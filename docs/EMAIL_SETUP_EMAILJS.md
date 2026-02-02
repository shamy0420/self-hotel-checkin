# Email Setup with EmailJS (Recommended - Works Immediately)

This guide explains how to set up email sending using EmailJS, which works without upgrading to Firebase Blaze plan.

## Why EmailJS?

- ✅ **Free tier**: 200 emails/month
- ✅ **No backend required**: Works directly from frontend
- ✅ **No Firebase upgrade needed**: Works with Spark plan
- ✅ **Easy setup**: 5-minute configuration
- ✅ **Professional emails**: HTML templates supported

## Setup Steps

### Step 1: Sign Up for EmailJS

1. Go to https://www.emailjs.com
2. Sign up for a free account
3. Verify your email address

### Step 2: Add Email Service

1. In EmailJS dashboard, go to **Email Services**
2. Click **Add New Service**
3. Choose **Gmail** (or your preferred email provider)
4. Connect your Gmail account
5. Copy the **Service ID** (e.g., `service_abc123`)

### Step 3: Create Email Template

1. Go to **Email Templates** in EmailJS dashboard
2. Click **Create New Template**
3. Use this template:

**Subject:**
```
Your Hotel Check-In Verification Code: {{verification_code}}
```

**Content (HTML):**
```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 30px; border-radius: 8px; }
    .header { background-color: #1976d2; color: #ffffff; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; margin: -30px -30px 30px -30px; }
    .code-box { background-color: #e3f2fd; border: 3px dashed #1976d2; border-radius: 8px; padding: 30px; text-align: center; margin: 30px 0; }
    .verification-code { font-size: 36px; font-weight: bold; color: #1976d2; letter-spacing: 8px; font-family: 'Courier New', monospace; }
    .info-box { background-color: #f8f9fa; border-left: 4px solid #1976d2; padding: 15px; margin: 20px 0; }
    .footer { text-align: center; color: #666666; font-size: 12px; margin-top: 30px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Hotel Check-In Confirmation</h1>
    </div>
    
    <h2>Dear {{to_name}},</h2>
    
    <p>Thank you for choosing our hotel! Your booking has been confirmed.</p>
    
    <div class="info-box">
      <h3 style="color: #1976d2; margin-top: 0;">Booking Details</h3>
      <p><strong>Room Type:</strong> {{room_type}}</p>
      <p><strong>Check-in:</strong> {{check_in}}</p>
      <p><strong>Check-out:</strong> {{check_out}}</p>
      <p><strong>Total Price:</strong> {{total_price}}</p>
    </div>
    
    <div class="code-box">
      <p style="font-size: 18px; font-weight: bold; margin: 0 0 15px 0;">Your Verification Code</p>
      <div class="verification-code">{{verification_code}}</div>
      <p style="color: #666666; font-size: 14px; margin: 20px 0 0 0;">
        Please save this code. You'll need it to access your room.
      </p>
    </div>
    
    <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 30px 0;">
      <p style="margin: 0; color: #856404; font-size: 14px;">
        <strong>Important:</strong> Present this verification code at the self-check-in kiosk or show it to hotel staff upon arrival.
      </p>
    </div>
    
    <p>We look forward to welcoming you! If you have any questions, please don't hesitate to contact us.</p>
    
    <p>Best regards,<br><strong>Hotel Management Team</strong></p>
    
    <div class="footer">
      <p>This is an automated confirmation email. Please do not reply to this message.</p>
    </div>
  </div>
</body>
</html>
```

4. Save the template and copy the **Template ID** (e.g., `template_xyz789`)

### Step 4: Get Public Key

1. Go to **Account** > **General** in EmailJS dashboard
2. Copy your **Public Key** (e.g., `abc123xyz`)

### Step 5: Update Configuration

1. Open `src/services/emailService.js`
2. Update the `EMAILJS_CONFIG` object:

```javascript
const EMAILJS_CONFIG = {
  serviceId: 'service_abc123',      // Your Service ID
  templateId: 'template_xyz789',    // Your Template ID
  publicKey: 'abc123xyz'             // Your Public Key
};
```

### Step 6: Install EmailJS Package

```bash
npm install @emailjs/browser
```

### Step 7: Test Email

1. Create a test booking in the app
2. Check the email inbox
3. Verify the email contains the verification code

## Alternative: Using Fetch API (No Package Required)

If you prefer not to install the EmailJS package, you can use the `sendBookingEmailFetch` function which uses the REST API directly.

## Troubleshooting

### Email Not Sending

1. **Check EmailJS Dashboard**: Go to EmailJS dashboard > Logs to see errors
2. **Verify Configuration**: Ensure Service ID, Template ID, and Public Key are correct
3. **Check Browser Console**: Look for error messages
4. **Verify Email Service**: Make sure your email service (Gmail) is connected in EmailJS

### Template Variables Not Working

- Ensure variable names match exactly: `{{verification_code}}`, `{{to_name}}`, etc.
- Variable names are case-sensitive

### Rate Limits

- Free tier: 200 emails/month
- Upgrade to paid plan for more emails
- Check usage in EmailJS dashboard

## Production Recommendations

1. **Move config to environment variables**:
   ```javascript
   const EMAILJS_CONFIG = {
     serviceId: import.meta.env.VITE_EMAILJS_SERVICE_ID,
     templateId: import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
     publicKey: import.meta.env.VITE_EMAILJS_PUBLIC_KEY
   };
   ```

2. **Add to .env file**:
   ```
   VITE_EMAILJS_SERVICE_ID=service_abc123
   VITE_EMAILJS_TEMPLATE_ID=template_xyz789
   VITE_EMAILJS_PUBLIC_KEY=abc123xyz
   ```

3. **Error Handling**: The service already includes error handling and logging

4. **Monitor Usage**: Check EmailJS dashboard regularly for usage and errors

## Next Steps

1. ✅ Sign up for EmailJS
2. ✅ Configure email service
3. ✅ Create email template
4. ✅ Update configuration in code
5. ✅ Install package: `npm install @emailjs/browser`
6. ✅ Test with a booking

## Firebase Cloud Functions Alternative

If you prefer to use Firebase Cloud Functions (requires Blaze plan upgrade):
- See `docs/EMAIL_SETUP.md` for Cloud Functions setup
- Upgrade Firebase project: https://console.firebase.google.com/project/clixsys-smart-mirror/usage/details




