/**
 * ESP32 Complete Configuration for Hotel Check-In System
 * 
 * Copy these values directly into your Arduino ESP32 code
 */

// ============================================
// WiFi Configuration
// ============================================
const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";

// ============================================
// Firebase Configuration (Option 2: Direct Firebase)
// ============================================

// Firebase API Key (for Firestore REST API)
#define FIREBASE_API_KEY "AIzaSyCuwoLX6t-zrstq-FSHdXX87WyQ22ZmlJg"

// Firebase Project ID
#define FIREBASE_PROJECT_ID "clixsys-smart-mirror"

// Firebase Host
#define FIREBASE_HOST "firestore.googleapis.com"

// Firestore Collection Name
#define FIRESTORE_COLLECTION "Bookings"  // Use "Bookings" (capitalized)

// Firestore Database URL
// Format: https://firestore.googleapis.com/v1/projects/{PROJECT_ID}/databases/(default)/documents/{COLLECTION}
#define FIRESTORE_BASE_URL "https://firestore.googleapis.com/v1/projects/clixsys-smart-mirror/databases/(default)/documents"

// ============================================
// Firestore Query Configuration
// ============================================

// Query Field: verificationCode (string, 6 digits)
// Collection Path: Bookings
// Fields Returned:
//   - guestName (string)
//   - roomTypeName (string)
//   - checkIn (string, ISO date)
//   - checkOut (string, ISO date)
//   - verified (boolean)
//   - email (string)
//   - verificationCode (string)

// ============================================
// Example Arduino Code Implementation:
// ============================================

/*
#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

// Use the defines above

bool verifyCode(String code) {
  HTTPClient http;
  
  // Firestore REST API query endpoint
  String url = FIRESTORE_BASE_URL + ":runQuery";
  
  // Create structured query JSON
  String queryJson = "{";
  queryJson += "\"structuredQuery\":{";
  queryJson += "\"from\":[{\"collectionId\":\"" + String(FIRESTORE_COLLECTION) + "\"}],";
  queryJson += "\"where\":{";
  queryJson += "\"fieldFilter\":{";
  queryJson += "\"field\":{\"fieldPath\":\"verificationCode\"},";
  queryJson += "\"op\":\"EQUAL\",";
  queryJson += "\"value\":{\"stringValue\":\"" + code + "\"}";
  queryJson += "}";
  queryJson += "},";
  queryJson += "\"limit\":1";
  queryJson += "}";
  queryJson += "}";
  
  http.begin(url);
  http.addHeader("Content-Type", "application/json");
  http.addHeader("X-Goog-Api-Key", FIREBASE_API_KEY);
  
  int httpCode = http.POST(queryJson);
  
  if (httpCode == 200) {
    String response = http.getString();
    
    // Parse JSON
    DynamicJsonDocument doc(4096);
    deserializeJson(doc, response);
    
    // Check if documents array exists and has items
    if (doc.containsKey("document")) {
      // Code found - booking verified
      return true;
    }
  }
  
  http.end();
  return false;
}
*/

// ============================================
// Keypad Configuration (if using matrix keypad)
// ============================================

// Matrix Keypad 4x4 pins:
// #define R1 32  // Row 1
// #define R2 33  // Row 2
// #define R3 25  // Row 3
// #define R4 26  // Row 4
// #define C1 27  // Column 1
// #define C2 14  // Column 2
// #define C3 12  // Column 3
// #define C4 13  // Column 4

// ============================================
// Quick Reference:
// ============================================

/*
FIREBASE_API_KEY = "AIzaSyCuwoLX6t-zrstq-FSHdXX87WyQ22ZmlJg"
FIREBASE_PROJECT_ID = "clixsys-smart-mirror"
FIRESTORE_COLLECTION = "Bookings"
FIRESTORE_BASE_URL = "https://firestore.googleapis.com/v1/projects/clixsys-smart-mirror/databases/(default)/documents"

Query Endpoint: FIRESTORE_BASE_URL + ":runQuery"
Request Header: "X-Goog-Api-Key: " + FIREBASE_API_KEY
Query Field: verificationCode
Response Fields: guestName, roomTypeName, checkIn, checkOut, verified, email
*/



