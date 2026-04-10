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
            <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">Account Overview</h1>
                <p className="text-slate-500 mt-1 text-sm flex items-center gap-2">
                    <User className="w-3.5 h-3.5" />
                    Viewing your verified citizen credentials
                </p>
            </div>

            {/* Profile Photo Header (Read Only) */}
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6 mb-6 flex items-center gap-6 shadow-xl border border-white/5">
                <div className="relative">
                    <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white/10 shadow-xl">
                        {avatarUrl ? (
                            <img src={avatarUrl} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full bg-blue-500 flex items-center justify-center text-white font-bold text-3xl">
                                {initials}
                            </div>
                        )}
                    </div>
                </div>
                <div>
                    <h2 className="text-white font-bold text-xl">{form.full_name || "Citizen User"}</h2>
                    <p className="text-slate-400 text-sm mt-0.5">{user?.email}</p>
                    <div className="mt-3 flex items-center gap-2">
                        <span className="px-2.5 py-1 rounded-full bg-green-500/20 text-green-400 border border-green-500/30 text-[10px] font-bold uppercase tracking-wider">
                            Verified Profile
                        </span>
                        <span className="px-2.5 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 text-[10px] font-bold uppercase tracking-wider">
                            {form.city || "Salem Area"}
                        </span>
                    </div>
                </div>
            </div>

            {/* Profile Details Card (Non-Editable) */}
            <div className="bg-card border rounded-2xl shadow-sm overflow-hidden mb-6">
                <div className="px-6 py-4 border-b flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-primary" />
                        <h2 className="font-bold text-slate-800 tracking-tight">Personal Details</h2>
                    </div>
                    <span className="text-[10px] font-bold text-muted-foreground uppercase bg-secondary px-2 py-0.5 rounded">View Mode</span>
                </div>
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                    <DetailItem label="Full Name" value={form.full_name} icon={<User className="w-4 h-4" />} />
                    <DetailItem label="Age" value={form.age ? `${form.age} Years` : "Not Set"} icon={<Calendar className="w-4 h-4" />} />
                    <DetailItem label="Phone Number" value={form.phone || "Not Linked"} icon={<Phone className="w-4 h-4" />} />
                    <DetailItem label="City / Ward" value={form.city || "Not Set"} icon={<MapPin className="w-4 h-4" />} />
                </div>
            </div>

            {/* Demographic Stats Card (Non-Editable) */}
            <div className="bg-card border rounded-2xl shadow-sm overflow-hidden mb-6">
                <div className="px-6 py-4 border-b flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-primary" />
                    <div>
                        <h2 className="font-bold text-slate-800 tracking-tight">Demographic Stats</h2>
                        <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-tighter">System used for Eligibility Matching</p>
                    </div>
                </div>
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                    <DetailItem label="Annual Income" value={form.annual_income ? `₹${form.annual_income}` : "Not Set"} icon={<IndianRupee className="w-4 h-4" />} />
                    <DetailItem label="Occupation" value={form.occupation || "Not Set"} icon={<Briefcase className="w-4 h-4" />} />
                </div>
            </div>

            <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-5 text-center">
                <p className="text-xs text-blue-600 font-medium italic">
                    Note: To edit your profile details, please click your profile icon in the sidebar and select "Edit Details".
                </p>
            </div>
        </div>
    );
}

function DetailItem({ label, value, icon }: { label: string, value: string, icon: React.ReactNode }) {
    return (
        <div className="space-y-1">
            <div className="flex items-center gap-2 text-muted-foreground">
                <span className="opacity-70">{icon}</span>
                <span className="text-[10px] font-bold uppercase tracking-widest">{label}</span>
            </div>
            <p className="text-sm font-semibold text-slate-800 pl-6 border-l ml-2 border-slate-100 italic transition-all">
                {value || <span className="text-slate-300 font-normal">Information missing</span>}
            </p>
        </div>
    );
}
