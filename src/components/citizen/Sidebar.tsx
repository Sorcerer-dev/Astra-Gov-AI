"use client";

import { useState } from "react";
import { CopyPlus, Folders, Settings as SettingsIcon, LogOut, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";

export type SidebarView = "dashboard" | "activities" | "complaints" | "settings";

interface CitizenSidebarProps {
    currentView: SidebarView;
    onViewChange: (view: SidebarView) => void;
}

export default function CitizenSidebar({ currentView, onViewChange }: CitizenSidebarProps) {
    const navItems = [
        { id: "dashboard", label: "Dashboard", icon: CopyPlus },
        { id: "activities", label: "My Activity", icon: Folders },
        { id: "complaints", label: "Complaint Portal", icon: MessageSquare },
        { id: "settings", label: "Settings", icon: SettingsIcon },
    ];

    return (
        <div className="w-64 bg-card border-r h-full flex flex-col justify-between py-6">
            <div>
                <div className="px-6 mb-8 mt-2">
                    <div className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold tracking-wide mb-1">
                        Citizen Portal
                    </div>
                    <h2 className="text-xl font-bold tracking-tight">Astra Gov AI</h2>
                </div>

                <nav className="space-y-1 px-3">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = currentView === item.id;

                        return (
                            <button
                                key={item.id}
                                onClick={() => onViewChange(item.id as SidebarView)}
                                className={cn(
                                    "w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                                    isActive
                                        ? "bg-primary/10 text-primary"
                                        : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
                                )}
                            >
                                <Icon className={cn("w-5 h-5", isActive ? "text-primary" : "text-muted-foreground")} />
                                <span>{item.label}</span>
                            </button>
                        );
                    })}
                </nav>
            </div>

            <div className="px-3">
                <button className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors">
                    <LogOut className="w-5 h-5" />
                    <span>Logout</span>
                </button>
            </div>
        </div>
    );
}
