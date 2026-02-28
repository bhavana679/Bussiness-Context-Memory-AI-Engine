import { Link } from 'react-router-dom';
import { BrainCircuit, ShieldCheck, Activity, Zap, Database, ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function Landing() {
    const { t, i18n } = useTranslation();

    const changeLanguage = (lng) => {
        i18n.changeLanguage(lng);
    };

    return (
        <div className="min-h-screen bg-gray-50 text-gray-900 font-sans overflow-hidden selection:bg-indigo-500/30">
            <div className="fixed top-[-20%] right-[-10%] w-[800px] h-[800px] bg-indigo-200 rounded-full blur-[200px] opacity-40 pointer-events-none"></div>
            <div className="fixed bottom-[-20%] left-[-10%] w-[800px] h-[800px] bg-purple-200 rounded-full blur-[200px] opacity-40 pointer-events-none"></div>

            <nav className="relative z-10 w-full px-4 sm:px-8 py-6 flex justify-between items-center max-w-7xl mx-auto">
                <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">
                        <BrainCircuit size={20} className="text-white" />
                    </div>
                    <span className="text-xl font-black tracking-widest uppercase italic text-gray-900">AI Risk <span className="text-indigo-600">Engine</span></span>
                </div>
                <div className="flex items-center space-x-4 sm:space-x-8">
                    <div className="flex items-center bg-white border border-gray-200 rounded-xl p-1 shadow-sm">
                        <button
                            onClick={() => changeLanguage('en')}
                            className={`px-3 py-1 text-[10px] font-black rounded-lg transition-all ${i18n.language === 'en' ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-400 hover:text-gray-600'}`}
                        >
                            EN
                        </button>
                        <button
                            onClick={() => changeLanguage('hi')}
                            className={`px-3 py-1 text-[10px] font-black rounded-lg transition-all ${i18n.language === 'hi' ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-400 hover:text-gray-600'}`}
                        >
                            HI
                        </button>
                    </div>
                    <Link to="/login" className="text-xs sm:text-sm font-black uppercase tracking-widest text-gray-500 hover:text-indigo-600 transition-colors">Log In</Link>
                    <Link to="/signup" className="px-5 py-2 sm:px-6 sm:py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-black uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-indigo-200 flex items-center">
                        Engage <ArrowRight size={14} className="ml-2" />
                    </Link>
                </div>
            </nav>

            <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-8 pt-24 pb-16 lg:pt-32 lg:pb-32 flex flex-col items-center text-center">
                <div className="inline-flex items-center px-4 py-2 bg-white/60 border border-gray-200 rounded-full text-[10px] font-black uppercase tracking-widest text-indigo-600 mb-8 backdrop-blur-sm shadow-sm">
                    <Zap size={12} className="mr-2 text-indigo-500" />
                    System Version 2.1.0-alpha Online
                </div>

                <h1 className="text-4xl sm:text-6xl lg:text-8xl font-black tracking-tighter mb-6 sm:mb-8 leading-tight text-gray-900">
                    INTELLIGENT <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600">CREDIT UNDERWRITING</span>
                </h1>

                <p className="text-base sm:text-lg lg:text-xl text-gray-600 font-medium max-w-3xl mb-10 sm:mb-12 leading-relaxed px-4 sm:px-0">
                    Transforming enterprise credit distribution. Combining structured financial metrics with experiential semantic memory to prevent defaults and optimize distributor growth.
                </p>

                <div className="flex flex-col sm:flex-row items-center w-full sm:w-auto space-y-4 sm:space-y-0 sm:space-x-6 px-4 sm:px-0">
                    <Link to="/signup" className="w-full sm:w-auto px-8 sm:px-10 py-5 bg-indigo-600 text-white hover:bg-indigo-700 text-xs sm:text-sm font-black uppercase tracking-[0.2em] rounded-2xl transition-all shadow-xl shadow-indigo-200 flex items-center justify-center">
                        Initialize Matrix
                    </Link>
                    <Link to="/login" className="w-full sm:w-auto px-8 sm:px-10 py-5 bg-white border-2 border-gray-200 hover:border-indigo-200 hover:bg-indigo-50 text-indigo-900 text-xs sm:text-sm font-black uppercase tracking-[0.2em] rounded-2xl transition-all flex items-center justify-center shadow-sm">
                        Authorized Access
                    </Link>
                </div>
            </main>

            <div className="relative z-10 bg-white/60 border-y border-gray-100 backdrop-blur-md">
                <div className="max-w-7xl mx-auto px-4 sm:px-8 py-16 sm:py-24">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-12">
                        <div className="space-y-4 sm:space-y-6 bg-white p-6 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-indigo-50 border border-indigo-100 rounded-2xl flex items-center justify-center shadow-sm">
                                <ShieldCheck size={28} className="text-indigo-600" />
                            </div>
                            <h3 className="text-lg sm:text-xl font-black uppercase tracking-wide text-gray-900">Structured Evaluation</h3>
                            <p className="text-sm sm:text-base text-gray-500 leading-relaxed font-medium">
                                Immediate and historical context memory processes financial behavior, payment delays, and absolute utilization thresholds.
                            </p>
                        </div>
                        <div className="space-y-4 sm:space-y-6 bg-white p-6 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-purple-50 border border-purple-100 rounded-2xl flex items-center justify-center shadow-sm">
                                <Database size={28} className="text-purple-600" />
                            </div>
                            <h3 className="text-lg sm:text-xl font-black uppercase tracking-wide text-gray-900">Semantic Retrieval</h3>
                            <p className="text-sm sm:text-base text-gray-500 leading-relaxed font-medium">
                                Powered by FAISS. Evaluates deep historical patterns, seasonal stress, and experiential memory via vectorized text summarization.
                            </p>
                        </div>
                        <div className="space-y-4 sm:space-y-6 bg-white p-6 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-blue-50 border border-blue-100 rounded-2xl flex items-center justify-center shadow-sm">
                                <Activity size={28} className="text-blue-600" />
                            </div>
                            <h3 className="text-lg sm:text-xl font-black uppercase tracking-wide text-gray-900">Temporal Decay</h3>
                            <p className="text-sm sm:text-base text-gray-500 leading-relaxed font-medium">
                                Mathematical context ranking applying exponential decay, ensuring only recent, highly-valid anomalies affect risk velocities.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <footer className="relative z-10 text-center py-8 sm:py-10">
                <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em]">© 2026 AI Risk Engine. Authorized Corporate Use Only.</p>
            </footer>
        </div>
    );
}
