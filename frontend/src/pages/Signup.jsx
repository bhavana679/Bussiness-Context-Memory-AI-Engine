import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldAlert, Server, ShieldCheck, User, ArrowLeft } from 'lucide-react';
import useAppStore from '../store/useAppStore';
import { postSignup } from '../services/api';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

export default function Signup() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('Viewer');
    const [isLoading, setIsLoading] = useState(false);
    const { setAuth } = useAppStore();
    const navigate = useNavigate();
    const { t } = useTranslation();

    const handleSignup = async (e) => {
        e.preventDefault();

        if (!email || !password || !role) {
            toast.error("Complete data profile required to authorize identity.");
            return;
        }

        setIsLoading(true);

        try {
            const response = await postSignup({ email, password, role });

            setAuth(response.token, response.role);
            toast.success(`Identity Provisioned. Welcome, ${response.role}.`);
            navigate('/');

        } catch (error) {
            const errorMsg = error.message || "Identity allocation failed. Database synchronization error.";
            toast.error(errorMsg);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-6 relative overflow-hidden">
            <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-indigo-200 rounded-full blur-[120px] opacity-40"></div>
            <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-purple-200 rounded-full blur-[150px] opacity-40"></div>

            <div className="w-full max-w-md relative z-10">
                <Link to="/welcome" className="inline-flex items-center text-gray-500 hover:text-indigo-600 font-bold text-xs uppercase tracking-widest mb-8 transition-colors">
                    <ArrowLeft size={14} className="mr-2" /> {t('common.goBack')}
                </Link>

                <div className="text-center mb-10">
                    <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-indigo-200">
                        <Server className="text-white" size={32} />
                    </div>
                    <h1 className="text-4xl font-black text-gray-900 tracking-widest uppercase italic">{t('auth.signup')}</h1>
                    <p className="text-gray-500 mt-3 text-xs uppercase tracking-widest font-black">{t('auth.getStarted')}</p>
                </div>

                <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 p-10 border border-gray-100">
                    <form onSubmit={handleSignup} className="space-y-6">
                        <div>
                            <label htmlFor="signup-role" className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">{t('auth.role')}</label>
                            <div className="relative">
                                <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-500" size={18} />
                                <select
                                    id="signup-role"
                                    name="role"
                                    value={role}
                                    onChange={(e) => setRole(e.target.value)}
                                    className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl py-4 pl-12 pr-4 text-sm font-black uppercase tracking-wider focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all cursor-pointer appearance-none"
                                >
                                    <option value="Admin">{t('evaluation.systemAdmin')}</option>
                                    <option value="RiskOfficer">{t('evaluation.riskOfficer')}</option>
                                    <option value="Viewer">{t('distributors.allIndustries')}</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label htmlFor="signup-email" className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">{t('auth.email')}</label>
                            <div className="relative">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input
                                    id="signup-email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="new.agent@ai-engine.corp"
                                    className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl py-4 pl-12 pr-4 text-sm font-bold focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all placeholder:text-gray-300"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="signup-password" className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">{t('auth.password')}</label>
                            <div className="relative">
                                <ShieldAlert className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input
                                    id="signup-password"
                                    name="password"
                                    type="password"
                                    autoComplete="new-password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl py-4 pl-12 pr-4 text-sm font-bold focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all placeholder:text-gray-300"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className={`w-full font-black text-xs uppercase tracking-[0.2em] rounded-xl py-5 transition-all shadow-xl ${isLoading ? 'bg-indigo-300 cursor-not-allowed text-white shadow-none' : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-200'}`}
                        >
                            {isLoading ? t('auth.signingUp') : t('auth.signup')}
                        </button>
                    </form>

                    <div className="mt-8 pt-6 border-t border-gray-100 text-center">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                            {t('auth.hasAccount')} <Link to="/login" className="text-indigo-600 hover:text-indigo-800 ml-1">{t('auth.login')}</Link>
                        </p>
                    </div>
                </div>
            </div>

            <div className="absolute bottom-6 text-center w-full">
                <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em]">v2.1.0-alpha • Secure Terminal</p>
            </div>
        </div>
    );
}
