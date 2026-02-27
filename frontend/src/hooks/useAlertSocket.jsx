import { useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import useAppStore from '../store/useAppStore';

export const useAlertSocket = () => {
    const socketRef = useRef(null);
    const reconnectTimeoutRef = useRef(null);
    const { addAlert, auth } = useAppStore();

    useEffect(() => {
        const connect = () => {
            // Only connect when user is authenticated with a valid token
            if (!auth.isAuthenticated || !auth.token) return;

            const baseUrl = import.meta.env.VITE_WS_BASE_URL || 'ws://localhost:8000';
            // Pass JWT token as query param — backend validates it before accepting
            const wsUrl = `${baseUrl}/ws/alerts?token=${encodeURIComponent(auth.token)}`;

            if (socketRef.current) {
                socketRef.current.close();
            }

            socketRef.current = new WebSocket(wsUrl);

            socketRef.current.onopen = () => {
                if (import.meta.env.DEV) console.log('WS authenticated and connected');
                if (reconnectTimeoutRef.current) {
                    clearTimeout(reconnectTimeoutRef.current);
                    reconnectTimeoutRef.current = null;
                }
            };

            socketRef.current.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);

                    addAlert(data);

                    toast.custom((t) => (
                        <div className={`${t.visible ? 'animate-enter' : 'animate-leave'
                            } max-w-md w-full bg-white shadow-2xl rounded-2xl pointer-events-auto flex ring-1 ring-black ring-opacity-5 p-4 border-l-4 ${data.severity === 'high' ? 'border-red-500' : 'border-yellow-500'
                            }`}>
                            <div className="flex-1 w-0 p-1">
                                <div className="flex items-start">
                                    <div className="ml-3 flex-1">
                                        <p className="text-sm font-black text-gray-900 uppercase tracking-tight">
                                            Risk Alert
                                        </p>
                                        <p className="mt-1 text-xs text-gray-500 font-medium">
                                            {data.message || 'Risk issue detected.'}
                                        </p>
                                        <p className="mt-2 text-[10px] font-bold text-indigo-500 uppercase">
                                            Source: {data.engine || 'System'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className="flex border-l border-gray-200">
                                <button
                                    onClick={() => toast.dismiss(t.id)}
                                    className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-xs font-black text-gray-400 hover:text-gray-500 focus:outline-none"
                                >
                                    CLOSE
                                </button>
                            </div>
                        </div>
                    ), { duration: 6000 });

                } catch (err) {
                    if (import.meta.env.DEV) console.error('WebSocket message parsing error:', err);
                }
            };

            socketRef.current.onclose = (event) => {
                // Code 4001 = server rejected auth — do NOT attempt reconnect
                if (event.code === 4001) {
                    if (import.meta.env.DEV) console.warn('WS closed: auth rejected, will not retry.');
                    return;
                }
                if (import.meta.env.DEV) console.log('WS disconnected, reconnecting in 5s...');
                reconnectTimeoutRef.current = setTimeout(connect, 5000);
            };

            socketRef.current.onerror = (err) => {
                if (import.meta.env.DEV) console.error('WebSocket Error:', err);
                socketRef.current.close();
            };
        };

        if (auth.isAuthenticated) {
            connect();
        }

        return () => {
            if (socketRef.current) {
                socketRef.current.close();
            }
            if (reconnectTimeoutRef.current) {
                clearTimeout(reconnectTimeoutRef.current);
            }
        };
    }, [auth.isAuthenticated, auth.token, addAlert]);
};
