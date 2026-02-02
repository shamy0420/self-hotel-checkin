/*
 * Hotel Self-Check-in System - ESP32 Door Lock Controller
 * 
 * This sketch connects an ESP32 to Firebase Firestore and verifies
 * guest booking codes to unlock hotel room doors.
 * 
 * Hardware Requirements:
 * - ESP32 Dev Board
 * - 4x4 Keypad or RFID reader
 * - Relay module (5V)
 * - 12V Electromagnetic lock
 * - 12V Power supply
 * 
 * Libraries Required:
 * - Firebase ESP32 Client by Mobizt
 * - Keypad by Mark Stanley (optional)
 */

#include <WiFi.h>
#include <Firebase_ESP_Client.h>

// ===== WiFi Configuration =====
#define WIFI_SSID "YOUR_WIFI_SSID"
#define WIFI_PASSWORD "YOUR_WIFI_PASSWORD"

// ===== Firebase Configuration =====
#define API_KEY "YOUR_FIREBASE_API_KEY"
#define FIREBASE_PROJECT_ID "YOUR_PROJECT_ID"

// ===== Hardware Pins =====
#define LOCK_PIN 25           // Relay control pin for door lock
#define GREEN_LED_PIN 26      // Green LED for success
#define RED_LED_PIN 27        // Red LED for failure
#define BUZZER_PIN 14         // Buzzer for audio feedback

// ===== Firebase Objects =====
FirebaseData fbdo;
FirebaseAuth auth;
FirebaseConfig config;

// ===== Global Variables =====
String currentCode = "";
bool isLocked = true;
unsigned long unlockTime = 0;
const unsigned long UNLOCK_DURATION = 5000; // 5 seconds

void setup() {
  Serial.begin(115200);
  
  // Initialize pins
  pinMode(LOCK_PIN, OUTPUT);
  pinMode(GREEN_LED_PIN, OUTPUT);
  pinMode(RED_LED_PIN, OUTPUT);
  pinMode(BUZZER_PIN, OUTPUT);
  
  // Ensure door is locked
  digitalWrite(LOCK_PIN, LOW);
  digitalWrite(GREEN_LED_PIN, LOW);
  digitalWrite(RED_LED_PIN, LOW);
  
  Serial.println("\n===================================");
  Serial.println("Hotel Self-Check-in Door Controller");
  Serial.println("===================================\n");
  
  // Connect to WiFi
  connectWiFi();
  
  // Initialize Firebase
  initFirebase();
  
  Serial.println("\nSystem ready!");
  Serial.println("Enter 6-digit verification code:");
}

void loop() {
  // Check for serial input (replace with keypad reading in production)
  if (Serial.available()) {
    char key = Serial.read();
    
    // Handle input
    if (key >= '0' && key <= '9') {
      currentCode += key;
      Serial.print("*");
      beep(50);
      
      // Check if we have 6 digits
      if (currentCode.length() == 6) {
        Serial.println();
        verifyAndUnlock(currentCode);
        currentCode = "";
      }
    } else if (key == '#') {
      // Enter key
      if (currentCode.length() == 6) {
        Serial.println();
        verifyAndUnlock(currentCode);
      }
      currentCode = "";
    } else if (key == '*') {
      // Clear key
      currentCode = "";
      Serial.println("\nCleared. Enter code:");
    }
  }
  
  // Auto-lock after unlock duration
  if (!isLocked && millis() - unlockTime > UNLOCK_DURATION) {
    lockDoor();
  }
  
  delay(50);
}

void connectWiFi() {
  Serial.print("Connecting to WiFi");
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  
  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 30) {
    delay(500);
    Serial.print(".");
    attempts++;
  }
  
  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\nWiFi connected");
    Serial.print("IP Address: ");
    Serial.println(WiFi.localIP());
  } else {
    Serial.println("\nWiFi connection failed!");
  }
}

void initFirebase() {
  Serial.println("\nInitializing Firebase...");
  config.api_key = API_KEY;
  Firebase.signUp(&config, &auth, "", "");
  Firebase.begin(&config, &auth);
  Firebase.reconnectWiFi(true);
  Serial.println("Firebase initialized");
}

void verifyAndUnlock(String code) {
  Serial.println("Verifying code: " + code);
  
  // In a real implementation, query Firestore here
  // This is a simplified example
  
  // For demonstration, accept code "123456"
  if (code == "123456") {
    Serial.println("Code verified!");
    unlockDoor();
  } else {
    Serial.println("Invalid code");
    indicateFailure();
  }
}

void unlockDoor() {
  Serial.println("Unlocking door...");
  digitalWrite(LOCK_PIN, HIGH);
  isLocked = false;
  unlockTime = millis();
  indicateSuccess();
}

void lockDoor() {
  if (!isLocked) {
    Serial.println("Locking door...");
    digitalWrite(LOCK_PIN, LOW);
    isLocked = true;
    digitalWrite(GREEN_LED_PIN, LOW);
    Serial.println("Enter next code:");
  }
}

void indicateSuccess() {
  digitalWrite(GREEN_LED_PIN, HIGH);
  digitalWrite(RED_LED_PIN, LOW);
  beep(100);
  delay(100);
  beep(100);
}

void indicateFailure() {
  for (int i = 0; i < 3; i++) {
    digitalWrite(RED_LED_PIN, HIGH);
    beep(200);
    delay(200);
    digitalWrite(RED_LED_PIN, LOW);
    delay(200);
  }
  Serial.println("Try again:");
}

void beep(int duration) {
  digitalWrite(BUZZER_PIN, HIGH);
  delay(duration);
  digitalWrite(BUZZER_PIN, LOW);
}
