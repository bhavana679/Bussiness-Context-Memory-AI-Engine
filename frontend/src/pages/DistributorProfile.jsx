import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { mockProfileData } from '../mockData';
import { ArrowLeft, BrainCircuit, Activity, AlertCircle, Calendar } from 'lucide-react';

export default function DistributorProfile() {
    const { id } = useParams();
    const navigate = useNavigate();
    // In a real app, use the ID to fetch data. Here we just use the mock.
    const profile = mockProfileData;

    const formatCurrency = (val) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);

    return (
        <div className="space-y-6 pb-12">
            <button
                onClick={() => navigate(-1)}
                className="flex items-center text-indigo-600 hover:text-indigo-800 font-medium transition-colors"
            >
                <ArrowLeft size={18} className="mr-1" /> Back to List
            </button>

            {/* 1. Basic Info */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col md:flex-row justify-between items-start md:items-center">
                <div>
                    <h2 className="text-3xl font-bold text-gray-900">{profile.name}</h2>
                    <p className="text-gray-500 mt-1">{profile.industry} • {profile.city} • ID: {profile.id}</p>
                </div>
                <div className="mt-4 md:mt-0 flex flex-col md:text-right">
                    <p className="text-sm font-medium text-gray-500">Credit Limit / Current Utilization</p>
                    <p className="text-xl font-bold text-gray-900">
                        {formatCurrency(profile.credit_limit)} <span className="text-gray-400 font-normal">limit</span>
                    </p>
                    <div className="w-full md:w-64 h-2 bg-gray-100 rounded-full mt-2 overflow-hidden">
                        <div
                            className="h-full bg-indigo-500"
                            style={{ width: `${(profile.current_utilization / profile.credit_limit) * 100}%` }}
                        ></div>
                    </div>
                    <p className="text-xs text-indigo-600 font-medium mt-1 text-right">
                        {formatCurrency(profile.current_utilization)} Used
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* 4. Risk Summary Panel (The core focus) */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white rounded-xl shadow-sm border-2 border-indigo-100 overflow-hidden">
                        <div className="bg-indigo-50 px-6 py-4 border-b border-indigo-100 flex items-center justify-between">
                            <h3 className="font-bold text-indigo-900 flex items-center">
                                <BrainCircuit size={20} className="mr-2 text-indigo-600" />
                                Hybrid Risk Engine
                            </h3>
                        </div>
                        <div className="p-6">
                            <div className="flex flex-col items-center justify-center mb-6">
                                <div className="relative w-32 h-32 flex items-center justify-center rounded-full border-8 border-gray-100 mb-2">
                                    <div className="absolute w-full h-full rounded-full border-8 border-red-500" style={{ clipPath: `inset(${100 - profile.final_risk}% 0 0 0)` }}></div>
                                    <span className="text-4xl font-black text-gray-900">{profile.final_risk}</span>
                                </div>
                                <span className="text-sm font-bold text-red-600 tracking-wider">HIGH RISK</span>
                            </div>

                            <div className="space-y-4">
                                <div className="bg-blue-50 p-3 rounded-lg flex justify-between items-center border border-blue-100">
                                    <span className="text-sm font-medium text-blue-800">Structured Factor (60%)</span>
                                    <span className="font-bold text-blue-900">{profile.structured_risk}</span>
                                </div>
                                <div className="bg-purple-50 p-3 rounded-lg flex justify-between items-center border border-purple-100">
                                    <span className="text-sm font-medium text-purple-800">Semantic Factor (30%)</span>
                                    <span className="font-bold text-purple-900">{profile.semantic_risk}</span>
                                </div>
                                <div className="bg-gray-50 p-3 rounded-lg flex justify-between items-center border border-gray-200">
                                    <span className="text-sm font-medium text-gray-600">Recency Decay (10%)</span>
                                    <span className="font-bold text-gray-900">-</span>
                                </div>
                            </div>

                            <div className="mt-6 pt-4 border-t border-gray-100">
                                <p className="text-xs text-gray-500 font-mono text-center">
                                    Formula: (0.6 × Structural) + (0.3 × Semantic) + (0.1 × Recency)
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-2 space-y-6">
                    {/* 2. Structured Risk Breakdown */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                            <Activity size={20} className="mr-2 text-blue-500" />
                            Structured Risk Breakdown
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {Object.entries(profile.breakdown).map(([key, value]) => (
                                <div key={key}>
                                    <div className="flex justify-between mb-1">
                                        <span className="text-sm font-medium text-gray-600 capitalize">{key.replace('_score', '').replace('_', ' ')}</span>
                                        <span className="text-sm font-bold text-gray-900">{value}/100</span>
                                    </div>
                                    <div className="w-full bg-gray-100 rounded-full h-2">
                                        <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${value}%` }}></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* 3. Semantic Memory Section */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-purple-50 rounded-bl-full -z-10"></div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                            <BrainCircuit size={20} className="mr-2 text-purple-500" />
                            Semantic Memory Context
                        </h3>
                        <p className="text-sm text-gray-600 mb-4">AI identified historical patterns influencing the current risk decision.</p>

                        <div className="space-y-4">
                            {profile.similar_cases.map((sc) => (
                                <div key={sc.id} className="border border-purple-100 bg-white hover:bg-purple-50/30 transition-colors p-4 rounded-lg shadow-sm">
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="flex items-center text-xs font-medium text-purple-600 bg-purple-100 px-2 py-1 rounded">
                                            <AlertCircle size={14} className="mr-1" />
                                            Similarity: {(sc.similarity * 100).toFixed(0)}%
                                        </div>
                                        <div className="flex items-center text-xs text-gray-500">
                                            <Calendar size={14} className="mr-1" />
                                            {sc.date}
                                        </div>
                                    </div>
                                    <p className="text-gray-800 font-medium text-sm">"{sc.event}"</p>
                                    <div className="mt-3 flex items-center justify-between text-xs">
                                        <span className="text-gray-500">Historical Case: <span className="font-mono">{sc.id}</span></span>
                                        <span className="text-red-500 font-bold border border-red-100 px-2 py-0.5 rounded bg-red-50">
                                            Severity: {sc.severity}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
