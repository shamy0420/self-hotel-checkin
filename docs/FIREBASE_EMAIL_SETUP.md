# Firebase Email Setup Guide

This guide explains how to set up Firebase Cloud Functions to automatically send confirmation emails with verification codes when bookings are created.

## How It Works

1. **Guest fills out booking form** → Enters email address in the form
2. **Booking is created in Firestore** → Document added to `Bookings` collection
3. **Cloud Function triggers automatically** → `sendVerificationEmail` function runs
4. **Email is sent** → Guest receives email with verification code at the email address they entered

## Prerequisites

### Step 1: Upgrade to Blaze Plan

Firebase Cloud Functions require the **Blaze (pay-as-you-go) plan**:

1. Go to: https://console.firebase.google.com/project/clixsys-smart-mirror/usage/details
2. Click **"Modify plan"** or **"Upgrade"**
3. Select **Blaze plan** (pay-as-you-go)
4. Complete the upgrade process

**Note:** The Blaze plan has a free tier:
- 2 million function invocations/month free
- 400,000 GB-seconds compute time/month free
- 200,000 CPU-seconds/month free
- You only pay for usage beyond the free tier

### Step 2: Verify Email Configuration

The email configuration is already set:
```bash
firebase functions:config:get
```

You should see:
```json
{
  "email": {
    "user": "m.elshamy06@gmail.com",
    "password": "dfez mupb dwuo bwyh"
  }
}
```

If not set, run:
```bash
firebase functions:config:set \
  email.user="m.elshamy06@gmail.com" \
  email.password="dfez mupb dwuo bwyh" \
  --project clixsys-smart-mirror
```

### Step 3: Install Functions Dependencies

```bash
cd functions
npm install
```

### Step 4: Deploy Cloud Functions

```bash
cd /Users/mohamedel-shamy/Documents/Self-checkin/Self-checkin-copilot-build-app-connected-to-firebase
firebase deploy --only functions --project clixsys-smart-mirror
```

## How the Email System Works

### Automatic Trigger

The Cloud Function `sendVerificationEmail` is automatically triggered when:
- A new document is created in the `Bookings` collection
- The booking has `status: 'confirmed'`
- The booking has a `verificationCode` field

### Email Content

The email includes:
- **Subject**: "Your Hotel Check-In Verification Code: [CODE]"
- **Guest Name**: From the booking form
- **Email Address**: From the booking form (where email is sent)
- **Verification Code**: 6-digit code
- **Booking Details**: Check-in/check-out dates, room type
- **Professional HTML Design**: Blue theme with large verification code display

### Email Template

The email is sent using the email address entered in the booking form. The Cloud Function:
1. Reads the `email` field from the booking document
2. Sends the email to that address
3. Uses Gmail SMTP (configured with your credentials)
4. Marks the booking with `emailSent: true` when successful

## Testing

1. **Create a test booking**:
   - Go to the booking page
   - Select dates and room
   - Fill in the form with a test email address
   - Complete the booking

2. **Check the email**:
   - Check the inbox of the email address you entered
   - Verify the email contains:
     - Verification code
     - Booking details
     - Professional formatting

3. **Check Firebase Console**:
   - Go to: https://console.firebase.google.com/project/clixsys-smart-mirror/functions
   - View function logs to see if email was sent
   - Check for any errors

## Troubleshooting

### Email Not Sending

**Check Function Logs:**
```bash
firebase functions:log --project clixsys-smart-mirror
```

**Common Issues:**

1. **Gmail App Password Invalid**
   - Verify the app password is correct
   - Make sure 2-Step Verification is enabled
   - Generate a new app password if needed

2. **Function Not Triggering**
   - Verify booking has `status: 'confirmed'`
   - Verify booking has `verificationCode` field
   - Check function logs for errors

3. **Email Configuration Missing**
   - Run: `firebase functions:config:get`
   - If empty, set config again
   - Redeploy functions after setting config

### Function Deployment Fails

**Error: "Must be on Blaze plan"**
- Upgrade to Blaze plan first (see Step 1)

**Error: "API not enabled"**
- The deployment will automatically enable required APIs
- Wait a few minutes and try again

**Error: "Functions config not found"**
- Set the email config: `firebase functions:config:set email.user="..." email.password="..."`
- Redeploy functions

## Monitoring

### View Function Logs
```bash
firebase functions:log --project clixsys-smart-mirror
```

### View in Firebase Console
- Go to: https://console.firebase.google.com/project/clixsys-smart-mirror/functions
- Click on `sendVerificationEmail` function
- View logs, metrics, and execution history

### Check Booking Status
- In Firestore, check the booking document
- Look for `emailSent: true` (success) or `emailError: "..."` (failure)
- `emailSentAt` timestamp shows when email was sent

## Cost Estimation

With the free tier:
- **2 million function invocations/month** = ~66,000 bookings/day
- **400,000 GB-seconds/month** = Plenty for email sending
- **200,000 CPU-seconds/month** = More than enough

**Typical usage:**
- Each booking = 1 function invocation
- Each email = ~1-2 seconds compute time
- **Cost**: $0 for most hotels (within free tier)

## Security Notes

1. **Email credentials are secure**: Stored in Firebase Functions config (encrypted)
2. **No credentials in code**: Email password is not in source code
3. **Automatic triggering**: No manual intervention needed
4. **Error handling**: Failed emails don't break bookings

## Next Steps

1. ✅ Upgrade to Blaze plan
2. ✅ Verify email config is set
3. ✅ Deploy functions: `firebase deploy --only functions`
4. ✅ Test with a booking
5. ✅ Monitor function logs

## Support

If you encounter issues:
1. Check function logs: `firebase functions:log`
2. Verify email config: `firebase functions:config:get`
3. Check Firebase Console for errors
4. Ensure Gmail app password is valid




