import { useState } from 'react';

export const INDIAN_CATEGORIES = [
  // Essentials
  { id: 'kirana', label: 'Kirana', icon: '🛒', category: 'Essentials' },
  { id: 'sabzi_mandi', label: 'Sabzi Mandi', icon: '🥬', category: 'Essentials' },
  { id: 'doodhwala', label: 'Doodhwala', icon: '🥛', category: 'Essentials' },
  { id: 'atta_chakki', label: 'Atta Chakki', icon: '🌾', category: 'Essentials' },

  // Transport
  { id: 'auto_rickshaw', label: 'Auto-rickshaw', icon: '🛺', category: 'Transport' },
  { id: 'taxi', label: 'Taxi', icon: '🚕', category: 'Transport' },
  { id: 'bus', label: 'Bus', icon: '🚌', category: 'Transport' },
  { id: 'metro', label: 'Metro', icon: '🚇', category: 'Transport' },
  { id: 'petrol_diesel', label: 'Petrol/Diesel', icon: '⛽', category: 'Transport' },
  { id: 'ev_charging', label: 'EV Charging', icon: '🔌', category: 'Transport' },

  // Bills
  { id: 'electricity', label: 'Electricity', icon: '💡', category: 'Bills' },
  { id: 'water', label: 'Water', icon: '💧', category: 'Bills' },
  { id: 'gas', label: 'Gas', icon: '🔥', category: 'Bills' },
  { id: 'dth', label: 'DTH', icon: '📺', category: 'Bills' },
  { id: 'broadband', label: 'Broadband', icon: '🌐', category: 'Bills' },
  { id: 'mobile_recharge', label: 'Mobile Recharge', icon: '📱', category: 'Bills' },

  // Education
  { id: 'school_fees', label: 'School Fees', icon: '🎓', category: 'Education' },
  { id: 'tuition', label: 'Tuition', icon: '📚', category: 'Education' },
  { id: 'books', label: 'Books', icon: '📕', category: 'Education' },
  { id: 'uniform', label: 'Uniform', icon: '👕', category: 'Education' },
  { id: 'transport', label: 'Transport', icon: '🚖', category: 'Education' },

  // Health
  { id: 'doctor', label: 'Doctor', icon: '👨‍⚕️', category: 'Health' },
  { id: 'pharmacy', label: 'Pharmacy', icon: '💊', category: 'Health' },
  { id: 'hospital', label: 'Hospital', icon: '🏥', category: 'Health' },
  { id: 'dental', label: 'Dental', icon: '🦷', category: 'Health' },
  { id: 'ayurvedic', label: 'Ayurvedic', icon: '🌿', category: 'Health' },

  // EMI
  { id: 'home_loan', label: 'Home Loan', icon: '🏠', category: 'EMI' },
  { id: 'car_loan', label: 'Car Loan', icon: '🚗', category: 'EMI' },
  { id: 'personal_loan', label: 'Personal Loan', icon: '💳', category: 'EMI' },
  { id: 'credit_card', label: 'Credit Card', icon: '💳', category: 'EMI' },

  // Investments
  { id: 'sip', label: 'SIP', icon: '📈', category: 'Investments' },
  { id: 'mutual_fund', label: 'Mutual Fund', icon: '🏦', category: 'Investments' },
  { id: 'fd', label: 'Fixed Deposit', icon: '🏦', category: 'Investments' },
  { id: 'ppf', label: 'PPF', icon: '🏦', category: 'Investments' },
  { id: 'nps', label: 'NPS', icon: '🏦', category: 'Investments' },
  { id: 'gold', label: 'Gold', icon: '🏆', category: 'Investments' },

  // Lifestyle
  { id: 'ott', label: 'OTT', icon: '📺', category: 'Lifestyle' },
  { id: 'dining_out', label: 'Dining Out', icon: '🍽️', category: 'Lifestyle' },
  { id: 'movies', label: 'Movies', icon: '🎬', category: 'Lifestyle' },
  { id: 'shopping', label: 'Shopping', icon: '🛍️', category: 'Lifestyle' },
  { id: 'salon', label: 'Salon', icon: '✂️', category: 'Lifestyle' },

  // Pooja
  { id: 'flowers', label: 'Flowers', icon: '🌸', category: 'Pooja' },
  { id: 'prasad', label: 'Prasad', icon: '🙏', category: 'Pooja' },
  { id: 'dakshina', label: 'Dakshina', icon: '💰', category: 'Pooja' },
  { id: 'samagri', label: 'Samagri', icon: '🪔', category: 'Pooja' },

  // Domestic Help
  { id: 'maid', label: 'Maid', icon: '🧹', category: 'Domestic Help' },
  { id: 'cook', label: 'Cook', icon: '👩‍🍳', category: 'Domestic Help' },
  { id: 'driver', label: 'Driver', icon: '🚗', category: 'Domestic Help' },
  { id: 'nanny', label: 'Nanny', icon: '👶', category: 'Domestic Help' },
  { id: 'gardener', label: 'Gardener', icon: '🌱', category: 'Domestic Help' },

  // Festivals
  { id: 'diwali', label: 'Diwali', icon: '🪔', category: 'Festivals' },
  { id: 'holi', label: 'Holi', icon: '🎨', category: 'Festivals' },
  { id: 'eid', label: 'Eid', icon: '🌙', category: 'Festivals' },
  { id: 'christmas', label: 'Christmas', icon: '🎄', category: 'Festivals' },
  { id: 'pongal', label: 'Pongal', icon: '🍚', category: 'Festivals' },
  { id: 'durga_puja', label: 'Durga Puja', icon: '🕍', category: 'Festivals' },

  // Other
  { id: 'cash_withdrawal', label: 'Cash Withdrawal', icon: '💷', category: 'Other' },
  { id: 'udhaar_given', label: 'Udhaar Given', icon: '🤝', category: 'Other' },
  { id: 'udhaar_received', label: 'Udhaar Received', icon: '🤲', category: 'Other' },
  { id: 'gift', label: 'Gift', icon: '🎁', category: 'Other' }
];

export default function CategorySelector({
  onSelect,
  selectedId,
}: {
  onSelect: (categoryId: string) => void;
  selectedId: string | null;
}) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(selectedId);

  const handleSelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
    onSelect(categoryId);
  };

  // Group categories by category group
  const groupedCategories = INDIAN_CATEGORIES.reduce((acc, category) => {
    if (!acc[category.category]) {
      acc[category.category] = [];
    }
    acc[category.category].push(category);
    return acc;
  }, {} as Record<string, typeof INDIAN_CATEGORIES>);

  return (
    <div className="space-y-4">
      {Object.keys(groupedCategories).map((group) => (
        <div key={group} className="space-y-2">
          <h3 className="text-sm font-medium text-gray-600 text-uppercase">{group}</h3>
          <div className="flex flex-wrap gap-2">
            {groupedCategories[group].map((category) => (
              <button
                key={category.id}
                onClick={() => handleSelect(category.id)}
                className={selectedCategory === category.id
                                  ? `flex flex-col items-center justify-center p-3 border rounded-md bg-green-50 border-green-500`
                                  : `flex flex-col items-center justify-center p-3 border rounded-md bg-white border-gray-200 hover:bg-gray-50`}
              >
                <div className="text-2xl mb-1">{category.icon}</div>
                <span className="text-xs text-center">{category.label}</span>
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}