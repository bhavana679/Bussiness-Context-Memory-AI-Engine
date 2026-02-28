import React, { useState, useMemo } from 'react';
import { Search, Filter, ChevronRight, ChevronLeft, AlertCircle, RefreshCcw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useDistributors } from '../hooks/useApiHooks';
import { useTranslation } from 'react-i18next';
import { formatCurrency, formatNumber, convertDigits } from '../utils/formatters';

const SkeletonRow = () => (
    <tr className="animate-pulse ">
        <td className="px-6 py-4 whitespace-nowrap"><div className="h-4 bg-gray-100  rounded w-32 mb-1"></div><div className="h-3 bg-gray-50  rounded w-16"></div></td>
        <td className="px-6 py-4 whitespace-nowrap"><div className="h-4 bg-gray-100  rounded w-24"></div></td>
        <td className="px-6 py-4 whitespace-nowrap"><div className="h-4 bg-gray-100  rounded w-20"></div></td>
        <td className="px-6 py-4 whitespace-nowrap"><div className="h-4 bg-gray-100  rounded w-24"></div></td>
        <td className="px-6 py-4 whitespace-nowrap"><div className="h-6 bg-gray-100  rounded-full w-24"></div></td>
        <td className="px-6 py-4 whitespace-nowrap text-right"><div className="h-5 bg-gray-100  rounded w-5 ml-auto"></div></td>
    </tr>
);

