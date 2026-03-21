"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { User, Calendar, IndianRupee, Briefcase, CheckCircle2, ArrowRight, Loader2, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface OnboardingModalProps {
    userId: string;
    onComplete: (profile: any) => void;
}

export default function OnboardingModal({ userId, onComplete }: OnboardingModalProps) {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        first_name: "",
        last_name: "",
        age: "",
        annual_income: "",
        occupation: ""
    });

    const handleNext = () => setStep(step + 1);

    const handleSubmit = async () => {
        setLoading(true);
        const ageInt = parseInt(formData.age);
        if (isNaN(ageInt)) {
            alert("Please enter a valid number for Age.");
            setLoading(false);
            return;
        }

        const { data, error } = await supabase
            .from("profiles")
            .upsert({
                id: userId,
                ...formData,
                full_name: `${formData.first_name} ${formData.last_name}`,
                age: ageInt,
                updated_at: new Date().toISOString()
            })
            .select()
            .single();

        if (error) {
            console.error("Error saving profile:", error);
            alert(`Error saving your profile: ${error.message || "Unknown error"}. Check console for details.`);
            setLoading(false);
        } else {
            onComplete(data);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-500">
            <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in slide-in-from-bottom-8 duration-700">
                {/* Progress Bar */}
                <div className="h-1.5 w-full bg-slate-100 flex">
                    <div className={cn("h-full bg-primary transition-all duration-500", step === 1 ? "w-1/3" : step === 2 ? "w-2/3" : "w-full")} />
                </div>

                <div className="p-10 pt-8">
                    {step === 1 && (
                        <div className="space-y-6 animate-in slide-in-from-right duration-500">
                            <div className="space-y-2">
                                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                                    <Sparkles className="w-6 h-6 text-primary" />
                                </div>
                                <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">Welcome to Astra!</h2>
                                <p className="text-slate-500 font-medium">Let's start by getting to know you. What should we call you?</p>
                            </div>

                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-700 ml-1">First Name</label>
                                        <div className="relative group">
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-primary transition-colors">
                                                <User className="w-5 h-5" />
                                            </div>
                                            <input 
                                                type="text"
                                                value={formData.first_name}
                                                onChange={(e) => setFormData({...formData, first_name: e.target.value})}
                                                placeholder="John"
                                                className="block w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:border-primary/20 focus:bg-white focus:outline-none transition-all text-slate-900 font-medium"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-700 ml-1">Last Name</label>
                                        <div className="relative group">
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-primary transition-colors">
                                                <User className="w-5 h-5" />
                                            </div>
                                            <input 
                                                type="text"
                                                value={formData.last_name}
                                                onChange={(e) => setFormData({...formData, last_name: e.target.value})}
                                                placeholder="Doe"
                                                className="block w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:border-primary/20 focus:bg-white focus:outline-none transition-all text-slate-900 font-medium"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700 ml-1">Your Age</label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-primary transition-colors">
                                            <Calendar className="w-5 h-5" />
                                        </div>
                                        <input 
                                            type="number"
                                            value={formData.age}
                                            onChange={(e) => setFormData({...formData, age: e.target.value})}
                                            placeholder="25"
                                            className="block w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:border-primary/20 focus:bg-white focus:outline-none transition-all text-slate-900 font-medium"
                                        />
                                    </div>
                                </div>
                            </div>

                            <button 
                                onClick={handleNext}
                                disabled={!formData.first_name || !formData.last_name || !formData.age}
                                className="w-full bg-primary text-primary-foreground py-4 rounded-2xl font-bold shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50 group mt-4"
                            >
                                <span>Continue</span>
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </button>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-6 animate-in slide-in-from-right duration-500">
                            <div className="space-y-2">
                                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center mb-4">
                                    <IndianRupee className="w-6 h-6 text-amber-500" />
                                </div>
                                <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">Financial Profile</h2>
                                <p className="text-slate-500 font-medium">This helps our AI find schemes you're actually eligible for.</p>
                            </div>

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700 ml-1">Annual Income</label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-primary transition-colors">
                                            <IndianRupee className="w-5 h-5" />
                                        </div>
                                        <input 
                                            type="text"
                                            value={formData.annual_income}
                                            onChange={(e) => setFormData({...formData, annual_income: e.target.value})}
                                            placeholder="e.g. ₹ 5,00,000"
                                            className="block w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:border-primary/20 focus:bg-white focus:outline-none transition-all text-slate-900 font-medium"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700 ml-1">Current Occupation</label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-primary transition-colors">
                                            <Briefcase className="w-5 h-5" />
                                        </div>
                                        <input 
                                            type="text"
                                            value={formData.occupation}
                                            onChange={(e) => setFormData({...formData, occupation: e.target.value})}
                                            placeholder="e.g. Student, Shop Owner, Farmer"
                                            className="block w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:border-primary/20 focus:bg-white focus:outline-none transition-all text-slate-900 font-medium"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button 
                                    onClick={() => setStep(1)}
                                    className="flex-1 px-4 py-4 bg-slate-100 text-slate-600 font-bold rounded-2xl hover:bg-slate-200 transition-colors"
                                >
                                    Back
                                </button>
                                <button 
                                    onClick={handleNext}
                                    disabled={!formData.annual_income || !formData.occupation}
                                    className="flex-[2] bg-primary text-primary-foreground py-4 rounded-2xl font-bold shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50 group"
                                >
                                    <span>Almost Done</span>
                                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </button>
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="space-y-8 text-center animate-in zoom-in duration-500 py-4">
                            <div className="flex flex-col items-center">
                                <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mb-6">
                                    <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                                </div>
                                <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 text-center">You're All Set!</h2>
                                <p className="text-slate-500 font-medium mt-3 max-w-sm">
                                    Your citizen profile is ready. Our AI will now use this data to find the best governance solutions for you.
                                </p>
                            </div>

                            <button 
                                onClick={handleSubmit}
                                disabled={loading}
                                className="w-full bg-primary text-primary-foreground py-4 rounded-2xl font-bold shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all flex items-center justify-center gap-2 group"
                            >
                                {loading ? (
                                    <Loader2 className="w-6 h-6 animate-spin" />
                                ) : (
                                    <>
                                        <span>Enter Dashboard</span>
                                        <Sparkles className="w-5 h-5 text-emerald-300 group-hover:scale-110 transition-transform" />
                                    </>
                                )}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
