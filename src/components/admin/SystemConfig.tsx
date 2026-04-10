import { Save, Shield, Brain, Sliders, Bell, Globe, CheckCircle2, Loader2, RefreshCcw } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";

export default function SystemConfig() {
    const [saving, setSaving] = useState(false);
    const [loading, setLoading] = useState(true);
    const [showToast, setShowToast] = useState(false);
    
    // Feature States
    const [autoCategorize, setAutoCategorize] = useState(true);
    const [anonReporting, setAnonReporting] = useState(false);
    const [publicFeed, setPublicFeed] = useState(true);
    const [showAllLocations, setShowAllLocations] = useState(true);
    const [sensitivity, setSensitivity] = useState(50);

    // Fetch current settings on load
    useEffect(() => {
        async function loadSettings() {
            setLoading(true);
            const { data, error } = await supabase
                .from('system_settings')
                .select('*')
                .eq('id', 'global')
                .single();
            
            if (data && !error) {
                setAutoCategorize(data.auto_categorize);
                setAnonReporting(data.anonymous_reporting);
                setPublicFeed(data.public_feed);
                setShowAllLocations(data.show_all_locations ?? true);
                setSensitivity(data.nlp_sensitivity);
            }
            setLoading(false);
        }
        loadSettings();
    }, []);

    const handleSave = async () => {
        setSaving(true);
        const { error } = await supabase
            .from('system_settings')
            .upsert({
                id: 'global',
                auto_categorize: autoCategorize,
                anonymous_reporting: anonReporting,
                public_feed: publicFeed,
                show_all_locations: showAllLocations,
                nlp_sensitivity: sensitivity,
                updated_at: new Date().toISOString()
            });

        if (!error) {
            setShowToast(true);
            setTimeout(() => setShowToast(false), 4000);
        } else {
            alert("Error saving config: " + error.message);
        }
        setSaving(false);
    };

    return (
        <div className="space-y-6 max-w-4xl relative">
            {/* Success Notification */}
            {showToast && (
                <div className="fixed top-24 right-10 z-[100] animate-in slide-in-from-right-4 duration-300">
                    <div className="bg-green-50 border border-green-200 text-green-800 px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3">
                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                        <div className="flex flex-col">
                            <span className="font-bold text-sm tracking-tight">Configuration Applied</span>
                            <span className="text-[10px] uppercase font-bold text-green-600/70">Global changes deployed successfully</span>
                        </div>
                    </div>
                </div>
            )}

            <div>
                <h3 className="text-2xl font-bold tracking-tight">System Configuration</h3>
                <p className="text-sm text-muted-foreground">Adjust AI thresholds, SLA rules, and platform-wide settings.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* AI Configuration */}
                <div className="bg-card border rounded-2xl p-6 space-y-4">
                    <div className="flex items-center gap-2 text-primary">
                        <Brain className="w-5 h-5" />
                        <h4 className="font-bold">AI & Eligibility Engine</h4>
                    </div>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">NLP Sensitivity ({sensitivity}%)</label>
                            <input 
                                type="range" 
                                value={sensitivity}
                                onChange={(e) => setSensitivity(parseInt(e.target.value))}
                                className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary" 
                            />
                            <div className="flex justify-between text-[10px] text-muted-foreground uppercase font-bold">
                                <span>Balanced</span>
                                <span>Strict</span>
                            </div>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">Auto-Categorize Complaints</span>
                            <button 
                                onClick={() => setAutoCategorize(!autoCategorize)}
                                className={cn(
                                    "w-10 h-5 rounded-full relative transition-colors",
                                    autoCategorize ? "bg-primary" : "bg-muted"
                                )}
                            >
                                <div className={cn(
                                    "absolute top-1 w-3 h-3 bg-white rounded-full transition-all",
                                    autoCategorize ? "right-1" : "left-1"
                                )} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* SLA Configuration */}
                <div className="bg-card border rounded-2xl p-6 space-y-4">
                    <div className="flex items-center gap-2 text-amber-600">
                        <Sliders className="w-5 h-5" />
                        <h4 className="font-bold">SLA & Deadlines</h4>
                    </div>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Default Resolution Days (General)</label>
                            <input type="number" defaultValue={7} className="w-full px-3 py-2 bg-secondary/50 border rounded-lg text-sm" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">High Priority Escalate After (Hours)</label>
                            <input type="number" defaultValue={24} className="w-full px-3 py-2 bg-secondary/50 border rounded-lg text-sm" />
                        </div>
                    </div>
                </div>

                {/* Platform Settings */}
                <div className="bg-card border rounded-2xl p-6 space-y-4 md:col-span-2">
                    <div className="flex items-center gap-2 text-indigo-600">
                        <Globe className="w-5 h-5" />
                        <h4 className="font-bold">Public Portal Visibility</h4>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="flex items-center justify-between p-4 bg-muted/20 rounded-xl border">
                            <div className="space-y-0.5">
                                <p className="text-sm font-bold">Anonymous Reporting</p>
                                <p className="text-xs text-muted-foreground">Allow non-logged users to report issues.</p>
                            </div>
                            <button 
                                onClick={() => setAnonReporting(!anonReporting)}
                                className={cn(
                                    "w-10 h-5 rounded-full relative transition-colors",
                                    anonReporting ? "bg-primary" : "bg-muted"
                                )}
                            >
                                <div className={cn(
                                    "absolute top-1 w-3 h-3 bg-white rounded-full transition-all",
                                    anonReporting ? "right-1" : "left-1"
                                )} />
                            </button>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-muted/20 rounded-xl border">
                            <div className="space-y-0.5">
                                <p className="text-sm font-bold">Public Complaint Feed</p>
                                <p className="text-xs text-muted-foreground">Show all non-private issues to visitors.</p>
                            </div>
                            <button 
                                onClick={() => setPublicFeed(!publicFeed)}
                                className={cn(
                                    "w-10 h-5 rounded-full relative transition-colors",
                                    publicFeed ? "bg-primary" : "bg-muted"
                                )}
                            >
                                <div className={cn(
                                    "absolute top-1 w-3 h-3 bg-white rounded-full transition-all",
                                    publicFeed ? "right-1" : "left-1"
                                )} />
                            </button>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-muted/20 rounded-xl border">
                            <div className="space-y-0.5">
                                <p className="text-sm font-bold">Cross-Location Visibility</p>
                                <p className="text-xs text-muted-foreground">Allow citizens to see reports from other wards.</p>
                            </div>
                            <button 
                                onClick={() => setShowAllLocations(!showAllLocations)}
                                className={cn(
                                    "w-10 h-5 rounded-full relative transition-colors",
                                    showAllLocations ? "bg-primary" : "bg-muted"
                                )}
                            >
                                <div className={cn(
                                    "absolute top-1 w-3 h-3 bg-white rounded-full transition-all",
                                    showAllLocations ? "right-1" : "left-1"
                                )} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex justify-end pt-4">
                <button 
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 px-8 py-3 bg-primary text-primary-foreground font-bold rounded-xl hover:shadow-lg transition-all disabled:opacity-50"
                >
                    {saving ? <Shield className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    <span>{saving ? "Deploying Changes..." : "Apply Global Config"}</span>
                </button>
            </div>
        </div>
    );
}
