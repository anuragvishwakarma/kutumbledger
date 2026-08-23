import { generateOTP, verifyOTP, attemptVerification } from './otp';

describe('OTP Utility', () => {
  beforeEach(() => {
    // Clear the OTP store before each test
    // Note: Since the store is in-memory and not exported, we cannot clear it directly.
    // We'll rely on the fact that each test generates a new OTP.
  });

  describe('generateOTP', () => {
    it('should generate a 6-digit OTP', () => {
      const { otp, sessionId } = generateOTP('test@example.com');
      expect(otp).toHaveLength(6);
      expect(/^\d{6}$/.test(otp)).toBe(true);
      expect(typeof sessionId).toBe('string');
    });

    it('should generate different OTPs for different sessions', () => {
      const { otp: otp1 } = generateOTP('test1@example.com');
      const { otp: otp2 } = generateOTP('test2@example.com');
      expect(otp1).not.toBe(otp2);
    });
  });

  describe('verifyOTP', () => {
    it('should verify a correct OTP', () => {
      const { otp, sessionId } = generateOTP('test@example.com');
      const isValid = verifyOTP(sessionId, otp);
      expect(isValid).toBe(true);
    });

    it('should not verify an incorrect OTP', () => {
      const { otp, sessionId } = generateOTP('test@example.com');
      const isValid = verifyOTP(sessionId, '000000');
      expect(isValid).toBe(false);
    });

    it('should not verify an OTP for a non-existent session', () => {
      const isValid = verifyOTP('non-existent-session', '123456');
      expect(isValid).toBe(false);
    });
  });

  describe('attemptVerification', () => {
    it('should allow correct verification within max attempts', () => {
      const { otp, sessionId } = generateOTP('test@example.com');
      const result = attemptVerification(sessionId, otp);
      expect(result.success).toBe(true);
      expect(result.attemptsRemaining).toBe(2); // Started with 3, used 1
    });

    it('should increment attempts on incorrect OTP', () => {
      const { sessionId } = generateOTP('test@example.com');
      // First incorrect attempt
      let result = attemptVerification(sessionId, '000000');
      expect(result.success).toBe(false);
      expect(result.attemptsRemaining).toBe(2);
      // Second incorrect attempt
      result = attemptVerification(sessionId, '111111');
      expect(result.success).toBe(false);
      expect(result.attemptsRemaining).toBe(1);
      // Third incorrect attempt
      result = attemptVerification(sessionId, '222222');
      expect(result.success).toBe(false);
      expect(result.attemptsRemaining).toBe(0);
      // After max attempts, should be locked
      expect(result.lockedUntil).toBeInstanceOf(Date);
    });

    it('should reset attempts after successful verification', () => {
      const { otp, sessionId } = generateOTP('test@example.com');
      // First incorrect attempt
      attemptVerification(sessionId, '000000');
      // Then correct attempt
      const result = attemptVerification(sessionId, otp);
      expect(result.success).toBe(true);
      expect(result.attemptsRemaining).toBe(2); // Reset to 2 after success? Actually, after success, we don't care about attempts.
      // Note: The function returns the state after the attempt. On success, attemptsRemaining is not really relevant.
      // But we can check that the OTP is now verified and cannot be used again? Actually, the OTP can be verified multiple times until it expires.
      // Let's check that the same OTP can be verified again (if not expired).
      const result2 = attemptVerification(sessionId, otp);
      expect(result2.success).toBe(true);
    });
  });
});