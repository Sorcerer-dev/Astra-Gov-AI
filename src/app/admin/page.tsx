"use client";

import { useState } from "react";
import AdminSidebar, { AdminSidebarView } from "@/components/admin/Sidebar";
import KPICards from "@/components/admin/KPICards";
import PriorityTriageTable from "@/components/admin/PriorityTriageTable";
import VisualAnalyticsDashboard from "@/components/admin/VisualAnalyticsDashboard";
import { Menu, X, ShieldAlert } from "lucide-react";

export default function AdminDashboardPage() {
    const [currentView, setCurrentView] = useState<AdminSidebarView>("analytics");
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    return (
        <div className="flex flex-col md:flex-row h-screen overflow-hidden bg-background">

            {/* Mobile Header */}
            <div className="md:hidden flex items-center justify-between px-4 py-3 border-b bg-card z-30 shadow-sm">
                <div className="flex items-center space-x-2">
                    <div className="p-1.5 bg-primary text-primary-foreground rounded-lg">
                        <ShieldAlert className="w-4 h-4" />
                    </div>
                    <h2 className="text-lg font-bold tracking-tight">Command Center</h2>
                </div>
                <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 -mr-2 min-h-[44px] min-w-[44px] flex items-center justify-center focus:outline-none hover:bg-secondary rounded-full transition-colors">
                    <Menu className="w-5 h-5 flex-shrink-0" />
                </button>
            </div>

            {/* Mobile Sidebar Overlay */}
            {isMobileMenuOpen && (
                <div className="fixed inset-0 z-50 flex md:hidden">
                    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm transition-opacity" onClick={() => setIsMobileMenuOpen(false)} />
                    <div className="relative w-64 h-full bg-card shadow-2xl animate-in slide-in-from-left duration-300 flex flex-col">
                        <div className="absolute top-4 right-4 z-50">
                            <button className="p-2 text-muted-foreground hover:bg-secondary rounded-full min-h-[44px] min-w-[44px] flex items-center justify-center transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
                                <X className="w-5 h-5 flex-shrink-0" />
                            </button>
                        </div>
                        <AdminSidebar
                            currentView={currentView}
                            onViewChange={(v) => {
                                setCurrentView(v);
                                setIsMobileMenuOpen(false);
                            }}
                        />
                    </div>
                </div>
            )}

            {/* Persistent Sidebar (Desktop) */}
            <div className="hidden md:block h-full">
                <AdminSidebar currentView={currentView} onViewChange={setCurrentView} />
            </div>

            {/* Main Administrative Pane */}
            <main className="flex-1 flex flex-col h-full overflow-y-auto w-full p-4 md:p-8 max-w-[1600px] mx-auto pb-24 md:pb-8">

                {/* Universal Top KPI Overlay - Always visible on major views */}
                {(currentView === "analytics" || currentView === "triage") && (
                    <KPICards />
                )}

                {/* VIEW 1: Visual Analytics (Default) */}
                {currentView === "analytics" && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <VisualAnalyticsDashboard />
                    </div>
                )}

                {/* VIEW 2: Priority Triage Table */}
                {currentView === "triage" && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <PriorityTriageTable />
                    </div>
                )}

                {/* VIEW 3 & 4: Placeholder States */}
                {currentView === "citizens" && (
                    <div className="flex-1 border-2 border-dashed rounded-2xl flex items-center justify-center text-muted-foreground">
                        Citizen Directory Database - Phase 2 Integration Pending
                    </div>
                )}

                {currentView === "settings" && (
                    <div className="flex-1 border-2 border-dashed rounded-2xl flex items-center justify-center text-muted-foreground">
                        System Configuration Terminal
                    </div>
                )}

            </main>
        </div>
    );
}
