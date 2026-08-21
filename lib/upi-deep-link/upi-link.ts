export interface UPIPaymentParams {
  pa: string; // UPI ID of the payee
  pn: string; // Name of the payee
  am: number; // Amount in rupees
  cu?: string; // Currency (default: INR)
  tn?: string; // Transaction note
  tr?: string; // Transaction ID (optional)
  url?: string; // Callback URL (optional)
}

export interface UPIPaymentResult {
  success: boolean;
  upiLink: string;
  error?: string;
}

/**
 * Generate a UPI deep-link for payments
 * @param params UPI payment parameters
 * @returns UPI payment result with link or error
 */
export function generateUPILink(params: UPIPaymentParams): UPIPaymentResult {
  // Validate required parameters
  if (!params.pa || !params.pn || typeof params.am !== 'number' || params.am <= 0) {
    return {
      success: false,
      upiLink: '',
      error: 'Missing required parameters: pa (UPI ID), pn (payee name), am (amount > 0)'
    };
  }

  // Validate UPI ID format (basic validation)
  const upiIdPattern = /^[a-zA-Z0-9.\-_]{2,}@[a-zA-Z0-9.\-_]{2,}$/;
  if (!upiIdPattern.test(params.pa)) {
    return {
      success: false,
      upiLink: '',
      error: 'Invalid UPI ID format'
    };
  }

  // Build the UPI link
  const queryParams = new URLSearchParams();
  queryParams.append('pa', params.pa);
  queryParams.append('pn', params.pn);
  queryParams.append('am', params.am.toString());

  if (params.cu) {
    queryParams.append('cu', params.cu);
  } else {
    queryParams.append('cu', 'INR'); // Default to INR
  }

  if (params.tn) {
    queryParams.append('tn', params.tn);
  }

  if (params.tr) {
    queryParams.append('tr', params.tr);
  }

  if (params.url) {
    queryParams.append('url', params.url);
  }

  const upiLink = `upi://pay?${queryParams.toString()}`;

  return {
    success: true,
    upiLink
  };
}

/**
 * Open UPI link in a way that works across platforms
 * @param upiLink The UPI link to open
 */
export function openUPILink(upiLink: string): void {
  // Check if we're in a mobile browser or webview
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

  if (isMobile) {
    // On mobile, we can try to open the UPI link directly
    // Most UPI apps will register to handle the upi:// scheme
    window.location.href = upiLink;
  } else {
    // On desktop, we might want to show a QR code or suggest using mobile
    // For now, we'll just log and show an alert
    console.log('UPI link generated:', upiLink);
    alert('Please open this link on your mobile device to make a UPI payment:\n' + upiLink);

    // Still attempt to open it (some desktop browsers might handle it)
    try {
      window.location.href = upiLink;
    } catch (e) {
      console.warn('Could not open UPI link directly:', e);
    }
  }
}

/**
 * Create a UPI payment request for settling udhaar or splitting expenses
 * @param creditorUpiId UPI ID of the person receiving money
 * @param creditorName Name of the person receiving money
 * @param amount Amount in rupees to collect
 * @param description Description/purpose of the payment
 * @param debtId Optional ID of the debt being settled
 * @returns UPI payment result
 */
export function createSettlementUPILink(
  creditorUpiId: string,
  creditorName: string,
  amount: number,
  description: string,
  debtId?: string
): UPIPaymentResult {
  return generateUPILink({
    pa: creditorUpiId,
    pn: creditorName,
    am: amount,
    tn: `KutumbLedger: ${description}${debtId ? ` (Debt #${debtId})` : ''}`,
    url: typeof window !== 'undefined' && window.location.origin ? window.location.origin + '/upi/callback' : undefined
  });
}

/**
 * Parse a UPI link or intent to extract payment parameters
 * @param url UPI link or intent URL
 * @returns Parsed parameters or null if invalid
 */
export function parseUPILink(url: string): UPIPaymentParams | null {
  try {
    // Handle both upi://pay?... and https://upi://pay?... formats
    const cleanUrl = url.replace(/^https?:\/\/upi\//i, 'upi://');

    if (!cleanUrl.startsWith('upi://')) {
      return null;
    }

    const queryString = cleanUrl.split('?')[1];
    if (!queryString) {
      return null;
    }

    const params = new URLSearchParams(queryString);

    return {
      pa: params.get('pa') || '',
      pn: params.get('pn') || '',
      am: parseFloat(params.get('am') || '0'),
      cu: params.get('cu') || 'INR',
      tn: params.get('tn') ?? undefined,
      tr: params.get('tr') ?? undefined,
      url: params.get('url') ?? undefined
    };
  } catch (e) {
    console.error('Error parsing UPI link:', e);
    return null;
  }
}