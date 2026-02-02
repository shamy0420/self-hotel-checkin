import { db } from '../boot/firebase';
import { collection, query, where, getDocs, getDoc, doc, updateDoc, addDoc, deleteDoc } from 'firebase/firestore';

/**
 * Verify booking code API endpoint
 * This can be called by ESP32/Raspberry Pi devices
 * 
 * Usage:
 * POST /api/verify
 * Body: { "code": "123456" }
 * 
 * Response:
 * Success: { "success": true, "booking": {...} }
 * Failure: { "success": false, "message": "Invalid code" }
 */
export async function verifyBookingCode(code) {
  try {
    if (!code || code.length !== 6) {
      return {
        success: false,
        message: 'Invalid code format'
      };
    }

    // Check both 'bookings' and 'Bookings' collections
    let q = query(
      collection(db, 'Bookings'),
      where('verificationCode', '==', code)
    );
    let querySnapshot = await getDocs(q);

    // If not found, try lowercase collection
    if (querySnapshot.empty) {
      q = query(
        collection(db, 'bookings'),
        where('verificationCode', '==', code)
      );
      querySnapshot = await getDocs(q);
    }

    if (!querySnapshot.empty) {
      const bookingDoc = querySnapshot.docs[0];
      const booking = {
        id: bookingDoc.id,
        ...bookingDoc.data()
      };

      // Determine which collection to update
      const collectionName = bookingDoc.ref.parent.id === 'Bookings' ? 'Bookings' : 'bookings';

      // Update the booking to mark it as verified
      await updateDoc(doc(db, collectionName, booking.id), {
        verified: true,
        verifiedAt: new Date().toISOString()
      });

      // Check if booking is already verified
      if (booking.verified) {
        return {
          success: false,
          message: 'Code already used',
          booking: {
            id: booking.id,
            guestName: booking.guestName,
            roomName: booking.roomTypeName || booking.roomName,
            checkIn: booking.checkIn,
            checkOut: booking.checkOut,
            verified: true
          }
        };
      }

      return {
        success: true,
        booking: {
          id: booking.id,
          guestName: booking.guestName,
          roomName: booking.roomTypeName || booking.roomName,
          roomTypeId: booking.roomTypeId || booking.roomId,
          checkIn: booking.checkIn,
          checkOut: booking.checkOut,
          verified: true
        }
      };
    } else {
      return {
        success: false,
        message: 'Invalid code'
      };
    }
  } catch (error) {
    console.error('Error verifying code:', error);
    return {
      success: false,
      message: 'Verification error',
      error: error.message
    };
  }
}

/**
 * Get all bookings for a specific date
 * This can be used by the hotel system to check today's check-ins
 * 
 * Usage:
 * GET /api/bookings?date=2024-11-10
 */
export async function getBookingsByDate(date) {
  try {
    // Try 'Bookings' collection first
    let q = query(
      collection(db, 'Bookings'),
      where('checkIn', '==', date)
    );
    let querySnapshot = await getDocs(q);

    // If empty, try lowercase
    if (querySnapshot.empty) {
      q = query(
        collection(db, 'bookings'),
        where('checkIn', '==', date)
      );
      querySnapshot = await getDocs(q);
    }

    const bookings = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return {
      success: true,
      bookings
    };
  } catch (error) {
    console.error('Error fetching bookings:', error);
    return {
      success: false,
      message: 'Error fetching bookings',
      error: error.message
    };
  }
}

/**
 * Get room availability
 * This can be used to check which rooms are available
 */
export async function getRoomAvailability() {
  try {
    // Try 'Rooms' collection first
    let q = query(collection(db, 'Rooms'));
    let querySnapshot = await getDocs(q);

    // If empty, try lowercase
    if (querySnapshot.empty) {
      q = query(collection(db, 'rooms'));
      querySnapshot = await getDocs(q);
    }

    const rooms = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return {
      success: true,
      rooms
    };
  } catch (error) {
    console.error('Error fetching rooms:', error);
    return {
      success: false,
      message: 'Error fetching rooms',
      error: error.message
    };
  }
}

/**
 * Check if a room is available for specific dates
 * Used by admin and booking system
 */
export async function checkRoomAvailabilityForDates(roomId, checkIn, checkOut) {
  try {
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);

    // Get all confirmed bookings for this room
    let q = query(
      collection(db, 'Bookings'),
      where('roomId', '==', roomId),
      where('status', '==', 'confirmed')
    );
    let querySnapshot = await getDocs(q);

    // If empty, try lowercase
    if (querySnapshot.empty) {
      q = query(
        collection(db, 'bookings'),
        where('roomId', '==', roomId),
        where('status', '==', 'confirmed')
      );
      querySnapshot = await getDocs(q);
    }

    // Check for date conflicts
    for (const bookingDoc of querySnapshot.docs) {
      const booking = bookingDoc.data();
      const bookingCheckIn = new Date(booking.checkIn);
      const bookingCheckOut = new Date(booking.checkOut);

      // Check if dates overlap
      if (
        (checkInDate >= bookingCheckIn && checkInDate < bookingCheckOut) ||
        (checkOutDate > bookingCheckIn && checkOutDate <= bookingCheckOut) ||
        (checkInDate <= bookingCheckIn && checkOutDate >= bookingCheckOut)
      ) {
        return {
          success: true,
          available: false,
          conflictingBooking: {
            id: bookingDoc.id,
            checkIn: booking.checkIn,
            checkOut: booking.checkOut,
            guestName: booking.guestName
          }
        };
      }
    }

    return {
      success: true,
      available: true
    };
  } catch (error) {
    console.error('Error checking room availability:', error);
    return {
      success: false,
      message: 'Error checking availability',
      error: error.message
    };
  }
}

