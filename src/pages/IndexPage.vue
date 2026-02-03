<template>
  <q-page class="flex">
    <div class="full-width">
      <!-- Hero Section -->
      <div class="hero-section">
        <div class="hero-content">
          <h1 class="text-h2 text-weight-bold text-white q-mb-md">
            Welcome to Our Hotel
          </h1>
          <p class="text-h5 text-white q-mb-xl">
            Book your perfect stay with us
          </p>
        </div>
      </div>

      <!-- Date Selection Section (Booking.com style) -->
      <div class="date-selection-section q-pa-xl">
        <div class="container">
          <q-card class="date-card q-pa-lg">
            <div class="row q-col-gutter-md items-center">
              <div class="col-12 col-md-4">
                <q-input
                  v-model="searchDates.checkIn"
                  label="Check-in"
                  type="date"
                  outlined
                  :min="minDate"
                  :rules="[val => !!val || 'Check-in date is required']"
                  class="full-width"
                />
              </div>
              <div class="col-12 col-md-4">
                <q-input
                  v-model="searchDates.checkOut"
                  label="Check-out"
                  type="date"
                  outlined
                  :min="minCheckOutDate"
                  :rules="[val => !!val || 'Check-out date is required']"
                  class="full-width"
                />
              </div>
              <div class="col-12 col-md-4">
          <q-btn
            color="primary"
            size="lg"
                  label="Search Rooms"
                  @click="searchRooms"
                  :loading="searching"
                  :disable="!searchDates.checkIn || !searchDates.checkOut"
                  class="full-width"
          />
              </div>
            </div>
          </q-card>
        </div>
      </div>

      <!-- Room Selection Section (Shown after date selection) -->
      <div v-if="showRooms" class="rooms-section q-pa-xl">
        <div class="container">
          <div class="q-mb-lg">
            <h2 class="text-h3 q-mb-sm">Available Rooms</h2>
            <p class="text-body1 text-grey-7">
              {{ formatDateRange(searchDates.checkIn, searchDates.checkOut) }}
            </p>
          </div>

          <div class="row q-col-gutter-lg">
            <div
              v-for="roomType in availableRoomTypes"
              :key="roomType.id"
              class="col-12 col-md-6"
            >
              <q-card class="room-card">
                <q-img :src="roomType.image" height="200px">
                  <div class="absolute-bottom text-subtitle1 text-center bg-primary text-white q-pa-sm">
                    {{ roomType.name }}
                  </div>
                </q-img>
                <q-card-section>
                  <div class="text-h6 q-mb-sm">{{ roomType.name }}</div>
                  <div class="text-caption text-grey q-mb-md">{{ roomType.description }}</div>

                  <div class="row items-center q-mb-sm">
                    <q-icon name="person" size="sm" class="q-mr-xs" />
                    <span class="text-caption">Up to {{ roomType.capacity }} guests</span>
                  </div>

                  <div class="row items-center q-mb-sm">
                    <q-icon name="hotel" size="sm" class="q-mr-xs" />
                    <span class="text-caption text-weight-bold">
                      {{ roomType.availableCount }} {{ roomType.availableCount === 1 ? 'room' : 'rooms' }} available
                    </span>
                  </div>

                  <div v-if="roomType.amenities && roomType.amenities.length > 0" class="q-mt-md">
                    <div class="text-caption text-grey q-mb-xs">Amenities:</div>
                    <div class="row q-gutter-xs">
                      <q-chip
                        v-for="amenity in roomType.amenities.slice(0, 4)"
                        :key="amenity"
                        size="sm"
                        color="grey-3"
                        text-color="grey-8"
                      >
                        {{ amenity }}
                      </q-chip>
                    </div>
                  </div>
                </q-card-section>
                <q-separator />
                <q-card-section>
                  <div class="row items-center justify-between">
                    <div>
                      <div class="text-h5 text-primary text-weight-bold">
                        ${{ roomType.price }}
                      </div>
                      <div class="text-caption">per night</div>
                      <div class="text-caption text-grey q-mt-xs">
                        Total: ${{ calculateTotal(roomType.price) }}
                      </div>
                    </div>
                    <q-btn
                      color="primary"
                      label="Book Now"
                      @click="openBookingDialog(roomType)"
                      :disable="roomType.availableCount <= 0"
                      :loading="bookingLoading"
                    />
                  </div>
                  <div v-if="roomType.availableCount <= 0" class="text-negative q-mt-sm">
                    No rooms available for these dates
                  </div>
                </q-card-section>
              </q-card>
            </div>
          </div>
        </div>
      </div>

      <!-- No rooms message -->
      <div v-if="showRooms && availableRoomTypes.length === 0" class="q-pa-xl text-center">
        <q-icon name="hotel" size="64px" color="grey" class="q-mb-md" />
        <div class="text-h6 text-grey">No rooms available for the selected dates</div>
        <q-btn
          color="primary"
          label="Change Dates"
          @click="resetSearch"
          class="q-mt-md"
        />
      </div>
    </div>

    <!-- Booking Dialog -->
    <q-dialog v-model="bookingDialog" persistent>
      <q-card style="min-width: 350px">
        <q-card-section>
          <div class="text-h6">Complete Your Booking</div>
          <div class="text-caption text-grey">{{ selectedRoomType?.name }}</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <div class="q-mb-md">
            <div class="text-caption text-grey">Dates:</div>
            <div class="text-body1">{{ formatDateRange(searchDates.checkIn, searchDates.checkOut) }}</div>
          </div>

          <q-input
            v-model="bookingData.guestName"
            label="Full Name"
            outlined
            class="q-mb-md"
            :rules="[val => !!val || 'Name is required']"
          />
          <q-input
            v-model="bookingData.email"
            label="Email"
            type="email"
            outlined
            class="q-mb-md"
            :rules="[val => !!val || 'Email is required']"
          />
          <q-input
            v-model="bookingData.phone"
            label="Phone Number"
            outlined
            class="q-mb-md"
            :rules="[val => !!val || 'Phone is required']"
          />
          <q-input
            v-model="bookingData.guests"
            label="Number of Guests"
            type="number"
            outlined
            :min="1"
            :max="selectedRoomType?.capacity"
            :rules="[val => !!val || 'Number of guests is required']"
          />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancel" color="primary" v-close-popup />
          <q-btn
            label="Confirm Booking"
            color="primary"
            @click="confirmBooking"
            :loading="bookingLoading"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Booking Confirmation Dialog -->
    <q-dialog v-model="confirmationDialog" persistent>
      <q-card style="min-width: 350px">
        <q-card-section class="bg-positive text-white text-center">
          <q-icon name="check_circle" size="64px" />
          <div class="text-h5 q-mt-md">Booking Confirmed!</div>
        </q-card-section>

        <q-card-section class="q-pt-xl">
          <div class="text-center q-mb-lg">
            <div class="text-subtitle1 q-mb-sm">Your Verification Code:</div>
            <div class="text-h3 text-weight-bold text-primary">
              {{ verificationCode }}
            </div>
          </div>
          <q-separator class="q-mb-md" />
          <div class="text-body2 text-grey-7">
            <p>Please save this code. You'll need it to access your room.</p>
            <p v-if="emailSent" class="text-positive q-mt-sm">
              <q-icon name="email" class="q-mr-xs" />
              A confirmation email with this code has been sent to your email address.
            </p>
            <p v-else-if="emailError" class="text-warning q-mt-sm">
              <q-icon name="warning" class="q-mr-xs" />
              Email could not be sent, but your booking is confirmed. Please save this code.
            </p>
            <p v-else class="text-grey-7 q-mt-sm">
              The code will be displayed on the check-in screen at the hotel.
            </p>
          </div>
        </q-card-section>

        <q-card-actions align="center">
          <q-btn
            label="Close"
            color="primary"
            @click="closeConfirmation"
            class="q-px-xl"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { db } from 'src/boot/firebase';
