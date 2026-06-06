"use client";

import { useState, useEffect } from "react";
import { X, MapPin, Camera, UploadCloud, ChevronRight, CheckCircle2, Loader2, Clock, Navigation } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";
import LocationPickerMap from "@/components/citizen/LocationPickerMap";

interface ReportIssueDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    mockLocation: string;
    onSubmitSuccess?: () => void;
}

// Simple AI category detection (maps keywords to departments)
function detectDeptAssigned(description: string): string {
    const lower = description.toLowerCase();
    if (lower.includes("garbage") || lower.includes("waste") || lower.includes("sanitation") || lower.includes("trash") || lower.includes("dump")) {
        return "Municipal Sanitation";
    }
    if (lower.includes("pothole") || lower.includes("road") || lower.includes("bridge") || lower.includes("footpath") || lower.includes("pavement")) {
        return "Public Works Department";
    }
    if (lower.includes("electric") || lower.includes("transformer") || lower.includes("power") || lower.includes("light") || lower.includes("wire")) {
        return "Electricity Board";
    }
    if (lower.includes("water") || lower.includes("pipe") || lower.includes("leak") || lower.includes("drain") || lower.includes("sewage")) {
        return "Water Supply Department";
    }
    if (lower.includes("tree") || lower.includes("park") || lower.includes("garden") || lower.includes("green")) {
        return "Parks & Recreation";
    }
    return "General Administration";
}

function detectPriority(description: string): number {
    const lower = description.toLowerCase();
    const urgentKeywords = ["danger", "emergency", "fire", "collapse", "sparking", "electrocution", "flood", "accident"];
    const highKeywords = ["broken", "overflow", "leaking", "blocked", "unsafe", "large"];
    let score = 5.0;
    for (const kw of urgentKeywords) {
        if (lower.includes(kw)) { score = Math.min(score + 2.5, 10); }
    }
    for (const kw of highKeywords) {
        if (lower.includes(kw)) { score = Math.min(score + 1.0, 10); }
    }
    return parseFloat(score.toFixed(1));
}

