"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Shield, User, Lock, Mail, ArrowRight, Loader2 } from "lucide-react";

export default function LoginPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [mode, setMode] = useState<"login" | "signup">("login");
    const [role, setRole] = useState<"citizen" | "admin">("citizen");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const getFriendlyError = (msg: string): string => {
        if (msg.includes("Invalid login credentials"))
            return "Incorrect email or password. Please check your credentials.";
        if (msg.includes("Email not confirmed"))
            return "Please confirm your email first. Check your inbox for a verification link.";
        if (msg.includes("User already registered"))
            return "An account with this email already exists. Please sign in instead.";
        if (msg.includes("Password should be at least"))
            return "Password must be at least 6 characters long.";
        if (msg.toLowerCase().includes("fetch") || msg.includes("network"))
            return "Network error. Please check your internet connection and try again.";
        return msg;
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        setSuccess(null);

        try {
            const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (authError) throw authError;

            // Determine role based on email suffix
            const detectedRole = email.endsWith("@gov.in") ? "admin" : "citizen";
            
            if (detectedRole !== role) {
                await supabase.auth.signOut();
                throw new Error(`Access denied. Your account type is "${detectedRole}". Please select the correct role tab.`);
            }

            // Ensure a profile exists
            const { error: profileError } = await supabase
                .from("profiles")
                .upsert({ id: authData.user.id }, { onConflict: 'id' });

            if (profileError) {
                console.error("Profile sync error:", profileError);
            }

            const target = role === "admin" ? "/admin" : "/";
            window.location.href = target;
            
        } catch (err: any) {
            console.error("Login error:", err);
            setError(getFriendlyError(err.message || "An error occurred during login"));
            setIsLoading(false); 
        }
    };

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        setSuccess(null);

        if (email.endsWith("@gov.in")) {
            setError("Admin accounts cannot be self-registered. Please contact your IT administrator.");
            setIsLoading(false);
            return;
        }

        try {
            const { error: signupError } = await supabase.auth.signUp({
                email,
                password,
            });

            if (signupError) throw signupError;

            setSuccess("Account created! Check your email for a confirmation link, then sign in.");
            setMode("login");
        } catch (err: any) {
            console.error("Signup error:", err);
            setError(getFriendlyError(err.message || "An error occurred during signup"));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-sky-400 to-blue-800 p-4">
            <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:20px_20px]" />
            
            <div className="relative w-full max-w-md">
                {/* Logo/Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 mb-4 shadow-2xl">
                        <Shield className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">Astra Gov AI</h1>
                    <p className="text-blue-100/70 mt-2">Transparent Governance for Every Citizen</p>
                </div>

                {/* Login Card */}
                <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl overflow-hidden border border-white/20">
                    {/* Role Selector */}
                    <div className="flex p-2 bg-slate-100/50 m-6 rounded-2xl">
                        <button
                            onClick={() => setRole("citizen")}
                            className={`flex-1 flex items-center justify-center py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                                role === "citizen"
                                    ? "bg-white text-blue-600 shadow-sm"
                                    : "text-slate-500 hover:text-slate-700"
                            }`}
                        >
                            <User className="w-4 h-4 mr-2" />
                            Citizen
                        </button>
                        <button
                            onClick={() => setRole("admin")}
                            className={`flex-1 flex items-center justify-center py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                                role === "admin"
                                    ? "bg-white text-blue-600 shadow-sm"
                                    : "text-slate-500 hover:text-slate-700"
                            }`}
                        >
                            <Shield className="w-4 h-4 mr-2" />
                            Admin
                        </button>
                    </div>

                    <form onSubmit={mode === "login" ? handleLogin : handleSignup} className="p-8 pt-0 space-y-5">
                        {error && (
                            <div className="p-3 rounded-xl bg-red-50 text-red-600 text-sm border border-red-100 flex items-start gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5 shrink-0" />
                                <span>{error}</span>
                            </div>
                        )}

                        {success && (
                            <div className="p-3 rounded-xl bg-green-50 text-green-700 text-sm border border-green-100 flex items-start gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-1.5 shrink-0" />
                                <span>{success}</span>
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700 ml-1">Email Address</label>
                            <div className="relative group">
                                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder={role === "admin" ? "name@gov.in" : "name@gmail.com"}
                                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all"
                                />
                            </div>
                            {role === "admin" && (
                                <p className="text-xs text-slate-400 ml-1">Admin accounts must use a <strong>@gov.in</strong> email</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between items-center ml-1">
                                <label className="text-sm font-semibold text-slate-700">Password</label>
                            </div>
                            <div className="relative group">
                                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                                <input
                                    type="password"
                                    required
                                    minLength={6}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold text-lg shadow-lg shadow-blue-500/30 transition-all active:scale-[0.98] disabled:opacity-70 flex items-center justify-center group"
                        >
                            {isLoading ? (
                                <Loader2 className="w-6 h-6 animate-spin" />
                            ) : (
                                <>
                                    {mode === "login"
                                        ? `Sign In as ${role === "admin" ? "Admin" : "Citizen"}`
                                        : "Create Citizen Account"}
                                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>

                        {role === "citizen" && (
                            <div className="text-center pt-2">
                                <p className="text-slate-500 text-sm">
                                    {mode === "login" ? "New here?" : "Already have an account?"}
                                    <button
                                        type="button"
                                        onClick={() => { setMode(mode === "login" ? "signup" : "login"); setError(null); setSuccess(null); }}
                                        className="ml-1 font-bold text-blue-600 hover:text-blue-700"
                                    >
                                        {mode === "login" ? "Create account" : "Sign in"}
                                    </button>
                                </p>
                            </div>
                        )}

                        {role === "admin" && (
                            <div className="text-center pt-2">
                                <p className="text-slate-400 text-xs">Secure admin access only. Contact IT for account setup.</p>
                            </div>
                        )}
                    </form>
                </div>

                {/* Footer Info */}
                <div className="mt-8 text-center text-blue-100/50 text-xs uppercase tracking-widest font-semibold flex items-center justify-center space-x-4">
                    <span>Secured by Supabase</span>
                    <span className="w-1 h-1 rounded-full bg-blue-100/30" />
                    <span>Privacy Policy</span>
                    <span className="w-1 h-1 rounded-full bg-blue-100/30" />
                    <span>Terms of Service</span>
                </div>
            </div>
        </div>
    );
}
