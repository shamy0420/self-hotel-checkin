# Firebase Setup for ESP32 Verification

This guide explains what needs to be configured in Firebase Console for ESP32 code verification to work.

## ✅ Current Status

Your Firebase project (`clixsys-smart-mirror`) is already configured correctly! Here's what's set up:

### 1. Firestore Database ✅

- **Status**: Enabled and working
- **Collections**:
  - `RoomTypes` - Room type definitions (Normal, Premium)
  - `Bookings` - Guest bookings with verification codes
  - `Rooms` - Individual room records (optional)

### 2. Firestore Security Rules ✅

The rules are already deployed and allow:
- ✅ **Reading Bookings**: Anyone can read (needed for ESP32)
- ✅ **Updating Bookings**: Can mark as verified (needed for ESP32)
- ✅ **Creating Bookings**: Web app can create bookings

**Current Rules Location**: `firestore.rules` (already deployed)

### 3. Collections Structure ✅

**Bookings Collection** structure:
```javascript
{
  verificationCode: "123456",      // 6-digit code
  status: "confirmed",              // Booking status
  verified: false,                  // Verification status
  guestName: "John Doe",
  email: "john@example.com",
  phone: "1234567890",
  checkIn: "2024-11-20",
  checkOut: "2024-11-22",
  roomTypeId: "...",
  roomTypeName: "Normal Room",
  createdAt: "2024-11-16T10:00:00Z",
  verifiedAt: null
}
```

## 🔧 What You Need to Do

### Step 1: Verify Firestore is Enabled

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select project: `clixsys-smart-mirror`
3. Go to **Firestore Database**
4. Verify it shows "Active"

### Step 2: Check Security Rules (Already Done ✅)

1. In Firestore Database, click **Rules** tab
2. Verify rules allow:
   - Reading from `Bookings` collection
   - Updating `verified` field in `Bookings`

**Current rules are correct - no changes needed!**

### Step 3: Verify Bookings Collection Exists

1. In Firestore Database, click **Data** tab
2. Verify you see `Bookings` collection
3. When a booking is created through the web app, it should appear here

### Step 4: Test with a Booking

1. Create a booking through the web app
2. Note the 6-digit verification code
3. Check Firestore Console → `Bookings` collection
4. Verify the booking document has:
   - `verificationCode` field
   - `status` = "confirmed"
   - `verified` = false

## 📋 ESP32 Connection Details

The ESP32 connects to Firebase **cloud** (not local) using:

- **Host**: `firestore.googleapis.com`
- **Project**: `clixsys-smart-mirror`
- **Collection**: `Bookings`
- **Method**: REST API (HTTPS)

**No local setup needed** - everything is cloud-based!

## 🔍 Troubleshooting

### ESP32 Can't Connect to Firebase

**Check:**
1. WiFi is connected (check Serial Monitor)
2. Firestore is enabled in Firebase Console
3. Security rules allow reading Bookings
4. Project ID is correct: `clixsys-smart-mirror`

### "Missing or insufficient permissions" Error

**Solution:**
1. Go to Firestore Database → Rules
2. Verify rules include:
   ```
   match /Bookings/{bookingId} {
     allow read: if true;
     allow update: if (resource.data.verified == false && 
                      request.resource.data.verified == true);
   }
   ```
3. Click **Publish** to deploy rules

### Code Not Found

**Check:**
1. Booking exists in Firestore `Bookings` collection
2. `verificationCode` field matches exactly (6 digits)
3. `status` field is "confirmed"
4. Booking hasn't been verified already

### Update Fails

**Check:**
1. Security rules allow updating `verified` field
2. Booking document exists
3. `verified` field is currently `false`

## ✅ Verification Checklist

- [ ] Firestore Database is enabled
- [ ] `Bookings` collection exists
- [ ] Security rules allow reading Bookings
- [ ] Security rules allow updating verified field
- [ ] Test booking created through web app
- [ ] Booking appears in Firestore Console
- [ ] ESP32 WiFi credentials configured
- [ ] ESP32 can connect to internet

## 🚀 Next Steps

1. **Create a test booking** through the web app
2. **Note the verification code**
3. **Verify it appears in Firestore** Console
4. **Test with ESP32** - enter the code
5. **Check Firestore** - `verified` should change to `true`

## 📝 No Additional Firebase Setup Needed!

Everything is already configured correctly. The ESP32 will:
- ✅ Connect to Firebase cloud automatically
- ✅ Query Bookings collection
- ✅ Verify codes
- ✅ Update verification status

Just make sure:
1. WiFi credentials are set in ESP32 code
2. Firestore is enabled (it is)
3. Rules are deployed (they are)

You're all set! 🎉

