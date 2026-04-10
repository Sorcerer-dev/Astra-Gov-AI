"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { User, X, Loader2 } from "lucide-react";

interface EditProfileModalProps {
    user: any;
    currentFullName: string;
    onUpdate: () => void;
}

export default function EditProfileModal({ user, currentFullName, onUpdate }: EditProfileModalProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({
        full_name: currentFullName,
        phone: "",
        city: "",
        age: "",
        occupation: "",
        annual_income: ""
    });

    useEffect(() => {
        if (isOpen && user) {
            supabase.from("profiles").select("*").eq("id", user.id).single().then(({ data }) => {
                if (data) setForm({
                    full_name: data.full_name || "",
                    phone: data.phone || "",
                    city: data.city || "",
                    age: data.age?.toString() || "",
                    occupation: data.occupation || "",
                    annual_income: data.annual_income || ""
                });
            });
        }
    }, [isOpen, user]);

    const handleSave = async () => {
        setLoading(true);
        const { error } = await supabase.from("profiles").upsert({
            id: user.id,
            full_name: form.full_name,
            phone: form.phone,
            city: form.city,
            age: parseInt(form.age) || null,
            occupation: form.occupation,
            annual_income: form.annual_income
        });
        setLoading(false);
        if (!error) {
            setIsOpen(false);
            onUpdate();
        } else alert(error.message);
    };

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-bold text-blue-700 bg-blue-50/50 hover:bg-blue-100/50 transition-colors"
            >
                <User className="w-4 h-4" />
                Edit Profile Details
            </button>

            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white rounded-[2rem] w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-white/20">
                        <div className="p-8 bg-slate-900 text-white flex justify-between items-center relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full -mr-16 -mt-16 blur-3xl"></div>
                            <div className="relative z-10">
                                <h3 className="text-2xl font-bold tracking-tight">Modify Profile</h3>
                                <p className="text-slate-400 text-xs font-medium uppercase tracking-widest mt-1">Official Resource Record</p>
                            </div>
                            <button onClick={() => setIsOpen(false)} className="relative z-10 p-2 hover:bg-white/10 rounded-full transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        
                        <div className="p-8 space-y-6 max-h-[60vh] overflow-y-auto custom-scrollbar">
                            <div className="grid grid-cols-2 gap-6">
                                <div className="col-span-2 space-y-2">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Full Name</label>
                                    <input value={form.full_name} onChange={e => setForm({...form, full_name: e.target.value})} className="w-full p-3.5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all" placeholder="Legal Name" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Phone Contact</label>
                                    <input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} className="w-full p-3.5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all" placeholder="+91..." />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Age</label>
                                    <input type="number" value={form.age} onChange={e => setForm({...form, age: e.target.value})} className="w-full p-3.5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">City / Ward</label>
                                    <input value={form.city} onChange={e => setForm({...form, city: e.target.value})} className="w-full p-3.5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Occupation</label>
                                    <input value={form.occupation} onChange={e => setForm({...form, occupation: e.target.value})} className="w-full p-3.5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all" />
                                </div>
                                <div className="col-span-2 space-y-2">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Annual Income (₹)</label>
                                    <input value={form.annual_income} onChange={e => setForm({...form, annual_income: e.target.value})} className="w-full p-3.5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all" />
                                </div>
                            </div>
                        </div>

                        <div className="p-8 bg-slate-50 border-t flex gap-4">
                            <button onClick={() => setIsOpen(false)} className="flex-1 py-4 font-bold text-slate-600 hover:bg-slate-200 rounded-2xl transition-colors">Discard</button>
                            <button 
                                onClick={handleSave} 
                                disabled={loading}
                                className="flex-1 py-4 bg-blue-600 text-white font-bold rounded-2xl shadow-xl shadow-blue-500/30 hover:bg-blue-700 active:scale-95 transition-all disabled:opacity-50"
                            >
                                {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "Commit Changes"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
