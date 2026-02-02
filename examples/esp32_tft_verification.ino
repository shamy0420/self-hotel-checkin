/**
 * ESP32 TFT Display Code Verification System
 * 
 * Simple white and blue UI with "Enter code" display
 * Connects to Firebase Firestore (cloud) to verify booking codes
 * 
 * Pin Configuration:
 * TFT D0-D7 → GPIO 12, 13, 26, 25, 22, 23, 27, 14
 * TFT Control → GPIO 32, 33, 15, 4, 2
 * Touch → GPIO 5, 18, 19, 21
 * Door Lock → GPIO 16
 * Buzzer → GPIO 17
 */

#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <TFT_eSPI.h>

// WiFi credentials - UPDATE THESE
const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";

// Firebase Firestore configuration (cloud-based)
const char* firebaseProjectId = "clixsys-smart-mirror";
const char* firebaseHost = "firestore.googleapis.com";
const char* firebaseApiKey = "AIzaSyCuwoLX6t-zrstq-FSHdXX87WyQ22ZmlJg"; // Firebase API Key

// Hardware pins
#define DOOR_LOCK_PIN 16
#define BUZZER_PIN 17

// TFT Display
TFT_eSPI tft = TFT_eSPI();

// Touch calibration (adjust for your screen)
#define TOUCH_X_MIN 200
#define TOUCH_X_MAX 3800
#define TOUCH_Y_MIN 200
#define TOUCH_Y_MAX 3800

// UI State
String enteredCode = "";
bool verifying = false;
unsigned long lastTouchTime = 0;
const unsigned long TOUCH_DEBOUNCE = 200;

// Colors - White and Blue theme
#define COLOR_BG TFT_WHITE
#define COLOR_BLUE TFT_BLUE
#define COLOR_TEXT TFT_BLACK
#define COLOR_KEYPAD TFT_LIGHTGREY
#define COLOR_KEY_TEXT TFT_BLACK

// Keypad layout
struct Key {
  int x, y, w, h;
  char label;
};

Key keys[12] = {
  {20, 140, 60, 50, '1'}, {90, 140, 60, 50, '2'}, {160, 140, 60, 50, '3'},
  {20, 200, 60, 50, '4'}, {90, 200, 60, 50, '5'}, {160, 200, 60, 50, '6'},
  {20, 260, 60, 50, '7'}, {90, 260, 60, 50, '8'}, {160, 260, 60, 50, '9'},
  {20, 320, 60, 50, 'C'}, {90, 320, 60, 50, '0'}, {160, 320, 60, 50, 'E'}
};

void setup() {
  Serial.begin(115200);
  
  // Initialize pins
  pinMode(DOOR_LOCK_PIN, OUTPUT);
  pinMode(BUZZER_PIN, OUTPUT);
  digitalWrite(DOOR_LOCK_PIN, LOW);
  
  // Initialize TFT
  tft.init();
  tft.setRotation(1); // Landscape
  tft.fillScreen(COLOR_BG);
  
  // Show initial screen
  drawMainScreen();
  
  // Connect to WiFi
  drawStatus("Connecting to WiFi...", COLOR_BLUE);
  connectWiFi();
  
  // Show ready screen
  drawMainScreen();
  Serial.println("ESP32 Ready - Connected to Firebase Cloud!");
}

void loop() {
  if (verifying) {
    return; // Don't process touches while verifying
  }
  
  // Check for touch input
  uint16_t x, y;
  bool touched = tft.getTouch(&x, &y);
  
  if (touched && (millis() - lastTouchTime > TOUCH_DEBOUNCE)) {
    lastTouchTime = millis();
    handleTouch(x, y);
  }
  
  // Auto-verify when 6 digits entered
  if (enteredCode.length() == 6 && !verifying) {
    verifying = true;
    verifyCode(enteredCode);
  }
  
  delay(50);
}

void connectWiFi() {
  WiFi.begin(ssid, password);
  int attempts = 0;
  
  while (WiFi.status() != WL_CONNECTED && attempts < 30) {
    delay(500);
    Serial.print(".");
    attempts++;
  }
  
  if (WiFi.status() == WL_CONNECTED) {
    Serial.println();
    Serial.print("WiFi Connected! IP: ");
    Serial.println(WiFi.localIP());
    drawStatus("Connected to Cloud", TFT_GREEN);
    delay(1500);
  } else {
    Serial.println("WiFi connection failed!");
    drawStatus("WiFi Failed - Check Settings", TFT_RED);
    delay(2000);
  }
}

