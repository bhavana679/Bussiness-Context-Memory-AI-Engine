import React from 'react';
import { mockAlerts } from '../mockData';
import { AlertCircle, AlertTriangle, Info, Clock } from 'lucide-react';

export default function Alerts() {
    const getAlertIcon = (severity) => {
        switch (severity) {
            case 'High': return <AlertCircle className="text-red-600" size={24} />;
            case 'Medium': return <AlertTriangle className="text-yellow-600" size={24} />;
            case 'Low': return <Info className="text-blue-600" size={24} />;
            default: return <Info className="text-gray-600" size={24} />;
        }
    };

    const getAlertStyles = (severity) => {
        switch (severity) {
            case 'High': return 'bg-red-50 border-red-200';
            case 'Medium': return 'bg-yellow-50 border-yellow-200';
            case 'Low': return 'bg-blue-50 border-blue-200';
            default: return 'bg-gray-50 border-gray-200';
        }
    };

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">System Alerts</h2>
                    <p className="text-gray-500 mt-1">Real-time risk events and engine notifications.</p>
                </div>
                <div className="flex space-x-2">
                    <button className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">Mark All Read</button>
                </div>
            </div>

            <div className="space-y-4">
                {mockAlerts.map((alert) => (
                    <div key={alert.id} className={`flex p-5 rounded-xl border items-start ${getAlertStyles(alert.severity)}`}>
                        <div className="mr-4 mt-1 bg-white p-2 rounded-full shadow-sm">
                            {getAlertIcon(alert.severity)}
                        </div>
                        <div className="flex-1">
                            <div className="flex justify-between items-start mb-1">
                                <h3 className="font-bold text-gray-900">{alert.message}</h3>
                                <span className="flex items-center text-xs text-gray-500 bg-white px-2 py-1 border rounded-md">
                                    <Clock size={12} className="mr-1" /> {alert.date}
                                </span>
                            </div>
                            <div className="flex space-x-3 mt-3">
                                <span className="text-xs font-semibold py-1 px-3 bg-white border rounded-full text-gray-700">
                                    Type: {alert.type}
                                </span>
                                <span className={`text-xs font-bold py-1 px-3 border rounded-full ${alert.severity === 'High' ? 'bg-red-100 text-red-800 border-red-200' :
                                        alert.severity === 'Medium' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
                                            'bg-blue-100 text-blue-800 border-blue-200'
                                    }`}>
                                    {alert.severity} Priority
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {mockAlerts.length === 0 && (
                <div className="text-center py-12 bg-white rounded-xl border border-gray-100 border-dashed">
                    <Info className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                    <h3 className="text-lg font-medium text-gray-900">No active alerts</h3>
                    <p className="text-gray-500">System is operating normally.</p>
                </div>
            )}
        </div>
    );
}
