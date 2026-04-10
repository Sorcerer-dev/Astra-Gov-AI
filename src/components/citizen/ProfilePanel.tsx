"use client";

import { useState, useRef, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { User, Camera, LogOut, Settings, X, Loader2, Eye } from "lucide-react";
import EditProfileModal from "./EditProfileModal";

interface ProfilePanelProps {
    onNavigateSettings?: () => void;
}

export default function ProfilePanel({ onNavigateSettings }: ProfilePanelProps) {
    const [open, setOpen] = useState(false);
    const [user, setUser] = useState<any>(null);
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);
    const [fullName, setFullName] = useState("");
    const panelRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Load user + profile
    useEffect(() => {
        async function loadProfile() {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;
            setUser(user);

            const { data: profile } = await supabase
                .from("profiles")
                .select("full_name, avatar_url")
                .eq("id", user.id)
                .single();

            if (profile) {
                setFullName(profile.full_name || "");
                if (profile.avatar_url) {
                    const { data } = supabase.storage
                        .from("avatars")
                        .getPublicUrl(profile.avatar_url);
                    setAvatarUrl(data.publicUrl);
                }
            }
        }
        loadProfile();
    }, []);

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !user) return;
        setUploading(true);

        try {
            const ext = file.name.split(".").pop();
            const path = `${user.id}/avatar.${ext}`;

            const { error: uploadError } = await supabase.storage
                .from("avatars")
                .upload(path, file, { upsert: true });

            if (uploadError) throw uploadError;

            await supabase
                .from("profiles")
                .upsert({ id: user.id, avatar_url: path }, { onConflict: "id" });

            const { data } = supabase.storage.from("avatars").getPublicUrl(path);
            setAvatarUrl(data.publicUrl + `?t=${Date.now()}`);
        } catch (err) {
            console.error("Upload failed:", err);
        } finally {
            setUploading(false);
        }
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        window.location.href = "/login";
    };

    const initials = fullName
        ? fullName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
        : user?.email?.slice(0, 2).toUpperCase() || "U";

    return (
        <div ref={panelRef} className="relative">
            {/* Avatar Button */}
            <button
                onClick={() => setOpen(!open)}
                className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-blue-200 hover:border-blue-400 transition-all shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                title="My Profile"
            >
                {avatarUrl ? (
                    <img src={avatarUrl} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm">
                        {initials}
                    </div>
                )}
                {/* Online dot */}
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-400 border-2 border-white rounded-full" />
            </button>

            {/* Dropdown Panel */}
            {open && (
                <div className="absolute right-0 top-12 w-80 bg-white rounded-2xl shadow-2xl border border-slate-100 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                    {/* Header */}
                    <div className="relative bg-gradient-to-br from-blue-600 to-indigo-700 px-6 pt-6 pb-6">
                        <button
                            onClick={() => setOpen(false)}
                            className="absolute top-3 right-3 text-white/60 hover:text-white transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>

                        {/* Avatar with upload button */}
                        <div className="flex flex-col items-center">
                            <div className="relative">
                                <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-white/30 shadow-xl">
                                    {avatarUrl ? (
                                        <img src={avatarUrl} alt="Profile" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full bg-white/20 flex items-center justify-center text-white font-bold text-2xl">
                                            {initials}
                                        </div>
                                    )}
                                </div>
                                {/* Camera Upload Button */}
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={uploading}
                                    className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-white shadow-md flex items-center justify-center hover:bg-blue-50 transition-colors border border-slate-200"
                                    title="Upload photo"
                                >
                                    {uploading ? (
                                        <Loader2 className="w-3 h-3 text-blue-500 animate-spin" />
                                    ) : (
                                        <Camera className="w-3 h-3 text-blue-600" />
                                    )}
                                </button>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleUpload}
                                />
                            </div>

                            <h3 className="mt-3 text-white font-bold text-lg leading-tight text-center">
                                {fullName || "Citizen User"}
                            </h3>
                            <p className="text-blue-200 text-xs mt-0.5 text-center">{user?.email}</p>
                            <span className="mt-2 px-2 py-0.5 rounded-full bg-white/20 text-white text-[10px] font-semibold uppercase tracking-wider">
                                Citizen
                            </span>
                        </div>
                    </div>

                    {/* Info box */}
                    <div className="px-4 pt-4 pb-2">
                        <div className="bg-slate-50 rounded-xl border border-slate-100 px-4 py-3 space-y-0.5">
                            <div className="flex items-center gap-2 text-slate-400 text-xs font-medium">
                                <User className="w-3.5 h-3.5 shrink-0" />
                                <span>Logged in as Citizen</span>
                            </div>
                            <p className="text-slate-700 text-sm font-semibold truncate pl-5">{user?.email}</p>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="p-4 space-y-1">
                        <EditProfileModal 
                            user={user} 
                            currentFullName={fullName} 
                            onUpdate={() => window.location.reload()} 
                        />
                        
                        <button
                            onClick={() => { onNavigateSettings?.(); setOpen(false); }}
                            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-slate-700 hover:bg-blue-50 transition-colors"
                        >
                            <Eye className="w-4 h-4" />
                            View Records & Stats
                        </button>
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-colors border-t border-slate-50 mt-1 pt-3"
                        >
                            <LogOut className="w-4 h-4" />
                            Sign Out
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
