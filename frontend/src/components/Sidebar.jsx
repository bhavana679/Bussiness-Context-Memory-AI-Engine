import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, CreditCard, Bell, ShieldCheck } from 'lucide-react';
import useAppStore from '../store/useAppStore';
import { useTranslation } from 'react-i18next';

const navigation = [
    { name: 'Dashboard', key: 'dashboard', to: '/', icon: LayoutDashboard, roles: ['Admin', 'RiskOfficer', 'Viewer'] },
    { name: 'Distributors', key: 'distributors', to: '/distributors', icon: Users, roles: ['Admin', 'RiskOfficer', 'Viewer'] },
    { name: 'Credit Evaluation', key: 'creditEvaluation', to: '/evaluation', icon: CreditCard, roles: ['Admin', 'RiskOfficer'] },
    { name: 'Alerts', key: 'alerts', to: '/alerts', icon: Bell, roles: ['Admin'] },
];

export default function Sidebar({ isOpen, close }) {
    const { auth } = useAppStore();
    const { t } = useTranslation();

    const filteredNav = navigation.filter(item => item.roles.includes(auth.role));

    return (
        <div className={`fixed lg:relative z-50 lg:z-0 transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 w-64 h-full bg-indigo-900 text-white flex flex-col hide-scrollbar transition-all duration-300 shadow-2xl lg:shadow-none`}>
            <div className="h-16 flex items-center px-6 font-bold text-xl tracking-wider border-b border-indigo-800">
                RISK MANAGEMENT
            </div>

            <nav className="flex-1 py-4 space-y-1 overflow-y-auto">
                {filteredNav.map((item) => (
                    <NavLink
                        key={item.name}
                        to={item.to}
                        onClick={close}
                        className={({ isActive }) =>
                            `group flex items-center px-6 py-3 text-[11px] font-black uppercase tracking-widest transition-colors ${isActive
                                ? 'bg-indigo-800 text-white border-l-4 border-indigo-400'
                                : 'text-indigo-200/60 hover:bg-indigo-800 hover:text-white border-l-4 border-transparent'
                            }`
                        }
                    >
                        <item.icon className="mr-4 h-5 w-5 flex-shrink-0" />
                        {t(`common.${item.key}`)}
                    </NavLink>
                ))}
            </nav>

            <div className="p-4 bg-indigo-950 border-t border-indigo-800 space-y-3 mt-auto mb-4">
                <div className="flex items-center text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-2">
                    <ShieldCheck size={12} className="mr-1" /> {t('common.role')}: {auth.role}
                </div>
                <button
                    onClick={() => useAppStore.getState().logout()}
                    className="w-full bg-indigo-900 border border-indigo-700/50 rounded-lg py-2.5 px-3 text-[10px] uppercase tracking-widest font-black text-indigo-200 hover:text-white hover:bg-indigo-800 transition-all flex items-center justify-center"
                >
                    {t('common.logout')}
                </button>
            </div>

            <div className="p-4 border-t border-indigo-900 opacity-50">
                <div className="text-[10px] text-indigo-300">
                    App v1.0.0
                </div>
            </div>
        </div>
    );
}
