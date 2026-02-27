import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import useAppStore from '../store/useAppStore';
import { ShieldAlert } from 'lucide-react';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
    const { auth } = useAppStore();
    const location = useLocation();

    if (!auth.isAuthenticated) {
        return <Navigate to="/welcome" state={{ from: location }} replace />;
    }

    if (allowedRoles.length > 0 && !allowedRoles.includes(auth.role)) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center p-6">
                <div className="max-w-md w-full bg-white  rounded-[40px] shadow-2xl border border-red-50  p-12 text-center space-y-8 transition-colors duration-300">
                    <div className="w-24 h-24 bg-red-50  rounded-3xl flex items-center justify-center mx-auto mb-4 border border-red-100 ">
                        <ShieldAlert size={48} className="text-red-600 " />
                    </div>
                    <div className="space-y-3">
                        <h2 className="text-3xl font-black text-gray-900  tracking-widest uppercase italic">Denied</h2>
                        <p className="text-gray-400  text-[10px] font-black uppercase tracking-[0.2em] leading-relaxed">
                            Vector node <span className="text-red-600 ">[{auth.role}]</span>
                            is not authorized for this specific sector.
                        </p>
                    </div>
                    <button
                        onClick={() => window.history.back()}
                        className="w-full py-5 bg-gray-900  text-white  rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] hover:opacity-80 transition-all shadow-2xl"
                    >
                        Return to Safety
                    </button>
                </div>
            </div>
        );
    }

    return children;
};

export default ProtectedRoute;
