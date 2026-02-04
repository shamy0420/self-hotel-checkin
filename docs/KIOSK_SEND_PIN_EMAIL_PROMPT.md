# Prompt: Make the kiosk send the room PIN email

Use the text below as a prompt in your **kiosk app** project (e.g. in Cursor or another AI). It tells the kiosk to send the room PIN email after verification instead of relying on the self-check-in app’s Cloud Function.

---

## Copy this prompt

```
In this kiosk app we verify guests by their verification code and update Firestore (Bookings or bookings) with verified: true and verifiedAt.

Add this behavior: **after** we successfully verify a booking (i.e. after we find the booking by verificationCode and set verified: true and verifiedAt), **send an email** to the guest with their **room passcode (PIN)**. The kiosk should send this email itself; do not rely on another app or Cloud Function to send it.

**Data to use (from the booking document we just verified):**
- To: booking.email
- Guest name: booking.guestName
- Room passcode: booking.roomPasscode (6-digit PIN for the room)
- Room type: booking.roomTypeName
- Check-in date: booking.checkIn
- Check-out date: booking.checkOut

**Email content:**
- Subject: "Your Room Passcode: {roomPasscode}"
- Body (HTML or plain text): Tell the guest their room passcode, include stay details (room type, check-in, check-out), and a note to keep the code private. Match the style of a typical “room access code” email (clear, professional).

**How to send the email:**
- If this kiosk has a backend (Node, Firebase Functions in the kiosk project, etc.): send the email from there using nodemailer (Gmail SMTP), SendGrid, Mailgun, or another SMTP/API. Use environment variables or config for SMTP/API keys; do not hardcode secrets.
- If this kiosk is frontend-only (e.g. React/Vue/Quasar): integrate an email service the frontend can call, e.g. EmailJS, or add a small backend/Cloud Function in the kiosk project that sends the email when given the booking data.

**After sending successfully:**
- Update the same booking document in Firestore with: roomPasscodeEmailSent: true, roomPasscodeSentAt: <server timestamp or ISO string>. This avoids sending the same email twice and allows other systems to know it was sent.

**Error handling:**
- If sending the email fails, log the error and optionally store it on the booking (e.g. roomPasscodeEmailError: error.message). Do not block or undo the verification (verified and verifiedAt should already be set).

**Summary:** When the user enters the verification code and we verify them, we already update Firestore. Add a step right after that: send one email to booking.email with the room passcode and stay details, then set roomPasscodeEmailSent (and optionally roomPasscodeSentAt) on the booking.
```

---

## After the kiosk sends the email

To avoid sending the room PIN email **twice** (once from the kiosk and once from the self-check-in app’s Cloud Function), do one of the following:

1. **Recommended:** In the **self-check-in** project (this repo), disable or remove the Cloud Functions that send the room passcode on verification:
   - `sendRoomPasscodeOnVerification` (Bookings)
   - `sendRoomPasscodeOnVerificationBookings` (bookings)
   - Optionally keep `resendRoomPasscodeEmail` if you want a way to resend from this app.

2. **Or:** Leave those functions deployed; they will only send if `roomPasscodeEmailSent` is not yet true. If the kiosk sets `roomPasscodeEmailSent: true` (and `roomPasscodeSentAt`) **immediately after** sending the email, the Cloud Function will see that and skip sending. So the kiosk must set those fields as part of the same flow.

---

## Quick reference: booking fields

| Field                | Use in email        |
|----------------------|---------------------|
| `email`              | To address          |
| `guestName`          | Greeting            |
| `roomPasscode`       | The PIN to show     |
| `roomTypeName`       | Stay details        |
| `checkIn` / `checkOut` | Stay details     |

After sending: set `roomPasscodeEmailSent: true` and `roomPasscodeSentAt` on the booking.