import { collection, addDoc, query, getDocs, where, doc, updateDoc, getDoc } from 'firebase/firestore';
import { Notify } from 'quasar';
import { sendBookingEmail } from 'src/services/emailService';

const searchDates = ref({
  checkIn: '',
  checkOut: ''
});

const searching = ref(false);
const showRooms = ref(false);
const availableRoomTypes = ref([]);
const bookingDialog = ref(false);
const confirmationDialog = ref(false);
const selectedRoomType = ref(null);
const bookingLoading = ref(false);
const verificationCode = ref('');
const roomPasscode = ref('');
const emailSent = ref(false);
const emailError = ref(false);

const bookingData = ref({
  guestName: '',
  email: '',
  phone: '',
  guests: 1
});

// Calculate minimum dates
const today = new Date();
today.setHours(0, 0, 0, 0);
const minDate = today.toISOString().split('T')[0];

const minCheckOutDate = computed(() => {
  if (!searchDates.value.checkIn) return minDate;
  const checkIn = new Date(searchDates.value.checkIn);
  checkIn.setDate(checkIn.getDate() + 1);
  return checkIn.toISOString().split('T')[0];
});

// Format date range
function formatDateRange(checkIn, checkOut) {
  if (!checkIn || !checkOut) return '';
  const inDate = new Date(checkIn);
  const outDate = new Date(checkOut);
  const nights = Math.ceil((outDate - inDate) / (1000 * 60 * 60 * 24));
  return `${inDate.toLocaleDateString()} - ${outDate.toLocaleDateString()} (${nights} ${nights === 1 ? 'night' : 'nights'})`;
}

