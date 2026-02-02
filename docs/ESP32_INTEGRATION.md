# ESP32/Raspberry Pi Integration Guide

This guide explains how to integrate ESP32 or Raspberry Pi devices with the Hotel Self-Check-in System for door locks, kiosk displays, or other IoT applications.

## Overview

The system provides cloud-based API functions that can be accessed from ESP32 or Raspberry Pi devices to:
- Verify guest booking codes
- Unlock room doors
- Display check-in information
- Query booking data

## Architecture

```
Guest Mobile App → Firebase Firestore ← ESP32/Raspberry Pi
                         ↑
                    Web Dashboard
```

All devices read/write to the same Firebase Firestore database, ensuring real-time synchronization.

## ESP32 Integration

### Prerequisites

- ESP32 development board
- Arduino IDE with ESP32 board support
- Required libraries:
  - WiFi
  - HTTPClient
  - ArduinoJson
  - Firebase ESP32 Client

### Installation

1. Install Arduino IDE
2. Add ESP32 board support:
   - File > Preferences
   - Additional Board URLs: `https://dl.espressif.com/dl/package_esp32_index.json`
3. Install libraries:
   - Sketch > Include Library > Manage Libraries
   - Search and install: "Firebase ESP32 Client" by Mobizt

### Basic ESP32 Code

```cpp
#include <WiFi.h>
#include <Firebase_ESP_Client.h>
#include "addons/TokenHelper.h"
#include "addons/RTDBHelper.h"

// WiFi credentials
#define WIFI_SSID "YOUR_WIFI_SSID"
#define WIFI_PASSWORD "YOUR_WIFI_PASSWORD"

// Firebase credentials
#define API_KEY "YOUR_FIREBASE_API_KEY"
#define DATABASE_URL "YOUR_DATABASE_URL"

// Firebase objects
FirebaseData fbdo;
FirebaseAuth auth;
FirebaseConfig config;

void setup() {
  Serial.begin(115200);
  
  // Connect to WiFi
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  Serial.print("Connecting to WiFi");
  while (WiFi.status() != WL_CONNECTED) {
    Serial.print(".");
    delay(300);
  }
  Serial.println("\nConnected!");
  
  // Configure Firebase
  config.api_key = API_KEY;
  config.database_url = DATABASE_URL;
  
  // Sign up (anonymous)
  Firebase.signUp(&config, &auth, "", "");
  
  config.token_status_callback = tokenStatusCallback;
  
  Firebase.begin(&config, &auth);
  Firebase.reconnectWiFi(true);
}

void loop() {
  // Check for code input (keypad, RFID, etc.)
  String code = readCode(); // Implement your code reading method
  
  if (code.length() == 6) {
    if (verifyCode(code)) {
      unlockDoor();
      displayWelcome();
    } else {
      displayError();
    }
  }
  
  delay(100);
}

bool verifyCode(String code) {
  if (Firebase.ready()) {
    // Query Firestore for matching booking
    String path = "bookings";
    
    if (Firebase.Firestore.runQuery(&fbdo, DATABASE_URL, path, 
        "verificationCode", "==", code)) {
      
      if (fbdo.payload().length() > 0) {
        // Code found - update as verified
        String bookingId = getBookingIdFromResponse(fbdo.payload());
        updateBookingVerified(bookingId);
        return true;
      }
    }
  }
  return false;
}

void unlockDoor() {
  // Control door lock relay
  digitalWrite(LOCK_PIN, HIGH);
  delay(5000); // Keep unlocked for 5 seconds
  digitalWrite(LOCK_PIN, LOW);
  Serial.println("Door unlocked!");
}

String readCode() {
  // Implement keypad reading or other input method
  // Example: read from serial for testing
  if (Serial.available()) {
    return Serial.readStringUntil('\n');
  }
  return "";
}
```

### Hardware Setup

#### Door Lock System

**Components:**
- ESP32 board
- 12V electromagnetic door lock
- 5V relay module
- 12V power supply
- Keypad or RFID reader (optional)

**Wiring:**
```
ESP32 GPIO Pin → Relay IN
Relay COM → 12V+
Relay NO → Door Lock +
Door Lock - → 12V GND
ESP32 GND → Relay GND
```

#### Check-in Kiosk Display

**Components:**
- ESP32 board
- TFT LCD display (e.g., ILI9341)
- Keypad or touchscreen

## Raspberry Pi Integration

### Prerequisites

