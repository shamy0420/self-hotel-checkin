# ESP32 TFT Display Setup Guide

## Hardware Connections

Your ESP32 TFT display is connected as follows:

```
TFT Display Connections:
├── Power
│   ├── VCC  → 5V
│   ├── GND  → GND
│   └── LED  → 3.3V
│
├── Control Pins
│   ├── RESET → GPIO 32
│   ├── CS    → GPIO 33
│   ├── DC    → GPIO 15
│   ├── WR    → GPIO 4
│   └── RD    → GPIO 2
│
├── Data Pins (8-bit parallel)
│   ├── D0 → GPIO 12
│   ├── D1 → GPIO 13
│   ├── D2 → GPIO 26
│   ├── D3 → GPIO 25
│   ├── D4 → GPIO 22  (updated)
│   ├── D5 → GPIO 23  (updated)
│   ├── D6 → GPIO 27
│   └── D7 → GPIO 14
│
└── Touch Screen
    ├── XP → GPIO 5
    ├── XM → GPIO 18
    ├── YP → GPIO 19
    └── YM → GPIO 21
```

## Additional Hardware (Optional)

- **Door Lock Relay**: GPIO 16 (reassigned - D4 now uses GPIO 22)
- **Buzzer**: GPIO 17 (reassigned - D5 now uses GPIO 23)
- **Green LED**: GPIO 25 (if not using TFT D3)
- **Red LED**: GPIO 26 (if not using TFT D2)

## Required Libraries

Install these libraries in Arduino IDE:

1. **TFT_eSPI** by Bodmer
   - Library Manager: Search "TFT_eSPI"
   - Or download: https://github.com/Bodmer/TFT_eSPI

2. **ArduinoJson** by Benoit Blanchon
   - Library Manager: Search "ArduinoJson"
   - Version 6.x recommended

3. **WiFi** (built-in with ESP32)

4. **HTTPClient** (built-in with ESP32)

## TFT_eSPI Configuration

Edit the `User_Setup.h` file in the TFT_eSPI library folder:

```cpp
// Driver: ILI9341 or your display driver
#define USER_SETUP_LOADED

// ESP32 pins
#define TFT_MISO 19
#define TFT_MOSI 23
#define TFT_SCLK 18
#define TFT_CS   33
#define TFT_DC   15
#define TFT_RST  32

// Parallel mode (8-bit)
#define TFT_PARALLEL_8_BIT
#define TFT_WR 4
#define TFT_RD 2

// Data pins
#define TFT_D0 12
#define TFT_D1 13
#define TFT_D2 26
#define TFT_D3 25
#define TFT_D4 22  // Updated
#define TFT_D5 23  // Updated
#define TFT_D6 27
#define TFT_D7 14

// Touch screen
#define TOUCH_CS 5
```

## Setup Steps

1. **Install Arduino IDE** with ESP32 support
   - Add ESP32 board: https://github.com/espressif/arduino-esp32

2. **Install Required Libraries**
   - TFT_eSPI
   - ArduinoJson

3. **Configure TFT_eSPI**
   - Edit `User_Setup.h` with your pin configuration
   - Select your display driver (ILI9341, ST7789, etc.)

4. **Update Code**
   - Set WiFi credentials
   - Set Firebase project ID
   - Adjust touch calibration if needed

5. **Upload to ESP32**
   - Select board: ESP32 Dev Module
   - Select correct COM port
   - Upload sketch

## Touch Calibration

The touch screen may need calibration. Adjust these values in the code:

```cpp
#define TOUCH_X_MIN 200
#define TOUCH_X_MAX 3800
#define TOUCH_Y_MIN 200
#define TOUCH_Y_MAX 3800
```

To calibrate:
1. Display touch coordinates on screen
2. Touch corners and note values
3. Update min/max values accordingly

## Firebase Configuration

The code uses Firestore REST API. For better security, consider:

1. **Using Cloud Functions** (Recommended)
   - Create a Cloud Function to verify codes
   - ESP32 calls the function via HTTPS
   - More secure and easier to implement

2. **Current Implementation**
   - Directly queries Firestore REST API
   - Requires Firestore rules to allow reads
   - Simpler but less secure

## Testing

1. **WiFi Connection**
   - Check Serial Monitor for connection status
   - Should see "WiFi Connected" on screen

2. **Touch Screen**
   - Tap number keys
   - Code should appear on screen
   - Tap "E" to verify

3. **Code Verification**
   - Enter a valid 6-digit code from a booking
   - Should show "ACCESS GRANTED"
   - Door lock should activate

4. **Error Handling**
   - Enter invalid code → "ACCESS DENIED"
   - Enter used code → "Code already used"

## Troubleshooting

### Display Not Working
- Check all connections
- Verify TFT_eSPI configuration
- Check display driver type
- Try different rotation values

### Touch Not Working
- Calibrate touch coordinates
- Check touch pin connections
- Verify touch driver in TFT_eSPI

### WiFi Connection Failed
- Check SSID and password
- Verify WiFi signal strength
- Check Serial Monitor for errors

### Firebase Connection Failed
- Verify Firebase project ID
- Check Firestore rules allow reads
- Check Serial Monitor for HTTP errors
- Verify API key if using authentication

### Code Verification Fails
- Check booking exists in Firestore
- Verify code is exactly 6 digits
- Check booking status is "confirmed"
- Verify Firestore rules

## Production Recommendations

1. **Use Cloud Functions** for verification
2. **Add authentication** (API keys, tokens)
3. **Implement rate limiting** to prevent brute force
4. **Add logging** for security monitoring
5. **Use NTP** for accurate timestamps
6. **Add error recovery** and retry logic
7. **Implement code expiration** after check-out
8. **Add admin override** for manual access

## Next Steps

1. Test with real bookings
2. Calibrate touch screen
3. Adjust UI layout if needed
4. Add additional features (time display, etc.)
5. Implement Cloud Functions for better security