// Calculate total price
function calculateTotal(pricePerNight) {
  if (!searchDates.value.checkIn || !searchDates.value.checkOut) return 0;
  const checkIn = new Date(searchDates.value.checkIn);
  const checkOut = new Date(searchDates.value.checkOut);
  const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
  return pricePerNight * nights;
}

// Generate verification code
function generateVerificationCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function generateRoomPasscode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Search for available rooms
async function searchRooms() {
  searching.value = true;
  showRooms.value = false;

  try {
    // Validate dates
    const checkInDate = new Date(searchDates.value.checkIn);
    const checkOutDate = new Date(searchDates.value.checkOut);

    if (checkOutDate <= checkInDate) {
      Notify.create({
        type: 'negative',
        message: 'Check-out date must be after check-in date.',
        position: 'top'
      });
      searching.value = false;
      return;
    }

    // Get room types (Normal and Premium)
    const roomTypesQuery = query(collection(db, 'RoomTypes'));
    const roomTypesSnapshot = await getDocs(roomTypesQuery);

    let roomTypes = [];
    if (roomTypesSnapshot.empty) {
      // Initialize room types if they don't exist
      await initializeRoomTypes();
      const newSnapshot = await getDocs(query(collection(db, 'RoomTypes')));
      roomTypes = newSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } else {
      roomTypes = roomTypesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    }

    // Get bookings for the selected date range
    const bookingsQuery = query(
      collection(db, 'Bookings'),
      where('status', '==', 'confirmed')
    );
    const bookingsSnapshot = await getDocs(bookingsQuery);

    const conflictingBookings = bookingsSnapshot.docs
      .map(doc => doc.data())
      .filter(booking => {
        const bookingCheckIn = new Date(booking.checkIn);
        const bookingCheckOut = new Date(booking.checkOut);

        // Check if dates overlap
        return (
          (checkInDate < bookingCheckOut && checkOutDate > bookingCheckIn)
        );
      });

    // Calculate available count for each room type
    availableRoomTypes.value = roomTypes.map(roomType => {
      // Count how many rooms of this type are booked for the selected dates
      const bookedCount = conflictingBookings.filter(
        booking => booking.roomTypeId === roomType.id
      ).length;

      // Available count = total count - booked count
      const availableCount = Math.max(0, (roomType.totalCount || 50) - bookedCount);

      return {
        ...roomType,
        availableCount
      };
    }).filter(roomType => roomType.availableCount > 0); // Only show rooms with availability

    showRooms.value = true;

    if (availableRoomTypes.value.length === 0) {
      Notify.create({
        type: 'info',
        message: 'No rooms available for the selected dates.',
        position: 'top'
      });
    }
  } catch (error) {
    console.error('Error searching rooms:', error);
    Notify.create({
      type: 'negative',
      message: 'Error searching for rooms. Please try again.',
      position: 'top'
    });
  } finally {
    searching.value = false;
  }
}

// Initialize room types if they don't exist (only check, don't create - use script instead)
async function initializeRoomTypes() {
  // Just check if RoomTypes exist - don't try to create them
  // RoomTypes should be created using: npm run setup-room-types
  // This prevents permission errors
  try {
    const roomTypesQuery = query(collection(db, 'RoomTypes'));
    const snapshot = await getDocs(roomTypesQuery);
    if (snapshot.empty) {
      console.warn('RoomTypes collection is empty. Run: npm run setup-room-types');
    }
  } catch (error) {
    console.error('Error checking room types:', error);
  }
}

