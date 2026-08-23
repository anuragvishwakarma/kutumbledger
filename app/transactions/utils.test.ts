import { formatCurrency, calculateProgress } from '../transactions/page';

describe('Transaction Page Utilities', () => {
  describe('formatCurrency', () => {
    it('should format zero amount correctly', () => {
      expect(formatCurrency(0)).toBe('₹0.00');
    });

    it('should format positive amount correctly', () => {
      expect(formatCurrency(100)).toBe('₹1.00'); // 100 paise = 1.00 INR
      expect(formatCurrency(1234)).toBe('₹12.34'); // 1234 paise = 12.34 INR
      expect(formatCurrency(100000)).toBe('₹1,000.00'); // 100000 paise = 1,000.00 INR
    });

    it('should handle large numbers', () => {
      expect(formatCurrency(1234567)).toBe('₹12,345.67');
    });
  });

  describe('calculateProgress', () => {
    it('should return 0 when target is 0', () => {
      expect(calculateProgress(0, 0)).toBe(0);
      expect(calculateProgress(50, 0)).toBe(0);
    });

    it('should calculate progress correctly', () => {
      expect(calculateProgress(0, 100)).toBe(0);
      expect(calculateProgress(25, 100)).toBe(25);
      expect(calculateProgress(50, 100)).toBe(50);
      expect(calculateProgress(75, 100)).toBe(75);
      expect(calculateProgress(100, 100)).toBe(100);
    });

    it('should cap at 100 when current exceeds target', () => {
      expect(calculateProgress(150, 100)).toBe(100);
      expect(calculateProgress(200, 50)).toBe(100);
    });
  });
});