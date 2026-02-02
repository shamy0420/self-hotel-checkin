# Fix: "The recipients address is empty" Error

## The Problem
EmailJS error: `The recipients address is empty`

This means EmailJS isn't receiving the email address properly.

## Solution: Configure EmailJS Template

### Step 1: Check Your EmailJS Template

1. Go to: **https://dashboard.emailjs.com/admin/templates**
2. Click on your template: **`template_7idjxvl`**
3. Look for the **"To Email"** field

### Step 2: Set "To Email" Field

In your EmailJS template, the **"To Email"** field must be set to use the `to_email` variable:

1. Find the **"To Email"** field in the template editor
2. Set it to: `{{to_email}}`
3. **OR** if there's a dropdown, select **"Template Variable"** and choose `to_email`

### Step 3: Verify Template Variables

Make sure your template includes these variables:
- `{{to_name}}` - Guest's name
- `{{to_email}}` - **This must be in the "To Email" field!**
- `{{verification_code}}` - 6-digit code
- `{{check_in}}` - Check-in date
- `{{check_out}}` - Check-out date
- `{{room_type}}` - Room type name
- `{{total_price}}` - Total price

### Step 4: Save and Test

1. **Save** the template
2. **Refresh** your browser
3. **Create a new booking** with a valid email address
4. Check the console - you should see: "Sending email to: [email]"
5. Check your email inbox!

## Common Issues

### Issue 1: "To Email" Field is Empty
- **Fix**: Set "To Email" to `{{to_email}}` in the template

### Issue 2: "To Email" Field Has Hardcoded Value
- **Fix**: Replace hardcoded email with `{{to_email}}`

### Issue 3: Template Variable Name Mismatch
- **Fix**: Make sure the variable is exactly `to_email` (lowercase, with underscore)

## Debugging

After the fix, check the browser console. You should see:
- `Sending email to: [your-email@example.com]`
- `Template params: { to_name: '...', to_email: '[REDACTED]', ... }`

If you still see "recipients address is empty":
1. Double-check the "To Email" field in EmailJS template
2. Make sure it's set to `{{to_email}}` (with double curly braces)
3. Save the template
4. Try again

---

**The key is**: The "To Email" field in your EmailJS template must be set to `{{to_email}}` to receive the email address from the booking form!



