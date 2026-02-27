import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

export default function Layout() {
    return (
        <div className="flex h-screen bg-gray-50 overflow-hidden">
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
                <header className="bg-white shadow-sm border-b border-gray-200">
                    <div className="px-6 py-4 flex items-center justify-between">
                        <h1 className="text-xl font-semibold text-gray-800">Business Control Center</h1>
                        <div className="flex items-center space-x-4">
                            <span className="text-sm text-gray-500">Demo User</span>
                            <div className="h-8 w-8 bg-indigo-600 rounded-full flex items-center justify-center text-white text-sm font-medium">A</div>
                        </div>
                    </div>
                </header>
                <main className="flex-1 overflow-auto p-6">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
