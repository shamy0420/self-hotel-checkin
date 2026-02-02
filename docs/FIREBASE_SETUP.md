# Firebase Setup Guide

This guide will help you set up Firebase for the Hotel Self-Check-in System.

## Step 1: Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project"
3. Enter project name: "hotel-checkin" (or your preferred name)
4. Disable Google Analytics (optional for this project)
5. Click "Create project"

## Step 2: Register Your Web App

1. In the Firebase Console, click the web icon (</>) to add a web app
2. Register app with nickname: "Hotel Checkin Web"
3. Enable Firebase Hosting (optional)
4. Click "Register app"
5. Copy the Firebase configuration object

## Step 3: Enable Firestore Database

1. In the Firebase Console, go to "Firestore Database"
2. Click "Create database"
3. Select "Start in test mode" (for development)
4. Choose your preferred location
5. Click "Enable"

## Step 4: Configure Security Rules

In Firestore Database > Rules, replace the default rules with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Rooms collection
    match /rooms/{roomId} {
      // Anyone can read rooms
      allow read: if true;
      // Only authenticated admins can write
      allow write: if request.auth != null && 
                   request.auth.token.admin == true;
    }
    
    // Bookings collection
    match /bookings/{bookingId} {
      // Anyone can read bookings (for kiosk and ESP32)
      allow read: if true;
      
      // Allow creating bookings with valid verification code
      allow create: if request.resource.data.verificationCode is string && 
                    request.resource.data.verificationCode.size() == 6 &&
                    request.resource.data.guestName is string &&
                    request.resource.data.email is string;
      
      // Allow updating to mark as verified
      allow update: if resource.data.verified == false && 
                    request.resource.data.verified == true;
      
      // Authenticated users can update/delete
      allow update, delete: if request.auth != null;
    }
  }
}
```

## Step 5: Update Your App Configuration

1. Open `src/boot/firebase.js`
2. Replace the placeholder configuration with your Firebase config:

```javascript
const firebaseConfig = {
  apiKey: "AIza...",  // Your actual API key
  authDomain: "hotel-checkin-xxxxx.firebaseapp.com",
  projectId: "hotel-checkin-xxxxx",
  storageBucket: "hotel-checkin-xxxxx.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123..."
};
```

## Troubleshooting

### CORS Issues
If you encounter CORS issues with Firebase, ensure your domain is whitelisted in Firebase Console > Authentication > Settings > Authorized domains

### Security Rules Testing
Test your security rules in Firestore Console > Rules > Rules Playground

## Best Practices

1. **Never commit Firebase config with real credentials to public repos**
2. Use environment variables for sensitive data
3. Regularly review security rules
4. Monitor usage in Firebase Console
5. Implement proper error handling
