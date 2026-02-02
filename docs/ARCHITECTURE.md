# System Architecture

## Overview

The Hotel Self-Check-in System is a cloud-based application that connects guests and IoT devices through Firebase Firestore.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        Firebase Cloud                            │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                   Firestore Database                      │  │
│  │                                                            │  │
│  │  ┌──────────┐         ┌──────────────┐                   │  │
│  │  │  Rooms   │         │   Bookings   │                   │  │
│  │  │ Collection│        │  Collection  │                   │  │
│  │  │          │         │              │                   │  │
│  │  │ - name   │         │ - guestName  │                   │  │
│  │  │ - price  │         │ - roomName   │                   │  │
│  │  │ - capacity│        │ - code       │                   │  │
│  │  │ - available│       │ - verified   │                   │  │
│  │  └──────────┘         └──────────────┘                   │  │
│  └──────────────────────────────────────────────────────────┘  │
│                              ↕                                  │
│                    Real-time Sync                               │
└─────────────────────────────────────────────────────────────────┘
                              ↕
        ┌────────────────────────────────────────────┐
        │          Quasar Web Application            │
        └────────────────────────────────────────────┘
                              ↕
    ┌────────────┬──────────────────┐
    │            │                  │
┌───▼────┐  ┌───▼─────┐  ┌─────────▼────┐
│ Guest  │  │   Kiosk  │  │ IoT Devices  │
│ Portal │  │  Display │  │ ESP32/RPi    │
└────────┘  └──────────┘  └──────────────┘
```

## Component Details

### 1. Guest Portal (IndexPage.vue)
**Purpose**: Public-facing booking interface

**Features**:
- Browse available rooms
- Book rooms with guest details
- Receive verification codes
- Responsive design

**User Flow**:
1. View room gallery
2. Select room and dates
3. Enter personal information
4. Submit booking
5. Receive 6-digit code

### 2. Check-in Kiosk (KioskPage.vue)
**Purpose**: Self-service guest verification

**Features**:
- Large touch-friendly interface
- Code verification
- Visual feedback
- Auto-reset after use

**Display Options**:
- Tablet in lobby
- Wall-mounted touchscreen
- Desktop browser (fullscreen)

### 3. IoT Device Integration
**Purpose**: Physical access control

**Supported Devices**:
- ESP32 microcontrollers
- Raspberry Pi
- Any device with internet access

**Use Cases**:
- Door lock control
- Room access systems
- Check-in terminals

## Data Flow

### Booking Flow
```
Guest → Web Form → Firebase → Verification Code → Guest
```

### Verification Flow
```
Guest Code → Kiosk/IoT → Firebase Query → Match Found?
                              ↓               ↓
                         Update Record   Yes → Unlock
                                           No → Error
```

### Real-time Sync
```
Any Update → Firestore → Real-time Listeners → All Clients
```

## Security Architecture

### Authentication
- Anonymous access for guest bookings
- Service account for IoT devices

### Firestore Security Rules
```javascript
// Rooms: Public read, admin write
rooms: {
  read: true,
  write: auth.admin == true
}

// Bookings: Public read/create, restricted update
bookings: {
  read: true,
  create: validated data,
  update: verified field only OR authenticated
}
```

### API Security
- HTTPS only
- CORS restrictions
- Rate limiting (Firebase)
- Input validation

## Technology Stack

### Frontend
- **Framework**: Quasar (Vue 3)
- **Language**: JavaScript (ES6+)
- **Styling**: SCSS
- **Icons**: Material Design
- **Build**: Vite

### Backend
- **Database**: Firebase Firestore
- **Auth**: Firebase Authentication
- **Hosting**: Firebase Hosting (optional)
- **Functions**: Firebase Cloud Functions (optional)

### IoT
- **ESP32**: Arduino C++ with Firebase library
- **Raspberry Pi**: Python with firebase-admin
- **Protocol**: HTTPS REST API

## Deployment Architecture

### Development
```
Local Machine → npm run dev → localhost:9000
```

### Production
```
Local Build → npm run build → dist/spa → Hosting Service
```

### Hosting Options
1. **Firebase Hosting** (Recommended)
   - CDN included
   - SSL certificate
   - Custom domain
   - Easy deployment

2. **Static Hosting**
   - Netlify
   - Vercel
   - AWS S3 + CloudFront
   - GitHub Pages

## Scalability

### Current Capacity (Free Tier)
- 50k reads/day
- 20k writes/day
- 20k deletes/day
- 1GB storage

### Scaling Options
1. Upgrade to Blaze plan
2. Implement caching
3. Add indexes for queries
4. Use Cloud Functions for complex operations

## Monitoring & Analytics

### Built-in Monitoring
- Firebase Console metrics
- Firestore usage tracking
- Authentication logs

### Optional Integrations
- Google Analytics
- Sentry for error tracking
- Firebase Performance Monitoring
- Custom logging

## Future Enhancements

### Phase 2
- User accounts and profiles
- Email notifications
- Payment integration
- Multi-language support

### Phase 3
- Mobile app (Capacitor)
- Advanced analytics
- Room scheduling
- Housekeeping integration

### Phase 4
- AI chatbot support
- Biometric check-in
- Smart room controls
- Guest preferences learning

## Disaster Recovery

### Backup Strategy
1. Firestore automatic backups
2. Export data regularly
3. Version control for code
4. Document configuration

### Recovery Plan
1. Restore from Firebase backup
2. Redeploy application
3. Verify data integrity
4. Test all functions

## Maintenance

### Regular Tasks
- Monitor Firebase usage
- Review security rules
- Update dependencies
- Check error logs
- Test IoT devices

### Updates
- Monthly dependency updates
- Quarterly security audits
- Annual architecture review
