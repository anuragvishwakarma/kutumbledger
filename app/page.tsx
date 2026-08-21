export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-8">
      <div className="text-center space-y-6">
        <h1 className="text-4xl font-bold text-gray-800">KutumbLedger</h1>
        <p className="text-lg text-gray-600 max-w-2xl">
          Indian Joint Family Finance OS - Built for true Indian joint-family reality
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
          <a href="/dashboard" className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-lg text-lg transition-colors">
            Open Dashboard →
          </a>
          <a href="/dashboard/transactions" className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-3 px-6 rounded-lg text-lg transition-colors">
            View Transactions
          </a>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-2">👨‍👩‍👧‍👦 Joint Family Mode</h2>
            <p className="text-gray-500">
              Hierarchy: Admin → Adult Earners → Dependents → Kids
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-2">📱 SMS Auto-Detection</h2>
            <p className="text-gray-500">
              Local regex parser for bank/UPI SMS - zero data leaves device
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-2">🔒 Privacy First</h2>
            <p className="text-gray-500">
              Zero bank credentials, local-first IndexedDB, optional encrypted sync
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}