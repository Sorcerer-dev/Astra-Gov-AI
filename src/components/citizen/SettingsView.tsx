"use client";

import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import {
    User, Camera, Save, Loader2, CheckCircle, AlertCircle,
    Briefcase, IndianRupee, Phone, MapPin, Calendar,
} from "lucide-react";

export default function SettingsView() {
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [toast, setToast] = useState<{ type: "success" | "error"; msg: string } | null>(null);
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Form state
    const [form, setForm] = useState({
        full_name: "",
        age: "",
        phone: "",
        city: "",
        occupation: "",
        annual_income: "",
    });

    const showToast = (type: "success" | "error", msg: string) => {
        setToast({ type, msg });
        setTimeout(() => setToast(null), 4000);
    };

    useEffect(() => {
        async function load() {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;
            setUser(user);

            const { data: profile } = await supabase
                .from("profiles")
                .select("*")
                .eq("id", user.id)
                .single();

            if (profile) {
                setForm({
                    full_name: profile.full_name || "",
                    age: profile.age?.toString() || "",
                    phone: profile.phone || "",
                    city: profile.city || "",
                    occupation: profile.occupation || "",
                    annual_income: profile.annual_income || "",
                });

                if (profile.avatar_url) {
                    const { data } = supabase.storage
                        .from("avatars")
                        .getPublicUrl(profile.avatar_url);
                    setAvatarUrl(data.publicUrl);
                }
            }
            setLoading(false);
        }
        load();
    }, []);

    const handleSave = async () => {
        if (!user) return;
        setSaving(true);
        const { error } = await supabase.from("profiles").upsert(
            {
                id: user.id,
                full_name: form.full_name,
                age: form.age ? parseInt(form.age) : null,
                phone: form.phone,
                city: form.city,
                occupation: form.occupation,
                annual_income: form.annual_income,
            },
            { onConflict: "id" }
        );

        setSaving(false);
        if (error) {
            showToast("error", "Failed to save: " + error.message);
        } else {
            showToast("success", "Profile updated successfully!");
        }
    };

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

            await supabase.from("profiles").upsert(
                { id: user.id, avatar_url: path },
                { onConflict: "id" }
            );

            const { data } = supabase.storage.from("avatars").getPublicUrl(path);
            setAvatarUrl(data.publicUrl + `?t=${Date.now()}`);
            showToast("success", "Profile photo updated!");
        } catch (err: any) {
            showToast("error", "Photo upload failed: " + err.message);
        } finally {
            setUploading(false);
        }
    };

    const initials = form.full_name
        ? form.full_name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
        : user?.email?.slice(0, 2).toUpperCase() || "U";

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            </div>
        );
    }

    return (
        <div className="p-6 md:p-8 max-w-3xl mx-auto w-full">
            {/* Toast */}
            {toast && (
                <div className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-2xl shadow-2xl border text-sm font-medium animate-in slide-in-from-top-2 duration-300 ${
                    toast.type === "success"
                        ? "bg-green-50 text-green-700 border-green-200"
                        : "bg-red-50 text-red-700 border-red-200"
                }`}>
                    {toast.type === "success"
                        ? <CheckCircle className="w-4 h-4 text-green-500" />
                        : <AlertCircle className="w-4 h-4 text-red-500" />}
                    {toast.msg}
                </div>
            )}

            <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">Account Settings</h1>
                <p className="text-slate-500 mt-1">Manage your profile information and photo</p>
            </div>

            {/* Profile Photo Card */}
            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-6 mb-6 flex items-center gap-6 shadow-lg">
                <div className="relative">
                    <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white/30 shadow-xl">
                        {avatarUrl ? (
                            <img src={avatarUrl} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full bg-white/20 flex items-center justify-center text-white font-bold text-3xl">
                                {initials}
                            </div>
                        )}
                    </div>
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                        className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-white shadow-md flex items-center justify-center hover:bg-blue-50 transition-colors border border-slate-200"
                        title="Upload photo"
                    >
                        {uploading ? (
                            <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
                        ) : (
                            <Camera className="w-4 h-4 text-blue-600" />
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
                <div>
                    <h2 className="text-white font-bold text-xl">{form.full_name || "Your Name"}</h2>
                    <p className="text-blue-200 text-sm mt-0.5">{user?.email}</p>
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="mt-2 text-xs text-white/70 hover:text-white underline underline-offset-2 transition-colors"
                    >
                        {uploading ? "Uploading..." : "Change profile photo"}
                    </button>
                </div>
            </div>

            {/* Profile Details Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden mb-6">
                <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2">
                    <User className="w-4 h-4 text-blue-500" />
                    <h2 className="font-semibold text-slate-800">Profile Details</h2>
                </div>
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Full Name</label>
                        <input
                            type="text"
                            value={form.full_name}
                            onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                            placeholder="Enter your full name"
                            className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all bg-slate-50 focus:bg-white"
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Age</label>
                        <div className="relative">
                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="number"
                                value={form.age}
                                onChange={(e) => setForm({ ...form, age: e.target.value })}
                                placeholder="e.g. 28"
                                min={1} max={120}
                                className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all bg-slate-50 focus:bg-white"
                            />
                        </div>
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Phone Number</label>
                        <div className="relative">
                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="tel"
                                value={form.phone}
                                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                                placeholder="+91 98765 43210"
                                className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all bg-slate-50 focus:bg-white"
                            />
                        </div>
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">City</label>
                        <div className="relative">
                            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="text"
                                value={form.city}
                                onChange={(e) => setForm({ ...form, city: e.target.value })}
                                placeholder="e.g. Mumbai"
                                className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all bg-slate-50 focus:bg-white"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Demographic Stats Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden mb-6">
                <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-indigo-500" />
                    <div>
                        <h2 className="font-semibold text-slate-800">Demographic Stats</h2>
                        <p className="text-xs text-slate-400">Used for AI Scheme Matching</p>
                    </div>
                </div>
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Annual Income</label>
                        <div className="relative">
                            <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="text"
                                value={form.annual_income}
                                onChange={(e) => setForm({ ...form, annual_income: e.target.value })}
                                placeholder="e.g. 3,50,000"
                                className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all bg-slate-50 focus:bg-white"
                            />
                        </div>
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Occupation</label>
                        <div className="relative">
                            <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="text"
                                value={form.occupation}
                                onChange={(e) => setForm({ ...form, occupation: e.target.value })}
                                placeholder="e.g. Retail Business Owner"
                                className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all bg-slate-50 focus:bg-white"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Email (read-only) */}
            <div className="bg-slate-50 rounded-2xl border border-slate-100 p-5 mb-6 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center">
                    <User className="w-4 h-4 text-slate-500" />
                </div>
                <div>
                    <p className="text-xs text-slate-400 font-semibold uppercase tracking-wide">Email Address</p>
                    <p className="text-sm text-slate-700 font-medium">{user?.email}</p>
                </div>
                <span className="ml-auto text-[10px] bg-slate-200 text-slate-500 px-2 py-0.5 rounded-full font-semibold">READ ONLY</span>
            </div>

            {/* Save Button */}
            <button
                onClick={handleSave}
                disabled={saving}
                className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-2xl font-bold text-sm shadow-lg shadow-blue-500/30 transition-all active:scale-[0.98] disabled:opacity-70 flex items-center justify-center gap-2"
            >
                {saving ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</>
                ) : (
                    <><Save className="w-4 h-4" /> Save Profile</>
                )}
            </button>
        </div>
    );
}
