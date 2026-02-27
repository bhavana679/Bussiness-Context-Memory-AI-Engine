import React, { Component } from 'react';
import { AlertTriangle, RefreshCcw, Home } from 'lucide-react';

class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        if (import.meta.env.DEV) {
            console.error('React Error Boundary caught an error:', error, errorInfo);
        }
    }

    handleReset = () => {
        this.setState({ hasError: false, error: null });
        window.location.reload();
    };

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-[80vh] flex items-center justify-center p-6">
                    <div className="max-w-lg w-full bg-white  rounded-[40px] shadow-2xl border border-red-50  p-12 text-center space-y-10 animate-in fade-in zoom-in duration-500 transition-colors">
                        <div className="w-24 h-24 bg-red-50  rounded-3xl flex items-center justify-center mx-auto mb-2 border border-red-100 ">
                            <AlertTriangle size={48} className="text-red-600 " />
                        </div>

                        <div className="space-y-4">
                            <h2 className="text-4xl font-black text-gray-900  tracking-widest uppercase italic">Something went wrong</h2>
                            <p className="text-gray-400  text-[10px] font-black uppercase tracking-[0.2em] leading-relaxed">
                                An unexpected error occurred while rendering this page.
                            </p>
                        </div>

                        {import.meta.env.DEV && (
                            <div className="bg-gray-50  p-6 rounded-3xl text-left border border-gray-100  overflow-auto max-h-48 mb-6">
                                <p className="text-[9px] font-black text-gray-400  uppercase mb-3 tracking-widest">Error Details</p>
                                <code className="text-[11px] text-red-600  font-mono break-words leading-relaxed">{this.state.error?.toString()}</code>
                            </div>
                        )}

                        <div className="flex flex-col gap-4 pt-6">
                            <button
                                onClick={this.handleReset}
                                className="w-full py-5 bg-indigo-600  text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] flex items-center justify-center hover:bg-indigo-700  shadow-2xl shadow-indigo-100  transition-all active:scale-[0.98]"
                            >
                                <RefreshCcw size={16} className="mr-3" /> Reload Page
                            </button>
                            <button
                                onClick={() => window.location.href = '/'}
                                className="w-full py-5 bg-gray-50  text-gray-500  rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] flex items-center justify-center hover:bg-gray-100  transition-all border border-gray-100 "
                            >
                                <Home size={16} className="mr-3" /> Go Home
                            </button>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
