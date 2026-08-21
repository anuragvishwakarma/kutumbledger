'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ExportUtil } from '@/lib/export';
import EmptyState from '@/components/ui/EmptyState';
import SkeletonLoader from '@/components/ui/SkeletonLoader';
import ToastManager from '@/components/ui/ToastManager';
import { useToast } from '@/components/ui/ToastManager';

export default function Settings() {
  const [notifications, setNotifications] = useState({
    email: true,
    sms: false,
    push: true,
    transactionAlerts: true,
    billReminders: true
  });

  const [appPreferences, setAppPreferences] = useState({
    language: 'en-IN',
    currency: 'INR',
    dateFormat: 'DD/MM/YYYY',
    weekStartsOn: 'monday',
    theme: 'system'
  });

  const [privacySettings, setPrivacySettings] = useState({
    analytics: false,
    errorTracking: true,
    usageStats: true
  });

  const [syncSettings, setSyncSettings] = useState({
    cloudSync: true,
    autoBackup: true,
    syncOverCellular: false
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const showToast = useToast();

  // Simulate saving settings to backend
  const handleSaveSettings = async () => {
    setLoading(true);
    setError(null);
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // In a real app, this would save to backend/local storage
      showToast('Settings saved successfully', 'success');
    } catch (err) {
      setError('Failed to save settings');
      showToast('Failed to save settings', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleNotification = (key: string) => {
    setNotifications(prev => ({
      ...prev,
      [key]: !prev[key as keyof typeof notifications]
    }));
  };

  const handleTogglePreference = (key: string) => {
    setAppPreferences(prev => ({
      ...prev,
      [key]: key === 'theme'
        ? (prev.theme === 'system' ? 'dark' : prev.theme === 'dark' ? 'light' : 'system')
        : !prev[key as keyof typeof appPreferences]
    }));
  };

  const handleTogglePrivacy = (key: string) => {
    setPrivacySettings(prev => ({
      ...prev,
      [key]: !prev[key as keyof typeof privacySettings]
    }));
  };

  const handleToggleSync = (key: string) => {
    setSyncSettings(prev => ({
      ...prev,
      [key]: !prev[key as keyof typeof syncSettings]
    }));
  };

  return (
    <ToastManager>
      <div className="max-w-4xl mx-auto py-8">
        {/* Loading State */}
        {loading && !error && (
          <SkeletonLoader loading={true}>
            <div className="space-y-6">
              {[1, 2, 3, 4].map((_, index) => (
                <div key={index} className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold">Section Title</h2>
                    <button className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
                      Save
                    </button>
                  </div>
                  <div className="space-y-4">
                    {[1, 2, 3].map((_, idx) => (
                      <div key={idx} className="flex items-center justify-between p-4 border rounded-md">
                        <div className="flex items-center space-x-3">
                          <div className="flex-shrink-0">
                            <div className="w-10 h-10 flex items-center justify-center bg-gray-200 rounded"></div>
                          </div>
                          <div className="flex-1 ml-4 space-y-1">
                            <div className="h-4 w-full rounded bg-gray-200"></div>
                            <div className="h-2 w-1/2 rounded bg-gray-200 mt-1"></div>
                          </div>
                          <div className="flex-shrink-0 text-right space-y-1">
                            <div className="h-4 w-8 rounded bg-gray-200"></div>
                            <div className="h-2 w-4 rounded bg-gray-200 mt-1"></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </SkeletonLoader>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="bg-red-50 border-l-4 border-red-400 text-red-700 p-4 rounded-md mb-6">
            <p className="font-medium">{error}</p>
            <button
              onClick={() => {
                setError(null);
                // Trigger reload
                window.location.reload();
              }}
              className="mt-2 text-sm text-blue-600 hover:text-blue-500 underline"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Settings Form */}
        {!loading && !error && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold">Settings</h1>
              <button
                onClick={handleSaveSettings}
                className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
                disabled={loading}
              >
                {loading ? 'Saving...' : 'Save Settings'}
              </button>
            </div>

            {/* Notifications */}
            <div className="space-y-6">
              <h2 className="text-xl font-semibold mb-4">Notifications</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-md hover:bg-gray-50 transition-colors duration-200">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600">�������������������������������������📧</span>
                      </div>
                    </div>
                    <div>
                      <p className="font-medium">Email notifications</p>
                      <p className="text-sm text-gray-500">
                        Receive transaction summaries and updates via email
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={notifications.email}
                        onChange={() => handleToggleNotification('email')}
                        className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                      />
                    </label>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-md hover:bg-gray-50 transition-colors duration-200">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                        <span className="text-green-600">�������������������������������������📱</span>
                      </div>
                    </div>
                    <div>
                      <p className="font-medium">SMS alerts</p>
                      <p className="text-sm text-gray-500">
                        Get instant alerts for important transactions via SMS
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={notifications.sms}
                        onChange={() => handleToggleNotification('sms')}
                        className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                      />
                    </label>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-md hover:bg-gray-50 transition-colors duration-200">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                        <span className="text-purple-600">����������������������������������🔔</span>
                      </div>
                    </div>
                    <div>
                      <p className="font-medium">Push notifications</p>
                      <p className="text-sm text-gray-500">
                        Receive real-time notifications in the app
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={notifications.push}
                        onChange={() => handleToggleNotification('push')}
                        className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                      />
                    </label>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-md hover:bg-gray-50 transition-colors duration-200">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                        <span className="text-indigo-600">�������������������������������������💳</span>
                      </div>
                    </div>
                    <div>
                      <p className="font-medium">Transaction alerts</p>
                      <p className="text-sm text-gray-500">
                        Notify for every income/expense transaction
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={notifications.transactionAlerts}
                        onChange={() => handleToggleNotification('transactionAlerts')}
                        className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                      />
                    </label>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-md hover:bg-gray-50 transition-colors duration-200">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                        <span className="text-orange-600">�������������������������������������📅</span>
                      </div>
                    </div>
                    <div>
                      <p className="font-medium">Bill reminders</p>
                      <p className="text-sm text-gray-500">
                        Get reminders for upcoming bills and payments
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={notifications.billReminders}
                        onChange={() => handleToggleNotification('billReminders')}
                        className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                      />
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* App Preferences */}
            <div className="space-y-6">
              <h2 className="text-xl font-semibold mb-4">App Preferences</h2>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 border rounded-md hover:bg-gray-50 transition-colors duration-200">
                    <p className="font-medium mb-2">Language</p>
                    <div className="space-y-2">
                      <span className="text-sm text-gray-500">English (India)</span>
                      <button
                        onClick={() => handleTogglePreference('language')}
                        className="text-xs text-blue-600 hover:text-blue-500 underline"
                      >
                        Change
                      </button>
                    </div>
                  </div>

                  <div className="p-4 border rounded-md hover:bg-gray-50 transition-colors duration-200">
                    <p className="font-medium mb-2">Currency</p>
                    <div className="space-y-2">
                      <span className="text-sm text-gray-500">Indian Rupee (�������₹)</span>
                      <button
                        onClick={() => handleTogglePreference('currency')}
                        className="text-xs text-blue-600 hover:text-blue-500 underline"
                      >
                        Change
                      </button>
                    </div>
                  </div>

                  <div className="p-4 border rounded-md hover:bg-gray-50 transition-colors duration-200">
                    <p className="font-medium mb-2">Date Format</p>
                    <div className="space-y-2">
                      <span className="text-sm text-gray-500">DD/MM/YYYY</span>
                      <button
                        onClick={() => handleTogglePreference('dateFormat')}
                        className="text-xs text-blue-600 hover:text-blue-500 underline"
                      >
                        Change
                      </button>
                    </div>
                  </div>

                  <div className="p-4 border rounded-md hover:bg-gray-50 transition-colors duration-200">
                    <p className="font-medium mb-2">Week Starts On</p>
                    <div className="space-y-2">
                      <span className="text-sm text-gray-500">Monday</span>
                      <button
                        onClick={() => handleTogglePreference('weekStartsOn')}
                        className="text-xs text-blue-600 hover:text-blue-500 underline"
                      >
                        Change
                      </button>
                    </div>
                  </div>

                  <div className="p-4 border rounded-md hover:bg-gray-50 transition-colors duration-200">
                    <p className="font-medium mb-2">Theme</p>
                    <div className="space-y-2">
                      <span className="text-sm text-gray-500">
                        {appPreferences.theme === 'system'
                          ? 'System'
                          : appPreferences.theme === 'dark'
                            ? 'Dark'
                            : 'Light'}
                      </span>
                      <button
                        onClick={() => handleTogglePreference('theme')}
                        className="text-xs text-blue-600 hover:text-blue-500 underline"
                      >
                        Change
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Privacy & Security */}
            <div className="space-y-6">
              <h2 className="text-xl font-semibold mb-4">Privacy & Security</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-md hover:bg-gray-50 transition-colors duration-200">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                        <span className="text-red-600">�������������������������������������📊</span>
                      </div>
                    </div>
                    <div>
                      <p className="font-medium">Analytics data collection</p>
                      <p className="text-sm text-gray-500">
                        Help us improve the app by collecting usage data
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={privacySettings.analytics}
                        onChange={() => handleTogglePrivacy('analytics')}
                        className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                      />
                    </label>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-md hover:bg-gray-50 transition-colors duration-200">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                        <span className="text-yellow-600">��������������������������������</span>
                      </div>
                    </div>
                    <div>
                      <p className="font-medium">Error tracking</p>
                      <p className="text-sm text-gray-500">
                        Automatically report app crashes and errors
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={privacySettings.errorTracking}
                        onChange={() => handleTogglePrivacy('errorTracking')}
                        className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                      />
                    </label>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-md hover:bg-gray-50 transition-colors duration-200">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center">
                        <span className="text-teal-600">�������������������������������������📈</span>
                      </div>
                    </div>
                    <div>
                      <p className="font-medium">Usage statistics</p>
                      <p className="text-sm text-gray-500">
                        Share anonymous usage statistics to improve features
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={privacySettings.usageStats}
                        onChange={() => handleTogglePrivacy('usageStats')}
                        className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                      />
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Data & Sync */}
            <div className="space-y-6">
              <h2 className="text-xl font-semibold mb-4">Data & Sync</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-md hover:bg-gray-50 transition-colors duration-200">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                        <span className="text-green-600">�������������������������������☁������️</span>
                      </div>
                    </div>
                    <div>
                      <p className="font-medium">Cloud synchronization</p>
                      <p className="text-sm text-gray-500">
                        Sync your data across devices securely
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={syncSettings.cloudSync}
                        onChange={() => handleToggleSync('cloudSync')}
                        className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                      />
                    </label>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-md hover:bg-gray-50 transition-colors duration-200">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600">�������������������������������������💾</span>
                      </div>
                    </div>
                    <div>
                      <p className="font-medium">Automatic backups</p>
                      <p className="text-sm text-gray-500">
                        Automatically backup your data to the cloud
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={syncSettings.autoBackup}
                        onChange={() => handleToggleSync('autoBackup')}
                        className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                      />
                    </label>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-md hover:bg-gray-50 transition-colors duration-200">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                        <span className="text-indigo-600">�������������������������������������📶</span>
                      </div>
                    </div>
                    <div>
                      <p className="font-medium">Sync over cellular</p>
                      <p className="text-sm text-gray-500">
                        Allow data sync when using mobile data
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={syncSettings.syncOverCellular}
                        onChange={() => handleToggleSync('syncOverCellular')}
                        className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                      />
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Danger Zone */}
            <div className="space-y-6">
              <h2 className="text-xl font-semibold mb-4 text-red-600">Danger Zone</h2>
              <div className="bg-red-50 rounded-lg p-6 border-l-4 border-red-400 hover:bg-red-100 transition-colors duration-200">
                <h3 className="font-semibold mb-4">Export Your Data</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Download a copy of all your financial data in JSON format
                </p>
                <button
                  onClick={() => {
                    // In a real app, this would trigger data export
                    showToast('Data export feature coming soon!', 'info');
                  }}
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                >
                  Export Data
                </button>

                <h3 className="font-semibold mb-4 mt-6">Delete Account</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Permanently delete your account and all associated data. This action cannot be undone.
                </p>
                <button
                  onClick={() => {
                    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
                      // In a real app, this would trigger account deletion
                      showToast('Account deletion feature coming soon!', 'info');
                    }
                  }}
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                >
                  Delete Account
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ToastManager>
  );
}