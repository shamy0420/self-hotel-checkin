# ESP32 Code Verification Guide

This guide explains how to set up ESP32 to verify booking codes from Firebase and control door access.

## Overview

When a guest books a room, they receive a 6-digit verification code. The ESP32 device can verify this code against Firebase Firestore and unlock the door if valid.

## Architecture

```
Guest Booking → Firebase Firestore (Bookings collection)
                      ↓
                ESP32 queries Firebase
                      ↓
            Code matches → Unlock Door
            Code invalid → Deny Access
```

## Setup Options

### Option 1: Direct Firestore Query (Simpler, but less secure)

ESP32 directly queries Firestore using Firebase REST API.

**Pros:**
- Simple implementation
- No additional services needed

**Cons:**
- Requires exposing Firestore rules
- Less secure
- More complex authentication

### Option 2: Firebase Cloud Functions (Recommended)

ESP32 calls a Cloud Function that verifies the code.

**Pros:**
- More secure
- Easier to implement
- Better error handling
- Can add rate limiting

**Cons:**
- Requires setting up Cloud Functions

## Implementation Steps

### Step 1: Ensure RoomTypes Exist

Run the setup script to create room types:

```bash
npm run setup-room-types
```

This creates:
- Normal Room: 50 total rooms
- Premium Room: 50 total rooms

### Step 2: Verify Firestore Rules

The Firestore rules should allow:
- Reading Bookings collection (for ESP32 verification)
- Updating bookings to mark as verified

Current rules allow:
- ✅ Anyone can read Bookings
- ✅ Anyone can update bookings to mark as verified (if not already verified)

### Step 3: ESP32 Code Verification

The ESP32 needs to:

1. **Query Firestore** for a booking with matching `verificationCode`
2. **Check if booking is valid:**
   - Code exists
   - Booking status is "confirmed"
   - Booking is not already verified
   - Check-in date is today or in the past
   - Check-out date is in the future
3. **If valid:**
   - Mark booking as verified (`verified: true`)
   - Unlock door/access
   - Return success
4. **If invalid:**
   - Deny access
   - Return error

## Example Code Structure

```javascript
// In your ESP32 code or Cloud Function
async function verifyCode(code) {
  // Query Firestore
  const bookings = await db.collection('Bookings')
    .where('verificationCode', '==', code)
    .where('status', '==', 'confirmed')
    .get();
  
  if (bookings.empty) {
    return { success: false, message: 'Invalid code' };
  }
  
  const booking = bookings.docs[0].data();
  
  // Check if already verified
  if (booking.verified) {
    return { success: false, message: 'Code already used' };
  }
  
  // Check dates
  const today = new Date();
  const checkIn = new Date(booking.checkIn);
  const checkOut = new Date(booking.checkOut);
  
  if (today < checkIn || today >= checkOut) {
    return { success: false, message: 'Booking not active' };
  }
  
  // Mark as verified
  await booking.ref.update({
    verified: true,
    verifiedAt: new Date().toISOString()
  });
  
  return {
    success: true,
    booking: {
      guestName: booking.guestName,
      roomTypeName: booking.roomTypeName
    }
  };
}
```

## Using the API Service

The app includes a `verifyBookingCode` function in `src/services/api.js`:

```javascript
import { verifyBookingCode } from './services/api';

const result = await verifyBookingCode('123456');
if (result.success) {
  console.log('Guest:', result.booking.guestName);
  console.log('Room:', result.booking.roomName);
  // Unlock door
} else {
  console.log('Error:', result.message);
  // Deny access
}
```

## Firebase Cloud Function Example (Recommended)

Create a Cloud Function for ESP32 to call:

```javascript
// functions/index.js
const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

exports.verifyCode = functions.https.onRequest(async (req, res) => {
  const code = req.body.code;
  
  if (!code || code.length !== 6) {
    return res.status(400).json({ success: false, message: 'Invalid code format' });
  }
  
  try {
    const bookings = await admin.firestore()
      .collection('Bookings')
      .where('verificationCode', '==', code)
      .where('status', '==', 'confirmed')
      .limit(1)
      .get();
    
    if (bookings.empty) {
      return res.json({ success: false, message: 'Invalid code' });
    }
    
    const booking = bookings.docs[0];
    const data = booking.data();
    
    if (data.verified) {
      return res.json({ success: false, message: 'Code already used' });
    }
    
    // Check dates
    const today = new Date();
    const checkIn = new Date(data.checkIn);
    const checkOut = new Date(data.checkOut);
    
    if (today < checkIn || today >= checkOut) {
      return res.json({ success: false, message: 'Booking not active' });
    }
    
    // Mark as verified
    await booking.ref.update({
      verified: true,
      verifiedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    return res.json({
      success: true,
      booking: {
        guestName: data.guestName,
        roomTypeName: data.roomTypeName
      }
    });
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});
```

Then ESP32 calls:
```
POST https://YOUR_REGION-YOUR_PROJECT.cloudfunctions.net/verifyCode
Body: { "code": "123456" }
```

## Testing

1. Create a booking through the web app
2. Note the 6-digit verification code
3. Test verification:
   - Valid code → Should unlock
   - Invalid code → Should deny
   - Already used code → Should deny
   - Expired booking → Should deny

## Security Considerations

1. **Rate Limiting**: Add rate limiting to prevent brute force attacks
2. **HTTPS Only**: Always use HTTPS for ESP32 communication
3. **Code Expiration**: Consider expiring codes after check-out date
4. **One-Time Use**: Codes are marked as verified after first use
5. **Date Validation**: Only allow verification during active booking period

## Troubleshooting

### "Missing or insufficient permissions"
- Check Firestore rules allow reading Bookings
- Ensure rules allow updating verified field

### "Code not found"
- Verify code is exactly 6 digits
- Check booking exists in Firestore
- Ensure booking status is "confirmed"

### "Code already used"
- Booking was already verified
- Check `verified` field in Firestore

## Next Steps

1. Set up ESP32 hardware (door lock, LEDs, buzzer)
2. Implement code verification logic
3. Test with real bookings
4. Add error handling and logging
5. Consider adding Cloud Functions for better security