// Open booking dialog
function openBookingDialog(roomType) {
  selectedRoomType.value = roomType;
  bookingDialog.value = true;
}

// Confirm booking
async function confirmBooking() {
  bookingLoading.value = true;

  try {
    // Validate guest data
    if (!bookingData.value.guestName || !bookingData.value.email || !bookingData.value.phone) {
      Notify.create({
        type: 'negative',
        message: 'Please fill in all required fields.',
        position: 'top'
      });
      bookingLoading.value = false;
      return;
    }

    // Generate verification code and room passcode
    verificationCode.value = generateVerificationCode();
    roomPasscode.value = generateRoomPasscode();

    // Create booking document
    const booking = {
      roomTypeId: selectedRoomType.value.id,
      roomTypeName: selectedRoomType.value.name,
      guestName: bookingData.value.guestName,
      email: bookingData.value.email,
      phone: bookingData.value.phone,
      checkIn: searchDates.value.checkIn,
      checkOut: searchDates.value.checkOut,
      guests: parseInt(bookingData.value.guests),
      verificationCode: verificationCode.value,
      roomPasscode: roomPasscode.value,
      status: 'confirmed',
      verified: false,
      createdAt: new Date().toISOString(),
      verifiedAt: null,
      totalPrice: calculateTotal(selectedRoomType.value.price),
      pricePerNight: selectedRoomType.value.price
    };

    // Add booking to Firestore
    await addDoc(collection(db, 'Bookings'), booking);

    // Send confirmation email with verification code (FREE - EmailJS)
    // Uses the email address entered in the booking form
    emailSent.value = false;
    emailError.value = false;

    try {
      const emailResult = await sendBookingEmail({
        guestName: bookingData.value.guestName,
        email: bookingData.value.email, // Email from the form
        verificationCode: verificationCode.value,
        checkIn: searchDates.value.checkIn,
        checkOut: searchDates.value.checkOut,
        roomTypeName: selectedRoomType.value.name,
        totalPrice: calculateTotal(selectedRoomType.value.price)
      });

      if (emailResult.success) {
        emailSent.value = true;
        console.log('Confirmation email sent successfully to:', bookingData.value.email);
      } else {
        emailError.value = true;
        console.warn('Email sending failed:', emailResult.error);
        // Don't fail the booking if email fails
      }
    } catch (err) {
      emailError.value = true;
      console.error('Error sending email:', err);
      // Don't fail the booking if email fails
    }

    bookingDialog.value = false;
    confirmationDialog.value = true;

    // Reset booking data
    bookingData.value = {
      guestName: '',
      email: '',
      phone: '',
      guests: 1
    };

    // Refresh available rooms
    await searchRooms();

    Notify.create({
      type: 'positive',
      message: 'Booking created successfully!',
      position: 'top'
    });
  } catch (error) {
    console.error('Error creating booking:', error);
    Notify.create({
      type: 'negative',
      message: 'Failed to create booking. Please try again.',
      position: 'top'
    });
  } finally {
    bookingLoading.value = false;
  }
}

// Close confirmation dialog
function closeConfirmation() {
  confirmationDialog.value = false;
  verificationCode.value = '';
  roomPasscode.value = '';
  emailSent.value = false;
  emailError.value = false;
  resetSearch();
}

// Reset search
function resetSearch() {
  showRooms.value = false;
  availableRoomTypes.value = [];
  searchDates.value = {
    checkIn: '',
    checkOut: ''
  };
}

onMounted(() => {
  // Check room types (they should already exist from setup script)
  initializeRoomTypes();
});
</script>

<style lang="scss" scoped>
.hero-section {
  background: linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)),
    url('https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=1200') center/cover;
  height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.hero-content {
  text-align: center;
  padding: 2rem;
}

.date-selection-section {
  background: #f5f5f5;
  margin-top: -50px;
  position: relative;
  z-index: 1;
}

.date-card {
  max-width: 1000px;
  margin: 0 auto;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.rooms-section {
  background: #ffffff;
  min-height: 400px;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
}

.room-card {
  height: 100%;
  display: flex;
  flex-direction: column;
  transition: transform 0.3s ease;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
  }
}
</style>
