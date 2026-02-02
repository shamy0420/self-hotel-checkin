# Quick Start Guide

## For Users (Hotel Guests)

1. Visit the hotel website
2. Browse available rooms on the home page
3. Click "Book" on your preferred room
4. Fill in your details:
   - Full name
   - Email address
   - Phone number
   - Check-in and check-out dates
   - Number of guests
5. Confirm your booking
6. **Save your 6-digit verification code!**
7. On arrival, enter your code at the check-in kiosk

## For Developers

### Quick Setup
```bash
# Clone the repository
git clone https://github.com/shamy0420/Self-checkin.git
cd Self-checkin

# Install dependencies
npm install

# Configure Firebase (see docs/FIREBASE_SETUP.md)
# Edit src/boot/firebase.js with your credentials

# Start development server
npm run dev

# Build for production
npm run build
```

### Key Files
- `src/pages/IndexPage.vue` - Main booking interface
- `src/pages/KioskPage.vue` - Self-check-in kiosk
- `src/boot/firebase.js` - Firebase configuration
- `src/services/api.js` - IoT device API functions

### IoT Integration
See `examples/` directory for:
- `esp32_door_lock.ino` - Arduino sketch for ESP32
- `raspberry_pi_controller.py` - Python script for Raspberry Pi

## Firebase Setup (Quick Version)

1. Create a Firebase project at https://console.firebase.google.com
2. Enable Firestore Database
3. Copy your Firebase config
4. Update `src/boot/firebase.js`
5. Deploy Firestore security rules from `firestore.rules`

## Testing Without Firebase

The app includes fallback data for testing:
- Default rooms are shown if Firebase is not configured
- Replace placeholder credentials in `src/boot/firebase.js`

## Features at a Glance

### Home Page
- Beautiful room gallery
- Detailed room information
- Real-time availability
- Instant booking

### Kiosk Mode
- Large, touch-friendly interface
- Auto-clear after verification
- Visual and status feedback
- Perfect for lobby displays

### Cloud Sync
All data syncs in real-time across:
- Web application
- Mobile devices
- Kiosk displays
- ESP32/Raspberry Pi devices

## Common Issues

### Firebase Connection Error
- Check your API key in `src/boot/firebase.js`
- Ensure Firestore is enabled
- Verify security rules are deployed

### Build Errors
```bash
# Clear cache and rebuild
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Code Not Working
- Verify the code is exactly 6 digits
- Check Firestore security rules allow reads
- Ensure device has internet connection

## Support

- Documentation: `README.md` and `docs/`
- Examples: `examples/` directory
- Issues: Open an issue on GitHub

## Next Steps

1. ✅ Deploy to Firebase Hosting
2. ✅ Set up custom domain
3. ✅ Add email notifications
4. ✅ Implement user accounts
5. ✅ Add payment integration
6. ✅ Create mobile app version
