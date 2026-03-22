"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase, Profile } from "@/lib/supabase";
import CitizenSidebar, { SidebarView } from "@/components/citizen/Sidebar";
import UniversalSearchBar from "@/components/citizen/UniversalSearchBar";
import ActivityGrid from "@/components/citizen/ActivityGrid";
import ComplaintFeed from "@/components/citizen/ComplaintFeed";
import OnboardingModal from "@/components/citizen/OnboardingModal";
import { Menu, X, Loader2, Save, Mic } from "lucide-react";

export default function CitizenDashboard() {
    const router = useRouter();
    const [currentView, setCurrentView] = useState<SidebarView>("dashboard");
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [user, setUser] = useState<any>(null);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(true);
    const [showOnboarding, setShowOnboarding] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    useEffect(() => {
        const checkUser = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                router.push("/login");
            } else {
                setUser(session.user);
                
                // Check for profile
                const { data: profileData, error: profileError } = await supabase
                    .from("profiles")
                    .select("*")
                    .eq("id", session.user.id);

                const p = profileData?.[0];
                const isMissingOrPlaceholder = 
                    profileError || 
                    !profileData || 
                    profileData.length === 0 || 
                    !p?.full_name || 
                    !p?.age ||
                    !p?.annual_income ||
                    p?.full_name === "New Citizen";

                if (isMissingOrPlaceholder) {
                    setShowOnboarding(true);
                } else {
                    setProfile(profileData[0]);
                }
                setLoading(false);
            }
        };
        checkUser().catch(err => {
            console.error(err);
            setLoading(false);
        });
    }, [router]);

    if (loading) {
        return (
            <div className="h-screen w-screen flex items-center justify-center bg-background">
                <Loader2 className="w-10 h-10 animate-spin text-primary" />
            </div>
        );
    }

    const handleOnboardingComplete = (newProfile: Profile) => {
        setProfile(newProfile);
        setShowOnboarding(false);
    };

    const userName = profile?.first_name || profile?.full_name?.split(" ")[0] || user?.email?.split("@")[0] || "Citizen";

    return (
        <div className="flex flex-col md:flex-row h-screen overflow-hidden bg-background">
            {showOnboarding && user && (
                <OnboardingModal userId={user.id} onComplete={handleOnboardingComplete} />
            )}

            {/* Mobile Header */}
            <div className="md:hidden flex items-center justify-between px-4 py-3 border-b bg-card z-30 shadow-sm">
                <div className="flex items-center space-x-2">
                    <div className="inline-block px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold tracking-wide">
                        Citizen
                    </div>
                    <h2 className="text-lg font-bold tracking-tight">Astra Gov AI</h2>
                </div>
                <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 -mr-2 min-h-[44px] min-w-[44px] flex items-center justify-center focus:outline-none hover:bg-secondary rounded-full transition-colors">
                    <Menu className="w-5 h-5 flex-shrink-0" />
                </button>
            </div>

            {/* Mobile Sidebar Overlay */}
            {isMobileMenuOpen && (
                <div className="fixed inset-0 z-50 flex md:hidden">
                    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm transition-opacity" onClick={() => setIsMobileMenuOpen(false)} />
                    <div className="relative w-64 h-full bg-card shadow-2xl animate-in slide-in-from-left duration-300 flex flex-col">
                        <div className="absolute top-4 right-4 z-50">
                            <button className="p-2 text-muted-foreground hover:bg-secondary rounded-full min-h-[44px] min-w-[44px] flex items-center justify-center transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
                                <X className="w-5 h-5 flex-shrink-0" />
                            </button>
                        </div>
                        <CitizenSidebar
                            currentView={currentView}
                            onViewChange={(v) => {
                                setCurrentView(v);
                                setIsMobileMenuOpen(false);
                            }}
                        />
                    </div>
                </div>
            )}

            {/* Persistent Isolated Sidebar (Desktop) */}
            <div className="hidden md:block h-full">
                <CitizenSidebar currentView={currentView} onViewChange={setCurrentView} />
            </div>

            {/* Main Content Pane */}
            <main className={currentView === "dashboard" ? "flex-1 flex flex-col h-full w-full relative overflow-hidden" : "flex-1 flex flex-col h-full overflow-y-auto w-full relative pb-24 md:pb-0"}>

                {/* VIEW 1: Clean Dashboard (Chat View) */}
                {currentView === "dashboard" && (
                    <UniversalSearchBar userName={userName} />
                )}

                {/* VIEW 2: My Activities */}
                {currentView === "activities" && (
                    <div className="p-8 h-full flex flex-col max-w-7xl mx-auto w-full">
                        <h1 className="text-3xl font-bold tracking-tight mb-2">Activity Tracker</h1>
                        <p className="text-muted-foreground mb-8 text-lg">Manage your ongoing schemes, permits, and business guides.</p>
                        <div className="flex-1 min-h-0">
                            <ActivityGrid />
                        </div>
                    </div>
                )}

                {/* VIEW 3: Complaint Portal */}
                {currentView === "complaints" && (
                    <div className="p-8 h-full flex flex-col max-w-7xl mx-auto w-full">
                        <ComplaintFeed />
                    </div>
                )}

                {/* VIEW 4: Settings */}
                {currentView === "settings" && (
                    <div className="p-8 h-full flex flex-col max-w-7xl mx-auto w-full">
                        <h1 className="text-3xl font-bold tracking-tight mb-6">Account Settings</h1>
                        <div className="max-w-2xl bg-card rounded-[2rem] shadow-sm border p-8 space-y-8">
                            <div className="border-b pb-4 flex justify-between items-center">
                                <div>
                                    <h2 className="text-xl font-bold">Profile Details</h2>
                                    <p className="text-muted-foreground text-sm">Manage your identification and demographic info.</p>
                                </div>
                                <button 
                                    disabled={isSaving}
                                    onClick={async () => {
                                        setIsSaving(true);
                                        const { error } = await supabase
                                            .from("profiles")
                                            .update({
                                                first_name: profile?.first_name,
                                                last_name: profile?.last_name,
                                                full_name: (profile?.first_name && profile?.last_name) ? `${profile?.first_name} ${profile?.last_name}` : profile?.full_name,
                                                age: profile?.age,
                                                annual_income: profile?.annual_income,
                                                occupation: profile?.occupation,
                                                updated_at: new Date().toISOString()
                                            })
                                            .eq("id", user.id);
                                        
                                        if (error) alert("Error saving changes.");
                                        else alert("Changes saved successfully!");
                                        setIsSaving(false);
                                    }}
                                    className="px-6 py-2 bg-primary text-primary-foreground font-bold rounded-xl hover:shadow-lg transition-all flex items-center gap-2 disabled:opacity-50"
                                >
                                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                    Save Changes
                                </button>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700">First Name</label>
                                    <input 
                                        value={profile?.first_name || ""} 
                                        onChange={(e) => setProfile(prev => prev ? {...prev, first_name: e.target.value} : null)}
                                        className="w-full p-3 border-2 border-slate-100 rounded-2xl focus:border-primary/20 outline-none transition font-medium" 
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700">Last Name</label>
                                    <input 
                                        value={profile?.last_name || ""} 
                                        onChange={(e) => setProfile(prev => prev ? {...prev, last_name: e.target.value} : null)}
                                        className="w-full p-3 border-2 border-slate-100 rounded-2xl focus:border-primary/20 outline-none transition font-medium" 
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700">Age</label>
                                    <input 
                                        type="number"
                                        value={profile?.age || ""} 
                                        onChange={(e) => setProfile(prev => prev ? {...prev, age: parseInt(e.target.value)} : null)}
                                        className="w-full p-3 border-2 border-slate-100 rounded-2xl focus:border-primary/20 outline-none transition font-medium" 
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700">Annual Income</label>
                                    <input 
                                        value={profile?.annual_income || ""} 
                                        onChange={(e) => setProfile(prev => prev ? {...prev, annual_income: e.target.value} : null)}
                                        className="w-full p-3 border-2 border-slate-100 rounded-2xl focus:border-primary/20 outline-none transition font-medium" 
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700">Occupation</label>
                                    <input 
                                        value={profile?.occupation || ""} 
                                        onChange={(e) => setProfile(prev => prev ? {...prev, occupation: e.target.value} : null)}
                                        className="w-full p-3 border-2 border-slate-100 rounded-2xl focus:border-primary/20 outline-none transition font-medium" 
                                    />
                                </div>
                            </div>

                            <div className="pt-4 mt-4 border-t border-slate-100">
                                <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-3">Security & Account</h2>
                                <div className="p-4 bg-slate-50 rounded-2xl border border-dashed border-slate-200 flex justify-between items-center">
                                    <div>
                                        <p className="text-xs text-slate-500 mb-1">Authenticated Account</p>
                                        <p className="text-sm font-bold text-slate-700">{user?.email}</p>
                                    </div>
                                    <button 
                                        onClick={() => setShowDeleteConfirm(true)}
                                        className="text-xs font-bold text-destructive hover:bg-destructive/10 px-3 py-1.5 rounded-lg transition-colors"
                                    >
                                        Delete Account
                                    </button>
                                </div>

                                {showDeleteConfirm && (
                                    <div className="mt-4 p-4 bg-destructive/5 rounded-2xl border border-destructive/20 animate-in fade-in slide-in-from-top-2">
                                        <h3 className="text-sm font-bold text-destructive mb-1">Are you absolutely sure?</h3>
                                        <p className="text-xs text-muted-foreground mb-4">This will permanently delete your profile and auth account. You will lose all your data.</p>
                                        <div className="flex gap-3">
                                            <button 
                                                onClick={async () => {
                                                    setIsSaving(true);
                                                    const { error } = await supabase.rpc('delete_user');
                                                    if (error) {
                                                        alert("Error deleting account. Please make sure you ran the SQL script in Supabase.");
                                                        console.error(error);
                                                    } else {
                                                        await supabase.auth.signOut();
                                                        router.push("/login");
                                                    }
                                                    setIsSaving(false);
                                                }}
                                                className="px-4 py-2 bg-destructive text-white text-xs font-bold rounded-xl hover:bg-destructive/90 transition-colors"
                                            >
                                                Yes, Delete My Account
                                            </button>
                                            <button 
                                                onClick={() => setShowDeleteConfirm(false)}
                                                className="px-4 py-2 bg-slate-100 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-200 transition-colors"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

            </main>
        </div>
    );
}
