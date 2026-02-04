# Kiosk verification → Room PIN email

Your **external kiosk** only marks the booking as verified in Firestore. **This app** (the self-check-in project) sends the room PIN email via a Cloud Function when it sees that update.

---

## How it works

- **Kiosk:** Finds the booking by `verificationCode`, then updates the document with **`verified: true`** and **`verifiedAt`** only. The kiosk does **not** send any email.
- **This app (Cloud Function):** Listens to **`Bookings`** and **`bookings`**. When `verified` becomes `true`, it sends the room PIN to the guest’s email and sets `roomPasscodeEmailSent: true`.

So the kiosk only changes “it has been verified” in Firestore; the room PIN email is sent from this file/app (Firebase Cloud Function in this repo).

---

## Kiosk verification → Room PIN email

### What the kiosk does

1. **Find the booking**  
   Query Firestore collection **`Bookings`** where `verificationCode` equals the code the guest entered.

2. **Update only verification fields**  
   Update that booking document with:
   - `verified: true`
   - `verifiedAt`: timestamp (e.g. `FieldValue.serverTimestamp()` or `new Date().toISOString()`)

The kiosk must **not** set `roomPasscode`, `roomPasscodeEmailSent`, or send any email. This app’s Cloud Function handles the room PIN email.

### Instructions for an external kiosk

- Use the **same Firestore project** as this self-check-in app.
- The Cloud Function listens to both **`Bookings`** and **`bookings`**, so either collection name will trigger the room PIN email.

### Example flow (pseudo-code)

```text
1. Guest enters code "123456" at the kiosk.
2. Kiosk queries: Bookings where verificationCode == "123456"
3. If one matching booking is found and not already verified:
   - Update that document: { verified: true, verifiedAt: <now> }
   - Do nothing else (no email from kiosk).
4. Cloud Function in this app runs automatically and sends the room PIN to the guest’s email.
```

---

## Deploying the Cloud Function and Gmail SMTP

1. **Deploy Firebase Functions** (from this project’s root):

   ```bash
   cd functions
   npm install
   cd ..
   firebase deploy --only functions
   ```

2. **Set Gmail SMTP** (so the function can send the PIN email):

   ```bash
   firebase functions:config:set email.user="your@gmail.com" email.password="your-app-password"
   ```

   Use a [Gmail App Password](https://support.google.com/accounts/answer/185833), not your normal password. Then deploy again:

   ```bash
   firebase deploy --only functions
   ```

3. **Optional:** If you use environment variables instead of Firebase config, set `EMAIL_USER` and `EMAIL_PASSWORD` for the Functions environment.

---

## Summary

| Step | Who / What | Action |
|------|-------------|--------|
| 1 | Guest | Books on web → receives verification code by email. |
| 2 | Guest | Goes to kiosk and enters verification code. |
| 3 | **Kiosk** | Finds booking by `verificationCode`, sets `verified: true` and `verifiedAt` on **`Bookings`** only. |
| 4 | **This app (Cloud Function)** | Sees the update and sends the room PIN email to the guest. |

The kiosk is aligned with this flow: verification at the kiosk only updates Firestore; the room PIN email is sent by the Cloud Function in this app.

---

## Troubleshooting: Room PIN email not received

If the guest never gets the room PIN email after verifying at the kiosk:

1. **Check Firebase Console → Functions → Logs**  
   After the kiosk sets `verified: true`, you should see logs like:
   - `[Bookings] Booking xyz: before.verified=false, after.verified=true ...` then `Room passcode email sent successfully to ...`
   - If you see `Skipping: no roomPasscode` then the booking was created without `roomPasscode` (e.g. not from this web app).
   - If you see `Skipping: room passcode email already sent` then the email was already sent once.

2. **Check the booking in Firestore**  
   Open the booking document (in **Bookings** or **bookings**) and confirm:
   - `verified` is `true`
   - `roomPasscode` exists (6 digits)
   - `email` is correct
   - If the function failed, there may be a field **`roomPasscodeEmailError`** with the error message (e.g. Gmail auth failed).

3. **Gmail SMTP**  
   The function uses Gmail to send. Set config and redeploy:
   ```bash
   firebase functions:config:set email.user="your@gmail.com" email.password="your-app-password"
   firebase deploy --only functions
   ```
   Use a [Gmail App Password](https://support.google.com/accounts/answer/185833), not your normal password.

4. **Resend the room PIN email**  
   A callable function **`resendRoomPasscodeEmail`** can send the email again for a given booking (e.g. after fixing Gmail or if the trigger didn’t run). From your app or a small script:
   ```javascript
   const functions = getFunctions(app);
   const resend = httpsCallable(functions, 'resendRoomPasscodeEmail');
   const result = await resend({ bookingId: 'THE_BOOKING_DOCUMENT_ID' });
   ```
   Or in Firebase Console → Functions → sendRoomPasscodeOnVerification (or resendRoomPasscodeEmail) you can’t call directly; use the client SDK above or a one-off script. The booking must already be **verified** and have **roomPasscode** and **email**. You cannot invoke the callable from the Firebase Console UI; use the client SDK or a script.
