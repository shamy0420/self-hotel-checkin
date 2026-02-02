# Free Email Setup Guide (EmailJS)

This guide shows you how to set up **FREE** email sending using EmailJS. No Firebase upgrade needed!

## ✅ What You Get

- **200 emails/month FREE** (perfect for most hotels)
- **No packages to install** - uses REST API
- **Works immediately** - no Firebase upgrade needed
- **Uses email from booking form** - sends to the address guest enters
- **Professional HTML emails** with verification codes

## Quick Setup (5 Minutes)

### Step 1: Sign Up for EmailJS (Free)

1. Go to **https://www.emailjs.com**
2. Click **"Sign Up"** (top right)
3. Create a free account
4. Verify your email address

### Step 2: Connect Your Gmail

1. In EmailJS dashboard, go to **"Email Services"**
2. Click **"Add New Service"**
3. Select **"Gmail"**
4. Click **"Connect Account"**
5. Sign in with your Gmail: `m.elshamy06@gmail.com`
6. Copy the **Service ID** (looks like `service_abc123`)

### Step 3: Create Email Template

1. Go to **"Email Templates"** in EmailJS dashboard
2. Click **"Create New Template"**
3. **Template Name**: "Hotel Booking Confirmation"
4. **Subject**: 
   ```
   Your Hotel Check-In Verification Code: {{verification_code}}
   ```

5. **Content** (HTML):
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

6. **Important**: Make sure these variables are in the template:
   - `{{to_name}}` - Guest name
   - `{{to_email}}` - Guest email (where email is sent)
   - `{{verification_code}}` - 6-digit code
   - `{{check_in}}` - Check-in date
   - `{{check_out}}` - Check-out date
   - `{{room_type}}` - Room type name
   - `{{total_price}}` - Total price

7. Click **"Save"**
8. Copy the **Template ID** (looks like `template_xyz789`)

### Step 4: Get Your Public Key

1. Go to **"Account"** > **"General"** in EmailJS dashboard
2. Find **"Public Key"** (also called User ID)
3. Copy it (looks like `abc123xyz`)

### Step 5: Update Code Configuration

1. Open: `src/services/emailService.js`
2. Find the `EMAILJS_CONFIG` object (around line 11)
3. Replace the placeholder values:

```javascript
const EMAILJS_CONFIG = {
  serviceId: 'service_abc123',      // Your Service ID from Step 2
  templateId: 'template_xyz789',   // Your Template ID from Step 3
  publicKey: 'abc123xyz'             // Your Public Key from Step 4
};
```

### Step 6: Test It!

1. Create a test booking in your app
2. Use your own email address in the booking form
3. Complete the booking
4. Check your email inbox
5. You should receive the confirmation email with verification code!

## How It Works

1. **Guest enters email** in booking form → `bookingData.value.email`
2. **Booking is created** → Saved to Firestore
3. **Email is sent automatically** → Uses EmailJS REST API
4. **Email goes to** → The email address entered in the form

## Troubleshooting

### Email Not Sending

**Check Browser Console:**
- Open browser DevTools (F12)
- Go to Console tab
- Look for error messages

**Common Issues:**

1. **"Invalid Service ID"**
   - Verify Service ID is correct in `emailService.js`
   - Check EmailJS dashboard > Email Services

2. **"Invalid Template ID"**
   - Verify Template ID is correct
   - Check EmailJS dashboard > Email Templates

3. **"Invalid Public Key"**
   - Verify Public Key is correct
   - Check EmailJS dashboard > Account > General

4. **"CORS Error"**
   - EmailJS should handle CORS automatically
   - Make sure you're using the REST API (fetch method)

### Check EmailJS Logs

1. Go to EmailJS dashboard
2. Click **"Logs"** in the sidebar
3. See all email attempts
4. Check for errors

### Test EmailJS Directly

You can test in browser console:
```javascript
fetch('https://api.emailjs.com/api/v1.0/email/send', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    service_id: 'YOUR_SERVICE_ID',
    template_id: 'YOUR_TEMPLATE_ID',
    user_id: 'YOUR_PUBLIC_KEY',
    template_params: {
      to_name: 'Test Guest',
      to_email: 'your-email@example.com',
      verification_code: '123456',
      check_in: 'Monday, January 1, 2024',
      check_out: 'Tuesday, January 2, 2024',
      room_type: 'Normal Room',
      total_price: '$99'
    }
  })
})
.then(res => res.json())
.then(data => console.log('Success:', data))
.catch(err => console.error('Error:', err));
```

## Free Tier Limits

- **200 emails/month** - Perfect for small to medium hotels
- **No credit card required**
- **No expiration** - Free forever

## Upgrade (Optional)

If you need more than 200 emails/month:
- **Paid plans start at $15/month**
- **1,000 emails/month**
- **More features**

## Security

- ✅ **Public Key is safe** - It's meant to be public
- ✅ **No passwords in code** - EmailJS handles authentication
- ✅ **HTTPS only** - All requests are encrypted
- ✅ **Rate limiting** - EmailJS prevents abuse

## Next Steps

1. ✅ Sign up for EmailJS
2. ✅ Connect Gmail service
3. ✅ Create email template
4. ✅ Update configuration in code
5. ✅ Test with a booking
6. ✅ Done! Emails will send automatically

## Support

- **EmailJS Docs**: https://www.emailjs.com/docs/
- **EmailJS Support**: support@emailjs.com
- **Check Logs**: EmailJS dashboard > Logs

---

**That's it!** Your free email system is ready. No Firebase upgrade needed! 🎉




