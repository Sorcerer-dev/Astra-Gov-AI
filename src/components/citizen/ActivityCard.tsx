"use client";

import { CheckCircle2, Circle, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface ChecklistTask {
    name: string;
    completed: boolean;
}

interface ActivityCardProps {
    title: string;
    progress: number;
    type: string;
    status: string;
    tasks: ChecklistTask[];
}

export default function ActivityCard({ title, progress: initialProgress, type, status, tasks: initialTasks }: ActivityCardProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [currentTasks, setCurrentTasks] = useState(initialTasks);

    // Calculate progress based on completed tasks
    const completedCount = currentTasks.filter(t => t.completed).length;
    const calculatedProgress = Math.round((completedCount / currentTasks.length) * 100);

    const toggleTask = (index: number) => {
        const newTasks = [...currentTasks];
        newTasks[index].completed = !newTasks[index].completed;
        setCurrentTasks(newTasks);
    };

    return (
        <div className="bg-card border rounded-2xl shadow-sm hover:shadow-md transition-shadow flex flex-col overflow-hidden w-full max-w-md">

            {/* Top Section - Progress & Title */}
            <div className="p-5 border-b bg-muted/20">
                <div className="flex justify-between items-center mb-4">
                    <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground bg-secondary px-2 py-1 rounded">
                        {type}
                    </span>
                    <span className={cn(
                        "text-xs font-bold px-2 py-1 rounded-full",
                        calculatedProgress === 100 ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"
                    )}>
                        {calculatedProgress === 100 ? "completed" : status}
                    </span>
                </div>

                <h3 className="font-bold text-lg leading-tight mb-4 text-foreground">{title}</h3>

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

        </div>
    );
}
