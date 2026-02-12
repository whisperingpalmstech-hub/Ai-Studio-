
import { useEffect, useRef, useState } from 'react';
import { getSupabaseClient } from './supabase/client';

export function useWebSocket() {
    const [status, setStatus] = useState<'connecting' | 'connected' | 'disconnected'>('disconnected');
    const [lastMessage, setLastMessage] = useState<any>(null);
    const wsRef = useRef<WebSocket | null>(null);
    const reconnectTimeoutRef = useRef<NodeJS.Timeout>();

    useEffect(() => {
        const connect = async () => {
            const supabase = getSupabaseClient();
            const { data: { session } } = await supabase.auth.getSession();

            if (!session) return;

            // In production, you might want to use a separate ticket/token endpoint
            // For now, we are using the Supabase JWT directly which the backend verifies
            const token = session.access_token;

            // Construct WS URL
            // If API_URL is http://localhost:4000/api/v1, we need ws://localhost:4000
            // Assuming config matches
            const wsUrl = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:4000";

            setStatus('connecting');
            const ws = new WebSocket(`${wsUrl}?token=${token}`);
            wsRef.current = ws;

            ws.onopen = () => {
                console.log('WebSocket Connected');
                setStatus('connected');
            };

            ws.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    setLastMessage(data);
                } catch (e) {
                    console.error('Failed to parse WS message', e);
                }
            };

            ws.onclose = () => {
                console.log('WebSocket Disconnected');
                setStatus('disconnected');
                // Auto reconnect
                reconnectTimeoutRef.current = setTimeout(connect, 3000);
            };

            ws.onerror = (error) => {
                console.error('WebSocket Error', error);
                ws.close();
            };
        };

        connect();

        return () => {
            if (wsRef.current) {
                wsRef.current.close();
            }
            if (reconnectTimeoutRef.current) {
                clearTimeout(reconnectTimeoutRef.current);
            }
        };
    }, []);

    const sendMessage = (msg: any) => {
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify(msg));
        } else {
            console.warn("WebSocket not open, cannot send message");
        }
    };

    return { status, lastMessage, sendMessage };
}
