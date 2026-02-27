import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    BrainCircuit,
    Activity,
    AlertTriangle,
    Calendar,
    ShieldCheck,
    TrendingDown,
    RefreshCcw,
    FileText,
    CreditCard,
    Download
} from 'lucide-react';
import useAppStore from '../store/useAppStore';
import RiskGauge from '../components/RiskGauge';
import SimilarCaseCard from '../components/SimilarCaseCard';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts';
import { useDistributor } from '../hooks/useApiHooks';

export default function DistributorProfile() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { auth } = useAppStore();

    const { data: profile, loading, error, refetch } = useDistributor(id);

    const formatCurrency = (val) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(val || 0);
    };

    const downloadReport = () => {
        if (!profile) return;
        const reportContent = `
=========================================
      AI INTELLIGENCE NODE REPORT
=========================================
Entity Name  : ${profile.name}
Node UUID    : ${profile.id}
Industry     : ${profile.industry}
Location     : ${profile.city}

--- FINANCIAL STATE ---
Authorized Ceiling : ${formatCurrency(profile.credit_limit)}
Active Exposure    : ${formatCurrency(profile.current_utilization)}
Credit Drain       : ${((profile.current_utilization / profile.credit_limit) * 100).toFixed(1)}%

--- AI RISK HYBRID SCORE ---
Final Risk Index   : ${profile.final_risk}/100
Structured Array   : ${profile.structured_risk}%
Semantic Array     : ${profile.semantic_risk}%

--- COGNITIVE INSIGHT ---
${profile.explanation}

=========================================
End of Report | Verified by Engine v2.1.0
=========================================
        `.trim();

        const blob = new Blob([reportContent], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `risk_report_${profile.name.replace(/\s+/g, '_')}_${profile.id}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };


    if (loading && !profile) {
        return (
            <div className="space-y-8 animate-pulse">
                <div className="h-6 bg-gray-100  rounded w-24"></div>
                <div className="bg-white  rounded-3xl h-40 border border-gray-100 "></div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="bg-white  rounded-3xl h-[450px] border border-gray-100 "></div>
                    <div className="lg:col-span-2 space-y-8">
                        <div className="bg-white  rounded-3xl h-72 border border-gray-100 "></div>
                        <div className="bg-white  rounded-3xl h-72 border border-gray-100 "></div>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-white  rounded-3xl border-2 border-dashed border-red-100  p-16 text-center my-12 transition-colors">
                <AlertTriangle className="text-red-500 mx-auto mb-6" size={56} />
                <h3 className="text-2xl font-black text-gray-900  mb-2 uppercase tracking-tighter">Profile Retrieval Failed</h3>
                <p className="text-gray-500  mb-8 max-w-sm mx-auto font-medium">Could not load data for distributor {id}.</p>
                <button
                    onClick={() => refetch()}
                    className="inline-flex items-center px-8 py-4 bg-red-600 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-red-700 transition-all shadow-xl shadow-red-100 "
                >
                    <RefreshCcw size={18} className="mr-2" /> Try Again
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-8 pb-20 max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center text-[10px] font-black text-gray-400  hover:text-indigo-600  uppercase tracking-widest transition-all group"
                >
                    <ArrowLeft size={16} className="mr-2 group-hover:-translate-x-1 transition-transform" /> Go Back
                </button>
                <div className="flex items-center space-x-3">
                    <button
                        onClick={downloadReport}
                        className="px-6 py-2 bg-white text-gray-700 border border-gray-200 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-sm hover:bg-gray-50 transition-all flex items-center"
                    >
                        <Download size={14} className="mr-2" /> Export
                    </button>
                    {['Admin', 'RiskOfficer'].includes(auth.role) && (
                        <button
                            onClick={() => navigate('/evaluation', { state: { distributorId: id } })}
                            className="px-6 py-2 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center"
                        >
                            <CreditCard size={14} className="mr-2" /> Evaluate Credit
                        </button>
                    )}
                    <span className="px-5 py-2 bg-white  border border-gray-100  rounded-full text-[10px] font-black text-gray-400  shadow-sm uppercase tracking-widest">
                        ID: {String(id).slice(0, 16)}...
                    </span>
                </div>
            </div>

            <div className="bg-white  rounded-3xl shadow-xl border border-gray-100  p-10 flex flex-col xl:flex-row justify-between items-start xl:items-center relative overflow-hidden transition-colors duration-300">
                <div className="absolute -top-10 -right-10 p-2 opacity-5">
                    <ShieldCheck className="text-indigo-600" size={240} />
                </div>
                <div className="relative z-10 space-y-4">
                    <h2 className="text-5xl font-black text-gray-900  tracking-tighter">{profile?.name}</h2>
                    <div className="flex flex-wrap gap-3">
                        <span className="px-4 py-1.5 bg-indigo-50  text-indigo-700  rounded-xl text-[10px] font-black uppercase tracking-widest border border-indigo-100 ">{profile?.industry}</span>
                        <span className="px-4 py-1.5 bg-gray-50  text-gray-600  rounded-xl text-[10px] font-black uppercase tracking-widest border border-gray-200 ">{profile?.city}</span>
                    </div>
                </div>
                <div className="mt-10 xl:mt-0 w-full xl:w-96 relative z-10">
                    <div className="flex justify-between items-end mb-3">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Credit Utilization</p>
                        <p className="text-xs font-black text-indigo-600 ">{((profile?.current_utilization / profile?.credit_limit) * 100).toFixed(1)}%</p>
                    </div>
                    <div className="w-full h-4 bg-gray-100  rounded-2xl overflow-hidden border border-gray-50 ">
                        <div
                            className="h-full bg-gradient-to-r from-indigo-600 to-indigo-400 shadow-lg shadow-indigo-100  transition-all duration-1000"
                            style={{ width: `${(profile?.current_utilization / profile?.credit_limit) * 100}%` }}
                        ></div>
                    </div>
                    <div className="flex justify-between mt-5">
                        <div className="space-y-1">
                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]">Credit Limit</p>
                            <p className="text-xl font-black text-gray-900  tracking-tighter italic">{formatCurrency(profile?.credit_limit)}</p>
                        </div>
                        <div className="text-right space-y-1">
                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]">Current Utilization</p>
                            <p className="text-xl font-black text-indigo-600  tracking-tighter italic">{formatCurrency(profile?.current_utilization)}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1 space-y-8">
                    <div className="bg-white  rounded-3xl shadow-xl border border-gray-100  overflow-hidden transition-colors duration-300">
                        <div className="bg-gray-50/50  px-8 py-5 border-b border-gray-100  flex items-center justify-between">
                            <h3 className="font-black text-gray-900  flex items-center text-[10px] uppercase tracking-[0.2em]">
                                <BrainCircuit size={16} className="mr-3 text-indigo-600 " /> Risk Analysis
                            </h3>
                        </div>
                        <div className="p-10">
                            <RiskGauge score={profile?.final_risk} />

                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-gray-50  p-5 rounded-3xl border border-gray-100  text-center group hover:bg-white  transition-all border-b-4 border-b-blue-600">
                                    <p className="text-[9px] font-black text-gray-400 uppercase mb-2 tracking-widest">Financial</p>
                                    <p className="text-2xl font-black text-blue-600 ">{profile?.structured_risk || 0}%</p>
                                </div>
                                <div className="bg-gray-50  p-5 rounded-3xl border border-gray-100  text-center group hover:bg-white  transition-all border-b-4 border-b-purple-600">
                                    <p className="text-[9px] font-black text-gray-400 uppercase mb-2 tracking-widest">Behavioral</p>
                                    <p className="text-2xl font-black text-purple-600 ">{profile?.semantic_risk || 0}%</p>
                                </div>
                            </div>
                            <div className="mt-8 p-6 bg-indigo-50/30  rounded-2xl border border-indigo-100/50 ">
                                <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-3 text-center">Risk Score Calculation</p>
                                <div className="flex justify-center items-center space-x-2 text-[10px] font-black text-indigo-600  italic tracking-tighter">
                                    <span>(0.6 × Financial)</span>
                                    <span className="text-gray-300  font-normal">+</span>
                                    <span>(0.3 × Behavioral)</span>
                                    <span className="text-gray-300  font-normal">+</span>
                                    <span>(0.1 × Recency)</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white  rounded-3xl shadow-xl border border-gray-100  p-8 transition-colors duration-300">
                        <h3 className="font-black text-gray-400 uppercase text-[9px] tracking-[0.2em] mb-8 flex items-center">
                            <TrendingDown size={14} className="mr-3 text-indigo-600 " /> Risk Score Trend
                        </h3>
                        <div className="h-48">
                            {profile?.risk_trend?.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={profile.risk_trend}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-gray-100 " />
                                        <XAxis dataKey="date" hide />
                                        <YAxis hide domain={[0, 100]} />
                                        <Tooltip
                                            contentStyle={{
                                                borderRadius: '16px',
                                                border: 'none',
                                                boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
                                                fontWeight: '900',
                                                fontSize: '10px'
                                            }}
                                            labelStyle={{ display: 'none' }}
                                        />
                                        <Line
                                            type="monotone"
                                            dataKey="score"
                                            stroke="#4f46e5"
                                            strokeWidth={5}
                                            dot={{ r: 5, fill: '#4f46e5', strokeWidth: 3, stroke: '#fff' }}
                                            activeDot={{ r: 8, stroke: '#4f46e5', strokeWidth: 4, fill: '#fff' }}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="h-full flex items-center justify-center bg-gray-50  rounded-2xl border-2 border-dashed border-gray-100 ">
                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">No Data Available</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-white  rounded-3xl shadow-xl border border-gray-100  p-10 transition-colors duration-300">
                        <h3 className="text-sm font-black text-gray-900  mb-8 flex items-center uppercase tracking-widest">
                            <FileText size={20} className="mr-4 text-indigo-600 " /> AI Analysis
                        </h3>
                        <div className="prose prose-indigo  max-w-none">
                            <p className="text-gray-700  leading-loose text-xl italic bg-indigo-50/50  p-10 rounded-3xl border-l-[6px] border-indigo-600  shadow-sm transition-all">
                                {profile?.explanation || "No detailed analysis is available yet."}
                            </p>
                        </div>

                        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-10">
                            {profile?.breakdown && Object.entries(profile.breakdown).map(([key, value]) => (
                                <div key={key} className="group">
                                    <div className="flex justify-between mb-3 items-end">
                                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] group-hover:text-indigo-600  transition-colors">{key.replace(/_/g, ' ')}</span>
                                        <span className="text-xs font-black text-gray-900 ">{value}%</span>
                                    </div>
                                    <div className="w-full bg-gray-100  rounded-full h-2">
                                        <div
                                            className="bg-indigo-600  h-2 rounded-full transition-all duration-1000 shadow-lg shadow-indigo-100 "
                                            style={{ width: `${value}%` }}
                                        ></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-white  rounded-3xl shadow-xl border border-gray-100  p-10 transition-colors duration-300">
                        <h3 className="text-sm font-black text-gray-900  mb-8 flex items-center uppercase tracking-widest">
                            <BrainCircuit size={20} className="mr-4 text-purple-600 " /> Similar Historical Cases
                        </h3>
                        {profile?.similar_cases?.length > 0 ? (
                            <div className="space-y-5">
                                {profile.similar_cases.map((sc, idx) => (
                                    <SimilarCaseCard key={idx} {...sc} />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-24 bg-gray-50  rounded-[40px] border-2 border-dashed border-gray-100 ">
                                <Activity className="text-gray-200  mx-auto mb-6" size={56} />
                                <p className="text-gray-400  font-black uppercase text-[10px] tracking-[0.2em]">No similar cases found.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}


