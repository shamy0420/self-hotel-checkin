# Hotel Self-Check-in System

A modern, cloud-based hotel self-check-in application built with Quasar Framework and Firebase. This system allows guests to book rooms online, receive unique verification codes, and check in using a self-service kiosk or ESP32/Raspberry Pi device.

## Features

- **🏨 Hotel Booking System**: booking.com-inspired interface for room reservations
- **☁️ Firebase Cloud Integration**: Real-time data synchronization across all devices
- **🔐 Verification Code System**: Secure 6-digit codes for guest check-in
- **💻 Self-Service Kiosk**: Touch-screen interface for guest check-in
- **🔌 IoT Device Support**: API endpoints for ESP32/Raspberry Pi integration
- **📱 Responsive Design**: Works on desktop, tablet, and mobile devices

> **Note:** The administrative dashboard now lives on a separate site. This repository focuses on the guest booking and self-check-in flows.

## Technology Stack

- **Frontend**: Quasar Framework (Vue 3 with Composition API)
- **Backend**: Firebase (Firestore Database, Authentication)
- **Styling**: SCSS with Quasar components
- **Build Tool**: Vite

## Project Structure

```
hotel-checkin/
├── src/
│   ├── boot/
│   │   └── firebase.js          # Firebase configuration
│   ├── layouts/
│   │   └── MainLayout.vue       # Main app layout with navigation
│   ├── pages/
│   │   ├── IndexPage.vue        # Home/booking page
│   │   └── KioskPage.vue        # Self-check-in kiosk
│   ├── services/
│   │   └── api.js               # API functions for IoT devices
│   └── router/
│       └── routes.js            # App routes
├── public/                      # Static assets
└── package.json
```

## Getting Started

### Prerequisites

- Node.js (v20 or higher)
- npm or yarn
- Firebase account

### Installation

1. Clone the repository:
```bash
git clone https://github.com/shamy0420/Self-checkin.git
cd Self-checkin
```

2. Install dependencies:
```bash
npm install
```

3. Configure Firebase:
   - Create a Firebase project at [https://firebase.google.com](https://firebase.google.com)
   - Enable Firestore Database
   - Copy your Firebase configuration
   - Update `src/boot/firebase.js` with your credentials:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

4. Set up Firestore collections:
   - Create two collections: `rooms` and `bookings`
   - The app will automatically populate sample rooms on first run

### Development

Start the development server:
```bash
npm run dev
# or
quasar dev
```

The app will be available at `http://localhost:9000`

### Building for Production

Build the application:
```bash
npm run build
# or
quasar build
```

The built files will be in the `dist/spa` directory.

## Usage

### Guest Booking Flow

1. **Browse Rooms**: Visit the home page to see available rooms
2. **Book a Room**: Click "Book" on your preferred room
3. **Enter Details**: Fill in guest information and dates
4. **Receive Code**: Get a unique 6-digit verification code
5. **Check In**: Use the code at the kiosk or show to hotel staff

### Self-Check-in Kiosk

The kiosk interface (`/kiosk`) provides:
- Large, touch-friendly input for verification codes
- Visual feedback for successful/failed verification
- Automatic room assignment confirmation
- Perfect for lobby displays or tablet devices

### ESP32/Raspberry Pi Integration

The system includes API functions in `src/services/api.js` for IoT device integration:

#### Verify Booking Code
```javascript
import { verifyBookingCode } from './services/api';

const result = await verifyBookingCode('123456');
if (result.success) {
  console.log('Guest:', result.booking.guestName);
  console.log('Room:', result.booking.roomName);
  // Unlock door, display welcome message, etc.
}
```

#### Get Today's Check-ins
```javascript
import { getBookingsByDate } from './services/api';

const result = await getBookingsByDate('2024-11-10');
if (result.success) {
  console.log('Check-ins:', result.bookings);
}
```

#### Example ESP32 Code

```cpp
#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";
const char* serverUrl = "YOUR_FIREBASE_FUNCTION_URL";

void verifyCode(String code) {
  HTTPClient http;
  http.begin(serverUrl + "/verify");
  http.addHeader("Content-Type", "application/json");
  
  String payload = "{\"code\":\"" + code + "\"}";
  int httpCode = http.POST(payload);
  
  if (httpCode == 200) {
    String response = http.getString();
    // Parse JSON and handle response
    Serial.println(response);
  }
  
  http.end();
}
```

## Firebase Security Rules

Recommended Firestore security rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Rooms - read by anyone, write by admin only
    match /rooms/{roomId} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.token.admin == true;
    }
    
    // Bookings - read/write with validation
    match /bookings/{bookingId} {
      allow read: if true;
      allow create: if request.resource.data.verificationCode is string 
                    && request.resource.data.verificationCode.size() == 6;
      allow update: if request.auth != null || 
                    (resource.data.verified == false && 
                     request.resource.data.verified == true);
    }
  }
}
```

## Environment Variables

For production deployment, consider using environment variables:

```bash
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
```

## Deployment

### Firebase Hosting

1. Install Firebase CLI:
```bash
npm install -g firebase-tools
```

2. Initialize Firebase:
```bash
firebase init
```

3. Build and deploy:
```bash
npm run build
firebase deploy
```

### Other Hosting Options

The built application is a static SPA that can be hosted on:
- Vercel
- Netlify
- AWS S3
- GitHub Pages
- Any static hosting service

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License.

## Support

For issues or questions, please open an issue on GitHub.

## Acknowledgments

- Built with [Quasar Framework](https://quasar.dev)
- Powered by [Firebase](https://firebase.google.com)
- Icons from [Material Design Icons](https://material.io/icons)
