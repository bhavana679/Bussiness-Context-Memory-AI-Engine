import React from 'react';
import {
    PieChart,
    Pie,
    Cell,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts';
import { IndianRupee, AlertTriangle, Activity, TrendingUp } from 'lucide-react';
import { mockDashboardData } from '../mockData';

const COLORS = ['#22c55e', '#eab308', '#ef4444']; // Green, Yellow, Red
const riskDistribution = [
    { name: 'Low Risk', value: 45 },
    { name: 'Medium Risk', value: 30 },
    { name: 'High Risk', value: 25 },
];

const mockExposureData = [
    { name: 'Jan', exposure: 12000000 },
    { name: 'Feb', exposure: 15000000 },
    { name: 'Mar', exposure: 18000000 },
    { name: 'Apr', exposure: 22000000 },
    { name: 'May', exposure: 25000000 },
];

export default function Dashboard() {
    const { total_exposure, avg_risk_score, overdue_count, high_risk_distributors } = mockDashboardData;

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumSignificantDigits: 3 }).format(value);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Executive Overview</h2>
                <span className="text-sm font-medium text-gray-500 bg-white px-3 py-1 rounded-full shadow-sm">Last updated: Just now</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Total Exposure Card */}
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 flex items-center">
                    <div className="p-3 rounded-lg bg-indigo-50 text-indigo-600 mr-4">
                        <IndianRupee size={24} />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500">Total Exposure</p>
                        <p className="text-2xl font-bold text-gray-900">{formatCurrency(total_exposure)}</p>
                    </div>
                </div>

                {/* Avg Risk Score Card */}
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 flex items-center">
                    <div className="p-3 rounded-lg bg-yellow-50 text-yellow-600 mr-4">
                        <Activity size={24} />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500">Average Risk Score</p>
                        <p className="text-2xl font-bold text-gray-900">{avg_risk_score}</p>
                    </div>
                </div>

                {/* Overdue Count Card */}
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 flex items-center">
                    <div className="p-3 rounded-lg bg-red-50 text-red-600 mr-4">
                        <AlertTriangle size={24} />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500">Overdue Invoices</p>
                        <p className="text-2xl font-bold text-gray-900">{overdue_count}</p>
                    </div>
                </div>

                {/* Active Entities Card */}
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 flex items-center">
                    <div className="p-3 rounded-lg bg-green-50 text-green-600 mr-4">
                        <TrendingUp size={24} />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500">Active Distributors</p>
                        <p className="text-2xl font-bold text-gray-900">124</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Risk Distribution Chart */}
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 col-span-1 border-t-4 border-t-indigo-500">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Risk Distribution</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={riskDistribution}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {riskDistribution.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="flex justify-center space-x-4 text-sm mt-4">
                        <div className="flex items-center"><span className="w-3 h-3 bg-green-500 rounded-full mr-2"></span> Low</div>
                        <div className="flex items-center"><span className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></span> Med</div>
                        <div className="flex items-center"><span className="w-3 h-3 bg-red-500 rounded-full mr-2"></span> High</div>
                    </div>
                </div>

                {/* Exposure Trend */}
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 col-span-1 lg:col-span-2">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Exposure Trend (M INR)</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={mockExposureData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                                <YAxis axisLine={false} tickLine={false} tickFormatter={(value) => value / 1000000} />
                                <Tooltip formatter={(value) => formatCurrency(value)} />
                                <Bar dataKey="exposure" fill="#6366f1" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
                <div className="px-6 py-4 border-b border-gray-100 bg-red-50 flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-red-800 flex items-center">
                        <AlertTriangle className="mr-2" size={20} /> Watchlist - High Risk
                    </h3>
                </div>
                <div className="divide-y divide-gray-100">
                    {high_risk_distributors.map((dist) => (
                        <div key={dist.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                            <div>
                                <p className="font-semibold text-gray-900">{dist.name}</p>
                                <p className="text-sm text-gray-500">ID: {dist.id}</p>
                            </div>
                            <div className="flex items-center">
                                <span className="text-sm text-gray-600 mr-2">Risk Score:</span>
                                <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full font-bold">
                                    {dist.risk_score}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
