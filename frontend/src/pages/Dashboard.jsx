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
import { IndianRupee, AlertTriangle, Activity, TrendingUp, RefreshCcw, Database } from 'lucide-react';
import { useDashboard } from '../hooks/useApiHooks';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import useAppStore from '../store/useAppStore';
import KpiCard from '../components/KpiCard';
import { convertDigits, formatCurrency, formatNumber } from '../utils/formatters';

const COLORS = ['#22c55e', '#eab308', '#ef4444'];

const SkeletonCard = () => (
    <div className="bg-white  rounded-xl shadow-sm p-6 border border-gray-100  flex items-center animate-pulse transition-colors duration-300">
        <div className="p-3 rounded-lg bg-gray-100  w-12 h-12 mr-4"></div>
        <div className="space-y-2 flex-1">
            <div className="h-4 bg-gray-100  rounded w-1/2"></div>
            <div className="h-6 bg-gray-100  rounded w-3/4"></div>
        </div>
    </div>
);

export default function Dashboard() {
    const { data, loading, error, refetch } = useDashboard();
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
    const { auth } = useAppStore();

    // Removed local formatters to use central ones from utils/formatters.js


    if (error) {
        return (
            <div className="flex flex-col items-center justify-center p-12 bg-white  rounded-2xl border-2 border-dashed border-red-100  text-center transition-colors duration-300">
                <div className="p-4 bg-red-50  rounded-full mb-4">
                    <AlertTriangle className="text-red-500" size={48} />
                </div>
                <h3 className="text-xl font-bold text-gray-900  mb-2">{t('common.error')}</h3>
                <p className="text-gray-500  mb-6 max-w-sm font-medium">{t('dashboard.subtitle')}</p>
                <button
                    onClick={() => refetch()}
                    className="flex items-center px-6 py-3 bg-indigo-600 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 "
                >
                    <RefreshCcw size={18} className="mr-2" /> {t('dashboard.retryConnection')}
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                <div>
                    <h2 className="text-3xl font-black text-gray-900 tracking-tight uppercase italic">
                        {auth.role === 'Viewer' ? t('dashboard.portfolioIntelligence') : t('dashboard.title')}
                    </h2>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">
                        {auth.role === 'Viewer'
                            ? 'Overview of risk and portfolio metrics'
                            : t('dashboard.subtitle')}
                    </p>
                </div>
                <button
                    onClick={() => refetch()}
                    disabled={loading}
                    className="flex items-center px-6 py-3 bg-white  border border-gray-200  rounded-xl text-[10px] font-black uppercase tracking-widest text-gray-700  hover:bg-gray-50  transition-all disabled:opacity-50 shadow-sm"
                >
                    <RefreshCcw size={14} className={`mr-2 ${loading ? 'animate-spin' : ''}`} />
                    {loading ? t('common.loading') : t('common.retry')}
                </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {loading && !data ? (
                    <>
                        <SkeletonCard />
                        <SkeletonCard />
                        <SkeletonCard />
                        <SkeletonCard />
                    </>
                ) : (
                    <>
                        <KpiCard
                            icon={IndianRupee}
                            label={t('dashboard.kpi.activeExposure')}
                            value={formatCurrency(data?.total_exposure, i18n)}
                            colorClass="indigo"
                        />

                        <KpiCard
                            icon={Activity}
                            label={t('dashboard.kpi.avgScore')}
                            value={formatNumber(data?.avg_risk_score || 0, i18n)}
                            colorClass="yellow"
                        />

                        <KpiCard
                            icon={AlertTriangle}
                            label={t('dashboard.kpi.overdueCount')}
                            value={formatNumber(data?.overdue_count || 0, i18n)}
                            colorClass="red"
                        />

                        <KpiCard
                            icon={TrendingUp}
                            label={t('dashboard.kpi.riskEntities')}
                            value={formatNumber(data?.active_count || 0, i18n)}
                            colorClass="green"
                        />
                    </>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="bg-white  rounded-3xl shadow-sm p-8 border border-gray-100  flex flex-col border-t-4 border-t-indigo-600 transition-colors duration-300">
                    <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-8">{t('dashboard.riskDistribution')}</h3>
                    <div className="h-64 flex items-center justify-center relative">
                        {loading && !data ? (
                            <div className="w-24 h-24 rounded-full border-4 border-gray-100  border-t-indigo-600 animate-spin"></div>
                        ) : data?.risk_distribution?.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={data.risk_distribution}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={65}
                                        outerRadius={85}
                                        paddingAngle={4}
                                        dataKey="value"
                                        stroke="none"
                                    >
                                        {data.risk_distribution.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{
                                            borderRadius: '16px',
                                            border: 'none',
                                            backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                            backdropFilter: 'blur(8px)',
                                            boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
                                            fontWeight: '900',
                                            fontSize: '12px'
                                        }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">No data</p>
                        )}
                    </div>
                </div>

                <div className="bg-white  rounded-3xl shadow-sm p-8 border border-gray-100  lg:col-span-2 transition-colors duration-300">
                    <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-8">{t('dashboard.exposureDynamics')}</h3>
                    <div className="h-64 flex items-center justify-center">
                        {loading && !data ? (
                            <div className="w-full h-full bg-gray-50  rounded-2xl animate-pulse"></div>
                        ) : data?.exposure_trend?.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={data.exposure_trend}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-gray-100 " />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 900, fill: '#9ca3af' }} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 900, fill: '#9ca3af' }} tickFormatter={(val) => `@\u20B9${formatNumber(val / 100000, i18n)}L`} />
                                    <Tooltip
                                        cursor={{ fill: 'rgba(99, 102, 241, 0.05)' }}
                                        contentStyle={{
                                            borderRadius: '16px',
                                            border: 'none',
                                            boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
                                            fontWeight: '900',
                                            fontSize: '12px',
                                            padding: '12px'
                                        }}
                                        formatter={(value) => [formatCurrency(value, i18n), 'Exposure']}
                                    />
                                    <Bar dataKey="exposure" fill="#4f46e5" radius={[6, 6, 0, 0]} barSize={35} />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">No Trend Data</p>
                        )}
                    </div>
                </div>
            </div>

            <div className="bg-white  rounded-3xl shadow-lg border border-gray-100  overflow-hidden transition-colors duration-300">
                <div className="px-8 py-6 border-b border-gray-100  bg-gray-50/50  flex justify-between items-center transition-colors">
                    <h3 className="text-sm font-black text-gray-900  flex items-center uppercase tracking-widest">
                        <Database className="mr-3 text-indigo-600 " size={18} /> {t('dashboard.highRiskNodes')}
                    </h3>
                    {auth.role === 'Viewer' && (
                        <span className="text-[8px] font-black px-3 py-1 bg-gray-200 text-gray-500 rounded-full uppercase tracking-tighter">Read-Only</span>
                    )}
                </div>
                <div className="divide-y divide-gray-100 ">
                    {loading && !data ? (
                        [1, 2, 3].map((i) => (
                            <div key={i} className="px-8 py-6 animate-pulse flex justify-between items-center">
                                <div className="space-y-3 flex-1">
                                    <div className="h-5 bg-gray-100  rounded-lg w-1/3"></div>
                                    <div className="h-4 bg-gray-100  rounded-md w-1/4"></div>
                                </div>
                                <div className="h-10 bg-gray-100  rounded-2xl w-24"></div>
                            </div>
                        ))
                    ) : data?.high_risk_distributors?.length > 0 ? (
                        data.high_risk_distributors.map((dist) => (
                            <div
                                key={dist.id}
                                onClick={() => navigate(`/distributors/${dist.id}`)}
                                className="px-8 py-5 flex items-center justify-between hover:bg-indigo-50/50 transition-all cursor-pointer group"
                            >
                                <div className="space-y-1">
                                    <p className="font-black text-gray-900 group-hover:text-indigo-600 transition-colors uppercase tracking-tight text-base">{dist.name}</p>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">ID: {String(dist.id).slice(0, 8)}...</p>
                                </div>
                                <div className="flex items-center">
                                    <span className="text-[9px] font-black text-gray-400 mr-4 uppercase tracking-[0.2em]">Score</span>
                                    <span className={`px-5 py-2 rounded-2xl font-black text-sm border-2 transform group-hover:scale-105 transition-transform ${dist.risk_score > 80
                                        ? 'bg-red-50 text-red-700 border-red-100 shadow-red-100 font-black'
                                        : 'bg-yellow-50 text-yellow-700 border-yellow-100'
                                        }`}>
                                        {formatNumber(dist.risk_score, i18n)}
                                    </span>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="px-8 py-16 text-center">
                            <p className="text-gray-400 text-[10px] uppercase font-black tracking-widest">{t('distributors.noResults')}</p>
                        </div>
                    )}
                </div>
            </div>

            <div className="bg-white  rounded-3xl shadow-xl border border-gray-100  transition-colors duration-300">
                <div className="px-8 py-5 border-b border-gray-100  flex justify-between items-center bg-gray-50/30 ">
                    <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] flex items-center">
                        <AlertTriangle className="mr-3 text-red-500" size={14} /> {t('dashboard.recentAlerts')}
                    </h3>
                    {auth.role === 'Admin' && (
                        <button onClick={() => navigate('/alerts')} className="text-[9px] font-black text-indigo-600 uppercase tracking-widest hover:opacity-70">{t('dashboard.viewAll')}</button>
                    )}
                </div>
                <div className="p-8">
                    {loading && !data ? (
                        <div className="space-y-4">
                            <div className="h-14 bg-gray-50  rounded-2xl animate-pulse"></div>
                            <div className="h-14 bg-gray-50  rounded-2xl animate-pulse"></div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {data?.recent_alerts?.length > 0 ? (
                                data.recent_alerts.map(alert => (
                                    <div key={alert.id} className={`p-5 rounded-[24px] border flex items-center justify-between transition-all hover:scale-[1.01] ${alert.severity === 'high' ? 'bg-red-50/50 border-red-100' : 'bg-yellow-50/50 border-yellow-100'}`}>
                                        <div className="flex items-center space-x-5">
                                            <div className={`w-2 h-2 rounded-full ${alert.severity === 'high' ? 'bg-red-500' : 'bg-yellow-500'} animate-pulse`}></div>
                                            <div>
                                                <span className={`px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest ${alert.severity === 'high' ? 'bg-red-100 text-red-600' : 'bg-yellow-100 text-yellow-600'}`}>
                                                    {alert.type}
                                                </span>
                                                <p className="mt-2 text-xs font-black text-gray-700 tracking-tight uppercase leading-snug">
                                                    <span className="text-indigo-600">[{convertDigits(alert.distributor_name, i18n)}]</span> {convertDigits(alert.message, i18n)}
                                                </p>
                                            </div>
                                        </div>
                                        <span className="text-[8px] font-black text-gray-400 uppercase italic">Just Now</span>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-10 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-100">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest italic">{t('dashboard.noAlerts')}</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}


