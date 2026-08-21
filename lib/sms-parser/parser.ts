import { hdfcRules, upiHandles, upiPattern, amountPattern, datePattern, RuleType } from './rules';

export interface SMSParseResult {
  amount: number; // in paise
  type: 'income' | 'expense' | 'transfer';
  date: string; // YYYY-MM-DD
  description: string;
  paymentMethod: 'upi' | 'cash' | 'card' | 'bank' | 'other';
  confidence: number; // 0-1
  rawSMS: string;
  // Optional fields for UPI transactions
  UPIId?: string;
  refId?: string;
}

interface HDFCRule {
  pattern: RegExp;
  type: RuleType;
  extract: (match: RegExpMatchArray) => {
    amount: number;
    date: string;
    UPIId: string;
    merchant: string;
    refId: string;
    raw: string;
  };
}

interface UPIPattern {
  pattern: RegExp;
  extract: (match: RegExpMatchArray) => {
    amount: number;
    type: RuleType;
    date: string;
    UPIId: string;
    refId: string;
    raw: string;
  };
}

// Parse SMS and return transaction data with confidence score
export function parseSMS(sms: string): SMSParseResult | null {
  if (!sms || sms.trim() === '') return null;

  const smsLower = sms.toLowerCase();

  // Try HDFC specific rules first
  for (const rule of hdfcRules) {
    const match = sms.match(rule.pattern);
    if (match) {
      const extracted = rule.extract(match);
      return {
        amount: extracted.amount,
        type: rule.type,
        date: extracted.date,
        description: extracted.merchant,
        paymentMethod: 'upi',
        confidence: 0.95, // High confidence for bank-specific rules
        rawSMS: sms,
        UPIId: extracted.UPIId,
        refId: extracted.refId
      };
    }
  }

  // Try generic UPI pattern
  const upiMatch = sms.match(upiPattern.pattern);
  if (upiMatch) {
    const extracted = upiPattern.extract(upiMatch);
    // Check if UPI handle matches known ones
    const isKnownUPI = upiHandles.some(handle => extracted.UPIId?.endsWith(handle));
    return {
      amount: extracted.amount,
      type: extracted.type,
      date: extracted.date,
      description: 'UPI Transaction', // Generic description since we don't have merchant in generic pattern
      paymentMethod: 'upi',
      confidence: isKnownUPI ? 0.85 : 0.7, // Lower confidence if UPI handle not recognized
      rawSMS: sms,
      UPIId: extracted.UPIId,
      refId: extracted.refId
    };
  }

  // Fallback: try to extract amount and date only (very low confidence)
  const amountMatch = sms.match(amountPattern);
  const dateMatch = sms.match(datePattern);

  if (amountMatch && dateMatch) {
    const amount = parseFloat(amountMatch[1]) * 100;
    const date = `${dateMatch[3]}-${dateMatch[2]}-${dateMatch[1]}`;

    // Try to determine type from keywords
    let type: RuleType = 'expense'; // Default to expense
    if (smsLower.includes('credited') || smsLower.includes('received') || smsLower.includes('refund')) {
      type = 'income';
    } else if (smsLower.includes('transferred') || smsLower.includes('transfer')) {
      type = 'transfer';
    }

    // Extract possible merchant/description (everything after amount and before date or UPI)
    const descriptionMatch = sms.match(/₹\s*\d+(?:\.\d+)?\s+(.*?)\s+(?:\d{2}\/\d{2}\/\d{4}|UPI)/i);
    const description = descriptionMatch ? descriptionMatch[1].trim() : 'Unknown Transaction';

    return {
      amount,
      type,
      date,
      description,
      paymentMethod: 'other', // We don't know payment method from fallback
      confidence: 0.4, // Low confidence for fallback
      rawSMS: sms
    };
  }

  return null; // Could not parse
}

// Validate if SMS looks like a transaction SMS
export function isTransactionSMS(sms: string): boolean {
  if (!sms) return false;

  const smsLower = sms.toLowerCase();

  // Check for transaction keywords
  const hasAmount = /₹\s*\d+/.test(sms);
  const hasDate = /\d{2}\/\d{2}\/\d{4}/.test(sms);
  const hasTransactionKeyword =
    smsLower.includes('debited') ||
    smsLower.includes('credited') ||
    smsLower.includes('UPI') ||
    smsLower.includes('transfer') ||
    smsLower.includes('payment') ||
    smsLower.includes('purchase') ||
    smsLower.includes('atm') ||
    smsLower.includes('withdrawal') ||
    smsLower.includes('deposit');

  return hasAmount && hasDate && hasTransactionKeyword;
}