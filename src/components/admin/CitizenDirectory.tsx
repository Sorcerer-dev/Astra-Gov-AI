"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { User, Mail, Shield, Search, Loader2 } from "lucide-react";

export default function CitizenDirectory() {
    const [citizens, setCitizens] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState("");

    useEffect(() => {
        async function fetchCitizens() {
            setIsLoading(true);
            try {
                const { data, error } = await supabase
                    .from("profiles")
                    .select("*")
                    .order("full_name");

                if (error) throw error;
                setCitizens(data || []);
            } catch (err) {
                console.error("Error fetching citizens:", err);
            } finally {
                setIsLoading(false);
            }
        }
        fetchCitizens();
    }, []);

    const filteredCitizens = citizens.filter(c => 
        (c.full_name?.toLowerCase() || "").includes(search.toLowerCase()) ||
        (c.email?.toLowerCase() || "").includes(search.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h3 className="text-2xl font-bold tracking-tight">Citizen Directory</h3>
                    <p className="text-sm text-muted-foreground">Manage and view registered citizen profiles.</p>
                </div>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input 
                        type="text"
                        placeholder="Search by name or email..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-10 pr-4 py-2 bg-card border rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all w-full md:w-64"
                    />
                </div>
            </div>

            {isLoading ? (
                <div className="flex flex-col items-center justify-center p-20 border-2 border-dashed rounded-3xl bg-muted/20">
                    <Loader2 className="w-8 h-8 text-primary animate-spin mb-4" />
                    <p className="text-muted-foreground font-medium">Loading digital identity vault...</p>
                </div>
            ) : filteredCitizens.length === 0 ? (
                <div className="p-12 border-2 border-dashed rounded-3xl text-center bg-muted/20">
                    <p className="text-muted-foreground">No citizens found matching your criteria.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filteredCitizens.map((citizen) => (
                        <div key={citizen.id} className="bg-card border rounded-2xl p-6 shadow-sm hover:shadow-md transition-all group">
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold overflow-hidden">
                                    {citizen.avatar_url ? (
                                        <img 
                                            src={supabase.storage.from('avatars').getPublicUrl(citizen.avatar_url).data.publicUrl} 
                                            className="w-full h-full object-cover" 
                                            alt=""
                                            onError={(e) => {
                                                (e.target as any).src = ""; 
                                                (e.target as any).parentElement.innerText = citizen.full_name?.charAt(0) || 'U';
                                            }}
                                        />
                                    ) : (
                                        citizen.full_name?.charAt(0) || 'U'
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-bold text-lg truncate group-hover:text-primary transition-colors">
                                        {citizen.full_name || "Anonymous Citizen"}
                                    </h4>
                                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-1">
                                        <Mail className="w-3.5 h-3.5" />
                                        <p className="truncate">{citizen.id.slice(0, 8)}...</p>
                                    </div>
                                </div>
                                <Shield className="w-5 h-5 text-green-500 shrink-0" />
                            </div>
                            
                            <div className="mt-6 pt-6 border-t flex items-center justify-between text-xs font-bold uppercase tracking-wider">
                                <span className="px-2 py-1 bg-green-100 text-green-700 rounded-md">Verified</span>
                                <button className="text-primary hover:underline">View History</button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