export default function ReportIssueDrawer({ isOpen, onClose, mockLocation, onSubmitSuccess }: ReportIssueDrawerProps) {
    const [step, setStep] = useState(1);
    const [description, setDescription] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedFile, setSelectedFile] = useState<string | null>(null);
    const [location, setLocation] = useState(mockLocation);
    const [locationLat, setLocationLat] = useState(11.6643);
    const [locationLng, setLocationLng] = useState(78.146);
    const [isMapOpen, setIsMapOpen] = useState(false);
    
    // System Config State
    const [autoCategorizeEnabled, setAutoCategorizeEnabled] = useState(true);
    const [manualDept, setManualDept] = useState("General Administration");

    useEffect(() => {
        async function loadConfig() {
            const { data } = await supabase
                .from('system_settings')
                .select('auto_categorize')
                .eq('id', 'global')
                .single();
            if (data) setAutoCategorizeEnabled(data.auto_categorize);
        }
        if (isOpen) loadConfig();
    }, [isOpen]);

    const detectedDeptAssigned = autoCategorizeEnabled ? detectDeptAssigned(description) : manualDept;
    const isSuccess = step === 4;

    const handleSubmit = async () => {
        if (!description.trim()) {
            setError("Please describe the issue before submitting.");
            return;
        }

        setIsSubmitting(true);
        setError(null);

        try {
            const { error: insertError } = await supabase.from("complaints").insert({
                description: description.trim(),
                dept_assigned: detectedDeptAssigned,
                priority_score: detectPriority(description),
                status: "Pending",
                verification_count: 0,
                location: location,
            });

            if (insertError) {
                throw insertError;
            }

            // Success - Move to success step
            setStep(4);
            onSubmitSuccess?.();
        } catch (err: any) {
            setError(err.message || "Failed to submit complaint. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        setStep(1);
        setDescription("");
        setError(null);
        setSelectedFile(null);
        setLocation(mockLocation);
        setIsMapOpen(false);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 transition-opacity"
                onClick={handleClose}
            />

            {/* Drawer */}
            <div className="fixed inset-y-0 right-0 w-full md:w-[450px] bg-card border-l shadow-2xl z-50 flex flex-col transform transition-transform animate-in slide-in-from-right duration-300">

                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b">
                    <h2 className="text-xl font-bold tracking-tight">Report an Issue</h2>
                    <button
                        onClick={handleClose}
                        className="p-2 hover:bg-secondary rounded-full transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-8">

                    {/* Steps Indicator */}
                    <div className="flex items-center space-x-2 text-sm font-medium text-muted-foreground mb-8">
                        <div className={cn("px-2.5 py-1 rounded-full", step >= 1 && step < 4 ? "bg-primary text-primary-foreground" : step === 4 ? "bg-green-600 text-white" : "bg-secondary")}>1</div>
                        <div className={cn("h-1 w-8 rounded-full", step >= 2 ? "bg-primary" : "bg-secondary")} />
                        <div className={cn("px-2.5 py-1 rounded-full", step >= 2 && step < 4 ? "bg-primary text-primary-foreground" : step === 4 ? "bg-green-600 text-white" : "bg-secondary")}>2</div>
                        <div className={cn("h-1 w-8 rounded-full", step >= 3 ? "bg-primary" : "bg-secondary")} />
                        <div className={cn("px-2.5 py-1 rounded-full", (step === 3) ? "bg-primary text-primary-foreground" : step === 4 ? "bg-green-600 text-white" : "bg-secondary")}>3</div>
                    </div>


                    {/* STEP 1: Description */}
                    {step === 1 && (
                        <div className="space-y-4 fade-in animate-in">
                            <div>
                                <h3 className="text-lg font-bold mb-1">Describe the problem</h3>
                                <p className="text-sm text-muted-foreground">Our AI will automatically categorize this and route it to the correct department.</p>
                            </div>
                            <textarea
                                className="w-full h-32 p-3 bg-secondary/50 border rounded-xl focus:ring-2 focus:ring-primary outline-none resize-none"
                                placeholder="E.g., The street light pole near the bakery is leaning dangerously after the storm..."
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                            />
                            {description.trim() && autoCategorizeEnabled && (
                                <div className="bg-primary/10 border-l-4 border-primary p-4 rounded-r-lg">
                                    <p className="text-sm font-medium text-primary flex items-center">
                                        <CheckCircle2 className="w-4 h-4 mr-2" />
                                        AI detected Category: <span className="font-bold ml-1">{detectedDeptAssigned}</span>
                                    </p>
                                </div>
                            )}

                            {description.trim() && !autoCategorizeEnabled && (
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Select Department</label>
                                    <select 
                                        value={manualDept}
                                        onChange={(e) => setManualDept(e.target.value)}
                                        className="w-full p-3 bg-secondary/50 border rounded-xl focus:ring-2 focus:ring-primary outline-none"
                                    >
                                        <option>General Administration</option>
                                        <option>Municipal Sanitation</option>
                                        <option>Public Works Department</option>
                                        <option>Electricity Board</option>
                                        <option>Water Supply Department</option>
                                        <option>Parks & Recreation</option>
                                    </select>
                                    <p className="text-[10px] text-amber-600 font-bold uppercase tracking-tight">AI Categorization is currently disabled by admin.</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* STEP 2: Location */}
                    {step === 2 && (
                        <div className="space-y-4 fade-in animate-in">
                            <div>
                                <h3 className="text-lg font-bold mb-1">Confirm Location</h3>
                                <p className="text-sm text-muted-foreground">Pick the exact location of the issue on the map.</p>
                            </div>

                            {/* Location display card */}
                            <div className="border rounded-xl overflow-hidden shadow-sm">
                                <div className="p-4 bg-card">
                                    <div className="flex items-start gap-3">
                                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                                            <MapPin className="w-5 h-5 text-blue-600" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs text-muted-foreground font-medium">Selected Location</p>
                                            <p className="text-sm font-semibold text-foreground truncate">{location}</p>
                                            <p className="text-xs text-muted-foreground mt-0.5">
                                                {locationLat.toFixed(4)}°N, {locationLng.toFixed(4)}°E
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => setIsMapOpen(true)}
                                    className="w-full py-3 bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 text-sm font-semibold border-t flex items-center justify-center gap-2 hover:from-blue-100 hover:to-indigo-100 transition-all"
                                >
                                    <Navigation className="w-4 h-4" />
                                    Open Map &amp; Choose Location
                                </button>
                            </div>

                            <div className="bg-blue-50 border-l-4 border-blue-400 p-3 rounded-r-lg">
                                <p className="text-xs font-medium text-blue-700">
                                    💡 Tip: Click "Open Map" above, then tap on the map to place a pin at the exact issue spot. You can also search by place name or use GPS.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* STEP 3: Photo & Verify */}
                    {step === 3 && (
                        <div className="space-y-4 fade-in animate-in">
                            <div>
                                <h3 className="text-lg font-bold mb-1">Visual Evidence</h3>
                                <p className="text-sm text-muted-foreground">Upload a photo. Our vision AI (Phase 4) will automatically verify validity.</p>
                            </div>

                            <input
                                type="file"
                                id="photo-upload"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    setSelectedFile(file ? file.name : null);
                                }}
                            />
                            <label
                                htmlFor="photo-upload"
                                className="w-full h-32 border-2 border-dashed rounded-xl flex flex-col items-center justify-center text-muted-foreground hover:bg-secondary/50 hover:text-foreground hover:border-primary transition-colors group cursor-pointer"
                            >
                                <UploadCloud className="w-8 h-8 mb-2 group-hover:scale-110 transition-transform" />
                                <span className="text-sm font-medium">
                                    {selectedFile ? selectedFile : "Tap to upload photo"}
                                </span>
                            </label>

                            <div className="bg-amber-500/10 border-l-4 border-amber-500 p-4 rounded-r-lg mt-4">
                                <p className="text-xs font-medium text-amber-700">
                                    Note: False reporting negatively impacts your digital civic score. Evidence is required for High-Priority routing.
                                </p>
                            </div>

                            {error && (
                                <div className="bg-red-500/10 border-l-4 border-red-500 p-4 rounded-r-lg">
                                    <p className="text-xs font-medium text-red-700">{error}</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* STEP 4: Success / SLA Confirmation */}
                    {step === 4 && (
                        <div className="flex flex-col items-center justify-center text-center space-y-6 pt-10 fade-in animate-in zoom-in group">
                            <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center animate-bounce">
                                <CheckCircle2 className="w-12 h-12" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-extrabold">Report Submitted!</h3>
                                <p className="text-muted-foreground mt-2 font-medium">Your issue is now live in the portal.</p>
                            </div>
                            
                            <div className="bg-blue-50 border border-blue-100 rounded-3xl p-6 w-full space-y-4">
                                <div className="flex items-center justify-center gap-2 text-blue-700">
                                    <Clock className="w-5 h-5" />
                                    <h4 className="font-bold">SLA Confirmation</h4>
                                </div>
                                <p className="text-sm text-blue-900/70">
                                    Your issue has been routed to **{detectedDeptAssigned}**. 
                                    Resolution expected within:
                                </p>
                                <div className="text-3xl font-black text-blue-700">5 DAYS</div>
                            </div>
                        </div>
                    )}

                </div>

                {/* Footer Actions */}
                <div className="p-6 border-t bg-muted/20">
                    {step === 4 ? (
                        <button
                            onClick={handleClose}
                            className="w-full py-4 bg-green-600 text-white font-bold rounded-xl shadow-lg hover:bg-green-700 transition-all flex justify-center items-center"
                        >
                            Done
                        </button>
                    ) : (
                        <button
                            disabled={isSubmitting}
                            onClick={() => {
                                if (step < 3) setStep(step + 1);
                                else {
                                    handleSubmit();
                                }
                            }}
                            className="w-full py-3 bg-primary text-primary-foreground font-bold rounded-xl shadow hover:bg-primary/90 transition-colors flex justify-center items-center group disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? (
                                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Submitting...</>
                            ) : step < 3 ? (
                                <>Next Step <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" /></>
                            ) : (
                                "Submit Report"
                            )}
                        </button>
                    )}
                </div>

            </div>

            {/* Map Picker Modal */}
            <LocationPickerMap
                isOpen={isMapOpen}
                onClose={() => setIsMapOpen(false)}
                onSelectLocation={(name, lat, lng) => {
                    setLocation(name);
                    setLocationLat(lat);
                    setLocationLng(lng);
                }}
                initialLat={locationLat}
                initialLng={locationLng}
            />
        </>
    );
}
