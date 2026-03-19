"use client";

import { useState, useEffect, useCallback } from "react";
import { mockUserLocation } from "@/lib/mock_data";
import { supabase, Complaint } from "@/lib/supabase";
import ComplaintCard from "@/components/citizen/ComplaintCard";
import ReportIssueDrawer from "@/components/citizen/ReportIssueDrawer";
import { MapPin, Filter, Loader2 } from "lucide-react";

export default function ComplaintFeed() {
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [selectedLocation, setSelectedLocation] = useState<string>(mockUserLocation);
    const [complaints, setComplaints] = useState<Complaint[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const locations = [
        mockUserLocation, // "Salem, Ward 4"
        "Chennai, Zone East",
        "Coimbatore, Central",
        "Madurai, South"
    ];

    const fetchComplaints = useCallback(async () => {
        setIsLoading(true);
        try {
            const { data, error } = await supabase
                .from("complaints")
                .select("*")
                .order("created_at", { ascending: false });

            if (error) {
                console.error("Error fetching complaints:", error);
            } else {
                setComplaints(data || []);
            }
        } catch (err) {
            console.error("Unexpected error fetching complaints:", err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchComplaints();
    }, [fetchComplaints]);

    const handleLocationChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedLocation(e.target.value);
    };

    const handleSubmitSuccess = () => {
        fetchComplaints(); // Re-fetch complaints after a new one is submitted
    };

    return (
        <div className="h-full flex flex-col pt-2">

            {/* Top Header Section (Location Switcher & Actions) */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4 border-b pb-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight mb-2">Complaint Portal</h1>
                    <p className="text-muted-foreground">View local issues, verify reports, or file a new problem.</p>
                </div>

                <div className="flex items-center space-x-3 w-full md:w-auto">
                    {/* Location Selector */}
                    <div className="relative flex-1 md:flex-none">
                        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                            <MapPin className="w-4 h-4 text-muted-foreground" />
                        </div>
                        <select
                            value={selectedLocation}
                            onChange={handleLocationChange}
                            className="w-full md:w-56 pl-9 pr-8 py-2 bg-secondary text-sm font-semibold rounded-xl appearance-none focus:outline-none focus:ring-2 focus:ring-primary shadow-sm border border-transparent focus:border-primary/20 cursor-pointer"
                        >
                            {locations.map(loc => (
                                <option key={loc} value={loc}>{loc}</option>
                            ))}
                        </select>
                    </div>

                    <button className="p-2 border rounded-xl hover:bg-secondary transition-colors shadow-sm hidden md:block">
                        <Filter className="w-4 h-4 text-muted-foreground" />
                    </button>
                    <button
                        onClick={() => setIsDrawerOpen(true)}
                        className="px-5 py-2 whitespace-nowrap bg-primary text-primary-foreground font-semibold rounded-xl shadow hover:bg-primary/90 transition"
                    >
                        + Report Issue
                    </button>
                </div>
            </div>

            {/* Grid Layout for Complaints */}
            <div className="flex-1 overflow-y-auto pr-4 -mr-4">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center p-12 mt-12 text-center fade-in animate-in">
                        <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
                        <p className="text-muted-foreground font-medium">Loading complaints...</p>
                    </div>
                ) : complaints.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-12 mt-12 text-center fade-in animate-in">
                        <div className="w-16 h-16 bg-secondary rounded-full flex justify-center items-center text-muted-foreground mb-4">
                            <MapPin className="w-8 h-8" />
                        </div>
                        <h3 className="text-xl font-bold">No issues found</h3>
                        <p className="text-muted-foreground mt-2">There are currently no reported issues. Be the first to report one!</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 auto-rows-max pb-8">
                        {complaints.map((complaint) => {
                            const isLocalMatch = selectedLocation.toLowerCase().includes(complaint.location.toLowerCase()) || 
                                               complaint.location.toLowerCase().includes(selectedLocation.toLowerCase());

                            return (
                                <div key={complaint.id} className="fade-in animate-in slide-in-from-bottom-4 duration-500">
                                    <ComplaintCard
                                        id={complaint.id}
                                        description={complaint.description}
                                        dept_assigned={complaint.dept_assigned}
                                        priority_score={complaint.priority_score}
                                        status={complaint.status}
                                        verification_count={complaint.verification_count}
                                        timestamp={complaint.created_at}
                                        location={complaint.location}
                                        distance={complaint.distance || "Nearby"}
                                        isLocal={isLocalMatch}
                                    />
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Slide-in Drawer Portal */}
            <ReportIssueDrawer
                isOpen={isDrawerOpen}
                onClose={() => setIsDrawerOpen(false)}
                mockLocation={mockUserLocation}
                onSubmitSuccess={handleSubmitSuccess}
            />
        </div>
    );
}
