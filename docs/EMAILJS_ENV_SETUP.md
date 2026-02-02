# EmailJS Environment Variable Setup

## Configuration

The email service is configured with:
- **Service ID**: `service_rglztaf`
- **Template ID**: `template_qmu1mpa`
- **Public Key**: From environment variable `VITE_EMAILJS_PUBLIC_KEY`

## Setup Instructions

### Step 1: Get Your EmailJS Public Key

1. Go to EmailJS dashboard: https://dashboard.emailjs.com
2. Click **"Account"** → **"General"**
3. Find **"Public Key"** (also called User ID)
4. Copy the public key

### Step 2: Create .env File

1. In the project root, create a `.env` file:
   ```bash
   touch .env
   ```

2. Add your EmailJS Public Key:
   ```env
   VITE_EMAILJS_PUBLIC_KEY=your_actual_public_key_here
   ```

   Replace `your_actual_public_key_here` with your actual EmailJS Public Key.

### Step 3: Restart Dev Server

After creating/updating the `.env` file:
```bash
# Stop the current dev server (Ctrl+C)
# Then restart:
npm run dev
```

## Template Variables

The email template uses these exact variable names (do NOT rename):
- `to_name` - Guest's name
- `to_email` - Guest's email (where email is sent)
- `verification_code` - 6-digit verification code
- `check_in` - Check-in date (formatted)
- `check_out` - Check-out date (formatted)
- `room_type` - Room type name
- `total_price` - Total price with $ sign

## Reply-To Address

Replies to confirmation emails will go to: `m.elshamy06@gmail.com`

This should be configured in your EmailJS template settings.

## How It Works

1. Guest enters email in booking form
2. Booking is created in Firestore
3. Email is automatically sent via EmailJS REST API
4. Email goes to `to_email` (guest's email from form)
5. Success/failure status is returned to UI

## Troubleshooting

### "EmailJS Public Key not configured"

- Make sure `.env` file exists in project root
- Verify `VITE_EMAILJS_PUBLIC_KEY` is set correctly
- Restart dev server after creating/updating `.env`

### Email Not Sending

- Check browser console for errors
- Verify Public Key is correct in `.env`
- Check EmailJS dashboard logs
- Ensure template variables match exactly

### Check Environment Variable

You can verify the environment variable is loaded:
```javascript
console.log('Public Key:', import.meta.env.VITE_EMAILJS_PUBLIC_KEY);
```

## Production Deployment

For production, set the environment variable in your hosting platform:
- **Vercel**: Environment Variables in project settings
- **Netlify**: Site settings → Environment variables
- **Firebase Hosting**: Use Firebase Functions or set in build process

Make sure to use `VITE_` prefix for Vite environment variables.



