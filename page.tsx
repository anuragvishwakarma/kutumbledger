export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            KutumbLedger
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Indian Joint Family Finance OS - Built for India's Reality
          </p>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <div className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6">
              <div className="flex items-center mb-4">
                <div className="bg-indigo-100 text-indigo-600 p-3 rounded-full">
                  <span className="text-2xl">���👨‍���👩‍���👧‍���👦</span>
                </div>
                <h3 className="text-lg font-medium ml-4">True Joint Family Mode</h3>
              </div>
              <p className="text-gray-600">
                Admin (CFO) → Adult Earners → Dependents → Kids hierarchy with role-based access.
              </p>
            </div>
            <div className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6">
              <div className="flex items-center mb-4">
                <div className="bg-green-100 text-green-600 p-3 rounded-full">
                  <span className="text-2xl">���📱</span>
                </div>
                <h3 className="text-lg font-medium ml-4">SMS Auto-Detection</h3>
              </div>
              <p className="text-gray-600">
                Local regex parser for bank/UPI SMS - zero data leaves device, works offline.
              </p>
            </div>
            <div className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6">
              <div className="flex items-center mb-4">
                <div className="bg-yellow-100 text-yellow-600 p-3 rounded-full">
                  <span className="text-2xl">���🔒</span>
                </div>
                <h3 className="text-lg font-medium ml-4">Privacy-First by Design</h3>
              </div>
              <p className="text-gray-600">
                Zero bank credentials needed, IndexedDB local storage, optional encrypted sync.
              </p>
            </div>
            <div className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6">
              <div className="flex items-center mb-4">
                <div className="bg-blue-100 text-blue-600 p-3 rounded-full">
                  <span className="text-2xl">���📴</span>
                </div>
                <h3 className="text-lg font-medium ml-4">Offline-First PWA</h3>
              </div>
              <p className="text-gray-600">
                Full functionality works without internet, syncs when online via service workers.
              </p>
            </div>
            <div className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6">
              <div className="flex items-center mb-4">
                <div className="bg-purple-100 text-purple-600 p-3 rounded-full">
                  <span className="text-2xl">���🎤</span>
                </div>
                <h3 className="text-lg font-medium ml-4">Hindi/English Voice Input</h3>
              </div>
              <p className="text-gray-600">
                "Swiggy pe 450 rupaye" → auto-categorized as Food Delivery using Web Speech API.
              </p>
            </div>
            <div className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6">
              <div className="flex items-center mb-4">
                <div className="bg-pink-100 text-pink-600 p-3 rounded-full">
                  <span className="text-2xl">���🏦</span>
                </div>
                <h3 className="text-lg font-medium ml-4">UPI Deep-link Settlement</h3>
              </div>
              <p className="text-gray-600">
                Generate UPI payment requests directly to PhonePe/GPay/Paytm for splits.
              </p>
            </div>
          </div>
          <div className="mt-12">
            <div className="bg-indigo-50 p-6 rounded-lg">
              <h2 className="text-xl font-bold mb-4">Get Started in Minutes</h2>
              <ol className="list-decimal list-inside space-y-2 text-gray-700">
                <li>
                  Validate with your family: Ask what's hardest about tracking money
                </li>
                <li>
                  Collect SMS samples: Forward 5 recent bank/UPI SMS to yourself
                </li>
                <li>
                  Set up repo: <code className="bg-gray-200 px-1 py-0.5 rounded">npx create-next-app@latest kutumbledger --ts --tailwind --app</code>
                </li>
                <li>
                  Build SMS parser: Create regex for your bank and test with samples
                </li>
              </ol>
            </div>
          </div>
          <div className="mt-12 text-center">
            <a
              href="/app/(dashboard)/login"
              className="inline-flex items-center px-6 py-3 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Try the Demo
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
