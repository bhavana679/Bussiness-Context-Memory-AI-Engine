import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldAlert, Server, ShieldCheck, User, ArrowLeft } from 'lucide-react';
import useAppStore from '../store/useAppStore';
import { postLogin } from '../services/api';
import toast from 'react-hot-toast';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { setAuth } = useAppStore();
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();

        if (!email || !password) {
            toast.error("Email and password are required.");
            return;
        }

        setIsLoading(true);

        try {
            const response = await postLogin({ email, password });

            setAuth(response.token, response.role);
            toast.success('Logged in successfully');
            navigate('/');

        } catch (error) {
            const errorMsg = error.response?.data?.detail || "Login failed.";
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
                    <ArrowLeft size={14} className="mr-2" /> Go Back
                </Link>

                <div className="text-center mb-10">
                    <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-indigo-200">
                        <Server className="text-white" size={32} />
                    </div>
                    <h1 className="text-4xl font-black text-gray-900 tracking-widest uppercase italic">Risk <span className="text-indigo-600">Management</span></h1>
                    <p className="text-gray-500 mt-3 text-xs uppercase tracking-widest font-black">Sign in to continue</p>
                </div>

                <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 p-10 border border-gray-100">
                    <form onSubmit={handleLogin} className="space-y-6">
                        <div>
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Email Address</label>
                            <div className="relative">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="name@company.com"
                                    className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl py-4 pl-12 pr-4 text-sm font-bold focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all placeholder:text-gray-300"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Password</label>
                            <div className="relative">
                                <ShieldAlert className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input
                                    type="password"
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
                            {isLoading ? 'Authenticating...' : 'Sign In'}
                        </button>
                    </form>

                    <div className="mt-8 pt-6 border-t border-gray-100 text-center">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                            Don't have an account? <Link to="/signup" className="text-indigo-600 hover:text-indigo-800 ml-1">Sign up</Link>
                        </p>
                    </div>
                </div>
            </div>

            <div className="absolute bottom-6 text-center w-full">
                <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em]">Internal Portal</p>
            </div>
        </div>
    );
}
