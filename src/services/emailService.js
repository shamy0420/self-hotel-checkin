/**
 * Email Service for sending booking confirmation emails
 * 
 * Uses EmailJS REST API to send hotel booking confirmation emails
 * Configuration from environment variables and provided service/template IDs
 */

// EmailJS Configuration
const EMAILJS_CONFIG = {
  serviceId: 'service_rglztaf',
  templateId: 'template_7idjxvl',
  publicKey: import.meta.env.VITE_EMAILJS_PUBLIC_KEY || process.env.EMAILJS_PUBLIC_KEY || ''
};

/**
 * Send booking confirmation email using EmailJS REST API
 * FREE - No packages needed, works immediately
 * Uses the email address from the booking form
 */
export async function sendBookingEmail(bookingData) {
  const {
    guestName,
    email,
    verificationCode,
    checkIn,
    checkOut,
    roomTypeName,
    totalPrice
  } = bookingData;

  // Check if EmailJS is configured
  if (!EMAILJS_CONFIG.publicKey) {
    console.warn('EmailJS Public Key not found. Please set VITE_EMAILJS_PUBLIC_KEY environment variable');
    return { success: false, error: 'EmailJS Public Key not configured' };
  }

  // Validate email address
  if (!email || !email.trim()) {
    console.error('Email address is empty or invalid:', email);
    return { success: false, error: 'Email address is required' };
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) {
    console.error('Invalid email format:', email);
    return { success: false, error: 'Invalid email format' };
  }

  try {
    // Format dates
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

    // Prepare template parameters
    // Note: EmailJS template uses {{email}} for recipient, so we send both 'email' and 'to_email'
    const templateParams = {
      to_name: guestName || 'Guest',
      email: email.trim(), // Guest's email - matches {{email}} in EmailJS template "To Email" field
      to_email: email.trim(), // Also send as to_email for template content
      verification_code: verificationCode,
      check_in: checkInDate,
      check_out: checkOutDate,
      room_type: roomTypeName || 'Room',
      total_price: `$${totalPrice || 0}`
    };

    // Debug: Log what we're sending (without sensitive data)
    console.log('Sending email to:', email.trim());
    console.log('Template params:', { ...templateParams, to_email: '[REDACTED]' });

    // EmailJS REST API endpoint
    // Template variables must match exactly: to_name, to_email, verification_code, check_in, check_out, room_type, total_price
    const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        service_id: EMAILJS_CONFIG.serviceId,
        template_id: EMAILJS_CONFIG.templateId,
        user_id: EMAILJS_CONFIG.publicKey,
        template_params: templateParams
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`EmailJS API error: ${response.statusText} - ${errorText}`);
    }

    const result = await response.json();
    console.log('Email sent successfully to:', email, result);
    return { success: true, messageId: result.text };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error: error.message };
  }
}

