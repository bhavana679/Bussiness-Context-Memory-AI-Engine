import React from 'react';
import {
    AlertCircle,
    AlertTriangle,
    Info,
    Clock,
    RefreshCcw,
    Zap,
    Skull
} from 'lucide-react';
import { useAlerts } from '../hooks/useApiHooks';

/**
 * Skeleton loader for initial state
 */
const SkeletonAlert = () => (
    <div className="flex p-8 rounded-3xl border items-start bg-gray-50/50  border-gray-100  animate-pulse">
        <div className="mr-6 bg-white  p-4 rounded-2xl w-14 h-14 shadow-sm border border-gray-100 "></div>
        <div className="flex-1 space-y-5">
            <div className="flex justify-between items-start">
                <div className="h-6 bg-gray-200  rounded-xl w-3/4"></div>
                <div className="h-5 bg-gray-200  rounded-lg w-28"></div>
            </div>
            <div className="flex space-x-4">
                <div className="h-8 bg-gray-200  rounded-full w-28"></div>
                <div className="h-8 bg-gray-200  rounded-full w-36"></div>
            </div>
        </div>
    </div>
);

export default function Alerts() {
    const { data: alerts, loading, error, refetch } = useAlerts();

    const getAlertIcon = (severity) => {
        switch (severity?.toLowerCase()) {
            case 'high':
            case 'emergency':
                return <Skull className="text-red-500" size={24} />;
            case 'medium':
            case 'critical':
                return <AlertTriangle className="text-yellow-500" size={24} />;
            default:
                return <Zap className="text-indigo-500" size={24} />;
        }
    };

    const getAlertStyles = (severity) => {
        switch (severity?.toLowerCase()) {
            case 'high':
            case 'emergency':
                return ' border-red-100  bg-red-50 shadow-sm';
            case 'medium':
            case 'critical':
                return ' border-yellow-100  bg-yellow-50 shadow-sm';
            default:
                return ' border-indigo-100  bg-indigo-50 shadow-sm';
        }
    };



    return (
        <div className="space-y-10 max-w-5xl mx-auto pb-20">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h2 className="text-4xl font-black text-gray-900  tracking-tighter uppercase italic flex items-center">
                        Risk <span className="text-red-600  mx-2">Alerts</span> <span className="px-3 py-1 bg-red-100  text-red-600  text-[9px] uppercase font-black rounded-full animate-pulse border border-red-200  ml-4 tracking-[0.2em]">Live</span>
                    </h2>
                    <p className="text-gray-400 font-black mt-2 uppercase text-[10px] tracking-[0.3em]">Live System Alerts</p>
                </div>
                <div className="flex space-x-4">
                    <button
                        onClick={() => refetch()}
                        disabled={loading}
                        className="p-4 bg-white  border border-gray-100  rounded-2xl text-gray-500  hover:text-indigo-600  transition-all shadow-xl shadow-gray-100  disabled:opacity-30"
                        title="Refresh Alerts"
                    >
                        <RefreshCcw size={22} className={loading ? 'animate-spin' : ''} />
                    </button>
                    <button
                        className="px-8 py-4 bg-gray-900  text-white  rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:opacity-80 transition-all shadow-2xl shadow-indigo-100 "
                    >
                        Clear Cache
                    </button>
                </div>
            </div>

            {error && (
                <div className="bg-red-50  border-2 border-red-100  rounded-3xl p-8 text-red-700  flex items-center animate-in slide-in-from-top-4 duration-500">
                    <AlertCircle className="mr-5 flex-shrink-0" size={32} />
                    <div>
                        <p className="font-black uppercase text-[10px] tracking-widest">Connection Error</p>
                        <p className="text-sm font-medium mt-1">Backend system is currently unreachable.</p>
                    </div>
                </div>
            )}

            <div className="space-y-5">
                {loading && (!alerts || alerts.length === 0) ? (
                    <>
                        <SkeletonAlert />
                        <SkeletonAlert />
                        <SkeletonAlert />
                    </>
                ) : alerts?.length > 0 ? (
                    alerts.map((alert, idx) => (
                        <div
                            key={alert.id || idx}
                            className={`flex p-6 rounded-2xl border-2 items-start transition-all transform hover:scale-[1.01] ${getAlertStyles(alert.severity)}`}
                        >
                            <div className="mr-6 bg-white  p-4 rounded-2xl shadow-xl border border-inherit  transform group-hover:rotate-6 transition-transform">
                                {getAlertIcon(alert.severity)}
                            </div>
                            <div className="flex-1">
                                <div className="flex justify-between items-start mb-3">
                                    <h3 className="font-black text-gray-900  text-xl leading-tight tracking-tighter group-hover:text-indigo-600  transition-colors">
                                        {alert.message}
                                    </h3>
                                    <span className="flex items-center text-[9px] font-black text-gray-400  uppercase tracking-widest bg-white/60  px-3 py-2 rounded-xl border border-gray-100  backdrop-blur-sm ml-4">
                                        <Clock size={12} className="mr-2" /> {alert.date || 'ActiveNow'}
                                    </span>
                                </div>
                                <div className="flex flex-wrap gap-3 mt-6">
                                    <span className="text-[9px] font-black px-4 py-1.5 bg-white/80  border border-gray-100  rounded-full text-indigo-600  uppercase tracking-[0.2em] shadow-sm">
                                        Type: {alert.type || 'System'}
                                    </span>
                                    <span className={`text-[9px] font-black px-4 py-1.5 border rounded-full uppercase tracking-[0.2em] shadow-lg ${alert.severity?.toLowerCase() === 'high' ? 'bg-red-600 text-white border-red-600 shadow-red-200' :
                                        alert.severity?.toLowerCase() === 'medium' ? 'bg-yellow-500 text-white border-yellow-500 shadow-yellow-200' :
                                            'bg-indigo-600 text-white border-indigo-600 shadow-indigo-200'
                                        }`}>
                                        {alert.severity || 'Standard'} Priority
                                    </span>
                                    {alert.distributor_name && (
                                        <span className="text-[9px] font-black px-4 py-1.5 bg-gray-900  text-white  rounded-full uppercase tracking-[0.2em] shadow-sm">
                                            Distributor: {alert.distributor_name}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-32 bg-white  rounded-[40px] border-2 border-dashed border-gray-100  transition-colors">
                        <div className="p-8 bg-gray-50  rounded-full inline-block mb-8 group hover:scale-110 transition-transform">
                            <Info className="h-16 w-16 text-gray-200  group-hover:text-indigo-500 transition-colors" />
                        </div>
                        <h3 className="text-sm font-black text-gray-900  uppercase tracking-[0.4em]">All Clear</h3>
                        <p className="text-gray-400  font-bold text-[10px] mt-4 uppercase tracking-widest">No active risk alerts at this time.</p>
                    </div>
                )}
            </div>
        </div>
    );
}