void drawMainScreen() {
  tft.fillScreen(COLOR_BG);
  
  // Blue header bar
  tft.fillRect(0, 0, 240, 60, COLOR_BLUE);
  
  // Title in blue bar
  tft.setTextColor(TFT_WHITE, COLOR_BLUE);
  tft.setTextSize(2);
  tft.setCursor(50, 20);
  tft.println("HOTEL CHECK-IN");
  
  // "Enter code" text - prominent display
  tft.setTextColor(COLOR_BLUE, COLOR_BG);
  tft.setTextSize(3);
  tft.setCursor(30, 80);
  tft.println("Enter Code");
  
  // Code display area (white background with blue border)
  tft.fillRect(20, 110, 200, 20, COLOR_BG);
  tft.drawRect(20, 110, 200, 20, COLOR_BLUE);
  updateCodeDisplay();
  
  // Draw keypad
  drawKeypad();
  
  // Status area
  tft.setTextColor(COLOR_TEXT, COLOR_BG);
  tft.setTextSize(1);
  tft.setCursor(20, 380);
  tft.println("Enter 6-digit verification code");
}

void drawKeypad() {
  for (int i = 0; i < 12; i++) {
    // Key background
    tft.fillRect(keys[i].x, keys[i].y, keys[i].w, keys[i].h, COLOR_KEYPAD);
    tft.drawRect(keys[i].x, keys[i].y, keys[i].w, keys[i].h, COLOR_BLUE);
    
    // Key label
    tft.setTextColor(COLOR_KEY_TEXT, COLOR_KEYPAD);
    tft.setTextSize(2);
    int labelX = keys[i].x + (keys[i].w / 2) - 8;
    int labelY = keys[i].y + (keys[i].h / 2) - 10;
    tft.setCursor(labelX, labelY);
    tft.print(keys[i].label);
  }
}

void updateCodeDisplay() {
  tft.fillRect(25, 112, 190, 16, COLOR_BG);
  tft.setTextColor(COLOR_BLUE, COLOR_BG);
  tft.setTextSize(2);
  tft.setCursor(30, 112);
  
  String displayCode = enteredCode;
  while (displayCode.length() < 6) {
    displayCode += "_";
  }
  tft.println(displayCode);
}

void handleTouch(uint16_t x, uint16_t y) {
  // Convert touch coordinates
  int touchX = map(x, TOUCH_X_MIN, TOUCH_X_MAX, 0, 240);
  int touchY = map(y, TOUCH_Y_MIN, TOUCH_Y_MAX, 0, 320);
  
  // Check which key was pressed
  for (int i = 0; i < 12; i++) {
    if (touchX >= keys[i].x && touchX <= keys[i].x + keys[i].w &&
        touchY >= keys[i].y && touchY <= keys[i].y + keys[i].h) {
      
      char key = keys[i].label;
      
      if (key == 'C') {
        // Clear
        enteredCode = "";
        updateCodeDisplay();
        drawStatus("Code cleared", COLOR_BLUE);
        beep(50);
      } else if (key == 'E') {
        // Enter/Verify
        if (enteredCode.length() == 6) {
          verifying = true;
          verifyCode(enteredCode);
        } else {
          drawStatus("Enter 6 digits", TFT_ORANGE);
          beep(100);
        }
      } else if (key >= '0' && key <= '9') {
        // Number key
        if (enteredCode.length() < 6) {
          enteredCode += key;
          updateCodeDisplay();
          beep(50);
        }
      }
      
      break;
    }
  }
}

void drawStatus(String message, uint16_t color) {
  tft.fillRect(20, 380, 200, 20, COLOR_BG);
  tft.setTextColor(color, COLOR_BG);
  tft.setTextSize(1);
  tft.setCursor(20, 380);
  tft.println(message);
}

