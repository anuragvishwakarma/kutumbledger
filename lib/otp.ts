import { v4 as uuidv4 } from 'uuid';

// In-memory store for OTPs (in production, use Redis or a database with TTL)
const otpStore = new Map<string, { code: string; expiresAt: number; attempts: number }>();

const OTP_EXPIRY_MINUTES = 10;
const MAX_ATTEMPTS = 3;

export function generateOTP(): string {
  // Generate a 6-digit numeric code
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export function storeOTP(key: string, code: string): void {
  const expiresAt = Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000;
  otpStore.set(key, { code, expiresAt, attempts: 0 });
}

export function verifyOTP(key: string, code: string): boolean {
  const record = otpStore.get(key);
  if (!record) return false;

  // Check if expired
  if (Date.now() > record.expiresAt) {
    otpStore.delete(key);
    return false;
  }

  // Check attempts
  if (record.attempts >= MAX_ATTEMPTS) {
    otpStore.delete(key);
    return false;
  }

  // Increment attempts
  record.attempts += 1;

  // Verify code
  const isValid = record.code === code;
  if (isValid) {
    otpStore.delete(code); // Remove on successful verification
  }
  return isValid;
}

export function sendOTPViaEmail(email: string, code: string): void {
  // In a real application, you would use an email service (SendGrid, SES, etc.)
  // For demo purposes, we'll log the OTP (in production, remove this logging)
  console.log(`OTP for ${email}: ${code}`);
  // You could also store it in a way that's accessible for demo (e.g., in localStorage via a client-side bridge)
  // But for security, we avoid exposing it in production.
}

export function sendOTPViaSMS(phoneNumber: string, code: string): void {
  // In a real application, you would use an SMS service (Twilio, AWS SNS, etc.)
  // For demo purposes, we'll log the OTP
  console.log(`OTP for ${phoneNumber}: ${code}`);
}

export function cleanupExpiredOTPs(): void {
  const now = Date.now();
  for (const [key, record] of otpStore.entries()) {
    if (Date.now() > record.expiresAt) {
      otpStore.delete(key);
    }
  }
}

// Call cleanup every minute (in a real app, you'd use a cron job or similar)
setInterval(cleanupExpiredOTPs, 60 * 1000);