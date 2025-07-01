import React from 'react';
import { Package, Truck, Send } from 'lucide-react';

// NEW: Helper function to format numbers to 2 decimal places if they are not whole numbers
const formatNumber = (num) => {
  if (num % 1 !== 0) {
    // Check if the number has a decimal part
    return num.toFixed(2);
  }
  return num;
};

const StatCard = ({ title, value, icon, color }) => {
  // MODIFIED: Updated color classes to include dark mode variants
  const colors = {
    blue: 'bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400',
    green:
      'bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400',
    yellow:
      'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/20 dark:text-yellow-400',
  };
  return (
    // MODIFIED: Added dark mode classes for background and text
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
          {title}
        </p>
        {/* MODIFIED: Applied the number formatting function to the value */}
        <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          {formatNumber(value)}
        </p>
      </div>
      <div className={`${colors[color]} p-3 rounded-full`}>{icon}</div>
    </div>
  );
};

const StatsCards = ({ stats }) => (
  // MODIFIED: Changed grid to be `sm:grid-cols-2` for 2 columns on small screens, then `lg:grid-cols-3` for 3 on large.
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
    <StatCard
      title="Total Line Items"
      value={stats?.totalMaterials || 0}
      icon={<Package />}
      color="blue"
    />
    <StatCard
      title="Total Qty Delivered"
      value={stats?.totalDelivered || 0}
      icon={<Truck />}
      color="green"
    />
    <StatCard
      title="Total Qty Issued"
      value={stats?.totalIssued || 0}
      icon={<Send />}
      color="yellow"
    />
  </div>
);

export default StatsCards;
