import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, CreditCard, Bell } from 'lucide-react';

const navigation = [
    { name: 'Dashboard', to: '/', icon: LayoutDashboard },
    { name: 'Distributors', to: '/distributors', icon: Users },
    { name: 'Credit Evaluation', to: '/evaluation', icon: CreditCard },
    { name: 'Alerts', to: '/alerts', icon: Bell },
];

export default function Sidebar() {
    return (
        <div className="w-64 bg-indigo-900 text-white flex flex-col hide-scrollbar">
            <div className="h-16 flex items-center px-6 font-bold text-xl tracking-wider border-b border-indigo-800">
                AI RISK ENGINE
            </div>
            <nav className="flex-1 py-4 space-y-1 overflow-y-auto">
                {navigation.map((item) => (
                    <NavLink
                        key={item.name}
                        to={item.to}
                        className={({ isActive }) =>
                            `group flex items-center px-6 py-3 text-sm font-medium transition-colors ${isActive ? 'bg-indigo-800 text-white border-l-4 border-indigo-400' : 'text-indigo-200 hover:bg-indigo-800 hover:text-white border-l-4 border-transparent'
                            }`
                        }
                    >
                        <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
                        {item.name}
                    </NavLink>
                ))}
            </nav>
            <div className="p-4 border-t border-indigo-800">
                <div className="text-xs text-indigo-300">
                    Hybrid Risk Model v2.1<br />
                    Semantic Mode: Active
                </div>
            </div>
        </div>
    );
}
