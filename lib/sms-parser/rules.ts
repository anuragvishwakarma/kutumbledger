// Type for rule type
export type RuleType = 'income' | 'expense' | 'transfer';

// HDFC Bank SMS rules
export const hdfcRules: Array<{ pattern: RegExp; type: RuleType; extract: (match: RegExpMatchArray) => { amount: number; date: string; UPIId: string; merchant: string; refId: string; raw: string } }> = [
  // Debit transaction
  {
    pattern: /₹(\d+(?:\.\d+)?)\s+debited\s+from\s+Account\s+.*?(\d{4})\s+on\s+(\d{2}\/\d{2}\/\d{4})\s+.*?UPI\/(\w+@\w+)\s+(.+?)\s+Ref\s*no\s*:?\s*(\w+)/i,
    type: 'expense' as RuleType,
    extract: (match: RegExpMatchArray) => ({
      amount: parseFloat(match[1]) * 100, // Convert to paise
      date: match[3].replace(/(\d{2})\/(\d{2})\/(\d{4})/, '$3-$2-$1'), // DD/MM/YYYY to YYYY-MM-DD
      UPIId: match[4],
      merchant: match[5].trim(),
      refId: match[6],
      raw: match[0]
    })
  },
  // Credit transaction
  {
    pattern: /₹(\d+(?:\.\d+)?)\s+credited\s+to\s+Account\s+.*?(\d{4})\s+on\s+(\d{2}\/\d{2}\/\d{4})\s+.*?UPI\/(\w+@\w+)\s+(.+?)\s+Ref\s*no\s*:?\s*(\w+)/i,
    type: 'income' as RuleType,
    extract: (match: RegExpMatchArray) => ({
      amount: parseFloat(match[1]) * 100,
      date: match[3].replace(/(\d{2})\/(\d{2})\/(\d{4})/, '$3-$2-$1'),
      UPIId: match[4],
      merchant: match[5].trim(),
      refId: match[6],
      raw: match[0]
    })
  }
];

// Common UPI handles (for generic UPI SMS)
export const upiHandles = [
  '@paytm',
  '@ybl',
  '@okaxis',
  '@oksbi',
  '@apl',
  '@ibl',
  '@okicici',
  '@okhdfcbank',
  '@okicici',
  '@okaxis',
  '@oksbi',
  '@okhdfcbank',
  '@icici',
  '@sbi',
  '@hdfcbank',
  '@axisbank',
  '@kotak',
  '@idfc',
  '@uboi',
  '@pnb',
  '@canarabank',
  '@unionbank',
  '@federal',
  '@idbi',
  '@indusind',
  '@yesbank',
  '@rblbank',
  '@yesbankltd',
  '@payzapp',
  '@freecharge',
  '@amex',
  '@citi',
  '@standardchartered',
  '@hsbc',
  '@barclays',
  '@deutschebank',
  '@cityunion',
  '@lakshmi',
  '@equitas',
  '@capitalsmallfinance',
  '@esaf',
  '@utib',
  '@suryoday',
  '@ujjivan',
  '@northeast',
  '@capitalfirst'
];

// Generic UPI SMS pattern (works with most banks)
export const upiPattern = {
  pattern: /₹(\d+(?:\.\d+)?)\s+(?:debited|credited).*?UPI\/(\w+@\w+).*?(\d{2}\/\d{2}\/\d{4}).*?(?:Ref\s*no\s*:\s*(\w+)|UTR\s*no\s*:\s*(\w+))/i,
  extract: (match: RegExpMatchArray): { amount: number; type: RuleType; date: string; UPIId: string; refId: string; raw: string } => ({
    amount: parseFloat(match[1]) * 100,
    // Determine type based on keywords in SMS
    type: match[0].toLowerCase().includes('debited') ? 'expense' : 'income',
    date: match[3].replace(/(\d{2})\/(\d{2})\/(\d{4})/, '$3-$2-$1'),
    UPIId: match[2],
    refId: match[4] || match[5],
    raw: match[0]
  })
};

// Helper to extract amount from SMS (fallback)
export const amountPattern = /₹\s*(\d+(?:\.\d+)?)/;

// Helper to extract date from SMS (fallback)
export const datePattern = /(\d{2})\/(\d{2})\/(\d{4})/;