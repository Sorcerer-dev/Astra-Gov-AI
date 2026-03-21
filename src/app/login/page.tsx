"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { isDisposableEmail } from "@/lib/disposable-emails";
import { Bot, Mail, Lock, Loader2, AlertCircle, ArrowRight, UserPlus, LogIn } from "lucide-react";
import { cn } from "@/lib/utils";

export default function LoginPage() {
    const router = useRouter();
    const [mode, setMode] = useState<"login" | "signup">("login");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [message, setMessage] = useState<string | null>(null);

    // Initial check: if already logged in, go to home
    useEffect(() => {
        const checkAuth = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                router.push("/");
            }
        };
        checkAuth();
    }, [router]);

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setMessage(null);

        if (mode === "signup") {
            // Check for disposable email
            if (isDisposableEmail(email)) {
                setError("Disposable/temporary email addresses are not allowed. Please use a valid email service.");
                setLoading(false);
                return;
            }

            const { data, error: signUpError } = await supabase.auth.signUp({
                email,
                password,
            });

            if (signUpError) {
                setError(signUpError.message);
            } else if (data.session) {
                // If auto-confirm is on (recommended for dev), go directly home
                router.push("/");
            } else {
                setMessage("Success! Please check your email to confirm your account before logging in.");
                setMode("login");
            }
        } else {
            const { error: signInError } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (signInError) {
                setError(signInError.message);
            } else {
                router.push("/");
            }
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Logo & Brand */}
                <div className="flex flex-col items-center mb-8">
                    <div className="w-16 h-16 rounded-3xl bg-primary flex items-center justify-center mb-4 shadow-xl shadow-primary/20 animate-in zoom-in duration-500">
                        <Bot className="w-8 h-8 text-primary-foreground" />
                    </div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Astra Gov AI</h1>
                    <p className="text-slate-500 mt-2 text-center text-sm font-medium">
                        Agentic Operating System for Transparent Governance
                    </p>
                </div>

                {/* Auth Card */}
                <div className="bg-white rounded-[2rem] shadow-2xl shadow-slate-200/50 border border-slate-100 p-8 pt-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
                    {/* Tabs */}
                    <div className="flex bg-slate-100 p-1.5 rounded-2xl mb-8 relative">
                        <button 
                            onClick={() => setMode("login")}
                            className={cn(
                                "flex-1 py-3 text-sm font-bold transition-all duration-300 rounded-xl relative z-10 flex items-center justify-center gap-2",
                                mode === "login" ? "text-slate-900" : "text-slate-500 hover:text-slate-700"
                            )}
                        >
                            <LogIn className="w-4 h-4" />
                            Sign In
                        </button>
                        <button 
                            onClick={() => setMode("signup")}
                            className={cn(
                                "flex-1 py-3 text-sm font-bold transition-all duration-300 rounded-xl relative z-10 flex items-center justify-center gap-2",
                                mode === "signup" ? "text-slate-900" : "text-slate-500 hover:text-slate-700"
                            )}
                        >
                            <UserPlus className="w-4 h-4" />
                            Create Account
                        </button>
                        <div 
                            className={cn(
                                "absolute top-1.5 bottom-1.5 w-[calc(50%-6px)] bg-white rounded-xl shadow-sm transition-all duration-300 ease-out",
                                mode === "signup" ? "translate-x-full" : "translate-x-0"
                            )}
                        />
                    </div>

                    <form onSubmit={handleAuth} className="space-y-5">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700 ml-1">Email Address</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within:text-primary text-slate-400">
                                    <Mail className="w-5 h-5" />
                                </div>
                                <input 
                                    type="email" 
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="name@company.com"
                                    className="block w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:border-primary/20 focus:bg-white focus:outline-none transition-all text-slate-900 placeholder:text-slate-400 font-medium"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700 ml-1">Password</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within:text-primary text-slate-400">
                                    <Lock className="w-5 h-5" />
                                </div>
                                <input 
                                    type="password" 
                                    required
                                    minLength={6}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="block w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:border-primary/20 focus:bg-white focus:outline-none transition-all text-slate-900 placeholder:text-slate-400 font-medium"
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-100 rounded-2xl text-red-700 text-sm animate-in shake duration-300">
                                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                                <span className="font-semibold leading-relaxed">{error}</span>
                            </div>
                        )}

                        {message && (
                            <div className="flex items-start gap-3 p-4 bg-emerald-50 border border-emerald-100 rounded-2xl text-emerald-700 text-sm animate-in zoom-in duration-300">
                                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                                <span className="font-semibold leading-relaxed">{message}</span>
                            </div>
                        )}

                        <button 
                            type="submit" 
                            disabled={loading}
                            className="w-full bg-primary text-primary-foreground py-4 rounded-2xl font-bold shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed group"
                        >
                            {loading ? (
                                <Loader2 className="w-6 h-6 animate-spin" />
                            ) : (
                                <>
                                    <span>{mode === "login" ? "Sign Into Dashboard" : "Create Citizen ID"}</span>
                                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-8 pt-6 border-t border-slate-100">
                        <p className="text-center text-xs text-slate-400 leading-relaxed max-w-[280px] mx-auto">
                            By continuing, you agree to Astra Gov AI's 
                            <span className="text-slate-600 font-bold mx-1 cursor-pointer hover:underline">Terms of Service</span> 
                            and 
                            <span className="text-slate-600 font-bold mx-1 cursor-pointer hover:underline">Privacy Policy</span>.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
