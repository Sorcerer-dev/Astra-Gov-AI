/**
 * Centralized API Client for Astra Gov AI
 * Supports dynamic configuration to allow testing across local networks (e.g. mobile testing).
 */

const LOCAL_IP = "10.189.51.43"; // NOTE: Replace this with your laptop's actual Local IP address
const API_PORT = 8000;

export const BACKEND_URL =
    process.env.NEXT_PUBLIC_API_URL ||
    (typeof window !== "undefined" && window.location.hostname !== "localhost"
        ? `http://${window.location.hostname}:${API_PORT}`
        : `http://${LOCAL_IP}:${API_PORT}`);

export async function fetchApi(endpoint: string, options?: RequestInit) {
    const url = `${BACKEND_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

    const response = await fetch(url, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...options?.headers,
        },
    });

    if (!response.ok) {
        throw new Error(`API request failed: ${response.statusText}`);
    }

    return response.json();
}
