import React, { useState } from 'react';
import { BrainCircuit, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { mockProfileData } from '../mockData';

export default function CreditEvaluation() {
    const [requestedAmount, setRequestedAmount] = useState('');
    const [isEvaluating, setIsEvaluating] = useState(false);
    const [result, setResult] = useState(null);

    const handleEvaluate = (e) => {
        e.preventDefault();
        if (!requestedAmount) return;

        setIsEvaluating(true);
        setResult(null);

        // Simulate API delay
        setTimeout(() => {
            // Mock deterministic result
            setResult({
                decision: 'PARTIAL',
                confidence: 82,
                approved_amount: Math.min(Number(requestedAmount), 500000), // Cap at 5L for safety demo
                explanation: "Business metrics are stable, but hazard is compounded by high-risk patterns in 3 historically similar cases involving rapid credit expansion in this region.",
                cases: mockProfileData.similar_cases.slice(0, 2)
            });
            setIsEvaluating(false);
        }, 1500);
    };

    const getDecisionStyles = (decision) => {
        if (decision === 'APPROVE') return 'bg-green-50 text-green-800 border-green-200';
        if (decision === 'PARTIAL') return 'bg-yellow-50 text-yellow-800 border-yellow-200';
        return 'bg-red-50 text-red-800 border-red-200';
    };

    const getDecisionIcon = (decision) => {
        if (decision === 'APPROVE') return <CheckCircle className="text-green-600 mb-2" size={48} />;
        if (decision === 'PARTIAL') return <AlertTriangle className="text-yellow-600 mb-2" size={48} />;
        return <XCircle className="text-red-600 mb-2" size={48} />;
    };

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-800">Credit Evaluation Request</h2>
                <p className="text-gray-500">Simulate memory-augmented credit decisioning.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Input Form */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 h-fit">
                    <form onSubmit={handleEvaluate} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Select Distributor</label>
                            <select className="w-full border border-gray-300 rounded-lg p-3 bg-gray-50 text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none">
                                <option value="1">Alpha Tech Supplies (ID: 1)</option>
                                <option value="2">Beta Pharmaceuticals (ID: 2)</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Requested Credit Amount (₹)</label>
                            <input
                                type="number"
                                value={requestedAmount}
                                onChange={(e) => setRequestedAmount(e.target.value)}
                                placeholder="e.g., 1000000"
                                className="w-full border border-gray-300 rounded-lg p-3 text-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isEvaluating}
                            className={`w-full py-4 rounded-lg text-white font-bold text-lg flex justify-center items-center transition-all ${isEvaluating ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 shadow-md hover:shadow-lg'
                                }`}
                        >
                            {isEvaluating ? (
                                <span className="flex items-center">
                                    <BrainCircuit className="animate-pulse mr-2" /> Processing Memory Context...
                                </span>
                            ) : (
                                'Run AI Evaluation'
                            )}
                        </button>
                    </form>
                </div>

                {/* Result Panel */}
                {result && (
                    <div className="space-y-6 animate-fade-in-up">
                        <div className={`rounded-xl border p-6 flex flex-col items-center text-center ${getDecisionStyles(result.decision)}`}>
                            {getDecisionIcon(result.decision)}
                            <h3 className="text-3xl font-black mb-1 tracking-tight">{result.decision}</h3>
                            <p className="text-sm font-medium opacity-80 mb-4">APPROVED: ₹{new Intl.NumberFormat('en-IN').format(result.approved_amount)}</p>

                            <div className="bg-white/60 rounded-full px-4 py-1 text-sm font-bold flex items-center">
                                <BrainCircuit size={16} className="mr-2" />
                                AI Confidence: {result.confidence}%
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 relative">
                            <div className="absolute top-0 left-0 w-1 h-full bg-purple-500 rounded-l-xl"></div>
                            <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">AI Natural Language Explanation</h4>
                            <p className="text-gray-800 font-medium leading-relaxed text-lg">
                                "{result.explanation}"
                            </p>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                            <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">Top Influential Historical Cases</h4>
                            <div className="space-y-3">
                                {result.cases.map((sc, idx) => (
                                    <div key={idx} className="flex p-3 bg-gray-50 rounded-lg border border-gray-100">
                                        <div className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-full bg-purple-100 text-purple-600 font-bold mr-4">
                                            #{(idx + 1)}
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-800 font-medium mb-1">"{sc.event}"</p>
                                            <div className="flex text-xs space-x-4 text-gray-500">
                                                <span>Similarity: <strong className="text-purple-600">{(sc.similarity * 100).toFixed(0)}%</strong></span>
                                                <span>Severity: <strong>{sc.severity}</strong></span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
