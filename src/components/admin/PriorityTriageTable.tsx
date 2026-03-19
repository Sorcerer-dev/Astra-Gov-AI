"use client";

import { useState, useEffect } from "react";
import { supabase, Complaint } from "@/lib/supabase";
import { AlertTriangle, Clock, MoreVertical, ShieldCheck, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export default function PriorityTriageTable() {
    const [complaints, setComplaints] = useState<Complaint[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const [updatingId, setUpdatingId] = useState<string | null>(null);

    async function fetchComplaints() {
        setIsLoading(true);
        try {
            const { data, error } = await supabase
                .from("complaints")
                .select("*")
                .order("priority_score", { ascending: false });

            if (error) {
                console.error("Error fetching complaints:", error);
            } else {
                setComplaints(data || []);
            }
        } catch (err) {
            console.error("Unexpected error:", err);
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        fetchComplaints();
    }, []);

    const handleVerifyRow = async (id: string, currentCount: number) => {
        console.log("Admin: Attempting to verify complaint ID:", id, "current count:", currentCount);
        setUpdatingId(id);
        try {
            const { error } = await supabase
                .from("complaints")
                .update({ verification_count: (currentCount || 0) + 1 })
                .eq("id", id);

            if (error) {
                console.error("Supabase error verifying:", error);
                throw error;
            }

            console.log("Admin: Verification successful for ID:", id);

            // Success: update local state
            setComplaints(prev => prev.map(c => 
                c.id === id ? { ...c, verification_count: (c.verification_count || 0) + 1 } : c
            ));
        } catch (err: any) {
            console.error("Caught error in admin verify:", err);
            alert(`Failed to verify: ${err.message || 'Unknown error'}. Check console for details.`);
        } finally {
            setUpdatingId(null);
        }
    };

    return (
        <div className="bg-card border rounded-2xl shadow-sm overflow-hidden">
            <div className="p-6 border-b flex justify-between items-center">
                <div>
                    <h3 className="text-xl font-bold">Complaint Triage</h3>
                    <p className="text-sm text-muted-foreground">Monitor and manage incoming civic issues</p>
                </div>
                <button 
                    onClick={() => fetchComplaints()}
                    className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg text-sm font-medium hover:bg-secondary/80 transition-colors"
                >
                    Refresh List
                </button>
            </div>

            {isLoading ? (
                <div className="flex items-center justify-center p-12">
                    <Loader2 className="w-8 h-8 text-primary animate-spin" />
                    <span className="ml-3 text-muted-foreground font-medium">Loading complaints...</span>
                </div>
            ) : complaints.length === 0 ? (
                <div className="flex items-center justify-center p-12 text-muted-foreground">
                    No complaints found in the database.
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[800px] text-sm text-left">
                        <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b">
                            <tr>
                                <th className="px-6 py-4 font-semibold">Complaint ID</th>
                                <th className="px-6 py-4 font-semibold">Description</th>
                                <th className="px-6 py-4 font-semibold">Department</th>
                                <th className="px-6 py-4 font-semibold">Priority</th>
                                <th className="px-6 py-4 font-semibold">Verifications</th>
                                <th className="px-6 py-4 font-semibold">SLA / Deadline</th>
                                <th className="px-6 py-4 font-semibold">Status</th>
                                <th className="px-6 py-4 font-semibold text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {complaints.map((comp) => (
                                <tr key={comp.id} className="hover:bg-muted/20 transition-colors">
                                    <td className="px-6 py-4 font-mono text-muted-foreground text-xs">{comp.id.slice(0, 8)}...</td>
                                    <td className="px-6 py-4 font-medium max-w-xs truncate">{comp.description}</td>
                                    <td className="px-6 py-4">
                                        <span className="px-2 py-1 bg-secondary text-secondary-foreground rounded-md text-xs font-semibold">
                                            {comp.dept_assigned}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center space-x-1.5 text-red-600 font-semibold">
                                            <AlertTriangle className="w-4 h-4" />
                                            <span>{comp.priority_score}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center space-x-1.5 font-medium">
                                            <ShieldCheck className="w-4 h-4 text-amber-500" />
                                            <span>{comp.verification_count} verified</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        {comp.deadline ? (() => {
                                            const daysLeft = Math.ceil((new Date(comp.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                                            const isOverdue = daysLeft < 0;
                                            return (
                                                <div className={cn(
                                                    "flex items-center space-x-1.5 font-bold",
                                                    isOverdue ? "text-red-600 animate-pulse" : daysLeft <= 1 ? "text-amber-600" : "text-blue-600"
                                                )}>
                                                    <Clock className="w-3.5 h-3.5" />
                                                    <span>{isOverdue ? "OVERDUE (Escalated)" : `${daysLeft}d left`}</span>
                                                </div>
                                            );
                                        })() : <span className="text-muted-foreground italic text-xs">No SLA set</span>}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-md text-xs font-semibold ${comp.status === "Resolved" ? "bg-green-100 text-green-700" :
                                            comp.status === "In Progress" ? "bg-blue-100 text-blue-700" :
                                                "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                                            }`}>
                                            {comp.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end space-x-3">
                                            <button 
                                                onClick={() => handleVerifyRow(comp.id, comp.verification_count)}
                                                disabled={updatingId === comp.id}
                                                className="flex items-center space-x-1 px-3 py-1.5 bg-yellow-400 text-yellow-950 font-bold rounded shadow-sm hover:bg-yellow-500 disabled:opacity-50 transition-colors text-xs uppercase tracking-wide"
                                            >
                                                {updatingId === comp.id ? (
                                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                                ) : (
                                                    <ShieldCheck className="w-3.5 h-3.5" />
                                                )}
                                                <span>Verify</span>
                                            </button>
                                            <button className="p-1.5 text-muted-foreground hover:bg-secondary rounded-lg transition-colors">
                                                <MoreVertical className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
