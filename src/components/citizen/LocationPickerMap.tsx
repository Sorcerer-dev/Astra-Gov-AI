"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { MapPin, Navigation, Search, X, Loader2, Check } from "lucide-react";

// We dynamically import leaflet to avoid SSR issues in Next.js
let L: any = null;

interface LocationPickerMapProps {
    isOpen: boolean;
    onClose: () => void;
    onSelectLocation: (locationName: string, lat: number, lng: number) => void;
    initialLat?: number;
    initialLng?: number;
}

export default function LocationPickerMap({
    isOpen,
    onClose,
    onSelectLocation,
    initialLat = 11.6643,
    initialLng = 78.146,
}: LocationPickerMapProps) {
    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<any>(null);
    const markerRef = useRef<any>(null);
    const [lat, setLat] = useState(initialLat);
    const [lng, setLng] = useState(initialLng);
    const [locationName, setLocationName] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [searching, setSearching] = useState(false);
    const [locating, setLocating] = useState(false);
    const [loaded, setLoaded] = useState(false);

    // Reverse geocode to get place name
    const reverseGeocode = useCallback(async (latitude: number, longitude: number) => {
        try {
            const res = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=16&addressdetails=1`,
                { headers: { "Accept-Language": "en" } }
            );
            const data = await res.json();
            if (data.display_name) {
                // Shorten to city/area level
                const parts = data.display_name.split(",");
                const short = parts.slice(0, 3).map((s: string) => s.trim()).join(", ");
                setLocationName(short);
            }
        } catch {
            setLocationName(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
        }
    }, []);

    // Initialize map
    useEffect(() => {
        if (!isOpen || !mapRef.current) return;

        let cancelled = false;

        const initMap = async () => {
            // Dynamically import leaflet
            if (!L) {
                L = (await import("leaflet")).default;
                // Import CSS
                await import("leaflet/dist/leaflet.css");
            }

            if (cancelled || !mapRef.current) return;

            // Clear old map
            if (mapInstanceRef.current) {
                mapInstanceRef.current.remove();
                mapInstanceRef.current = null;
            }

            const map = L.map(mapRef.current, {
                center: [lat, lng],
                zoom: 14,
                zoomControl: false,
            });

            L.control.zoom({ position: "bottomright" }).addTo(map);

            L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
                maxZoom: 19,
            }).addTo(map);

            // Custom marker icon
            const markerIcon = L.divIcon({
                className: "custom-marker",
                html: `<div style="
                    width: 32px; height: 32px;
                    background: linear-gradient(135deg, #3b82f6, #6366f1);
                    border-radius: 50% 50% 50% 0;
                    transform: rotate(-45deg);
                    border: 3px solid white;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
                    display: flex; align-items: center; justify-content: center;
                "><div style="
                    width: 10px; height: 10px;
                    background: white;
                    border-radius: 50%;
                    transform: rotate(45deg);
                "></div></div>`,
                iconSize: [32, 32],
                iconAnchor: [16, 32],
            });

            const marker = L.marker([lat, lng], { icon: markerIcon, draggable: true }).addTo(map);
            markerRef.current = marker;

            // On marker drag
            marker.on("dragend", () => {
                const pos = marker.getLatLng();
                setLat(pos.lat);
                setLng(pos.lng);
                reverseGeocode(pos.lat, pos.lng);
            });

            // On map click
            map.on("click", (e: any) => {
                const { lat: clickLat, lng: clickLng } = e.latlng;
                marker.setLatLng([clickLat, clickLng]);
                setLat(clickLat);
                setLng(clickLng);
                reverseGeocode(clickLat, clickLng);
            });

            mapInstanceRef.current = map;
            setLoaded(true);

            // Initial reverse geocode
            reverseGeocode(lat, lng);

            // Resize fix
            setTimeout(() => map.invalidateSize(), 100);
        };

        initMap();

        return () => {
            cancelled = true;
        };
    }, [isOpen]); // eslint-disable-line react-hooks/exhaustive-deps

    // Search location by name
    const handleSearch = async () => {
        if (!searchQuery.trim()) return;
        setSearching(true);
        try {
            const res = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=1`,
                { headers: { "Accept-Language": "en" } }
            );
            const data = await res.json();
            if (data.length > 0) {
                const { lat: sLat, lon: sLng, display_name } = data[0];
                const newLat = parseFloat(sLat);
                const newLng = parseFloat(sLng);
                setLat(newLat);
                setLng(newLng);
                const parts = display_name.split(",");
                setLocationName(parts.slice(0, 3).map((s: string) => s.trim()).join(", "));

                if (mapInstanceRef.current && markerRef.current) {
                    mapInstanceRef.current.setView([newLat, newLng], 15);
                    markerRef.current.setLatLng([newLat, newLng]);
                }
            }
        } catch (err) {
            console.error("Search failed:", err);
        } finally {
            setSearching(false);
        }
    };

    // Use current GPS
    const handleUseMyLocation = () => {
        if (!navigator.geolocation) return;
        setLocating(true);
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const { latitude, longitude } = pos.coords;
                setLat(latitude);
                setLng(longitude);
                reverseGeocode(latitude, longitude);
                if (mapInstanceRef.current && markerRef.current) {
                    mapInstanceRef.current.setView([latitude, longitude], 16);
                    markerRef.current.setLatLng([latitude, longitude]);
                }
                setLocating(false);
            },
            () => setLocating(false),
            { enableHighAccuracy: true, timeout: 10000 }
        );
    };

    const handleConfirm = () => {
        onSelectLocation(locationName || `${lat.toFixed(4)}, ${lng.toFixed(4)}`, lat, lng);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] transition-opacity"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="fixed inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-[640px] md:h-[520px] bg-white rounded-2xl shadow-2xl z-[61] flex flex-col overflow-hidden border border-slate-200">
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-3 border-b bg-slate-50">
                    <div className="flex items-center gap-2">
                        <MapPin className="w-5 h-5 text-blue-600" />
                        <h3 className="font-bold text-slate-800">Choose Location</h3>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1.5 hover:bg-slate-200 rounded-lg transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Search Bar */}
                <div className="px-4 py-3 border-b flex gap-2">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                            placeholder="Search a place (e.g. Mumbai, MG Road...)"
                            className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none bg-slate-50"
                        />
                    </div>
                    <button
                        onClick={handleSearch}
                        disabled={searching}
                        className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-1.5"
                    >
                        {searching ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
                        Search
                    </button>
                    <button
                        onClick={handleUseMyLocation}
                        disabled={locating}
                        className="px-3 py-2 border border-slate-200 text-sm font-semibold rounded-xl hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700 transition-colors disabled:opacity-50 flex items-center gap-1.5 whitespace-nowrap"
                        title="Use my current location"
                    >
                        {locating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Navigation className="w-3.5 h-3.5" />}
                        <span className="hidden sm:inline">My Location</span>
                    </button>
                </div>

                {/* Map */}
                <div className="flex-1 relative">
                    <div ref={mapRef} className="w-full h-full" />
                    {!loaded && (
                        <div className="absolute inset-0 flex items-center justify-center bg-slate-100">
                            <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                        </div>
                    )}
                </div>

                {/* Footer with location name + confirm */}
                <div className="px-5 py-3 border-t bg-slate-50 flex items-center gap-3">
                    <MapPin className="w-4 h-4 text-red-500 shrink-0" />
                    <div className="flex-1 min-w-0">
                        <p className="text-xs text-slate-400 font-medium">Selected Location</p>
                        <p className="text-sm font-semibold text-slate-700 truncate">
                            {locationName || "Click on the map to pick a location"}
                        </p>
                    </div>
                    <button
                        onClick={handleConfirm}
                        disabled={!locationName}
                        className="px-5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-bold rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md disabled:opacity-40 flex items-center gap-1.5"
                    >
                        <Check className="w-4 h-4" />
                        Confirm
                    </button>
                </div>
            </div>
        </>
    );
}
