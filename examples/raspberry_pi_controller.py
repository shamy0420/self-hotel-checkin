#!/usr/bin/env python3
"""
Hotel Self-Check-in System - Raspberry Pi Controller

This script connects a Raspberry Pi to Firebase Firestore and verifies
guest booking codes for door locks or kiosk displays.

Requirements:
    pip3 install firebase-admin RPi.GPIO

Hardware:
    - Raspberry Pi (any model with GPIO)
    - Relay module
    - 12V Door lock
    - Keypad or touchscreen
"""

import firebase_admin
from firebase_admin import credentials, firestore
import RPi.GPIO as GPIO
import time
from datetime import datetime

# ===== Configuration =====
LOCK_PIN = 17          # GPIO pin for door lock relay
GREEN_LED_PIN = 27     # GPIO pin for green LED
RED_LED_PIN = 22       # GPIO pin for red LED
BUZZER_PIN = 18        # GPIO pin for buzzer

UNLOCK_DURATION = 5    # Seconds to keep door unlocked

# ===== Initialize Firebase =====
# Download your service account key from Firebase Console
# Place it in the same directory as this script
cred = credentials.Certificate('serviceAccountKey.json')
firebase_admin.initialize_app(cred)
db = firestore.client()

# ===== Initialize GPIO =====
GPIO.setmode(GPIO.BCM)
GPIO.setwarnings(False)

GPIO.setup(LOCK_PIN, GPIO.OUT)
GPIO.setup(GREEN_LED_PIN, GPIO.OUT)
GPIO.setup(RED_LED_PIN, GPIO.OUT)
GPIO.setup(BUZZER_PIN, GPIO.OUT)

# Ensure door is locked
GPIO.output(LOCK_PIN, GPIO.LOW)
GPIO.output(GREEN_LED_PIN, GPIO.LOW)
GPIO.output(RED_LED_PIN, GPIO.LOW)


def beep(duration=0.1):
    """Sound the buzzer for specified duration"""
    GPIO.output(BUZZER_PIN, GPIO.HIGH)
    time.sleep(duration)
    GPIO.output(BUZZER_PIN, GPIO.LOW)


def indicate_success():
    """Visual and audio feedback for successful verification"""
    GPIO.output(GREEN_LED_PIN, GPIO.HIGH)
    GPIO.output(RED_LED_PIN, GPIO.LOW)
    beep(0.1)
    time.sleep(0.1)
    beep(0.1)


def indicate_failure():
    """Visual and audio feedback for failed verification"""
    for _ in range(3):
        GPIO.output(RED_LED_PIN, GPIO.HIGH)
        beep(0.2)
        time.sleep(0.2)
        GPIO.output(RED_LED_PIN, GPIO.LOW)
        time.sleep(0.2)


def verify_code(code):
    """
    Verify booking code against Firebase Firestore
    
    Args:
        code (str): 6-digit verification code
        
    Returns:
        dict: Booking details if valid, None otherwise
    """
    try:
        # Query Firestore for matching booking
        bookings_ref = db.collection('bookings')
        query = bookings_ref.where('verificationCode', '==', code).limit(1)
        results = query.get()
        
        if results:
            booking_doc = results[0]
            booking = booking_doc.to_dict()
            
            # Update booking as verified
            booking_doc.reference.update({
                'verified': True,
                'verifiedAt': firestore.SERVER_TIMESTAMP
            })
            
            print(f"✓ Code verified!")
            print(f"  Guest: {booking.get('guestName')}")
            print(f"  Room: {booking.get('roomName')}")
            
            return booking
        else:
            print("✗ Invalid code")
            return None
            
    except Exception as e:
        print(f"Error verifying code: {e}")
        return None


def unlock_door():
    """Unlock the door for specified duration"""
    print("🔓 Unlocking door...")
    GPIO.output(LOCK_PIN, GPIO.HIGH)
    indicate_success()
    
    time.sleep(UNLOCK_DURATION)
    
    print("🔒 Locking door...")
    GPIO.output(LOCK_PIN, GPIO.LOW)
    GPIO.output(GREEN_LED_PIN, GPIO.LOW)


def get_todays_checkins():
    """Get all bookings scheduled for today"""
    today = datetime.now().date().isoformat()
    
    bookings_ref = db.collection('bookings')
    query = bookings_ref.where('checkIn', '==', today)
    results = query.get()
    
    bookings = [doc.to_dict() for doc in results]
    return bookings


def listen_for_bookings():
    """Listen for new bookings in real-time"""
    def on_snapshot(col_snapshot, changes, read_time):
        for change in changes:
            if change.type.name == 'ADDED':
                booking = change.document.to_dict()
                print(f"New booking received:")
                print(f"  Guest: {booking.get('guestName')}")
                print(f"  Room: {booking.get('roomName')}")
                print(f"  Code: {booking.get('verificationCode')}")
    
    bookings_ref = db.collection('bookings')
    doc_watch = bookings_ref.on_snapshot(on_snapshot)
    return doc_watch


def main():
    """Main loop for the check-in system"""
    print("\n" + "="*50)
    print("Hotel Self-Check-in System - Raspberry Pi")
    print("="*50 + "\n")
    
    # Display today's check-ins
    checkins = get_todays_checkins()
    print(f"Today's check-ins: {len(checkins)}")
    for booking in checkins:
        status = "✓" if booking.get('verified') else "○"
        print(f"  {status} {booking.get('guestName')} - Room {booking.get('roomName')}")
    
    print("\n" + "-"*50)
    print("System ready. Waiting for verification codes...")
    print("Enter 'q' to quit")
    print("-"*50 + "\n")
    
    # Optional: Start listening for new bookings
    # doc_watch = listen_for_bookings()
    
    try:
        while True:
            # Get code input
            code = input("Enter 6-digit code: ").strip()
            
            if code.lower() == 'q':
                break
            
            if len(code) != 6 or not code.isdigit():
                print("Invalid format. Code must be 6 digits.")
                beep(0.1)
                continue
            
            # Verify code
            booking = verify_code(code)
            
            if booking:
                unlock_door()
            else:
                indicate_failure()
            
            print("\nReady for next code...\n")
            
    except KeyboardInterrupt:
        print("\n\nShutting down...")
    finally:
        # Cleanup
        GPIO.cleanup()
        print("GPIO cleaned up. Goodbye!")


if __name__ == '__main__':
    main()
