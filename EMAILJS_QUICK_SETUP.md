# EmailJS Quick Setup Guide

## ✅ Your Email System is Ready!

The code is already set up to send confirmation emails with verification codes to the email address that guests enter in the booking form.

## 🚀 Quick Setup (5 Minutes)

### Step 1: Sign Up for EmailJS (Free)

1. Go to **https://www.emailjs.com**
2. Click **"Sign Up"** (top right)
3. Create a free account
4. Verify your email address

### Step 2: Connect Your Gmail

1. In EmailJS dashboard, click **"Email Services"** (left sidebar)
2. Click **"Add New Service"**
3. Select **"Gmail"**
4. Click **"Connect Account"**
5. Sign in with: `YOUR-EMAIL`
6. **Copy the Service ID** (looks like `service_abc123`)

### Step 3: Create Email Template

1. Click **"Email Templates"** in EmailJS dashboard
2. Click **"Create New Template"**
3. **Template Name**: "Hotel Booking Confirmation"
4. **Subject**: 
   ```
   Your Hotel Check-In Verification Code: {{verification_code}}
   ```

5. **Content** (copy and paste this HTML):
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
   - `{{to_email}}` - Guest email (where email is sent) ⚠️ **This must be in the template!**
   - `{{verification_code}}` - 6-digit code
   - `{{check_in}}` - Check-in date
   - `{{check_out}}` - Check-out date
   - `{{room_type}}` - Room type name
   - `{{total_price}}` - Total price

7. Click **"Save"**
8. **Copy the Template ID** (looks like `template_xyz789`)

### Step 3b: Create Room Passcode Template

1. Click **"Email Templates"** in EmailJS dashboard
2. Click **"Create New Template"**
3. **Template Name**: "Room Passcode"
4. **Subject**:
  ```
  Your Room Passcode: {{room_passcode}}
  ```

5. **Content**: copy and paste the HTML from [EMAILJS_ROOMCODE_TEMPLATE_HTML.txt](EMAILJS_ROOMCODE_TEMPLATE_HTML.txt)

6. **Important**: Make sure these variables are in the template:
  - `{{to_name}}`
  - `{{to_email}}`
  - `{{room_passcode}}`
  - `{{room_type}}`
  - `{{check_in}}`
  - `{{check_out}}`

7. Click **"Save"**
8. **Copy the Room Template ID** (looks like `template_abc123`)

### Step 4: Get Your Public Key

1. Click **"Account"** > **"General"** in EmailJS dashboard
2. Find **"Public Key"** (also called User ID)
3. **Copy it** (looks like `abc123xyz`)

### Step 5: Update Configuration in Code

1. Open: `src/services/emailService.js`
2. Find the `EMAILJS_CONFIG` object (around line 18)
3. Replace the placeholder values with your actual IDs:

```javascript
const EMAILJS_CONFIG = {
  serviceId: 'service_abc123',      // ← Your Service ID from Step 2
  templateId: 'template_xyz789',   // ← Your Template ID from Step 3
  roomTemplateId: 'template_abc123', // ← Your Room Template ID from Step 3b
  publicKey: 'abc123xyz'             // ← Your Public Key from Step 4
};
```

4. **Save the file**

### Step 6: Test It!

1. Restart your dev server if it's running
2. Create a test booking in your app
3. Use your own email address in the booking form
4. Complete the booking
5. Check your email inbox
6. You should receive the confirmation email with verification code!

## ✅ How It Works

1. **Guest enters email** in booking form → `bookingData.email`
2. **Booking is created** → Saved to Firestore
3. **Email is sent automatically** → Uses EmailJS REST API
4. **Email goes to** → The email address entered in the form (`to_email`)

## 🎯 What You Get

- ✅ **200 emails/month FREE**
- ✅ **No packages needed** - uses REST API
- ✅ **Automatic sending** - happens when booking is created
- ✅ **Uses form email** - sends to the address guest enters
- ✅ **Professional HTML email** with verification code
- ✅ **Booking confirmation** - shows if email was sent successfully

## 🔍 Troubleshooting

### Email Not Sending?

**Check Browser Console:**
- Open DevTools (F12) → Console tab
- Look for error messages

**Common Issues:**

1. **"EmailJS not configured"**
   - Make sure you updated the config in `emailService.js`
   - Check that all three values are replaced (not `xxxxx`)

2. **"Invalid Service ID"**
   - Verify Service ID is correct
   - Check EmailJS dashboard > Email Services

3. **"Invalid Template ID"**
   - Verify Template ID is correct
   - Check EmailJS dashboard > Email Templates

4. **"Invalid Public Key"**
   - Verify Public Key is correct
   - Check EmailJS dashboard > Account > General

### Check EmailJS Logs

1. Go to EmailJS dashboard
2. Click **"Logs"** in the sidebar
3. See all email attempts
4. Check for errors

### Test in Browser Console

You can test directly:
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

## 📧 Email Template Variables

Make sure your EmailJS template includes:
- `{{to_name}}` - Guest's name
- `{{to_email}}` - Guest's email (where email is sent) ⚠️ **Required!**
- `{{verification_code}}` - 6-digit code
- `{{check_in}}` - Check-in date (formatted)
- `{{check_out}}` - Check-out date (formatted)
- `{{room_type}}` - Room type name
- `{{total_price}}` - Total price with $ sign

## 🎉 That's It!

Once configured, emails will automatically send to the email address that guests enter in the booking form. The confirmation dialog will show if the email was sent successfully!

---

**Need Help?** Check `docs/EMAIL_SETUP_FREE.md` for detailed instructions.



