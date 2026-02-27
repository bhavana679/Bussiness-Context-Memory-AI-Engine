import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import {
    BrainCircuit,
    CheckCircle,
    XCircle,
    AlertTriangle,
    Zap,
    History,
    RefreshCcw,
    ShieldAlert
} from 'lucide-react';
import { useCreditEvaluation, useDistributors, useCreditHistory } from '../hooks/useApiHooks';
import useAppStore from '../store/useAppStore';

export default function CreditEvaluation() {
    const [requestedAmount, setRequestedAmount] = useState('');
    const location = useLocation();
    const [selectedDistributorId, setSelectedDistributorId] = useState(location.state?.distributorId || '');
    const { auth } = useAppStore();

    const { data: distributors, loading: loadingDistributors, error: distributorsError, refetch: refetchDistributors } = useDistributors({ limit: 50 });
    const { data: result, loading: isEvaluating, error, evaluate } = useCreditEvaluation();
    const { data: history, loading: loadingHistory, refetch: refetchHistory } = useCreditHistory();

    const handleEvaluate = async (e) => {
        e.preventDefault();
        if (!requestedAmount || !selectedDistributorId) return;

        try {
            await evaluate({
                distributor_id: parseInt(selectedDistributorId),
                requested_amount: parseFloat(requestedAmount)
            });
            refetchHistory();
        } catch (e) {
            console.error(e);
        }
    };

    const getDecisionIcon = (decision) => {
        switch (decision?.toUpperCase()) {
            case 'APPROVED': return <CheckCircle className="text-green-600 mb-2" size={48} />;
            case 'DECLINED': return <XCircle className="text-red-600 mb-2" size={48} />;
            default: return <AlertTriangle className="text-yellow-600 mb-2" size={48} />;
        }
    };

    return (
        <div className="max-w-7xl mx-auto space-y-10 pb-20">
            <div className="mb-10">
                <h2 className="text-4xl font-black text-gray-900  tracking-tighter uppercase italic">Credit <span className="text-indigo-600 ">Evaluation</span></h2>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mt-2">Evaluate distributor risk</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                <div className="lg:col-span-5 space-y-8">
                    <div className="bg-white  rounded-3xl shadow-xl border border-gray-100  p-10 transition-colors duration-300">
                        <h3 className="text-[10px] font-black text-gray-400  uppercase tracking-[0.3em] mb-10 flex items-center">
                            <Zap size={16} className="mr-3 text-indigo-500" /> Distributor Details
                        </h3>

                        <form onSubmit={handleEvaluate} className="space-y-6">
                            <div className="space-y-8">
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400  uppercase tracking-[0.2em] mb-3 ml-1">Select Distributor</label>
                                    <div className="relative">
                                        <select
                                            value={selectedDistributorId}
                                            onChange={(e) => setSelectedDistributorId(e.target.value)}
                                            disabled={loadingDistributors || isEvaluating}
                                            className="w-full border border-gray-200 rounded-2xl p-4 bg-gray-50 text-gray-900 font-black text-xs uppercase tracking-widest focus:ring-2 focus:ring-indigo-500 focus:outline-none disabled:opacity-30 transition-all cursor-pointer pr-10"
                                            required
                                        >
                                            <option value="" disabled className="bg-white ">Select a distributor...</option>
                                            {distributors?.map(d => (
                                                <option key={d.id} value={d.id} className="bg-white ">{d.name} — {d.city}</option>
                                            ))}
                                        </select>
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                                            <RefreshCcw size={14} className={loadingDistributors ? 'animate-spin' : ''} />
                                        </div>
                                    </div>
                                    {distributorsError && (
                                        <button
                                            type="button"
                                            onClick={() => refetchDistributors()}
                                            className="mt-2 text-[8px] font-black text-red-500 uppercase tracking-widest hover:underline"
                                        >
                                            Failed to load distributors. Click to try again.
                                        </button>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-[10px] font-black text-gray-400  uppercase tracking-[0.2em] mb-3 ml-1">Requested Amount (INR)</label>
                                    <div className="relative group">
                                        <span className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300  font-black text-xl">₹</span>
                                        <input
                                            type="number"
                                            value={requestedAmount}
                                            onChange={(e) => setRequestedAmount(e.target.value)}
                                            disabled={isEvaluating}
                                            placeholder="0.00"
                                            className="w-full border border-gray-200  rounded-2xl py-5 pl-10 pr-6 text-2xl font-black bg-white  text-gray-900  focus:ring-2 focus:ring-indigo-500 focus:outline-none disabled:opacity-30 transition-all placeholder:text-gray-100  tracking-tighter italic"
                                            required
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={isEvaluating || !selectedDistributorId}
                                    className={`w-full py-6 rounded-2xl text-white font-black text-sm uppercase tracking-[0.3em] flex justify-center items-center transition-all shadow-2xl relative overflow-hidden group/btn ${isEvaluating
                                        ? 'bg-indigo-300  cursor-wait'
                                        : 'bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98]'
                                        }`}
                                >
                                    {isEvaluating ? (
                                        <span className="flex items-center">
                                            <RefreshCcw className="animate-spin mr-4" size={20} /> EVALUATING...
                                        </span>
                                    ) : (
                                        <>
                                            Evaluate Risk
                                            <Zap size={18} className="ml-3 group-hover/btn:translate-x-1 transition-transform" />
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>

                    {error && (
                        <div className="bg-red-50 border-2 border-red-100 rounded-2xl p-6 flex items-start text-red-700">
                            <ShieldAlert className="mr-3 flex-shrink-0" size={24} />
                            <div>
                                <h4 className="font-black text-sm uppercase tracking-tighter">Evaluation Error</h4>
                                <p className="text-sm font-medium mt-1">The request could not be processed: {error.message}</p>
                            </div>
                        </div>
                    )}
                </div>

                <div className="lg:col-span-7">
                    {!result && !isEvaluating && (
                        <div className="h-full min-h-[500px] flex flex-col items-center justify-center p-16 border-2 border-dashed border-gray-100  rounded-[40px] bg-gray-50/50  text-center transition-colors">
                            <div className="p-8 bg-white  rounded-full shadow-2xl mb-8 group hover:scale-110 transition-transform">
                                <BrainCircuit size={64} className="text-gray-100  group-hover:text-indigo-500 transition-colors" />
                            </div>
                            <h3 className="text-sm font-black text-gray-300  uppercase tracking-[0.4em]">Ready for Evaluation</h3>
                            <p className="text-gray-400  text-[10px] font-bold uppercase tracking-widest mt-4 max-w-xs leading-relaxed">Select a distributor and enter an amount to begin.</p>
                        </div>
                    )}

                    {isEvaluating && (
                        <div className="space-y-10 animate-pulse">
                            <div className="bg-gray-100  rounded-[40px] h-80"></div>
                            <div className="bg-gray-100  rounded-[32px] h-48"></div>
                            <div className="bg-gray-100  rounded-[32px] h-56"></div>
                        </div>
                    )}

                    {result && !isEvaluating && (
                        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-1000">
                            <div className={`rounded-[40px] border-[3px] p-12 flex flex-col items-center text-center shadow-2xl transition-all ${result.decision?.toUpperCase() === 'APPROVED' ? 'bg-green-50/50 border-green-200' :
                                result.decision?.toUpperCase() === 'DECLINED' ? 'bg-red-50/50 border-red-200' :
                                    'bg-yellow-50/50 border-yellow-200'
                                }`}>
                                <div className="mb-6 transform hover:scale-110 transition-transform duration-500">
                                    {getDecisionIcon(result.decision)}
                                </div>
                                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400 mb-2">Decision</p>
                                <h3 className={`text-6xl font-black mb-1 transition-colors tracking-tighter ${result.decision?.toUpperCase() === 'APPROVED' ? 'text-green-600' :
                                    result.decision?.toUpperCase() === 'DECLINED' ? 'text-red-600' :
                                        'text-yellow-600'
                                    }`}>{result.decision}</h3>
                                <div className="mt-2 flex items-center space-x-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-pulse"></div>
                                    <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">
                                        Approved by: <span className="text-gray-900 underline decoration-indigo-300 decoration-2">{auth.role === 'Admin' ? 'System Administrator' : 'Risk Officer'}</span>
                                    </span>
                                </div>

                                <div className="mt-10 flex flex-col md:flex-row items-center gap-6 md:gap-10 bg-white/60 px-8 py-6 md:py-5 rounded-3xl backdrop-blur-xl border border-white/50 shadow-inner w-full md:w-auto">
                                    <div className="text-center">
                                        <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-1">Risk Score</p>
                                        <p className="text-3xl font-black text-gray-900 italic tracking-tighter">{result.final_risk}<span className="text-sm opacity-30 ml-0.5">/100</span></p>
                                    </div>
                                    <div className="hidden md:block w-px h-12 bg-gray-200"></div>
                                    <div className="text-center">
                                        <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-1">Confidence Level</p>
                                        <p className="text-3xl font-black text-gray-900 italic tracking-tighter">{result.confidence_score}<span className="text-sm opacity-30 ml-0.5">%</span></p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white  rounded-[32px] shadow-xl border border-gray-100  p-10 space-y-8 transition-colors duration-300">
                                <h4 className="text-[9px] font-black text-gray-400  uppercase tracking-[0.3em] flex items-center">
                                    <Zap size={14} className="mr-3 text-indigo-600 " /> Risk Factors
                                </h4>
                                <div className="space-y-5">
                                    {result.influential_factors?.map((factor, idx) => (
                                        <div key={idx} className="flex items-center p-5 bg-gray-50  rounded-3xl border border-transparent hover:border-gray-100  transition-all hover:scale-[1.01] group">
                                            <div className={`w-3 h-3 rounded-full mr-6 shadow-sm ${factor.impact === 'negative' ? 'bg-red-500 shadow-red-100' : 'bg-green-500 shadow-green-100'}`}></div>
                                            <p className="flex-1 text-sm font-black text-gray-700  tracking-tight">{factor.description}</p>
                                            <div className="bg-white  px-4 py-1 rounded-full border border-gray-100  shadow-sm">
                                                <span className="text-[9px] font-black text-indigo-600  uppercase tracking-widest">{factor.weight}% Influence</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {result.similar_cases?.length > 0 && (
                                <div className="bg-white  rounded-[32px] shadow-xl border border-gray-100  p-10 transition-colors duration-300">
                                    <h4 className="text-[9px] font-black text-gray-400  uppercase tracking-[0.3em] mb-10 flex items-center">
                                        <History size={16} className="mr-3 text-purple-600 " /> Similar Historical Cases
                                    </h4>
                                    <div className="space-y-6">
                                        {result.similar_cases.map((sc, idx) => (
                                            <div key={idx} className="p-6 rounded-3xl border border-gray-50  flex gap-6 hover:border-purple-200  hover:bg-purple-50/30  transition-all group">
                                                <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-white  border border-gray-100  flex flex-col items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                                                    <span className="text-lg font-black text-gray-900  leading-none">{(sc.similarity * 100).toFixed(0)}</span>
                                                    <span className="text-[8px] font-black text-gray-400  uppercase mt-1">%</span>
                                                </div>
                                                <div className="pt-1 flex-1">
                                                    <div className="flex justify-between items-start mb-2">
                                                        <p className="text-sm font-black text-gray-800  leading-tight tracking-tight">"{sc.event}"</p>
                                                        <span className="text-[8px] font-black text-gray-400 uppercase bg-gray-50  px-2 py-1 rounded tracking-widest">{sc.date}</span>
                                                    </div>
                                                    <div className="flex items-center space-x-3">
                                                        <div className="inline-flex items-center px-4 py-1.5 bg-gray-50  rounded-xl border border-gray-100 ">
                                                            <span className="text-[9px] font-black text-indigo-600  uppercase tracking-[0.2em] italic">Outcome: {sc.outcome}</span>
                                                        </div>
                                                        <div className={`px-3 py-1.5 rounded-xl text-[8px] font-black uppercase tracking-widest ${sc.severity > 0.7 ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'}`}>
                                                            Severity: {sc.severity}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="flex flex-col sm:flex-row gap-6 mt-12 pt-10 border-t border-gray-100">
                                <button
                                    onClick={() => alert('Decision confirmed and saved.')}
                                    className="flex-1 py-5 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl hover:bg-indigo-700 transition-all flex items-center justify-center"
                                >
                                    <CheckCircle size={18} className="mr-3" /> Confirm Decision
                                </button>
                                <button
                                    onClick={() => alert('This requires manual override. Please provide justification.')}
                                    className="flex-1 py-5 bg-white border-2 border-gray-100 text-gray-400 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-gray-50 transition-all flex items-center justify-center"
                                >
                                    <XCircle size={18} className="mr-3" /> Override Decision
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="pt-20 border-t border-gray-100">
                <div className="flex justify-between items-end mb-10">
                    <div>
                        <h3 className="text-2xl font-black text-gray-900 tracking-tighter uppercase italic flex items-center">
                            <History className="mr-3 text-indigo-600" size={24} /> Decision <span className="text-indigo-600 ml-1.5">History</span>
                        </h3>
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-2 ml-9">Log of recent evaluation decisions</p>
                    </div>
                    <button
                        onClick={() => refetchHistory()}
                        className="p-3 bg-gray-50 hover:bg-white border border-gray-100 rounded-xl text-indigo-600 transition-all hover:shadow-lg"
                    >
                        <RefreshCcw size={16} className={loadingHistory ? 'animate-spin' : ''} />
                    </button>
                </div>

                <div className="bg-white rounded-[40px] border border-gray-100 shadow-2xl overflow-hidden transition-colors duration-300">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50/50">
                                    <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Distributor</th>
                                    <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Amount</th>
                                    <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Decision</th>
                                    <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Risk Score</th>
                                    <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Confidence</th>
                                    <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Date</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {loadingHistory && history.length === 0 ? (
                                    [1, 2, 3].map(i => (
                                        <tr key={i} className="animate-pulse">
                                            <td colSpan="6" className="px-10 py-8 bg-gray-50/30">
                                                <div className="h-4 bg-gray-200 rounded-full w-3/4 mx-auto"></div>
                                            </td>
                                        </tr>
                                    ))
                                ) : history.length > 0 ? (
                                    history.map((item) => (
                                        <tr key={item.id} className="hover:bg-indigo-50/30 transition-colors group">
                                            <td className="px-10 py-6 font-black text-gray-900 uppercase tracking-tight text-sm">
                                                {item.distributor_name}
                                                <div className="text-[8px] text-gray-400 -mt-1 font-bold">ID: {item.id}</div>
                                            </td>
                                            <td className="px-8 py-6 text-center">
                                                <span className="text-xs font-black text-gray-700 italic tracking-tighter">
                                                    ₹{new Intl.NumberFormat('en-IN').format(item.requested_amount)}
                                                </span>
                                            </td>
                                            <td className="px-8 py-6 text-center">
                                                <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${item.decision === 'APPROVED' ? 'bg-green-50 text-green-700 border-green-100' :
                                                    item.decision === 'DECLINED' ? 'bg-red-50 text-red-700 border-red-100' :
                                                        'bg-yellow-50 text-yellow-700 border-yellow-100'
                                                    }`}>
                                                    {item.decision}
                                                </span>
                                            </td>
                                            <td className="px-8 py-6 text-center font-black text-gray-900">{item.risk_score}</td>
                                            <td className="px-8 py-6 text-center font-black text-indigo-600">{item.confidence}%</td>
                                            <td className="px-10 py-6 text-right text-[10px] font-black text-gray-400 uppercase italic tracking-widest">
                                                {new Date(item.created_at).toLocaleDateString('en-IN', {
                                                    day: '2-digit',
                                                    month: 'short',
                                                    year: 'numeric'
                                                })}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="6" className="px-10 py-20 text-center">
                                            <div className="flex flex-col items-center">
                                                <ShieldAlert className="text-gray-200 mb-4" size={48} />
                                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">No previous decisions found.</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}


