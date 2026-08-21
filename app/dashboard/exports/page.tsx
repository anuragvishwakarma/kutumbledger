'use client';

import { useState } from 'react';
import { ExportUtil } from '@/lib/export';
import ToastManager from '@/components/ui/ToastManager';
import { useToast } from '@/components/ui/ToastManager';

// Mock data for demonstration - in a real app, this would come from Supabase
const mockTransactions = [
  {
    id: '1',
    date: '2026-08-01',
    type: 'expense',
    category: 'Kirana',
    description: 'Grocery shopping',
    amount: 85000, // ₹850.00 in paise
    paymentMethod: 'upi',
    isRecurring: false,
    refId: 'UPI123456789',
    UPIId: 'user@upi'
  },
  {
    id: '2',
    date: '2026-08-02',
    type: 'expense',
    category: 'Auto-rickshaw',
    description: 'Office commute',
    amount: 7200, // ₹72.00 in paise
    paymentMethod: 'cash',
    isRecurring: false
  },
  {
    id: '3',
    date: '2026-08-03',
    type: 'income',
    category: 'Salary',
    description: 'Monthly salary',
    amount: 500000, // ₹5000.00 in paise
    paymentMethod: 'bank',
    isRecurring: true,
    refId: 'SAL789012'
  }
];

const mockBudgets = [
  {
    id: '1',
    category: 'Kirana',
    amount: 300000, // ₹3000.00 in paise
    period: 'monthly',
    startDate: '2026-08-01',
    endDate: '2026-08-31',
    createdAt: '2026-08-01',
    updatedAt: '2026-08-01'
  },
  {
    id: '2',
    category: 'Entertainment',
    amount: 100000, // ₹1000.00 in paise
    period: 'monthly',
    startDate: '2026-08-01',
    endDate: '2026-08-31',
    createdAt: '2026-08-01',
    updatedAt: '2026-08-01'
  }
];

const mockUdhaarRecords = [
  {
    id: '1',
    date: '2026-07-15',
    dueDate: '2026-08-15',
    lenderName: 'Priya Sharma',
    borrowerName: 'Rahul Sharma',
    amount: 50000, // ₹500.00 in paise
    purpose: 'Emergency medical expense',
    status: 'lent',
    settledAt: null,
    whatsappSentAt: '2026-07-16'
  },
  {
    id: '2',
    date: '2026-07-20',
    dueDate: '2026-08-20',
    lenderName: 'Amit Sharma',
    borrowerName: 'Sonia Sharma',
    amount: 20000, // ₹200.00 in paise
    purpose: 'Festival shopping',
    status: 'received',
    settledAt: '2026-08-10',
    whatsappSentAt: '2026-07-21'
  }
];

