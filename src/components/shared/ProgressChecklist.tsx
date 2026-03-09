"use client";

import { CheckCircle2, Circle } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChecklistTask {
    name: string;
    completed: boolean;
}

interface ProgressChecklistProps {
    tasks: ChecklistTask[];
    onToggle?: (index: number) => void;
    className?: string;
}

export default function ProgressChecklist({ tasks, onToggle, className }: ProgressChecklistProps) {
    const completedCount = tasks.filter(t => t.completed).length;
    const progress = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

    return (
        <div className={cn("space-y-4", className)}>
            <div className="flex justify-between items-center text-sm font-medium">
                <span>Progress</span>
                <span>{progress}%</span>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                <div
                    className="h-full bg-primary transition-all duration-500 ease-out"
                    style={{ width: `${progress}%` }}
                />
            </div>

            {/* Task List */}
            <div className="space-y-2 pt-2">
                {tasks.map((task, index) => (
                    <div
                        key={index}
                        className="flex items-start space-x-3 cursor-pointer group"
                        onClick={() => onToggle && onToggle(index)}
                    >
                        <button className="mt-0.5 focus:outline-none flex-shrink-0">
                            {task.completed ? (
                                <CheckCircle2 className="w-5 h-5 text-green-500" />
                            ) : (
                                <Circle className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                            )}
                        </button>
                        <span className={cn(
                            "text-sm",
                            task.completed ? "text-muted-foreground line-through" : "text-foreground"
                        )}>
                            {task.name}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}
