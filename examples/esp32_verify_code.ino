/**
 * ESP32 Code Verification Example
 * 
 * This code allows ESP32 to verify booking codes from Firebase
 * When a valid code is entered, it unlocks the door/access
 * 
 * Requirements:
 * - ESP32 board
 * - WiFi connection
 * - Firebase project with Firestore enabled
 * - Install Firebase Arduino library: https://github.com/mobizt/Firebase-ESP32
 */

#include <WiFi.h>
#include <FirebaseESP32.h>

// WiFi credentials
#define WIFI_SSID "YOUR_WIFI_SSID"
#define WIFI_PASSWORD "YOUR_WIFI_PASSWORD"

// Firebase configuration
#define FIREBASE_HOST "clixsys-smart-mirror-default-rtdb.firebaseio.com" // Use your Realtime Database URL
#define FIREBASE_AUTH "YOUR_FIREBASE_AUTH_TOKEN" // Get from Firebase Console > Project Settings > Service Accounts

// Firebase Data object
FirebaseData fbdo;

// FirebaseAuth and FirebaseConfig objects
FirebaseAuth auth;
FirebaseConfig config;

// Pin definitions (adjust based on your hardware)
#define DOOR_LOCK_PIN 2      // GPIO pin for door lock relay
#define LED_GREEN_PIN 4      // GPIO pin for green LED (success)
#define LED_RED_PIN 5        // GPIO pin for red LED (error)
#define BUZZER_PIN 18        // GPIO pin for buzzer

// Function to connect to WiFi
void setupWiFi() {
  Serial.print("Connecting to WiFi");
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  
  Serial.println();
  Serial.print("Connected! IP address: ");
  Serial.println(WiFi.localIP());
}

// Function to verify booking code using Firestore REST API
bool verifyCode(String code) {
  if (code.length() != 6) {
    return false;
  }

  // Use Firebase REST API to query Firestore
  // Query: Bookings collection where verificationCode == code
  String path = "/Bookings";
  String query = "?where=verificationCode==\"" + code + "\"";
  
  // Note: This is a simplified example. For production, use Firebase Admin SDK
  // or Firebase Functions for better security and easier querying
  
  // Alternative: Use HTTP client to query Firestore REST API
  HTTPClient http;
  String url = "https://firestore.googleapis.com/v1/projects/clixsys-smart-mirror/databases/(default)/documents/Bookings";
  
  // Add query parameter (this requires proper authentication)
  // For production, use Firebase Admin SDK or Cloud Functions
  
  http.begin(url);
  http.addHeader("Content-Type", "application/json");
  
  // This is a simplified version - in production, use proper authentication
  int httpCode = http.GET();
  
  if (httpCode == 200) {
    String payload = http.getString();
    // Parse JSON response to find matching code
    // Check if booking exists and is not already verified
    http.end();
    return true; // Simplified - implement proper JSON parsing
  }
  
  http.end();
  return false;
}

// Function to unlock door
void unlockDoor() {
  digitalWrite(DOOR_LOCK_PIN, HIGH);
  digitalWrite(LED_GREEN_PIN, HIGH);
  tone(BUZZER_PIN, 1000, 200); // Beep for 200ms
  
  Serial.println("Door unlocked!");
  delay(2000); // Keep unlocked for 2 seconds
  
  digitalWrite(DOOR_LOCK_PIN, LOW);
  digitalWrite(LED_GREEN_PIN, LOW);
}

// Function to show error
void showError() {
  digitalWrite(LED_RED_PIN, HIGH);
  tone(BUZZER_PIN, 500, 500); // Low beep for error
  delay(1000);
  digitalWrite(LED_RED_PIN, LOW);
}

// Function to verify code using Firebase Firestore
bool verifyCodeFirestore(String code) {
  // Query Firestore for booking with matching verification code
  // This requires Firebase Admin SDK or proper authentication
  
  // For now, using a simplified approach
  // In production, use Firebase Cloud Functions or Admin SDK
  
  FirebaseJson json;
  json.setJsonData("{\"verificationCode\":\"" + code + "\"}");
  
  // Query Firestore (this is simplified - implement proper query)
  if (Firebase.getJSON(fbdo, "/Bookings", "")) {
    FirebaseJsonData jsonData;
    FirebaseJsonArray arr;
    
    // Parse results and find matching code
    // This is a placeholder - implement proper JSON parsing
    
    return false; // Placeholder
  }
  
  return false;
}

void setup() {
  Serial.begin(115200);
  
  // Initialize pins
  pinMode(DOOR_LOCK_PIN, OUTPUT);
  pinMode(LED_GREEN_PIN, OUTPUT);
  pinMode(LED_RED_PIN, OUTPUT);
  pinMode(BUZZER_PIN, OUTPUT);
  
  digitalWrite(DOOR_LOCK_PIN, LOW);
  digitalWrite(LED_GREEN_PIN, LOW);
  digitalWrite(LED_RED_PIN, LOW);
  
  // Connect to WiFi
  setupWiFi();
  
  // Initialize Firebase
  config.host = FIREBASE_HOST;
  config.signer.tokens.legacy_token = FIREBASE_AUTH;
  
  Firebase.begin(&config, &auth);
  Firebase.reconnectWiFi(true);
  
  Serial.println("ESP32 Ready! Waiting for verification code...");
}

void loop() {
  // Check for serial input (code entry)
  if (Serial.available() > 0) {
    String code = Serial.readStringUntil('\n');
    code.trim();
    
    Serial.print("Verifying code: ");
    Serial.println(code);
    
    // Verify code
    if (verifyCodeFirestore(code)) {
      Serial.println("Code verified! Unlocking door...");
      unlockDoor();
    } else {
      Serial.println("Invalid code!");
      showError();
    }
  }
  
  delay(100);
}

/**
 * RECOMMENDED APPROACH FOR PRODUCTION:
 * 
 * Instead of querying Firestore directly from ESP32, use Firebase Cloud Functions:
 * 
 * 1. Create a Cloud Function that verifies codes
 * 2. ESP32 calls the function via HTTPS
 * 3. Function queries Firestore and returns result
 * 4. ESP32 unlocks door based on response
 * 
 * This is more secure and easier to implement.
 */