- Raspberry Pi (any model with WiFi)
- Python 3.7+
- Internet connection

### Installation

```bash
# Update system
sudo apt-get update
sudo apt-get upgrade

# Install Python dependencies
pip3 install firebase-admin requests
```

### Basic Python Code

```python
import firebase_admin
from firebase_admin import credentials, firestore
import time

# Initialize Firebase
cred = credentials.Certificate('path/to/serviceAccountKey.json')
firebase_admin.initialize_app(cred)
db = firestore.client()

def verify_code(code):
    """Verify booking code and return booking details"""
    bookings_ref = db.collection('bookings')
    query = bookings_ref.where('verificationCode', '==', code).limit(1)
    results = query.get()
    
    if results:
        booking = results[0]
        # Update as verified
        booking.reference.update({
            'verified': True,
            'verifiedAt': firestore.SERVER_TIMESTAMP
        })
        return booking.to_dict()
    return None

def get_todays_checkins():
    """Get all bookings for today"""
    from datetime import date
    today = date.today().isoformat()
    
    bookings_ref = db.collection('bookings')
    query = bookings_ref.where('checkIn', '==', today)
    return [doc.to_dict() for doc in query.get()]

def listen_for_new_bookings():
    """Listen for new bookings in real-time"""
    def on_snapshot(col_snapshot, changes, read_time):
        for change in changes:
            if change.type.name == 'ADDED':
                print(f'New booking: {change.document.to_dict()}')
    
    bookings_ref = db.collection('bookings')
    bookings_ref.on_snapshot(on_snapshot)

# Main loop
def main():
    print("Hotel Check-in System - Raspberry Pi")
    print("Waiting for codes...")
    
    while True:
        # Get code from input (keypad, RFID, etc.)
        code = input("Enter verification code: ")
        
        if len(code) == 6:
            booking = verify_code(code)
            if booking:
                print(f"✓ Welcome, {booking['guestName']}!")
                print(f"  Room: {booking['roomName']}")
                # Unlock door or display welcome message
            else:
                print("✗ Invalid code")
        
        time.sleep(0.1)

if __name__ == '__main__':
    main()
```

### Getting Service Account Key

1. Go to Firebase Console
2. Project Settings > Service Accounts
3. Click "Generate new private key"
4. Save the JSON file to your Raspberry Pi
5. Update the path in the code

## Security Considerations

1. **Network Security**
   - Use WPA2/WPA3 encryption for WiFi
   - Consider VPN for remote devices
   - Implement certificate pinning

2. **Code Validation**
   - Always validate code format (6 digits)
   - Implement rate limiting
   - Log all verification attempts

3. **Physical Security**
   - Secure ESP32/RPi in tamper-proof enclosure
   - Use hardware encryption if available
   - Implement anti-tamper alerts

## Testing

### Testing with the Web App

1. Create a booking through the web interface
2. Note the 6-digit verification code
3. Enter the code on your ESP32/Raspberry Pi
4. Verify the response

### Testing without Firebase

For development without Firebase:

```cpp
// Mock verification for testing
bool verifyCodeMock(String code) {
  return code == "123456"; // Test code
}
```

## Troubleshooting

### ESP32 Won't Connect to WiFi
- Check SSID and password
- Ensure 2.4GHz WiFi (ESP32 doesn't support 5GHz)
- Check WiFi signal strength

### Firebase Connection Issues
- Verify API key and database URL
- Check Firestore security rules
- Ensure device has internet access

### Code Verification Fails
- Confirm code is 6 digits
- Check Firestore collection name
- Verify security rules allow read access

## Advanced Features

### Multiple Door Locks

```cpp
struct DoorLock {
  int pin;
  String roomNumber;
};

DoorLock locks[] = {
  {25, "101"},
  {26, "102"},
  {27, "103"}
};

void unlockRoom(String roomNumber) {
  for (auto& lock : locks) {
    if (lock.roomNumber == roomNumber) {
      digitalWrite(lock.pin, HIGH);
      delay(5000);
      digitalWrite(lock.pin, LOW);
      break;
    }
  }
}
```

### OLED Display for Feedback

```cpp
#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>

Adafruit_SSD1306 display(128, 64, &Wire, -1);

void displayMessage(String message) {
  display.clearDisplay();
  display.setTextSize(2);
  display.setTextColor(WHITE);
  display.setCursor(0, 10);
  display.println(message);
  display.display();
}
```

## Support

For issues or questions, please open an issue on GitHub or consult the main README.md file.
