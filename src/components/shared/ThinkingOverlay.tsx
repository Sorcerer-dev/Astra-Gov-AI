"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Search, FileText, CheckCircle } from "lucide-react";

const steps = [
    { id: 1, text: "Analyzing query intent...", icon: Search },
    { id: 2, text: "Searching official documents...", icon: FileText },
    { id: 3, text: "Verifying eligibility & generating response...", icon: CheckCircle },
];

export default function ThinkingOverlay({ isVisible }: { isVisible: boolean }) {
    const [currentStep, setCurrentStep] = useState(0);

    useEffect(() => {
        if (isVisible) {
            setCurrentStep(0);
            const timer1 = setTimeout(() => setCurrentStep(1), 1500);
            const timer2 = setTimeout(() => setCurrentStep(2), 3000);
            return () => {
                clearTimeout(timer1);
                clearTimeout(timer2);
            };
        }
    }, [isVisible]);

    if (!isVisible) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="flex flex-col items-center p-8 bg-card rounded-2xl shadow-2xl border"
            >
                <div className="flex space-x-2 mb-6">
                    <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ repeat: Infinity, duration: 1.5 }}
                        className="w-3 h-3 bg-primary rounded-full"
                    />
                    <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ repeat: Infinity, duration: 1.5, delay: 0.2 }}
                        className="w-3 h-3 bg-primary rounded-full"
                    />
                    <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ repeat: Infinity, duration: 1.5, delay: 0.4 }}
                        className="w-3 h-3 bg-primary rounded-full"
                    />
                </div>

                <div className="space-y-4 w-64">
                    {steps.map((step, index) => {
                        const Icon = step.icon;
                        const isActive = index === currentStep;
                        const isCompleted = index < currentStep;

                        return (
                            <motion.div
                                key={step.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{
                                    opacity: isActive || isCompleted ? 1 : 0.4,
                                    x: isActive || isCompleted ? 0 : -20
                                }}
                                className="flex items-center space-x-3"
                            >
                                <div className={`p-2 rounded-full ${isCompleted ? 'bg-green-100 text-green-600' : isActive ? 'bg-primary/20 text-primary animate-pulse' : 'bg-muted text-muted-foreground'}`}>
                                    <Icon className="w-5 h-5" />
                                </div>
                                <span className={`text-sm font-medium ${isActive ? 'text-foreground' : 'text-muted-foreground'}`}>
                                    {step.text}
                                </span>
                            </motion.div>
                        );
                    })}
                </div>
            </motion.div>
        </div>
    );
}
