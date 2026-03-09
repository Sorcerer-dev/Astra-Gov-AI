"use client";

import { useState } from "react";
import { LayoutDashboard, ShieldAlert, Users, Settings as SettingsIcon, LogOut, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";

export type AdminSidebarView = "analytics" | "triage" | "citizens" | "settings";

interface AdminSidebarProps {
    currentView: AdminSidebarView;
    onViewChange: (view: AdminSidebarView) => void;
}

export default function AdminSidebar({ currentView, onViewChange }: AdminSidebarProps) {
    const navItems = [
        { id: "analytics", label: "Visual Analytics", icon: BarChart3 },
        { id: "triage", label: "Complaint Triage", icon: ShieldAlert },
        { id: "citizens", label: "Citizen Directory", icon: Users },
        { id: "settings", label: "System Config", icon: SettingsIcon },
    ];

    return (
        <div className="w-64 bg-card border-r h-full flex flex-col justify-between py-6">
            <div>
                <div className="px-6 mb-8 mt-2 flex items-center space-x-3">
                    <div className="p-2 bg-primary text-primary-foreground rounded-lg">
                        <ShieldAlert className="w-5 h-5" />
                    </div>
                    <h2 className="text-lg font-bold tracking-tight">Command Center</h2>
                </div>

                <nav className="space-y-1 px-3">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = currentView === item.id;

                        return (
                            <button
                                key={item.id}
                                onClick={() => onViewChange(item.id as AdminSidebarView)}
                                className={cn(
                                    "w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                                    isActive
                                        ? "bg-primary text-primary-foreground shadow-sm"
                                        : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
                                )}
                            >
                                <Icon className={cn("w-5 h-5", isActive ? "text-primary-foreground" : "text-muted-foreground")} />
                                <span>{item.label}</span>
                            </button>
                        );
                    })}
                </nav>
            </div>

            <div className="px-3 space-y-4">
                <div className="px-3 py-2">
                    <p className="text-xs uppercase tracking-wider text-muted-foreground font-bold mb-1">Nodal Officer</p>
                    <p className="text-sm font-medium">Chennai Zone East</p>
                </div>
                <button className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium hover:bg-destructive/10 text-destructive transition-colors">
                    <LogOut className="w-5 h-5" />
                    <span>Exit Center</span>
                </button>
            </div>
        </div>
    );
}
