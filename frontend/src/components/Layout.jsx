import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import useAppStore from '../store/useAppStore';
import { useAlertSocket } from '../hooks/useAlertSocket';
import { Sun, Moon, Languages, Menu, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function Layout() {
    const { auth } = useAppStore();
    const [isSidebarOpen, setSidebarOpen] = React.useState(false);
    const { t, i18n } = useTranslation();

    useAlertSocket();

    const changeLanguage = (lng) => {
        i18n.changeLanguage(lng);
    };

    return (
        <div className="flex h-screen bg-white overflow-hidden font-inter transition-colors duration-300">
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            <Sidebar isOpen={isSidebarOpen} close={() => setSidebarOpen(false)} />
            <div className="flex-1 flex flex-col overflow-hidden">
                <header className="bg-white shadow-sm border-b border-gray-200 transition-colors duration-300">
                    <div className="px-6 py-4 flex items-center justify-between">
                        <h1 className="text-xl font-black text-gray-900 tracking-tighter uppercase italic flex items-center">
                            <button
                                onClick={() => setSidebarOpen(true)}
                                className="lg:hidden mr-4 p-1 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <Menu size={24} className="text-indigo-600" />
                            </button>
                            {t('common.control')} <span className="text-indigo-600 ml-1.5">{t('common.sync')}</span>
                        </h1>
                        <div className="flex items-center space-x-6">
                            <div className="flex items-center bg-gray-100 rounded-xl p-1 border border-transparent">
                                <button
                                    onClick={() => changeLanguage('en')}
                                    className={`px-3 py-1 text-[10px] font-black rounded-lg transition-all ${i18n.language === 'en' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-400'}`}
                                >
                                    EN
                                </button>
                                <button
                                    onClick={() => changeLanguage('hi')}
                                    className={`px-3 py-1 text-[10px] font-black rounded-lg transition-all ${i18n.language === 'hi' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-400'}`}
                                >
                                    HI
                                </button>
                            </div>

                            <div className="flex items-center space-x-4">
                                <div className="text-right">
                                    <p className="text-xs font-black text-gray-900 uppercase leading-none">{auth.role === 'Admin' ? 'System Admin' : auth.role === 'RiskOfficer' ? 'Risk Officer' : 'General Viewer'}</p>
                                    <p className="text-[10px] text-gray-400 font-bold uppercase mt-1">Verified Session</p>
                                </div>
                                <div className={`h-10 w-10 ${auth.role === 'Admin' ? 'bg-indigo-600' : auth.role === 'RiskOfficer' ? 'bg-purple-600' : 'bg-gray-400'} rounded-2xl flex items-center justify-center text-white text-sm font-black shadow-lg shadow-indigo-100`}>
                                    {auth.role.charAt(0)}
                                </div>
                            </div>
                        </div>
                    </div>
                </header>
                <main className="flex-1 overflow-auto p-6 bg-white transition-colors duration-300">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
