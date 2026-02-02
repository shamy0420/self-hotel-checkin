# Quick Fix: EmailJS Public Key Setup

## The Problem
The console shows: `EmailJS Public Key not found. Please set VITE_EMAILJS_PUBLIC_KEY environment variable`

## Quick Fix (2 Minutes)

### Step 1: Get Your EmailJS Public Key

1. Go to: **https://dashboard.emailjs.com**
2. Click **"Account"** (top right) → **"General"**
3. Find **"Public Key"** (also called User ID)
4. **Copy the Public Key** (it looks like: `abc123xyz` or `user_abc123xyz`)

### Step 2: Create .env File

Run this command in your terminal (replace `YOUR_PUBLIC_KEY` with the actual key you copied):

```bash
cd /Users/mohamedel-shamy/Documents/Self-checkin/Self-checkin-copilot-build-app-connected-to-firebase
echo "VITE_EMAILJS_PUBLIC_KEY=YOUR_PUBLIC_KEY" > .env
```

**Example:**
```bash
echo "VITE_EMAILJS_PUBLIC_KEY=abc123xyz" > .env
```

### Step 3: Restart Dev Server

1. **Stop the current dev server** (press `Ctrl+C` in the terminal where it's running)
2. **Start it again:**
   ```bash
   npm run dev
   ```

### Step 4: Test

1. Create a new booking
2. Enter your email address in the booking form
3. Complete the booking
4. Check your email inbox!

## Verify It's Working

After restarting, check the browser console. You should **NOT** see the warning anymore.

If you still see the warning:
- Make sure `.env` file is in the project root (same folder as `package.json`)
- Make sure the file contains: `VITE_EMAILJS_PUBLIC_KEY=your_actual_key`
- Make sure you restarted the dev server

## Need Help Finding Your Public Key?

1. Go to: https://dashboard.emailjs.com
2. Look at the top right corner → Click your account/profile
3. Click "General" or "Account Settings"
4. Scroll down to find "Public Key" or "User ID"
5. Copy it (it's a long string of letters and numbers)

---

**That's it!** Once you add the Public Key to `.env` and restart, emails will send automatically! 🎉



