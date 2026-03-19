"use client";

import { useState } from "react";
import { X, MapPin, Camera, UploadCloud, ChevronRight, CheckCircle2, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";

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
    const [isEditingLocation, setIsEditingLocation] = useState(false);

    const detectedDeptAssigned = detectDeptAssigned(description);

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

            // Success - reset and close
            setDescription("");
            setStep(1);
            onClose();
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
        setIsEditingLocation(false);
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
                        <div className={cn("px-2.5 py-1 rounded-full", step >= 1 ? "bg-primary text-primary-foreground" : "bg-secondary")}>1</div>
                        <div className={cn("h-1 w-8 rounded-full", step >= 2 ? "bg-primary" : "bg-secondary")} />
                        <div className={cn("px-2.5 py-1 rounded-full", step >= 2 ? "bg-primary text-primary-foreground" : "bg-secondary")}>2</div>
                        <div className={cn("h-1 w-8 rounded-full", step >= 3 ? "bg-primary" : "bg-secondary")} />
                        <div className={cn("px-2.5 py-1 rounded-full", step >= 3 ? "bg-primary text-primary-foreground" : "bg-secondary")}>3</div>
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
                            {description.trim() && (
                                <div className="bg-primary/10 border-l-4 border-primary p-4 rounded-r-lg">
                                    <p className="text-sm font-medium text-primary flex items-center">
                                        <CheckCircle2 className="w-4 h-4 mr-2" />
                                        AI detected Category: <span className="font-bold ml-1">{detectedDeptAssigned}</span>
                                    </p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* STEP 2: Location */}
                    {step === 2 && (
                        <div className="space-y-4 fade-in animate-in">
                            <div>
                                <h3 className="text-lg font-bold mb-1">Confirm Location</h3>
                                <p className="text-sm text-muted-foreground">We need exact coordinates to send the response team.</p>
                            </div>
                            <div className="border rounded-xl overflow-hidden shadow-sm">
                                <div className="h-40 bg-secondary flex items-center justify-center relative">
                                    <MapPin className="w-8 h-8 text-primary absolute animate-bounce" />
                                    {/* Simulated map background grid */}
                                    <svg className="absolute inset-0 w-full h-full text-muted opacity-50" fill="none" stroke="currentColor" viewBox="0 0 100 100">
                                        <path d="M0 20 L 100 20 M 0 40 L 100 40 M 0 60 L 100 60 M 0 80 L 100 80" strokeWidth="0.5" />
                                        <path d="M20 0 L 20 100 M 40 0 L 40 100 M 60 0 L 60 100 M 80 0 L 80 100" strokeWidth="0.5" />
                                    </svg>
                                </div>
                                <div className="p-4 bg-card flex justify-between items-center">
                                    <div className="flex-1 mr-4">
                                        <p className="font-semibold text-sm">Detected GPS Pin</p>
                                        {isEditingLocation ? (
                                            <input
                                                className="w-full text-xs bg-secondary/50 border rounded px-2 py-1 focus:ring-1 focus:ring-primary outline-none mt-1"
                                                value={location}
                                                onChange={(e) => setLocation(e.target.value)}
                                                autoFocus
                                            />
                                        ) : (
                                            <p className="text-xs text-muted-foreground">{location} (Accurate to 5m)</p>
                                        )}
                                    </div>
                                    <button
                                        onClick={() => setIsEditingLocation(!isEditingLocation)}
                                        className="text-primary text-sm font-medium hover:underline shrink-0"
                                    >
                                        {isEditingLocation ? "Save" : "Edit"}
                                    </button>
                                </div>
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

                </div>

                {/* Footer Actions */}
                <div className="p-6 border-t bg-muted/20">
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
                </div>

            </div>
        </>
    );
}
