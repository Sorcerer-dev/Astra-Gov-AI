"use client";

import { useState } from "react";
import { X, MapPin, Camera, UploadCloud, ChevronRight, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ReportIssueDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    mockLocation: string;
}

export default function ReportIssueDrawer({ isOpen, onClose, mockLocation }: ReportIssueDrawerProps) {
    const [step, setStep] = useState(1);

    if (!isOpen) return null;

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 transition-opacity"
                onClick={onClose}
            />

            {/* Drawer */}
            <div className="fixed inset-y-0 right-0 w-full md:w-[450px] bg-card border-l shadow-2xl z-50 flex flex-col transform transition-transform animate-in slide-in-from-right duration-300">

                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b">
                    <h2 className="text-xl font-bold tracking-tight">Report an Issue</h2>
                    <button
                        onClick={onClose}
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
                                defaultValue="There is a large uncollected pile of garbage overflowing onto the sidewalk near the municipal park entrance."
                            />
                            <div className="bg-primary/10 border-l-4 border-primary p-4 rounded-r-lg">
                                <p className="text-sm font-medium text-primary flex items-center">
                                    <CheckCircle2 className="w-4 h-4 mr-2" />
                                    AI detected Category: <span className="font-bold ml-1">Sanitation</span>
                                </p>
                            </div>
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
                                    <div>
                                        <p className="font-semibold text-sm">Detected GPS Pin</p>
                                        <p className="text-xs text-muted-foreground">{mockLocation} (Accurate to 5m)</p>
                                    </div>
                                    <button className="text-primary text-sm font-medium hover:underline">Edit</button>
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

                            <button className="w-full h-32 border-2 border-dashed rounded-xl flex flex-col items-center justify-center text-muted-foreground hover:bg-secondary/50 hover:text-foreground hover:border-primary transition-colors group">
                                <UploadCloud className="w-8 h-8 mb-2 group-hover:scale-110 transition-transform" />
                                <span className="text-sm font-medium">Tap to upload photo</span>
                            </button>

                            <div className="bg-amber-500/10 border-l-4 border-amber-500 p-4 rounded-r-lg mt-4">
                                <p className="text-xs font-medium text-amber-700">
                                    Note: False reporting negatively impacts your digital civic score. Evidence is required for High-Priority routing.
                                </p>
                            </div>
                        </div>
                    )}

                </div>

                {/* Footer Actions */}
                <div className="p-6 border-t bg-muted/20">
                    <button
                        onClick={() => {
                            if (step < 3) setStep(step + 1);
                            else {
                                // Submit logic
                                onClose();
                                setStep(1);
                            }
                        }}
                        className="w-full py-3 bg-primary text-primary-foreground font-bold rounded-xl shadow hover:bg-primary/90 transition-colors flex justify-center items-center group"
                    >
                        {step < 3 ? (
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