/**
 * ADMIN FUNCTIONS - For use in admin dashboard
 * These functions allow admins to manage rooms and bookings
 */

/**
 * Update room availability status
 * Admin can manually set a room as available/unavailable
 */
export async function updateRoomAvailability(roomId, available) {
  try {
    // Try 'Rooms' collection first
    let roomRef = doc(db, 'Rooms', roomId);
    try {
      await updateDoc(roomRef, {
        available: available,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      // Try lowercase collection
      roomRef = doc(db, 'rooms', roomId);
      await updateDoc(roomRef, {
        available: available,
        updatedAt: new Date().toISOString()
      });
    }

    return {
      success: true,
      message: `Room ${available ? 'marked as available' : 'marked as unavailable'}`
    };
  } catch (error) {
    console.error('Error updating room availability:', error);
    return {
      success: false,
      message: 'Error updating room availability',
      error: error.message
    };
  }
}

/**
 * Add a new room
 * Admin can add new rooms to the system
 */
export async function addRoom(roomData) {
  try {
    // Try 'Rooms' collection first
    try {
      await addDoc(collection(db, 'Rooms'), {
        ...roomData,
        available: roomData.available !== undefined ? roomData.available : true,
        createdAt: new Date().toISOString()
      });
    } catch (error) {
      // Try lowercase collection
      await addDoc(collection(db, 'rooms'), {
        ...roomData,
        available: roomData.available !== undefined ? roomData.available : true,
        createdAt: new Date().toISOString()
      });
    }

    return {
      success: true,
      message: 'Room added successfully'
    };
  } catch (error) {
    console.error('Error adding room:', error);
    return {
      success: false,
      message: 'Error adding room',
      error: error.message
    };
  }
}

/**
 * Update room details
 * Admin can update room information
 */
export async function updateRoom(roomId, roomData) {
  try {
    // Try 'Rooms' collection first
    let roomRef = doc(db, 'Rooms', roomId);
    try {
      await updateDoc(roomRef, {
        ...roomData,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      // Try lowercase collection
      roomRef = doc(db, 'rooms', roomId);
      await updateDoc(roomRef, {
        ...roomData,
        updatedAt: new Date().toISOString()
      });
    }

    return {
      success: true,
      message: 'Room updated successfully'
    };
  } catch (error) {
    console.error('Error updating room:', error);
    return {
      success: false,
      message: 'Error updating room',
      error: error.message
    };
  }
}

/**
 * Get all bookings
 * Admin can view all bookings
 */
export async function getAllBookings() {
  try {
    // Try 'Bookings' collection first
    let q = query(collection(db, 'Bookings'));
    let querySnapshot = await getDocs(q);

    // If empty, try lowercase
    if (querySnapshot.empty) {
      q = query(collection(db, 'bookings'));
      querySnapshot = await getDocs(q);
    }

    const bookings = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return {
      success: true,
      bookings
    };
  } catch (error) {
    console.error('Error fetching all bookings:', error);
    return {
      success: false,
      message: 'Error fetching bookings',
      error: error.message
    };
  }
}

/**
 * Update booking status
 * Admin can update booking status (confirmed, cancelled, etc.)
 */
export async function updateBookingStatus(bookingId, status) {
  try {
    // Try 'Bookings' collection first
    let bookingRef = doc(db, 'Bookings', bookingId);
    try {
      await updateDoc(bookingRef, {
        status: status,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      // Try lowercase collection
      bookingRef = doc(db, 'bookings', bookingId);
      await updateDoc(bookingRef, {
        status: status,
        updatedAt: new Date().toISOString()
      });
    }

    return {
      success: true,
      message: 'Booking status updated successfully'
    };
  } catch (error) {
    console.error('Error updating booking status:', error);
    return {
      success: false,
      message: 'Error updating booking status',
      error: error.message
    };
  }
}

/**
 * Cancel a booking
 * Admin can cancel bookings and free up the room
 */
export async function cancelBooking(bookingId) {
  try {
    // First get the booking to find the room
    let bookingRef = doc(db, 'Bookings', bookingId);
    let bookingDoc = await getDoc(bookingRef);
    let bookingData = null;

    // If not found, try lowercase collection
    if (!bookingDoc.exists()) {
      bookingRef = doc(db, 'bookings', bookingId);
      bookingDoc = await getDoc(bookingRef);
    }

    if (bookingDoc.exists()) {
      bookingData = bookingDoc.data();
    } else {
      return {
        success: false,
        message: 'Booking not found'
      };
    }

    // Update booking status to cancelled
    await updateDoc(bookingRef, {
      status: 'cancelled',
      cancelledAt: new Date().toISOString()
    });

    // If booking has a roomId, mark the room as available
    if (bookingData && bookingData.roomId) {
      await updateRoomAvailability(bookingData.roomId, true);
    }

    return {
      success: true,
      message: 'Booking cancelled and room freed'
    };
  } catch (error) {
    console.error('Error cancelling booking:', error);
    return {
      success: false,
      message: 'Error cancelling booking',
      error: error.message
    };
  }
}

export default {
  verifyBookingCode,
  getBookingsByDate,
  getRoomAvailability,
  checkRoomAvailabilityForDates,
  // Admin functions
  updateRoomAvailability,
  addRoom,
  updateRoom,
  getAllBookings,
  updateBookingStatus,
  cancelBooking
};