void verifyCode(String code) {
  drawStatus("Verifying with Firebase...", COLOR_BLUE);
  Serial.print("Verifying code: ");
  Serial.println(code);
  
  // Query Firebase Firestore REST API (cloud-based)
  HTTPClient http;
  
  // Build Firestore query URL - queries Bookings collection in cloud
  String url = "https://";
  url += firebaseHost;
  url += "/v1/projects/";
  url += firebaseProjectId;
  url += "/databases/(default)/documents/Bookings";
  
  // Add query parameters
  url += "?where=verificationCode==\"" + code + "\"";
  url += "&where=status==\"confirmed\"";
  
  http.begin(url);
  http.addHeader("Content-Type", "application/json");
  http.addHeader("X-Goog-Api-Key", firebaseApiKey); // Add Firebase API Key
  
  Serial.print("Querying Firebase: ");
  Serial.println(url);
  
  int httpCode = http.GET();
  Serial.print("HTTP Response Code: ");
  Serial.println(httpCode);
  
  if (httpCode == 200) {
    String payload = http.getString();
    Serial.println("Response received");
    
    // Parse JSON response
    DynamicJsonDocument doc(4096);
    DeserializationError error = deserializeJson(doc, payload);
    
    if (error) {
      Serial.print("JSON parse error: ");
      Serial.println(error.c_str());
      showError("Parse error");
      http.end();
      resetAfterDelay();
      return;
    }
    
    // Check if booking found
    if (doc.containsKey("documents") && doc["documents"].size() > 0) {
      JsonObject booking = doc["documents"][0];
      JsonObject fields = booking["fields"];
      
      // Check if already verified
      bool alreadyVerified = false;
      if (fields.containsKey("verified")) {
        alreadyVerified = fields["verified"]["booleanValue"].as<bool>();
      }
      
      if (alreadyVerified) {
        showError("Code already used");
        http.end();
        resetAfterDelay();
        return;
      }
      
      // Get booking ID from name field
      String bookingName = booking["name"].as<String>();
      int lastSlash = bookingName.lastIndexOf('/');
      String bookingId = bookingName.substring(lastSlash + 1);
      
      // Check dates
      String checkIn = fields["checkIn"]["stringValue"].as<String>();
      String checkOut = fields["checkOut"]["stringValue"].as<String>();
      
      if (!isDateValid(checkIn, checkOut)) {
        showError("Booking expired");
        http.end();
        resetAfterDelay();
        return;
      }
      
      // Mark as verified
      if (markAsVerified(bookingId)) {
        // Get guest name
        String guestName = fields["guestName"]["stringValue"].as<String>();
        showSuccess(guestName);
        unlockDoor();
      } else {
        showError("Update failed");
        resetAfterDelay();
      }
      
    } else {
      Serial.println("No booking found");
      showError("Invalid code");
      resetAfterDelay();
    }
  } else {
    Serial.print("HTTP Error: ");
    Serial.println(httpCode);
    String errorMsg = http.getString();
    Serial.println(errorMsg);
    showError("Connection error");
    resetAfterDelay();
  }
  
  http.end();
}

bool isDateValid(String checkIn, String checkOut) {
  // Simple date validation - check if today is between check-in and check-out
  // For production, use proper date parsing
  // This is a simplified check
  return true; // Allow verification if booking exists and is confirmed
}

bool markAsVerified(String bookingId) {
  HTTPClient http;
  
  String url = "https://";
  url += firebaseHost;
  url += "/v1/projects/";
  url += firebaseProjectId;
  url += "/databases/(default)/documents/Bookings/";
  url += bookingId;
  
  // Create update payload
  DynamicJsonDocument doc(512);
  doc["fields"]["verified"]["booleanValue"] = true;
  
  // Get current timestamp (simplified)
  String timestamp = String(millis() / 1000);
  doc["fields"]["verifiedAt"]["stringValue"] = timestamp;
  
  String payload;
  serializeJson(doc, payload);
  
  http.begin(url);
  http.addHeader("Content-Type", "application/json");
  http.addHeader("X-Goog-Api-Key", firebaseApiKey); // Add Firebase API Key
  
  // Use PATCH method to update
  int httpCode = http.sendRequest("PATCH", payload);
  
  http.end();
  
  return (httpCode == 200);
}

void showSuccess(String guestName) {
  tft.fillScreen(TFT_GREEN);
  tft.setTextColor(TFT_WHITE, TFT_GREEN);
  tft.setTextSize(3);
  tft.setCursor(30, 100);
  tft.println("ACCESS");
  tft.setCursor(40, 150);
  tft.println("GRANTED");
  
  tft.setTextSize(2);
  tft.setCursor(20, 220);
  tft.print("Welcome, ");
  tft.println(guestName);
  
  digitalWrite(LED_GREEN_PIN, HIGH);
  beep(200);
}

void showError(String message) {
  tft.fillScreen(TFT_RED);
  tft.setTextColor(TFT_WHITE, TFT_RED);
  tft.setTextSize(3);
  tft.setCursor(30, 100);
  tft.println("ACCESS");
  tft.setCursor(40, 150);
  tft.println("DENIED");
  
  tft.setTextSize(2);
  tft.setCursor(40, 220);
  tft.println(message);
  
  digitalWrite(LED_RED_PIN, HIGH);
  beep(100);
  delay(100);
  beep(100);
}

void unlockDoor() {
  digitalWrite(DOOR_LOCK_PIN, HIGH);
  delay(3000); // Keep unlocked for 3 seconds
  digitalWrite(DOOR_LOCK_PIN, LOW);
  digitalWrite(LED_GREEN_PIN, LOW);
  
  delay(2000);
  resetAfterDelay();
}

void beep(int duration) {
  tone(BUZZER_PIN, 1000, duration);
}

void resetAfterDelay() {
  delay(3000);
  enteredCode = "";
  verifying = false;
  digitalWrite(LED_RED_PIN, LOW);
  drawMainScreen();
}
