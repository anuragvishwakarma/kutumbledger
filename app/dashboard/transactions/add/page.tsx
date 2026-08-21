'use client';

import { useState } from 'react';
import CategorySelector from '@/components/ui/CategorySelector';
import ToastManager from '@/components/ui/ToastManager';
import { useToast } from '@/components/ui/ToastManager';

export default function AddTransaction() {
  const showToast = useToast();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showCashTips, setShowCashTips] = useState(false);
  const [hasReceipt, setHasReceipt] = useState(false);

  // Form state
  const [amount, setAmount] = useState('');
  const [transactionType, setTransactionType] = useState('expense');
  const [paymentMethod, setPaymentMethod] = useState('upi');
  const [description, setDescription] = useState('');
  const [isRecurring, setIsRecurring] = useState(false);
  const [voiceInputEnabled, setVoiceInputEnabled] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
  };

  const handleCashTipsToggle = () => {
    setShowCashTips(!showCashTips);
  };

  const handleReceiptToggle = () => {
    setHasReceipt(!hasReceipt);
    if (!hasReceipt && !showCashTips) {
      setShowCashTips(true);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!amount || !selectedCategory) {
      showToast('Please fill in amount and select a category', 'error');
      return;
    }

    setIsSubmitting(true);

    // Simulate API call
    setTimeout(() => {
      const transactionData = {
        amount: Math.round(parseFloat(amount) * 100), // Convert to paise
        type: transactionType,
        category: selectedCategory,
        description,
        paymentMethod,
        isRecurring,
        hasReceipt,
        voiceInputEnabled,
        date: new Date().toISOString().split('T')[0],
      };

      console.log('Transaction saved:', transactionData);
      showToast('Transaction saved successfully', 'success');
      setIsSubmitting(false);

      // Reset form
      setAmount('');
      setTransactionType('expense');
      setPaymentMethod('upi');
      setDescription('');
      setIsRecurring(false);
      setHasReceipt(false);
      setVoiceInputEnabled(false);
      setSelectedCategory(null);
      setShowCashTips(false);
    }, 500);
  };

  return (
    <ToastManager>
      <div className="max-w-2xl mx-auto py-8">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold mb-6">Add Transaction</h1>
        <form className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="amount" className="block text-sm font-medium mb-2">Amount (₹)</label>
              <input
                type="number"
                id="amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Enter amount"
                step="0.01"
                min="0"
                required
              />
            </div>
            <div>
              <label htmlFor="transaction-type" className="block text-sm font-medium mb-2">Type</label>
              <select
                id="transaction-type"
                value={transactionType}
                onChange={(e) => setTransactionType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="expense">Expense</option>
                <option value="income">Income</option>
                <option value="transfer">Transfer</option>
              </select>
            </div>
          </div>

          <div className="space-y-4">
            <label className="block text-sm font-medium mb-2">Category</label>
            <CategorySelector
              onSelect={handleCategorySelect}
              selectedId={selectedCategory}
            />
            {selectedCategory && (
              <p className="text-sm text-green-600 mt-2">
                Selected: {selectedCategory.replace('_', ' ').toUpperCase()}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="payment-method" className="block text-sm font-medium mb-2">Payment Method</label>
              <select
                id="payment-method"
                value={paymentMethod}
                onChange={(e) => {
                  setPaymentMethod(e.target.value);
                  if (e.target.value === 'cash' && !showCashTips) {
                    setShowCashTips(true);
                  }
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="upi">UPI</option>
                <option value="cash">Cash</option>
                <option value="card">Card</option>
                <option value="bank">Bank</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label htmlFor="transaction-description" className="block text-sm font-medium mb-2">Description</label>
              <input
                type="text"
                id="transaction-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Enter description"
              />
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                id="recurring-toggle"
                checked={isRecurring}
                onChange={() => setIsRecurring(!isRecurring)}
              />
              <span className="text-sm">Recurring</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                id="receipt-toggle"
                checked={hasReceipt}
                onChange={handleReceiptToggle}
              />
              <span className="text-sm">Has Receipt</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                id="voice-input-toggle"
                checked={voiceInputEnabled}
                onChange={() => setVoiceInputEnabled(!voiceInputEnabled)}
              />
              <span className="text-sm">Voice Input</span>
            </label>
          </div>

          {/* Cash-specific tips */}
          {showCashTips && (
            <div className="mt-4 p-4 bg-yellow-50 rounded-lg border-l-4 border-yellow-400">
              <h3 className="font-semibold mb-2">Cash Transaction Tips</h3>
              <p className="text-sm text-gray-600">
                For cash transactions, consider:
              </p>
              <ul className="list-disc list-inside text-sm text-gray-600 mt-2">
                <li>Getting a receipt whenever possible</li>
                <li>Recording the transaction as soon as possible</li>
                <li>Note down the exact location and time if relevant</li>
                <li>Consider using the voice input feature for quick entry</li>
              </ul>
            </div>
          )}

          <div className="flex justify-end pt-4">
            <button
              type="button"
              onClick={handleSubmit}
              className={`bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : 'Save Transaction'}
            </button>
          </div>
        </form>
      </div>
      </div>
    </ToastManager>
  );
}