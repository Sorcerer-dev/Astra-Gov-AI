"use client";

import { useState } from "react";
import CitizenSidebar, { SidebarView } from "@/components/citizen/Sidebar";
import UniversalSearchBar from "@/components/citizen/UniversalSearchBar";
import ActivityGrid from "@/components/citizen/ActivityGrid";
import ComplaintFeed from "@/components/citizen/ComplaintFeed";
import { Menu, X } from "lucide-react";

export default function CitizenDashboard() {
    const [currentView, setCurrentView] = useState<SidebarView>("dashboard");
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    return (
        <div className="flex flex-col md:flex-row h-screen overflow-hidden bg-background">

            {/* Mobile Header */}
            <div className="md:hidden flex items-center justify-between px-4 py-3 border-b bg-card z-30 shadow-sm">
                <div className="flex items-center space-x-2">
                    <div className="inline-block px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold tracking-wide">
                        Citizen
                    </div>
                    <h2 className="text-lg font-bold tracking-tight">Astra Gov AI</h2>
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
                        <CitizenSidebar
                            currentView={currentView}
                            onViewChange={(v) => {
                                setCurrentView(v);
                                setIsMobileMenuOpen(false);
                            }}
                        />
                    </div>
                </div>
            )}

            {/* Persistent Isolated Sidebar (Desktop) */}
            <div className="hidden md:block h-full">
                <CitizenSidebar currentView={currentView} onViewChange={setCurrentView} />
            </div>

            {/* Main Content Pane */}
            <main className="flex-1 flex flex-col h-full overflow-y-auto w-full relative pb-24 md:pb-0">

                {/* VIEW 1: Clean Dashboard (Hero View) */}
                {currentView === "dashboard" && (
                    <div className="flex-1 flex flex-col items-center justify-center -mt-20 px-4">
                        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-2 text-center text-foreground">
                            How can we help you today, Aryan?
                        </h1>
                        <p className="text-muted-foreground text-lg mb-8 text-center max-w-xl">
                            Describe your civic needs, business goals, or issues in plain English.
                        </p>
                        <UniversalSearchBar />
                    </div>
                )}

                {/* VIEW 2: My Activities */}
                {currentView === "activities" && (
                    <div className="p-8 h-full flex flex-col max-w-7xl mx-auto w-full">
                        <h1 className="text-3xl font-bold tracking-tight mb-2">Activity Tracker</h1>
                        <p className="text-muted-foreground mb-8 text-lg">Manage your ongoing schemes, permits, and business guides.</p>
                        <div className="flex-1 min-h-0">
                            <ActivityGrid />
                        </div>
                    </div>
                )}

                {/* VIEW 3: Complaint Portal */}
                {currentView === "complaints" && (
                    <div className="p-8 h-full flex flex-col max-w-7xl mx-auto w-full">
                        <ComplaintFeed />
                    </div>
                )}

                {/* VIEW 4: Settings */}
                {currentView === "settings" && (
                    <div className="p-8 h-full flex flex-col">
                        <h1 className="text-3xl font-bold tracking-tight mb-6">Account Settings</h1>
                        <div className="max-w-2xl bg-card rounded-2xl shadow-sm border p-8 space-y-6">
                            <div className="border-b pb-4">
                                <h2 className="text-lg font-semibold">Profile Details</h2>
                                <p className="text-muted-foreground text-sm">Update your public information.</p>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-sm font-medium">Full Name</label>
                                    <input disabled value="Aryan Sharma" className="w-full p-2 border rounded bg-secondary/30 text-muted-foreground cursor-not-allowed" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-sm font-medium">Age</label>
                                    <input disabled value="28" className="w-full p-2 border rounded bg-secondary/30 text-muted-foreground cursor-not-allowed" />
                                </div>
                            </div>
                            <div className="border-b pb-4 pt-4">
                                <h2 className="text-lg font-semibold">Demographic Stats</h2>
                                <p className="text-muted-foreground text-sm">Used for AI Scheme Matching</p>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-sm font-medium">Annual Income</label>
                                    <input defaultValue="₹ 3,50,000" className="w-full p-2 border rounded focus:ring-2 focus:ring-primary outline-none transition" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-sm font-medium">Occupation</label>
                                    <input defaultValue="Retail Business Owner" className="w-full p-2 border rounded focus:ring-2 focus:ring-primary outline-none transition" />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

            </main>
        </div>
    );
}
