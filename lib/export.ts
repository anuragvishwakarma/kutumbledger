export interface ExportOptions {
  filename?: string;
  separator?: string; // For CSV
  headers?: Record<string, string>; // Custom header names
}

export class ExportUtil {
  /**
   * Export data to CSV format
   * @param data Array of objects to export
   * @param options Export options
   */
  static exportToCSV(data: any[], options: ExportOptions = {}): void {
    if (!data || data.length === 0) {
      alert('No data to export');
      return;
    }

    const {
      filename = 'export',
      separator = ',',
      headers = {}
    } = options;

    // Get all unique keys from all objects
    const keys = Array.from(new Set(
      data.flatMap(Object.keys)
    )).sort();

    // Create CSV header
    const headerRow = keys.map(key => {
      const headerText = headers[key] || key;
      return `"${headerText.replace(/"/g, '""')}"`;
    }).join(separator);

    // Create CSV rows
    const csvRows = data.map(row => {
      return keys.map(key => {
        const value = row[key] == null ? '' : String(row[key]);
        // Escape quotes and wrap in quotes if contains separator, quote, or newline
        const escapedValue = value.replace(/"/g, '""');
        if (escapedValue.includes(separator) || escapedValue.includes('"') ||
            escapedValue.includes('\n') || escapedValue.includes('\r')) {
          return `"${escapedValue}"`;
        }
        return escapedValue;
      }).join(separator);
    });

    // Combine header and rows
    const csvContent = [headerRow, ...csvRows].join('\n');

    // Create and trigger download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  /**
   * Export data to Excel format (as CSV with .xls extension for simplicity)
   * Note: For true Excel format with multiple sheets, styling, etc.,
   * a library like SheetJS would be needed
   * @param data Array of objects to export
   * @param options Export options
   */
  static exportToExcel(data: any[], options: ExportOptions = {}): void {
    const {
      filename = 'export'
    } = options;

    // For simplicity, we'll export as CSV but with .xls extension
    // In a production app, you'd use a proper Excel library
    this.exportToCSV(data, { ...options, filename });
  }

  /**
   * Export transactions data
   * @param transactions Array of transaction objects
   * @param options Export options
   */
  static exportTransactions(transactions: any[], options: ExportOptions = {}): void {
    const transactionData = transactions.map(t => ({
      Date: t.date,
      Type: t.type,
      Category: t.category,
      Description: t.description,
      Amount: t.amount,
      'Payment Method': t.paymentMethod,
      Status: t.isRecurring ? 'Recurring' : 'One-time',
      'Has Receipt': t.hasReceipt ? 'Yes' : 'No',
      'Reference ID': t.refId || '',
      UPI_ID: t.UPIId || ''
    }));

    this.exportToCSV(transactionData, {
      ...options,
      filename: 'transactions-export',
      headers: {
        Date: 'Date',
        Type: 'Type (Income/Expense/Transfer)',
        Category: 'Category',
        Description: 'Description',
        Amount: 'Amount (₹)',
        'Payment Method': 'Payment Method',
        'Has Receipt': 'Has Receipt',
        Status: 'Status',
        'Reference ID': 'Reference ID',
        UPI_ID: 'UPI ID'
      }
    });
  }

  /**
   * Export budget data
   * @param budgets Array of budget objects
   * @param options Export options
   */
  static exportBudgets(budgets: any[], options: ExportOptions = {}): void {
    const budgetData = budgets.map(b => ({
      Category: b.category,
      Amount: b.amount,
      Period: b.period,
      'Start Date': b.startDate,
      'End Date': b.endDate || '',
      Created: b.createdAt,
      Updated: b.updatedAt
    }));

    this.exportToCSV(budgetData, {
      ...options,
      filename: 'budgets-export',
      headers: {
        Category: 'Budget Category',
        Amount: 'Amount (₹)',
        Period: 'Period (Monthly/Yearly)',
        'Start Date': 'Start Date',
        'End Date': 'End Date',
        Created: 'Created Date',
        Updated: 'Updated Date'
      }
    });
  }

  /**
   * Export udhaar records
   * @param records Array of udhaar record objects
   * @param options Export options
   */
  static exportUdhaar(records: any[], options: ExportOptions = {}): void {
    const udhaarData = records.map(r => ({
      Date: r.date,
      'Due Date': r.dueDate || '',
      Lender: r.lenderName,
      Borrower: r.borrowerName,
      Amount: r.amount,
      Purpose: r.purpose || '',
      Status: r.status,
      'Settled Date': r.settledAt || '',
      'WhatsApp Reminder Sent': r.whatsappSentAt ? 'Yes' : 'No'
    }));

    this.exportToCSV(udhaarData, {
      ...options,
      filename: 'udhaar-export',
      headers: {
        Date: 'Date of Loan',
        'Due Date': 'Due Date',
        Lender: 'Lender Name',
        Borrower: 'Borrower Name',
        Amount: 'Amount (₹)',
        Purpose: 'Purpose/Description',
        Status: 'Status (Lent/Received/Partial/Written Off)',
        'Settled Date': 'Date Settled',
        'WhatsApp Reminder Sent': 'WhatsApp Reminder Sent'
      }
    });
  }
}