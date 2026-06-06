"use client";

import { useState, useEffect, useCallback } from "react";
import { mockActivities } from "@/lib/mock_data";
import ActivityCard from "@/components/citizen/ActivityCard";
import { Inbox, LayoutGrid, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";

type FilterOption = "All" | "Business" | "Schemes" | "Ongoing" | "Completed";

export default function ActivityGrid() {
    const [filter, setFilter] = useState<FilterOption>("All");
    const [activities, setActivities] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchActivities = useCallback(async () => {
        setIsLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                setActivities(mockActivities);
                return;
            }

            const { data, error } = await supabase
                .from('activities')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (error) {
                console.warn("Table 'activities' might not exist yet. Using mock data.");
                setActivities(mockActivities);
            } else {
                // Merge with mock if empty to show something, or just use real data
                setActivities(data && data.length > 0 ? [...data, ...mockActivities] : mockActivities);
            }
        } catch (err) {
            console.error("Fetch error:", err);
            setActivities(mockActivities);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchActivities();
    }, [fetchActivities]);

    const filteredActivities = activities.filter(act => {
        if (filter === "All") return true;
        if (filter === "Business") return act.type === "business";
        if (filter === "Schemes") return act.type === "scheme";
        if (filter === "Ongoing") return act.status === "ongoing";
        if (filter === "Completed") return act.status === "completed";
        return true;
    });

    const filters: FilterOption[] = ["All", "Business", "Schemes", "Ongoing", "Completed"];

    return (
        <div className="h-full flex flex-col">
            {/* Filter Bar */}
            <div className="flex items-center justify-between mb-8 pb-4 border-b">
                <div className="flex items-center space-x-2 overflow-x-auto pb-2 -mb-2 no-scrollbar">
                    {filters.map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={cn(
                                "px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-colors",
                                filter === f
                                    ? "bg-primary text-primary-foreground shadow"
                                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                            )}
                        >
                            {f}
                        </button>
                    ))}
                </div>
                <div className="hidden sm:flex items-center text-muted-foreground bg-secondary px-3 py-1.5 rounded-lg text-sm font-medium">
                    <LayoutGrid className="w-4 h-4 mr-2" />
                    {filteredActivities.length} items
                </div>
            </div>

            {/* Grid Content */}
            {isLoading ? (
                <div className="flex-1 flex items-center justify-center p-12">
                    <Loader2 className="w-10 h-10 text-primary animate-spin" />
                </div>
            ) : filteredActivities.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center max-w-md mx-auto fade-in animate-in">
                    <div className="w-24 h-24 bg-secondary rounded-full flex items-center justify-center mb-6 text-muted-foreground">
                        <Inbox className="w-10 h-10" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">No activities found</h3>
                    <p className="text-muted-foreground mb-8">
                        We couldn't find any activities matching your filter. Use the Dashboard search to find new schemes or setup guides.
                    </p>
                    <button
                        onClick={() => setFilter("All")}
                        className="px-6 py-2.5 bg-primary text-primary-foreground rounded-full font-medium hover:bg-primary/90 transition shadow-sm"
                    >
                        Clear Filters
                    </button>
                </div>
            ) : (
                <div className="flex-1 overflow-y-auto pr-4 -mr-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 auto-rows-max items-start">
                        {filteredActivities.map((activity) => (
                            <div key={activity.id} className="fade-in animate-in slide-in-from-bottom-4 duration-500">
                                <ActivityCard {...activity} />
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
