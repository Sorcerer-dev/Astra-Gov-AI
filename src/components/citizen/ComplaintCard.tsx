"use client";

import { MapPin, ShieldCheck, Eye, Clock, AlertTriangle, CheckCircle2, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { supabase } from "@/lib/supabase";

interface ComplaintCardProps {
    id: string;
    description: string;
    dept_assigned: string;
    priority_score: number;
    status: string;
    verification_count: number;
    timestamp: string;
    location: string;
    distance: string;
    isLocal: boolean;
    deadline?: string;
}

export default function ComplaintCard({
    id,
    description,
    dept_assigned,
    priority_score,
    status,
    verification_count,
    location,
    distance,
    isLocal,
    deadline
}: ComplaintCardProps) {
    const [localCount, setLocalCount] = useState(verification_count);
    const [isValidating, setIsValidating] = useState(false);
    const [hasValidated, setHasValidated] = useState(false);

    const handleValidate = async () => {
        if (isValidating || hasValidated) return;

        console.log("Citizen: Validating complaint ID:", id, "current count:", localCount);
        setIsValidating(true);
        try {
            // Increment in Supabase
            const { error } = await supabase
                .from("complaints")
                .update({ verification_count: (localCount || 0) + 1 })
                .eq("id", id);

            if (error) {
                console.error("Supabase error validating:", error);
                throw error;
            }

            console.log("Citizen: Validation successful for ID:", id);

            // Update local state
            setLocalCount(prev => (prev || 0) + 1);
            setHasValidated(true);
        } catch (err: any) {
            console.error("Caught error in validation:", err);
            alert(`Failed to validate: ${err.message || 'Unknown error'}. Check console for details.`);
        } finally {
            setIsValidating(false);
        }
    };

    const getStatusIcon = () => {
        switch (status) {
            case "Pending": return <Clock className="w-4 h-4 text-amber-500" />;
            case "In Progress": return <AlertTriangle className="w-4 h-4 text-blue-500" />;
            case "Resolved": return <CheckCircle2 className="w-4 h-4 text-green-500" />;
            default: return null;
        }
    };

    const getPriorityColor = () => {
        if (priority_score > 8) return "bg-red-100 text-red-700 border-red-200";
        if (priority_score > 5) return "bg-amber-100 text-amber-700 border-amber-200";
        return "bg-green-100 text-green-700 border-green-200";
    };

    return (
        <div className="bg-card border rounded-2xl shadow-sm hover:shadow-md transition-shadow flex flex-col overflow-hidden w-full relative">

            {/* Top Banner indicating local vs remote view status */}
            {!isLocal && (
                <div className="bg-secondary/50 border-b px-4 py-1.5 flex items-center space-x-2 text-xs font-medium text-muted-foreground">
                    <Eye className="w-3.5 h-3.5" />
                    <span>View Only Mode - Outside current geo-fence</span>
                </div>
            )}

            <div className="p-5 flex-1 flex flex-col">
                {/* Header: Location & Priority */}
                <div className="flex justify-between items-start mb-4">
                    <div className="flex flex-col space-y-1">
                        <div className="flex items-center text-sm font-medium text-muted-foreground group">
                            <MapPin className="w-4 h-4 mr-1 text-primary group-hover:text-primary/80 transition-colors" />
                            {location}
                        </div>
                        <span className="text-xs text-muted-foreground ml-5">{distance}</span>
                    </div>
                    <div className={cn("px-2.5 py-1 rounded-full text-xs font-bold border", getPriorityColor())}>
                        P-{priority_score.toFixed(1)}
                    </div>
                </div>

                {/* SLA Countdown / Escalation */}
                <div className="mb-4">
                    {deadline ? (() => {
                        const daysLeft = Math.ceil((new Date(deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                        const isOverdue = daysLeft < 0;

                        return (
                            <div className={cn(
                                "flex items-center space-x-2 px-3 py-2 rounded-xl text-xs font-bold border",
                                isOverdue 
                                    ? "bg-red-50 text-red-700 border-red-200 animate-pulse" 
                                    : daysLeft <= 1 
                                        ? "bg-amber-50 text-amber-700 border-amber-200" 
                                        : "bg-blue-50 text-blue-700 border-blue-100"
                            )}>
                                <Clock className="w-3.5 h-3.5" />
                                <span>
                                    {isOverdue 
                                        ? "ESCALATED TO HIGHER AUTHORITY" 
                                        : `TIME TO RESOLVE: ${daysLeft} DAYS LEFT`}
                                </span>
                            </div>
                        );
                    })() : (
                        <div className="flex items-center space-x-2 px-3 py-2 rounded-xl text-xs font-bold border bg-secondary/30 text-muted-foreground border-transparent italic">
                            <Clock className="w-3.5 h-3.5" />
                            <span>SLA: Processing...</span>
                        </div>
                    )}
                </div>


                {/* Content */}
                <h3 className="font-semibold text-lg leading-snug mb-2 text-foreground">{description}</h3>
                <p className="text-sm font-medium text-muted-foreground mb-6">Routed to: <span className="text-foreground">{dept_assigned}</span></p>

                {/* Status Stepper */}
                <div className="relative mt-auto pt-4 border-t">
                    <div className="flex items-center justify-between relative z-10">
                        <div className="flex flex-col items-center space-y-1">
                            <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center border-2 border-background">
                                <span className="text-[10px] font-bold">1</span>
                            </div>
                            <span className="text-[10px] font-medium text-foreground">Reported</span>
                        </div>
                        <div className="flex flex-col items-center space-y-1">
                            <div className={cn(
                                "w-6 h-6 rounded-full flex items-center justify-center border-2 border-background",
                                status === "Pending" ? "bg-secondary text-muted-foreground" : "bg-primary text-primary-foreground"
                            )}>
                                <span className="text-[10px] font-bold">2</span>
                            </div>
                            <span className={cn("text-[10px] font-medium text-center", status === "Pending" ? "text-muted-foreground" : "text-foreground")}>Actioned</span>
                        </div>
                        <div className="flex flex-col items-center space-y-1">
                            <div className={cn(
                                "w-6 h-6 rounded-full flex items-center justify-center border-2 border-background",
                                status === "Resolved" ? "bg-green-500 text-white" : "bg-secondary text-muted-foreground"
                            )}>
                                <span className="text-[10px] font-bold">3</span>
                            </div>
                            <span className={cn("text-[10px] font-medium text-center", status === "Resolved" ? "text-green-600" : "text-muted-foreground")}>Resolved</span>
                        </div>
                    </div>
                    {/* Connecting Line */}
                    <div className="absolute top-[27px] left-4 right-4 h-0.5 bg-secondary -z-10" />
                    <div className="absolute top-[27px] left-4 h-0.5 bg-primary -z-10 transition-all duration-500"
                        style={{ width: status === "Resolved" ? '100%' : status === "In Progress" ? '50%' : '0%' }}
                    />
                </div>
            </div>

            {/* Action Footer */}
            <div className="bg-muted/10 border-t p-4 flex items-center justify-between">
                <div className="flex items-center space-x-1.5 text-sm font-medium">
                    <ShieldCheck className="w-4 h-4 text-green-600" />
                    <span>{localCount} Verified</span>
                </div>

                {isLocal ? (
                    <button
                        onClick={handleValidate}
                        disabled={isValidating || hasValidated}
                        className={cn(
                            "px-4 py-2 text-sm font-semibold rounded-lg transition-colors flex items-center space-x-1",
                            hasValidated 
                                ? "bg-green-100 text-green-700 cursor-default" 
                                : "bg-primary/10 hover:bg-primary/20 text-primary"
                        )}
                    >
                        {isValidating ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <ShieldCheck className="w-4 h-4" />
                        )}
                        <span>{hasValidated ? "Validated" : "Validate"}</span>
                    </button>
                ) : (
                    <button disabled className="px-4 py-2 bg-secondary/50 text-muted-foreground text-sm font-medium rounded-lg cursor-not-allowed">
                        Geo-Locked
                    </button>
                )}
            </div>

        </div>
    );
}
