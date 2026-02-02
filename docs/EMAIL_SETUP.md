# Email Setup Guide

This guide explains how to set up email sending for booking confirmations with verification codes.

## Overview

When a guest creates a booking, Firebase Cloud Functions automatically sends an email with:
- Booking confirmation
- Verification code (6 digits)
- Check-in and check-out dates
- Room type information

## Setup Steps

### Step 1: Install Functions Dependencies

```bash
cd functions
npm install
```

### Step 2: Configure Email Service

You have two options:

#### Option A: Gmail SMTP (Easiest for Testing)

1. **Enable 2-Step Verification** on your Google Account
   - Go to: https://myaccount.google.com/security
   - Enable 2-Step Verification

2. **Create App Password**
   - Go to: https://myaccount.google.com/apppasswords
   - Select "Mail" and "Other (Custom name)"
   - Enter "Firebase Functions"
   - Copy the 16-character password

3. **Set Firebase Config**
   ```bash
   firebase functions:config:set email.user="your-email@gmail.com" email.password="your-16-char-app-password"
   ```

#### Option B: SendGrid (Recommended for Production)

1. **Sign up for SendGrid** (free tier available)
   - Go to: https://sendgrid.com
   - Create account and verify email

2. **Create API Key**
   - Go to Settings > API Keys
   - Create API Key with "Mail Send" permissions
   - Copy the API key

3. **Update functions/index.js**
   ```javascript
   const emailConfig = {
     service: 'SendGrid',
     auth: {
       user: 'apikey',
      pass: functions.config().sendgrid?.apikey || 'your-sendgrid-api-key'
    }
  };
  ```

4. **Set Firebase Config**
   ```bash
   firebase functions:config:set sendgrid.apikey="your-sendgrid-api-key"
   ```

### Step 3: Deploy Functions

```bash
firebase deploy --only functions
```

## Email Template

The email includes:
- Professional HTML design
- Hotel branding (blue theme)
- Large, easy-to-read verification code
- Booking details (dates, room type)
- Instructions for using the code

## Testing

1. **Create a booking** through the web app
2. **Check your email** (the email address used in booking)
3. **Verify** the email contains:
   - Verification code
   - Booking details
   - Professional formatting

## Troubleshooting

### Email Not Sending

**Check:**
1. Functions are deployed: `firebase functions:list`
2. Email config is set: `firebase functions:config:get`
3. Check function logs: `firebase functions:log`
4. Verify email service credentials are correct

### Gmail "Less Secure App" Error

**Solution:**
- Use App Password (not regular password)
- Enable 2-Step Verification first
- App Password is required for Gmail SMTP

### Functions Not Triggering

**Check:**
1. Firestore trigger is set up correctly
2. Booking document is created in `Bookings` collection
3. Booking has `status: "confirmed"` and `verificationCode` field
4. Check function logs for errors

## Production Recommendations

1. **Use SendGrid or Mailgun** instead of Gmail
   - More reliable
   - Better deliverability
   - Professional service

2. **Add Email Templates**
   - Customize branding
   - Add hotel logo
   - Match your website design

3. **Error Handling**
   - Retry failed emails
   - Log all email attempts
   - Notify admin of failures

4. **Rate Limiting**
   - Prevent spam
   - Respect email service limits

## Current Status

✅ Cloud Function created: `sendVerificationEmail`
✅ Email template with verification code
✅ Automatic trigger on booking creation
✅ HTML email with professional design

**Next Steps:**
1. Configure email service (Gmail or SendGrid)
2. Deploy functions
3. Test with a booking




