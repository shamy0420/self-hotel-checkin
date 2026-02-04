const functions = require('firebase-functions');
const admin = require('firebase-admin');
const nodemailer = require('nodemailer');

admin.initializeApp();

// Email configuration - Update with your email service
// Option 1: Gmail SMTP (recommended for testing)
// Option 2: SendGrid, Mailgun, or other email service

// Gmail SMTP Configuration
// You'll need to create an App Password in your Google Account
// Go to: Google Account > Security > 2-Step Verification > App passwords
// Configuration is set via: firebase functions:config:set email.user="..." email.password="..."
const emailConfig = {
  service: 'gmail',
  auth: {
    user: functions.config().email?.user || process.env.EMAIL_USER || 'm.elshamy06@gmail.com',
    pass: functions.config().email?.password || process.env.EMAIL_PASSWORD || 'dfez mupb dwuo bwyh'
  }
};

// Create email transporter
const transporter = nodemailer.createTransport(emailConfig);

// Email template for verification code
function createEmailTemplate(guestName, verificationCode, checkIn, checkOut, roomTypeName) {
  const checkInDate = new Date(checkIn).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  const checkOutDate = new Date(checkOut).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Booking Confirmation</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td style="padding: 20px 0; text-align: center; background-color: #1976d2;">
        <h1 style="color: #ffffff; margin: 0; font-size: 28px;">Hotel Check-In Confirmation</h1>
      </td>
    </tr>
    <tr>
      <td style="padding: 40px 20px; background-color: #ffffff;">
        <div style="max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333333; margin-top: 0;">Dear ${guestName},</h2>

          <p style="color: #666666; font-size: 16px; line-height: 1.6;">
            Thank you for choosing our hotel! Your booking has been confirmed.
          </p>

          <div style="background-color: #f8f9fa; border-left: 4px solid #1976d2; padding: 20px; margin: 30px 0;">
            <h3 style="color: #1976d2; margin-top: 0;">Booking Details</h3>
            <p style="margin: 10px 0; color: #333333;">
              <strong>Room Type:</strong> ${roomTypeName}
            </p>
            <p style="margin: 10px 0; color: #333333;">
              <strong>Check-in:</strong> ${checkInDate}
            </p>
            <p style="margin: 10px 0; color: #333333;">
              <strong>Check-out:</strong> ${checkOutDate}
            </p>
          </div>

          <div style="background-color: #e3f2fd; border: 2px solid #1976d2; border-radius: 8px; padding: 30px; text-align: center; margin: 30px 0;">
            <p style="color: #333333; font-size: 18px; margin: 0 0 15px 0; font-weight: bold;">
              Your Verification Code
            </p>
            <div style="background-color: #ffffff; border: 3px dashed #1976d2; border-radius: 8px; padding: 20px; display: inline-block;">
              <p style="font-size: 36px; font-weight: bold; color: #1976d2; margin: 0; letter-spacing: 8px; font-family: 'Courier New', monospace;">
                ${verificationCode}
              </p>
            </div>
            <p style="color: #666666; font-size: 14px; margin: 20px 0 0 0;">
              Please save this code. You'll need it to access your room.
            </p>
          </div>

          <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 30px 0;">
            <p style="margin: 0; color: #856404; font-size: 14px;">
              <strong>Important:</strong> Present this verification code at the self-check-in kiosk or show it to hotel staff upon arrival.
            </p>
          </div>

          <p style="color: #666666; font-size: 16px; line-height: 1.6;">
            We look forward to welcoming you! If you have any questions, please don't hesitate to contact us.
          </p>

          <p style="color: #666666; font-size: 16px; margin-top: 30px;">
            Best regards,<br>
            <strong>Hotel Management Team</strong>
          </p>
        </div>
      </td>
    </tr>
    <tr>
      <td style="padding: 20px; text-align: center; background-color: #f4f4f4; color: #666666; font-size: 12px;">
        <p style="margin: 0;">
          This is an automated confirmation email. Please do not reply to this message.
        </p>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

// Cloud Function triggered when a booking is created
exports.sendVerificationEmail = functions.firestore
  .document('Bookings/{bookingId}')
  .onCreate(async (snap, context) => {
    const booking = snap.data();

    // Only send email if booking is confirmed and has verification code
    if (booking.status !== 'confirmed' || !booking.verificationCode) {
      console.log('Skipping email - booking not confirmed or missing verification code');
      return null;
    }

    const {
      guestName,
      email,
      verificationCode,
      checkIn,
      checkOut,
      roomTypeName
    } = booking;

    // Validate email
    if (!email || !guestName || !verificationCode) {
      console.error('Missing required fields for email');
      return null;
    }

    try {
      // Create email content
      const htmlContent = createEmailTemplate(
        guestName,
        verificationCode,
        checkIn,
        checkOut,
        roomTypeName || 'Room'
      );

      // Email options
      const mailOptions = {
        from: `"Hotel Check-In System" <${emailConfig.auth.user}>`,
        to: email,
        subject: `Your Hotel Check-In Verification Code: ${verificationCode}`,
        html: htmlContent,
        text: `
Dear ${guestName},

Thank you for choosing our hotel! Your booking has been confirmed.

Booking Details:
- Room Type: ${roomTypeName || 'Room'}
- Check-in: ${new Date(checkIn).toLocaleDateString()}
- Check-out: ${new Date(checkOut).toLocaleDateString()}

Your Verification Code: ${verificationCode}

Please save this code. You'll need it to access your room at the self-check-in kiosk.

We look forward to welcoming you!

Best regards,
Hotel Management Team
        `
      };

      // Send email
      const info = await transporter.sendMail(mailOptions);
      console.log('Email sent successfully:', info.messageId);

      // Update booking to mark email as sent
      await snap.ref.update({
        emailSent: true,
        emailSentAt: admin.firestore.FieldValue.serverTimestamp()
      });

      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('Error sending email:', error);

      // Log error but don't fail the function
      await snap.ref.update({
        emailError: error.message,
        emailSent: false
      });

      return { success: false, error: error.message };
    }
  });


// Shared helper: send room passcode email and update document
async function sendRoomPasscodeEmail(ref, data, options = {}) {
  const { skipAlreadySent = true } = options;
  const {
    guestName,
    email,
    roomPasscode,
    checkIn,
    checkOut,
    roomTypeName,
    roomPasscodeEmailSent
  } = data;

  if (!email) {
    console.error('Room passcode email skipped: no email on booking');
    return { success: false, error: 'No email' };
  }
  if (!roomPasscode) {
    console.error('Room passcode email skipped: no roomPasscode on booking');
    return { success: false, error: 'No roomPasscode' };
  }
  if (skipAlreadySent && roomPasscodeEmailSent) {
    console.log('Room passcode email skipped: already sent (roomPasscodeEmailSent=true)');
    return { success: false, error: 'Already sent' };
  }

  const checkInDate = new Date(checkIn).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  const checkOutDate = new Date(checkOut).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 30px; border-radius: 8px; }
    .header { background-color: #1976d2; color: #ffffff; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; margin: -30px -30px 30px -30px; }
    .code-box { background-color: #e3f2fd; border: 3px dashed #1976d2; border-radius: 8px; padding: 30px; text-align: center; margin: 30px 0; }
    .passcode { font-size: 36px; font-weight: bold; color: #1976d2; letter-spacing: 8px; font-family: 'Courier New', monospace; }
    .info-box { background-color: #f8f9fa; border-left: 4px solid #1976d2; padding: 15px; margin: 20px 0; }
    .footer { text-align: center; color: #666666; font-size: 12px; margin-top: 30px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Your Room Access Code</h1>
    </div>

    <h2>Dear ${guestName},</h2>

    <p>Here is the passcode for your room. Please keep it safe and do not share it.</p>

    <div class="info-box">
      <h3 style="color: #1976d2; margin-top: 0;">Stay Details</h3>
      <p><strong>Room Type:</strong> ${roomTypeName || 'Room'}</p>
      <p><strong>Check-in:</strong> ${checkInDate}</p>
      <p><strong>Check-out:</strong> ${checkOutDate}</p>
    </div>

    <div class="code-box">
      <p style="font-size: 18px; font-weight: bold; margin: 0 0 15px 0;">Your Room Passcode</p>
      <div class="passcode">${roomPasscode}</div>
      <p style="color: #666666; font-size: 14px; margin: 20px 0 0 0;">
        Use this passcode to access your room during your stay.
      </p>
    </div>

    <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 30px 0;">
      <p style="margin: 0; color: #856404; font-size: 14px;">
        <strong>Important:</strong> Keep this code private. For security, do not share it with anyone.
      </p>
    </div>

    <p>We look forward to welcoming you! If you need any help, please contact the front desk.</p>

    <p>Best regards,<br><strong>Hotel Management Team</strong></p>

    <div class="footer">
      <p>This is an automated email. Please do not reply to this message.</p>
    </div>
  </div>
</body>
</html>
  `;

  const mailOptions = {
    from: `"Hotel Check-In System" <${emailConfig.auth.user}>`,
    to: email,
    subject: `Your Room Passcode: ${roomPasscode}`,
    html: htmlContent,
    text: `
Dear ${guestName},

Here is the passcode for your room: ${roomPasscode}

Room Type: ${roomTypeName || 'Room'}
Check-in: ${checkInDate}
Check-out: ${checkOutDate}

Please keep this code safe and do not share it with anyone.

Best regards,
Hotel Management Team
    `
  };

  const info = await transporter.sendMail(mailOptions);
  console.log('Room passcode email sent successfully to', email, 'messageId:', info.messageId);

  await ref.update({
    roomPasscodeEmailSent: true,
    roomPasscodeSentAt: admin.firestore.FieldValue.serverTimestamp(),
    roomPasscodeEmailError: admin.firestore.FieldValue.delete()
  });

  return { success: true, messageId: info.messageId };
}

// Cloud Function: Send room passcode email when booking is verified (Bookings collection)
function handleRoomPasscodeOnUpdate(change, context, collectionLabel) {
  const before = change.before.data();
  const after = change.after.data();
  const bookingId = context.params.bookingId;

  console.log(`[${collectionLabel}] Booking ${bookingId}: before.verified=${!!before.verified}, after.verified=${!!after.verified}, after.roomPasscode=${!!after.roomPasscode}, after.roomPasscodeEmailSent=${!!after.roomPasscodeEmailSent}`);

  if (!before.verified && after.verified) {
    if (after.roomPasscodeEmailSent) {
      console.log(`[${collectionLabel}] Skipping: room passcode email already sent for ${bookingId}`);
      return null;
    }
    if (!after.roomPasscode) {
      console.error(`[${collectionLabel}] Skipping: no roomPasscode on booking ${bookingId}. Was the booking created by this web app?`);
      return null;
    }
    if (!after.email) {
      console.error(`[${collectionLabel}] Skipping: no email on booking ${bookingId}`);
      return null;
    }

    return sendRoomPasscodeEmail(change.after.ref, after, { skipAlreadySent: true })
      .then(result => result)
      .catch(async (error) => {
        console.error(`[${collectionLabel}] Error sending room passcode email:`, error);
        await change.after.ref.update({
          roomPasscodeEmailError: error.message
        });
        return { success: false, error: error.message };
      });
  }

  return null;
}

exports.sendRoomPasscodeOnVerification = functions.firestore
  .document('Bookings/{bookingId}')
  .onUpdate(async (change, context) => {
    return handleRoomPasscodeOnUpdate(change, context, 'Bookings');
  });

// Also listen to lowercase 'bookings' in case kiosk or another app uses it
exports.sendRoomPasscodeOnVerificationBookings = functions.firestore
  .document('bookings/{bookingId}')
  .onUpdate(async (change, context) => {
    return handleRoomPasscodeOnUpdate(change, context, 'bookings');
  });

// Callable: resend room passcode email (e.g. if it failed or wasn't triggered)
exports.resendRoomPasscodeEmail = functions.https.onCall(async (data, context) => {
  const bookingId = data?.bookingId;
  if (!bookingId || typeof bookingId !== 'string') {
    throw new functions.https.HttpsError('invalid-argument', 'bookingId is required');
  }

  const db = admin.firestore();
  let ref = db.collection('Bookings').doc(bookingId);
  let snap = await ref.get();
  if (!snap.exists) {
    ref = db.collection('bookings').doc(bookingId);
    snap = await ref.get();
  }
  if (!snap.exists) {
    throw new functions.https.HttpsError('not-found', 'Booking not found');
  }

  const docData = snap.data();
  if (!docData.verified) {
    throw new functions.https.HttpsError('failed-precondition', 'Booking is not verified. Verify at kiosk first.');
  }
  if (!docData.roomPasscode) {
    throw new functions.https.HttpsError('failed-precondition', 'Booking has no roomPasscode.');
  }
  if (!docData.email) {
    throw new functions.https.HttpsError('failed-precondition', 'Booking has no email.');
  }

  const result = await sendRoomPasscodeEmail(ref, docData, { skipAlreadySent: false });
  if (!result.success && result.error !== 'Already sent') {
    throw new functions.https.HttpsError('internal', result.error || 'Failed to send email');
  }
  return { success: true, message: 'Room passcode email sent (or was already sent).' };
});