export default function Distributors() {
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [page, setPage] = useState(1);
    const [riskFilter, setRiskFilter] = useState('');
    const [industryFilter, setIndustryFilter] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const pageSize = 8;

    const distributorsParams = useMemo(() => ({
        search: searchQuery,
        risk_filter: riskFilter,
        industry: industryFilter,
        page,
        limit: pageSize
    }), [searchQuery, riskFilter, industryFilter, page, pageSize]);

    const { data, loading, error, refetch } = useDistributors(distributorsParams);

    // Removed local formatters to use central ones from utils/formatters.js



    if (error) {
        return (
            <div className="bg-white  rounded-2xl border-2 border-dashed border-red-100  p-12 text-center transition-colors">
                <div className="bg-red-50  w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <AlertCircle className="text-red-500" size={32} />
                </div>
                <h3 className="text-xl font-black text-gray-900  mb-2 uppercase tracking-tighter">{t('common.error')}</h3>
                <p className="text-gray-500  mb-6 max-w-sm mx-auto font-medium">{t('distributors.subtitle')}</p>
                <button
                    onClick={() => refetch()}
                    className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 "
                >
                    <RefreshCcw size={18} className="mr-2" /> {t('common.retry')}
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-8 max-w-7xl mx-auto pb-20">
            <div className="flex flex-col xl:flex-row justify-between xl:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-black text-gray-900  tracking-tight uppercase italic">{t('distributors.title')} <span className="text-indigo-600 ">{t('distributors.directory')}</span></h2>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">{t('distributors.subtitle')}</p>
                </div>
                <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 transition-colors" size={16} />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
                            placeholder={t('distributors.searchPlaceholder')}
                            className="pl-12 pr-6 py-3 border border-gray-200  rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full sm:w-80 bg-white  text-gray-700  font-bold text-xs shadow-sm transition-all"
                        />
                    </div>
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className={`flex items-center justify-center px-6 py-3 border rounded-2xl transition-all shadow-sm font-black text-[10px] uppercase tracking-widest ${showFilters ? 'bg-indigo-600 text-white border-indigo-600 scale-[0.98]' : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'}`}
                    >
                        <Filter size={16} className={`mr-2 ${showFilters ? 'text-white' : 'text-indigo-500'}`} /> {showFilters ? t('distributors.activeFilters') : t('distributors.advancedFilter')}
                    </button>
                </div>
            </div>
            {showFilters && (
                <div className="bg-white  border border-gray-100  p-6 rounded-3xl mb-6 shadow-xl animate-in slide-in-from-top-4 duration-500 overflow-hidden">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div className="space-y-3">
                            <label className="block text-[9px] font-black text-gray-400  uppercase tracking-widest ml-1">{t('distributors.riskLevelFilter')}</label>
                            <select
                                value={riskFilter}
                                onChange={(e) => { setRiskFilter(e.target.value); setPage(1); }}
                                className="w-full bg-gray-50  border-none rounded-2xl py-3 px-4 text-xs font-bold text-gray-700  focus:ring-2 focus:ring-indigo-500"
                            >
                                <option value="">{t('distributors.allRiskLevels')}</option>
                                <option value="low">{t('distributors.lowRiskOnly')}</option>
                                <option value="medium">{t('distributors.mediumRiskOnly')}</option>
                                <option value="high">{t('distributors.highRiskOnly')}</option>
                            </select>
                        </div>
                        <div className="space-y-3">
                            <label className="block text-[9px] font-black text-gray-400  uppercase tracking-widest ml-1">{t('distributors.industry')}</label>
                            <select
                                value={industryFilter}
                                onChange={(e) => { setIndustryFilter(e.target.value); setPage(1); }}
                                className="w-full bg-gray-50  border-none rounded-2xl py-3 px-4 text-xs font-bold text-gray-700  focus:ring-2 focus:ring-indigo-500"
                            >
                                <option value="">{t('distributors.allIndustries')}</option>
                                <option value="Hardware">Hardware</option>
                                <option value="Electronics">Electronics</option>
                                <option value="Retail">Retail</option>
                                <option value="Logistics">Logistics</option>
                                <option value="Manufacturing">Manufacturing</option>
                                <option value="Agriculture">Agriculture</option>
                            </select>
                        </div>
                        <div className="flex items-end">
                            <button
                                onClick={() => { setRiskFilter(''); setIndustryFilter(''); setSearchQuery(''); }}
                                className="w-full py-3 bg-gray-100  text-gray-500  rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-200  transition-colors"
                            >
                                {t('distributors.resetFilters')}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="bg-white  rounded-3xl shadow-xl border border-gray-100  overflow-hidden transition-colors duration-300">
                <div className="overflow-x-auto scrolling-touch">
                    <table className="min-w-full divide-y divide-gray-100 ">
                        <thead className="bg-gray-50/50 ">
                            <tr>
                                <th className="px-8 py-5 text-left text-[10px] font-black text-gray-400  uppercase tracking-[0.2em]">{t('distributors.table.distributor')}</th>
                                <th className="px-8 py-5 text-left text-[10px] font-black text-gray-400  uppercase tracking-[0.2em]">{t('distributors.table.industryLocation')}</th>
                                <th className="px-8 py-5 text-left text-[10px] font-black text-gray-400  uppercase tracking-[0.2em]">{t('distributors.table.creditLimit')}</th>
                                <th className="px-8 py-5 text-left text-[10px] font-black text-gray-400  uppercase tracking-[0.2em]">{t('distributors.table.utilization')}</th>
                                <th className="px-8 py-5 text-left text-[10px] font-black text-gray-400  uppercase tracking-[0.2em]">{t('distributors.table.riskLevel')}</th>
                                <th className="relative px-8 py-5"></th>
                            </tr>
                        </thead>
                        <tbody className="bg-white  divide-y divide-gray-100  transition-colors">
                            {loading ? (
                                Array(pageSize).fill(0).map((_, i) => <SkeletonRow key={i} />)
                            ) : data?.length > 0 ? (
                                data.map((dist) => (
                                    <tr
                                        key={dist.id}
                                        className="hover:bg-indigo-50/30  cursor-pointer transition-all group"
                                        onClick={() => navigate(`/distributors/${dist.id}`)}
                                    >
                                        <td className="px-8 py-6 whitespace-nowrap">
                                            <div className="font-black text-gray-900  group-hover:text-indigo-600  transition-colors text-base tracking-tight">{convertDigits(dist.name, i18n)}</div>
                                            <div className="text-[10px] font-bold text-gray-400  uppercase tracking-widest mt-1">{t('distributors.table.ref')}: {formatNumber(String(dist.id).padStart(4, '0'), i18n)}</div>
                                        </td>
                                        <td className="px-8 py-6 whitespace-nowrap">
                                            <div className="text-xs font-black text-gray-700  uppercase tracking-tight">{dist.industry}</div>
                                            <div className="text-[10px] font-bold text-gray-400 mt-1 uppercase">{dist.city}</div>
                                        </td>
                                        <td className="px-8 py-6 whitespace-nowrap text-sm font-black text-gray-900  italic tracking-tighter">
                                            {formatCurrency(dist.credit_limit, i18n)}
                                        </td>
                                        <td className="px-8 py-6 whitespace-nowrap">
                                            <div className="flex items-center space-x-3">
                                                <div className="w-20 h-2 bg-gray-100  rounded-full overflow-hidden border border-gray-100 ">
                                                    <div
                                                        className={`h-full transition-all duration-500 ${dist.utilization_pct > 80 ? 'bg-red-500 shadow-lg shadow-red-200' : 'bg-indigo-600  shadow-lg shadow-indigo-200'}`}
                                                        style={{ width: `${dist.utilization_pct}%` }}
                                                    />
                                                </div>
                                                <span className="text-[11px] font-black text-gray-900 ">{formatNumber(dist.utilization_pct, i18n, 1)}%</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 whitespace-nowrap">
                                            <div className="flex flex-col items-center">
                                                <span className={`px-4 py-2 text-[10px] font-black rounded-2xl border-2 transition-transform group-hover:scale-105 uppercase tracking-widest block text-center min-w-[100px] ${dist.risk_score >= 80
                                                    ? 'bg-red-50 text-red-700 border-red-100'
                                                    : dist.risk_score >= 40
                                                        ? 'bg-yellow-50 text-yellow-700 border-yellow-100'
                                                        : 'bg-green-50 text-green-700 border-green-100'
                                                    }`}>
                                                    {dist.risk_score >= 80 ? t('common.highRisk') : dist.risk_score >= 40 ? t('common.mediumRisk') : t('common.lowRisk')}
                                                </span>
                                                <span className="text-[8px] font-black text-gray-400 mt-2 uppercase opacity-40">{t('common.index')}: {formatNumber(dist.risk_score, i18n)}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 whitespace-nowrap text-right">
                                            <ChevronRight size={20} className="text-gray-200  group-hover:text-indigo-600  transition-all transform group-hover:translate-x-2" />
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="px-8 py-24 text-center">
                                        <div className="flex flex-col items-center">
                                            <div className="p-6 bg-gray-50  rounded-full mb-6">
                                                <Search className="text-gray-300 " size={40} />
                                            </div>
                                            <p className="text-gray-500  font-black uppercase tracking-widest text-xs">{t('distributors.noResults')} "{convertDigits(searchQuery, i18n)}"</p>
                                            <button onClick={() => setSearchQuery('')} className="mt-4 text-indigo-600  text-[10px] font-black uppercase tracking-[0.2em] hover:opacity-80 transition-opacity">{t('distributors.resetFilters')}</button>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {!loading && data?.length === pageSize && (
                    <div className="px-8 py-5 bg-gray-50  border-t border-gray-100  flex items-center justify-between transition-colors">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                            {t('common.page')} <span className="text-gray-900 ">{formatNumber(page, i18n)}</span>
                        </p>
                        <div className="flex space-x-3">
                            <button
                                disabled={page === 1}
                                onClick={() => setPage(p => p - 1)}
                                className="p-3 bg-white  border border-gray-200  rounded-xl hover:bg-gray-100  disabled:opacity-30 transition-all shadow-sm"
                            >
                                <ChevronLeft size={16} className="text-gray-700 " />
                            </button>
                            <button
                                onClick={() => setPage(p => p + 1)}
                                className="p-3 bg-white  border border-gray-200  rounded-xl hover:bg-gray-100  disabled:opacity-30 transition-all shadow-sm"
                            >
                                <ChevronRight size={16} className="text-gray-700 " />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}


