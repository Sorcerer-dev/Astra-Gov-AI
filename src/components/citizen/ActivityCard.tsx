"use client";

import { CheckCircle2, Circle, ChevronDown, ChevronUp, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface ChecklistTask {
    name: string;
    completed: boolean;
}

interface ActivityCardProps {
    id?: string;
    title: string;
    progress: number;
    type: string;
    status: string;
    tasks: ChecklistTask[];
}

export default function ActivityCard({ id, title, progress: initialProgress, type, status, tasks: initialTasks }: ActivityCardProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [currentTasks, setCurrentTasks] = useState(initialTasks);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    // Calculate progress based on completed tasks
    const completedCount = currentTasks.filter(t => t.completed).length;
    const calculatedProgress = Math.round((completedCount / currentTasks.length) * 100);

    const removeActivity = () => {
        const stored = localStorage.getItem("astra_activities");
        if (stored && id) {
            const acts = JSON.parse(stored);
            const newActs = acts.filter((a: any) => a.id !== id);
            localStorage.setItem("astra_activities", JSON.stringify(newActs));
            window.dispatchEvent(new Event("astra_activity_updated"));
        }
    };

    const toggleTask = (index: number) => {
        const newTasks = [...currentTasks];
        newTasks[index].completed = !newTasks[index].completed;
        setCurrentTasks(newTasks);

        // Update localStorage to persist task toggling
        const stored = localStorage.getItem("astra_activities");
        if (stored && id) {
            const acts = JSON.parse(stored);
            const actIndex = acts.findIndex((a: any) => a.id === id);
            if (actIndex > -1) {
                acts[actIndex].tasks = newTasks;
                
                const allComplete = newTasks.every((t: any) => t.completed);
                if (allComplete) {
                   acts[actIndex].status = "completed";
                   acts[actIndex].progress = 100;
                }

                localStorage.setItem("astra_activities", JSON.stringify(acts));
                window.dispatchEvent(new Event("astra_activity_updated"));
            }
        }
    };

    return (
        <div className="bg-card border rounded-2xl shadow-sm hover:shadow-md transition-shadow flex flex-col overflow-hidden w-full max-w-md">

            {/* Top Section - Progress & Title */}
            <div className="p-5 border-b bg-muted/20 relative group">
                <div className="flex justify-between items-center mb-4">
                    <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground bg-secondary px-2 py-1 rounded">
                        {type}
                    </span>
                    <div className="flex items-center gap-2">
                        <span className={cn(
                            "text-xs font-bold px-2 py-1 rounded-full",
                            calculatedProgress === 100 ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"
                        )}>
                            {calculatedProgress === 100 ? "completed" : status}
                        </span>
                        <button 
                            onClick={() => setShowDeleteConfirm(true)}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                            title="Remove Activity"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                <h3 className="font-bold text-lg leading-tight mb-4 text-foreground pr-6">{title}</h3>

                {/* Progress Display */}
                <div className="space-y-2">
                    <div className="flex justify-between items-end">
                        <span className="text-sm font-medium text-muted-foreground">Completion</span>
                        <span className="text-2xl font-bold tracking-tight text-primary">{calculatedProgress}%</span>
                    </div>
                    <div className="w-full h-2.5 bg-secondary rounded-full overflow-hidden">
                        <div
                            className={cn(
                                "h-full transition-all duration-500 ease-out",
                                calculatedProgress === 100 ? "bg-green-500" : "bg-primary"
                            )}
                            style={{ width: `${calculatedProgress}%` }}
                        />
                    </div>
                </div>
            </div>

            {/* Task List (Collapsible / Scrollable) */}
            <div className="p-2">
                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="w-full flex items-center justify-between px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-secondary rounded-lg transition-colors min-h-[44px]"
                >
                    <span>View Tasks ({completedCount}/{currentTasks.length})</span>
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>

                {isExpanded && (
                    <div className="px-3 py-2 mt-2 space-y-3 max-h-64 overflow-y-auto no-scrollbar border-t pt-4">
                        {currentTasks.map((task, index) => (
                            <div 
                                key={index} 
                                onClick={() => toggleTask(index)}
                                className="flex items-start space-x-3 group cursor-pointer hover:bg-secondary/30 p-1.5 rounded-lg transition-colors"
                            >
                                <div className="mt-0.5 flex-shrink-0">
                                    {task.completed ? (
                                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                                    ) : (
                                        <Circle className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                                    )}
                                </div>
                                <span className={cn(
                                    "text-sm transition-all",
                                    task.completed ? "text-muted-foreground line-through" : "text-foreground font-medium"
                                )}>
                                    {task.name}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-card border rounded-3xl shadow-2xl p-6 max-w-sm w-full animate-in zoom-in-95 duration-200">
                        <h4 className="text-xl font-bold text-slate-900 mb-2">Delete Activity</h4>
                        <p className="text-muted-foreground text-sm mb-6">Are you sure you want to permanently delete "{title}" from your tracker? This cannot be undone.</p>
                        <div className="flex gap-3">
                            <button 
                                onClick={() => setShowDeleteConfirm(false)}
                                className="flex-1 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={() => {
                                    removeActivity();
                                    setShowDeleteConfirm(false);
                                }}
                                className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-md shadow-red-200 transition-colors"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}
