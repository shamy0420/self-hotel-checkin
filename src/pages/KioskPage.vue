<template>
  <q-page class="flex bg-primary">
    <div class="kiosk-screen">
      <div class="text-center q-mb-xl">
        <h2 class="text-h2 text-white q-mb-sm">Self Check-In Kiosk</h2>
        <p class="text-h6 text-white">Please enter your verification code</p>
      </div>

      <q-card class="kiosk-card">
        <q-card-section class="text-center">
          <div class="code-display q-mb-lg">
            <q-input
              v-model="code"
              outlined
              mask="######"
              fill-mask
              input-class="text-h3 text-center text-weight-bold"
              placeholder="000000"
              @keyup.enter="verifyCode"
              autofocus
              ref="codeInput"
            >
              <template v-slot:prepend>
                <q-icon name="lock" size="lg" />
              </template>
            </q-input>
          </div>

          <q-btn
            color="primary"
            size="xl"
            label="Verify & Check In"
            @click="verifyCode"
            class="full-width q-mb-md"
            :loading="verifying"
            :disable="code.length !== 6"
          />

          <q-btn
            flat
            color="grey-7"
            label="Clear"
            @click="clearCode"
            class="full-width"
          />
        </q-card-section>
      </q-card>

      <!-- Result Display -->
      <div v-if="result" class="result-display q-mt-xl">
        <q-card :class="result.success ? 'bg-positive' : 'bg-negative'">
          <q-card-section class="text-center text-white">
            <q-icon
              :name="result.success ? 'check_circle' : 'cancel'"
              size="120px"
            />
            <div class="text-h3 q-mt-md">
              {{ result.success ? 'Welcome!' : 'Invalid Code' }}
            </div>
            <div v-if="result.success" class="q-mt-md">
              <div class="text-h5">{{ result.booking.guestName }}</div>
              <div class="text-h6 q-mt-sm">{{ result.booking.roomName }}</div>
              <div class="text-subtitle1 q-mt-sm">
                Check-in: {{ result.booking.checkIn }}
              </div>
            </div>
            <div v-else class="text-h6 q-mt-md">
              Please check your code and try again
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { db } from 'src/boot/firebase';
import { collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';
import { Notify } from 'quasar';
import { sendRoomPasscodeEmail } from 'src/services/emailService';

const code = ref('');
const verifying = ref(false);
const result = ref(null);
const codeInput = ref(null);

function generateRoomPasscode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function clearCode() {
  code.value = '';
  result.value = null;
  if (codeInput.value) {
    codeInput.value.focus();
  }
}

async function verifyCode() {
  if (code.value.length !== 6) {
    Notify.create({
      type: 'warning',
      message: 'Please enter a 6-digit code',
      position: 'top'
    });
    return;
  }

  verifying.value = true;
  result.value = null;

  try {
    const q = query(
      collection(db, 'Bookings'),
      where('verificationCode', '==', code.value)
    );
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      const bookingDoc = querySnapshot.docs[0];
      const booking = {
        id: bookingDoc.id,
        ...bookingDoc.data()
      };

      // Update the booking to mark it as verified
      await updateDoc(doc(db, 'Bookings', booking.id), {
        verified: true,
        verifiedAt: new Date().toISOString()
      });

      // Send room passcode email after successful kiosk verification
      try {
        const roomPasscode = booking.roomPasscode || generateRoomPasscode();
        const roomPasscodeEmailSent = booking.roomPasscodeEmailSent === true;

        if (!booking.roomPasscode) {
          await updateDoc(doc(db, 'Bookings', booking.id), {
            roomPasscode
          });
        }

        if (!roomPasscodeEmailSent && booking.email) {
          const roomEmailResult = await sendRoomPasscodeEmail({
            guestName: booking.guestName,
            email: booking.email,
            roomPasscode,
            checkIn: booking.checkIn,
            checkOut: booking.checkOut,
            roomTypeName: booking.roomTypeName
          });

          if (roomEmailResult.success) {
            await updateDoc(doc(db, 'Bookings', booking.id), {
              roomPasscodeEmailSent: true,
              roomPasscodeSentAt: new Date().toISOString()
            });
          } else {
            console.warn('Room passcode email sending failed:', roomEmailResult.error);
          }
        }
      } catch (err) {
        console.error('Error sending room passcode email:', err);
      }

      result.value = {
        success: true,
        booking
      };

      // Auto clear after 5 seconds
      setTimeout(() => {
        clearCode();
      }, 5000);
    } else {
      result.value = {
        success: false
      };

      // Auto clear after 3 seconds
      setTimeout(() => {
        clearCode();
      }, 3000);
    }
  } catch (error) {
    console.error('Error verifying code:', error);
    Notify.create({
      type: 'negative',
      message: 'Verification failed. Please try again.',
      position: 'top'
    });
  } finally {
    verifying.value = false;
  }
}

onMounted(() => {
  // Focus on input when mounted
  if (codeInput.value) {
    codeInput.value.focus();
  }
});
</script>

<style lang="scss" scoped>
.kiosk-screen {
  max-width: 800px;
  width: 100%;
  padding: 2rem;
}

.kiosk-card {
  padding: 2rem;
}

.code-display {
  font-size: 3rem;
}

.result-display {
  animation: fadeIn 0.3s ease-in;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
