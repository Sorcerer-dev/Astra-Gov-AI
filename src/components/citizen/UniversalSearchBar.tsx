"use client";

import { Search } from "lucide-react";
import { useState } from "react";
import ThinkingOverlay from "@/components/shared/ThinkingOverlay";

export default function UniversalSearchBar() {
    const [query, setQuery] = useState("");
    const [isThinking, setIsThinking] = useState(false);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (!query.trim()) return;
        setIsThinking(true);
        // Simulate API call
        setTimeout(() => {
            setIsThinking(false);
        }, 4500);
    };

    return (
        <div className="w-full max-w-3xl mx-auto mt-6 md:mt-12 mb-8 px-4 w-full">
            <ThinkingOverlay isVisible={isThinking} />
            <form onSubmit={handleSearch} className="relative group w-full">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Search className="h-6 w-6 text-muted-foreground group-focus-within:text-primary transition-colors" />
                </div>
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="block w-full pl-12 pr-24 py-4 text-sm md:text-lg bg-card border-2 border-transparent rounded-full shadow-lg focus:outline-none focus:ring-4 focus:ring-primary/20 focus:border-primary transition-all duration-300 placeholder:text-muted-foreground placeholder:text-sm md:placeholder:text-base"
                    placeholder="Ask about schemes, permits, or report an issue..."
                />
                <button
                    type="submit"
                    className="absolute right-2 top-2 bottom-2 px-4 md:px-6 bg-primary text-primary-foreground font-medium rounded-full hover:bg-primary/90 transition-colors text-sm md:text-base"
                >
                    Search
                </button>
            </form>
        </div>
    );
}
