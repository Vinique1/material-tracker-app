import React from 'react';
import { Package, Truck, Send } from 'lucide-react';

const StatsCards = ({ stats }) => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard title="Total Materials" value={stats?.totalMaterials || 0} icon={<Package />} color="blue" />
        <StatCard title="Total Delivered" value={stats?.totalDelivered || 0} icon={<Truck />} color="green" />
        <StatCard title="Total Issued" value={stats?.totalIssued || 0} icon={<Send />} color="yellow" />
    </div>
);

const StatCard = ({ title, value, icon, color }) => {
    const colors = {
        blue: 'bg-blue-100 text-blue-600',
        green: 'bg-green-100 text-green-600',
        yellow: 'bg-yellow-100 text-yellow-600',
    };
    return (
        <div className="bg-white p-6 rounded-lg shadow-md flex items-center justify-between">
            <div>
                <p className="text-sm font-medium text-gray-500">{title}</p>
                <p className="text-3xl font-bold text-gray-900">{value}</p>
            </div>
            <div className={`${colors[color]} p-3 rounded-full`}>
                {icon}
            </div>
        </div>
    );
};

export default StatsCards;