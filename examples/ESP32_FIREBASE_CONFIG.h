/**
 * ESP32 Firebase Configuration
 * 
 * Copy these values to your Arduino ESP32 code
 */

// ============================================
// OPTION 2: Direct Firebase Firestore (Recommended)
// ============================================

// Firebase API Configuration
#define FIREBASE_API_KEY "AIzaSyCuwoLX6t-zrstq-FSHdXX87WyQ22ZmlJg"
#define FIREBASE_PROJECT_ID "clixsys-smart-mirror"
#define FIREBASE_HOST "firestore.googleapis.com"

// Firestore Collection Path
#define FIRESTORE_COLLECTION "Bookings"  // or "bookings" (both work)

// Firestore REST API Endpoint
// Format: https://firestore.googleapis.com/v1/projects/{PROJECT_ID}/databases/(default)/documents/{COLLECTION}
#define FIRESTORE_URL "https://firestore.googleapis.com/v1/projects/clixsys-smart-mirror/databases/(default)/documents/Bookings"

// Fields to query/return
// Query field: verificationCode
// Return fields: guestName, roomTypeName, checkIn, checkOut, verified, email

// ============================================
// Example Usage in Arduino Code:
// ============================================

/*
#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

// WiFi credentials
const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";

// Firebase config (from above)
#define FIREBASE_API_KEY "AIzaSyCuwoLX6t-zrstq-FSHdXX87WyQ22ZmlJg"
#define FIREBASE_PROJECT_ID "clixsys-smart-mirror"

bool verifyCode(String code) {
  HTTPClient http;
  
  // Query Firestore for booking with matching verification code
  String url = "https://firestore.googleapis.com/v1/projects/" + String(FIREBASE_PROJECT_ID) + 
               "/databases/(default)/documents:runQuery";
  
  // Create query JSON
  String queryJson = "{\"structuredQuery\":{\"from\":[{\"collectionId\":\"Bookings\"}],\"where\":{\"fieldFilter\":{\"field\":{\"fieldPath\":\"verificationCode\"},\"op\":\"EQUAL\",\"value\":{\"stringValue\":\"" + code + "\"}}},\"limit\":1}}";
  
  http.begin(url);
  http.addHeader("Content-Type", "application/json");
  http.addHeader("X-Goog-Api-Key", FIREBASE_API_KEY);
  
  int httpCode = http.POST(queryJson);
  
  if (httpCode == 200) {
    String response = http.getString();
    // Parse JSON response
    // If document found, return true
    return true;
  }
  
  return false;
}
*/

// ============================================
// OPTION 1: Backend API (If you create one)
// ============================================

// If you create a backend API endpoint:
// #define API_URL "https://your-backend.com/api/verify"
// Request: POST {"code": "123456"}
// Response: {"success": true, "booking": {...}} or {"success": false, "message": "..."}

// ============================================
// Keypad Configuration (if using keypad)
// ============================================

// Matrix Keypad pins (4x4)
// R1, R2, R3, R4 = Row pins
// C1, C2, C3, C4 = Column pins
// Example:
// #define R1 32
// #define R2 33
// #define R3 25
// #define R4 26
// #define C1 27
// #define C2 14
// #define C3 12
// #define C4 13

// ============================================
// Complete Configuration Summary:
// ============================================

/*
FIREBASE_API_KEY = "AIzaSyCuwoLX6t-zrstq-FSHdXX87WyQ22ZmlJg"
FIREBASE_PROJECT_ID = "clixsys-smart-mirror"
FIRESTORE_COLLECTION = "Bookings"
FIRESTORE_URL = "https://firestore.googleapis.com/v1/projects/clixsys-smart-mirror/databases/(default)/documents/Bookings"

Query Field: verificationCode
Return Fields: guestName, roomTypeName, checkIn, checkOut, verified, email, verificationCode
*/