export default function ExportsPage() {
  const [transactions, setTransactions] = useState(mockTransactions);
  const [budgets, setBudgets] = useState(mockBudgets);
  const [udhaarRecords, setUdhaarRecords] = useState(mockUdhaarRecords);
  const [exportType, setExportType] = useState('transactions');
  const [dateRange, setDateRange] = useState({
    start: '',
    end: ''
  });

  const handleExportTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setExportType(e.target.value);
  };

  const handleDateRangeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setDateRange(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleExportCSV = () => {
    let dataToExport: any[] = [];
    let filename = 'export';
    let headers: Record<string, string> = {};

    switch (exportType) {
      case 'transactions':
        dataToExport = transactions.map(t => ({
          Date: t.date,
          Type: t.type === 'income' ? 'Income' : t.type === 'expense' ? 'Expense' : 'Transfer',
          Category: t.category,
          Description: t.description,
          Amount: t.amount / 100, // Convert from paise to rupees
          'Payment Method': t.paymentMethod.toUpperCase(),
          Status: t.isRecurring ? 'Recurring' : 'One-time',
          'Reference ID': t.refId || '',
          UPI_ID: t.UPIId || ''
        }));
        filename = 'transactions-export';
        headers = {
          Date: 'Date',
          Type: 'Transaction Type',
          Category: 'Category',
          Description: 'Description',
          Amount: 'Amount (₹)',
          'Payment Method': 'Payment Method',
          Status: 'Status',
          'Reference ID': 'Reference ID',
          UPI_ID: 'UPI ID'
        };
        break;

      case 'budgets':
        dataToExport = budgets.map(b => ({
          Category: b.category,
          Amount: b.amount / 100, // Convert from paise to rupees
          Period: b.period,
          'Start Date': b.startDate,
          'End Date': b.endDate || '',
          Created: b.createdAt,
          Updated: b.updatedAt
        }));
        filename = 'budgets-export';
        headers = {
          Category: 'Budget Category',
          Amount: 'Amount (₹)',
          Period: 'Period (Monthly/Yearly)',
          'Start Date': 'Start Date',
          'End Date': 'End Date',
          Created: 'Created Date',
          Updated: 'Updated Date'
        };
        break;

      case 'udhaar':
        dataToExport = udhaarRecords.map(r => ({
          Date: r.date,
          'Due Date': r.dueDate || '',
          Lender: r.lenderName,
          Borrower: r.borrowerName,
          Amount: r.amount / 100, // Convert from paise to rupees
          Purpose: r.purpose || '',
          Status: r.status === 'lent' ? 'Lent' : r.status === 'received' ? 'Received' : r.status === 'partial' ? 'Partial' : 'Written Off',
          'Settled Date': r.settledAt || '',
          'WhatsApp Reminder Sent': r.whatsappSentAt ? 'Yes' : 'No'
        }));
        filename = 'udhaar-export';
        headers = {
          Date: 'Date of Loan',
          'Due Date': 'Due Date',
          Lender: 'Lender Name',
          Borrower: 'Borrower Name',
          Amount: 'Amount (₹)',
          Purpose: 'Purpose/Description',
          Status: 'Status',
          'Settled Date': 'Date Settled',
          'WhatsApp Reminder Sent': 'WhatsApp Reminder Sent'
        };
        break;
    }

    // Apply date filtering if date range is specified
    if (dateRange.start || dateRange.end) {
      const startDate = dateRange.start ? new Date(dateRange.start) : null;
      const endDate = dateRange.end ? new Date(dateRange.end) : null;

      dataToExport = dataToExport.filter(item => {
        const itemDate = new Date(item.Date);
        return (!startDate || itemDate >= startDate) &&
               (!endDate || itemDate <= endDate);
      });
    }

    ExportUtil.exportToCSV(dataToExport, {
      filename,
      headers
    });
  };

  const handleExportExcel = () => {
    // For simplicity, we'll reuse the CSV export but with .xls extension
    // In a production app, you'd use a proper Excel library like SheetJS
    handleExportCSV();
  };

  return (
    <ToastManager>
      <div className="space-y-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold mb-4">Export Data for CA</h1>
          <p className="text-gray-600 mb-4">
            Export financial data in CSV or Excel format for accounting and tax purposes
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <label className="block text-sm font-medium mb-2">Export Type</label>
              <select
                value={exportType}
                onChange={handleExportTypeChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="transactions">Transactions</option>
                <option value="budgets">Budgets</option>
                <option value="udhaar">Udhaar Records</option>
              </select>
            </div>

            <div className="space-y-4">
              <label className="block text-sm font-medium mb-2">Date Range (Optional)</label>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Start Date</label>
                  <input
                    type="date"
                    name="start"
                    value={dateRange.start}
                    onChange={handleDateRangeChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    max={new Date().toISOString().split('T')[0]}
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">End Date</label>
                  <input
                    type="date"
                    name="end"
                    value={dateRange.end}
                    onChange={handleDateRangeChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    max={new Date().toISOString().split('T')[0]}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <h2 className="text-xl font-semibold mb-4">Export Options</h2>
            <div className="flex justify-center space-x-4">
              <button
                onClick={handleExportCSV}
                className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded"
              >
                Export CSV
              </button>
              <button
                onClick={handleExportExcel}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded"
              >
                Export Excel
              </button>
            </div>
            <p className="mt-3 text-sm text-gray-500 text-center">
              Note: Excel export is provided as CSV format with .xls extension for compatibility.
              For advanced Excel features (multiple sheets, formatting), consider using a dedicated
              Excel library in production.
            </p>
          </div>
        </div>

        {/* Preview section */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Data Preview</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {exportType === 'transactions' && (
                    <>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount (₹)</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payment Method</th>
                    </>
                  )}
                  {exportType === 'budgets' && (
                    <>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount (₹)</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Period</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Start Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">End Date</th>
                    </>
                  )}
                  {exportType === 'udhaar' && (
                    <>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Lender</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Borrower</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount (₹)</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {exportType === 'transactions' && (
                  transactions.slice(0, 5).map((t, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {t.date}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {t.type === 'income' ? 'Income' : t.type === 'expense' ? 'Expense' : 'Transfer'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {t.category}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {t.description}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        ₹{(t.amount / 100).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {t.paymentMethod.toUpperCase()}
                      </td>
                    </tr>
                  ))
                )}
                {exportType === 'budgets' && (
                  budgets.slice(0, 5).map((b, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {b.category}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        ₹{(b.amount / 100).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {b.period}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {b.startDate}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {b.endDate || ''}
                      </td>
                    </tr>
                  ))
                )}
                {exportType === 'udhaar' && (
                  udhaarRecords.slice(0, 5).map((r, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {r.date}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {r.lenderName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {r.borrowerName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        ₹{(r.amount / 100).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {r.status === 'lent' ? 'Lent' : r.status === 'received' ? 'Received' : r.status === 'partial' ? 'Partial' : 'Written Off'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {exportType === 'transactions' && transactions.length > 5 && (
            <p className="mt-3 text-sm text-gray-500 text-center">
              Showing 5 of {transactions.length} transactions. All data will be exported.
            </p>
          )}
          {exportType === 'budgets' && budgets.length > 5 && (
            <p className="mt-3 text-sm text-gray-500 text-center">
              Showing 5 of {budgets.length} budgets. All data will be exported.
            </p>
          )}
          {exportType === 'udhaar' && udhaarRecords.length > 5 && (
            <p className="mt-3 text-sm text-gray-500 text-center">
              Showing 5 of {udhaarRecords.length} udhaar records. All data will be exported.
            </p>
          )}
        </div>
      </div>
    </ToastManager>
  );
}