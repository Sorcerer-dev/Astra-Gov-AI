"use client";

import { Search, CheckCircle2, XCircle, Info, ChevronRight, AlertCircle, MessageSquare, Bot, Mic } from "lucide-react";
import { useState } from "react";
import ThinkingOverlay from "@/components/shared/ThinkingOverlay";
import VoiceAssistant from "@/components/citizen/VoiceAssistant";
import { mockComplaints } from "@/lib/mock_data";
import { cn } from "@/lib/utils";

const BACKEND_URL = "http://localhost:8000";

export default function UniversalSearchBar() {
    const [query, setQuery] = useState("");
    const [isThinking, setIsThinking] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);
    const [results, setResults] = useState<any[]>([]);
    const [selectedScheme, setSelectedScheme] = useState<any | null>(null);
    const [aiAnswer, setAiAnswer] = useState<string | null>(null);
    const [showVoice, setShowVoice] = useState(false);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        const trimmedQuery = query.trim();
        if (!trimmedQuery) {
            setResults([]);
            setAiAnswer(null);
            return;
        }

        setIsThinking(true);
        setHasSearched(true);
        setResults([]);
        setAiAnswer(null);

        try {
            // Call the RAG backend
            const response = await fetch(`${BACKEND_URL}/api/chat`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ query: trimmedQuery }),
            });

            if (response.ok) {
                const data = await response.json();
                setAiAnswer(data.answer);
            } else {
                setAiAnswer("Sorry, the AI assistant is currently unavailable. Please try again later.");
            }
        } catch {
            setAiAnswer("Could not reach the AI backend. Please make sure the server is running on port 8000.");
        }

        // Also filter mock complaints for community issue results
        const filteredComplaints = mockComplaints.filter(c =>
            c.description.toLowerCase().includes(trimmedQuery.toLowerCase()) ||
            c.department.toLowerCase().includes(trimmedQuery.toLowerCase())
        ).map(c => ({
            id: c.id,
            title: `Report: ${c.description}`,
            description: `Department: ${c.department} | Status: ${c.status}`,
            type: 'complaint',
            original: c
        }));

        setResults(filteredComplaints);
        setIsThinking(false);
    };

    return (
        <div className="w-full max-w-3xl mx-auto mt-6 md:mt-12 mb-8 px-4 w-full relative">
            <ThinkingOverlay isVisible={isThinking} />
            
            <form onSubmit={handleSearch} className="relative group w-full z-10">
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
                    type="button"
                    onClick={() => setShowVoice(true)}
                    className="absolute right-[88px] md:right-[104px] top-2 bottom-2 px-3 text-muted-foreground hover:text-violet-500 transition-colors flex items-center justify-center"
                    title="Voice input"
                >
                    <Mic className="w-5 h-5" />
                </button>
                <button
                    type="submit"
                    className="absolute right-2 top-2 bottom-2 px-4 md:px-6 bg-primary text-primary-foreground font-medium rounded-full hover:bg-primary/90 transition-colors text-sm md:text-base"
                >
                    Search
                </button>
            </form>

            <VoiceAssistant isOpen={showVoice} onClose={() => setShowVoice(false)} />

            {/* Search Results */}
            {hasSearched && !isThinking && !aiAnswer && results.length === 0 && (
                <div className="mt-8 p-8 bg-muted/20 border border-dashed rounded-3xl text-center fade-in animate-in">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-secondary mb-4">
                        <Search className="w-6 h-6 text-muted-foreground" />
                    </div>
                    <h4 className="text-lg font-bold">No results found</h4>
                    <p className="text-muted-foreground text-sm max-w-xs mx-auto mt-1">
                        We couldn&apos;t find any information matching &ldquo;{query}&rdquo;. Try a broader keyword like &ldquo;scheme&rdquo; or &ldquo;eligibility&rdquo;.
                    </p>
                </div>
            )}

            {/* AI Answer Card */}
            {aiAnswer && !isThinking && (
                <div className="mt-8 fade-in animate-in slide-in-from-top-4">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground px-4 mb-3">AI Response</h3>
                    <div className="bg-primary/5 border border-primary/20 rounded-2xl p-5 shadow-sm">
                        <div className="flex items-start gap-3">
                            <div className="shrink-0 mt-0.5 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                <Bot className="w-4 h-4 text-primary" />
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-primary mb-1">Astra AI</p>
                                <p className="text-sm text-foreground/90 leading-relaxed">{aiAnswer}</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {results.length > 0 && !isThinking && (
                <div className="mt-8 space-y-4 fade-in animate-in slide-in-from-top-4">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground px-4">Search Results</h3>
                    <div className="grid gap-3">
                        {results.map((result) => (
                            <div 
                                key={result.id}
                                onClick={() => {
                                    if (result.type === 'scheme') {
                                        setSelectedScheme(result);
                                    } else {
                                        // Optional: toast or message for complaints
                                        alert("This is a public report. You can view more details in the 'Complaint Portal' tab.");
                                    }
                                }}
                                className="bg-card border rounded-2xl p-4 shadow-sm hover:shadow-md hover:border-primary/50 transition-all cursor-pointer group"
                            >
                                <div className="flex justify-between items-start gap-4">
                                    <div className="flex gap-3">
                                        <div className="mt-1 shrink-0">
                                            {result.type === 'scheme' ? (
                                                <Info className="w-5 h-5 text-primary" />
                                            ) : (
                                                <MessageSquare className="w-5 h-5 text-amber-500" />
                                            )}
                                        </div>
                                        <div className="space-y-1">
                                            <h4 className="font-bold text-foreground group-hover:text-primary transition-colors">{result.title}</h4>
                                            <p className="text-sm text-muted-foreground line-clamp-1">{result.description}</p>
                                        </div>
                                    </div>
                                    {result.type === 'scheme' && result.eligibility && (
                                        <div className={cn(
                                            "shrink-0 px-2 py-1 rounded-full text-[10px] font-bold border flex items-center gap-1",
                                            result.eligibility.is_eligible 
                                                ? "bg-green-100 text-green-700 border-green-200" 
                                                : "bg-red-100 text-red-700 border-red-200"
                                        )}>
                                            {result.eligibility.is_eligible ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                                            {result.eligibility.is_eligible ? "Eligible" : "Not Eligible"}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Scheme Eligibility Modal/Detail */}
            {selectedScheme && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-background/80 backdrop-blur-md fade-in animate-in">
                    <div className="bg-card border rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden zoom-in animate-in duration-300">
                        <div className="p-6 border-b bg-muted/20 flex justify-between items-start">
                            <div>
                                <div className={cn(
                                    "inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold mb-2",
                                    selectedScheme.eligibility.is_eligible ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                                )}>
                                    {selectedScheme.eligibility.is_eligible ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                                    {selectedScheme.eligibility.is_eligible ? "ELIGIBLE" : "NOT ELIGIBLE"}
                                </div>
                                <h3 className="text-xl font-extrabold leading-tight">{selectedScheme.title}</h3>
                            </div>
                            <button 
                                onClick={() => setSelectedScheme(null)}
                                className="p-2 hover:bg-secondary rounded-full transition-colors"
                            >
                                <AlertCircle className="w-5 h-5 text-muted-foreground" />
                            </button>
                        </div>
                        
                        <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
                            <div className="space-y-2">
                                <h5 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">About Scheme</h5>
                                <p className="text-sm leading-relaxed">{selectedScheme.description}</p>
                            </div>

                            <div className="bg-primary/5 rounded-2xl p-4 border border-primary/10">
                                <div className="flex items-center gap-2 mb-2 text-primary">
                                    <Info className="w-4 h-4" />
                                    <h5 className="text-sm font-bold">AI Eligibility Analysis</h5>
                                </div>
                                <p className="text-sm text-foreground/80 italic leading-relaxed">
                                    &ldquo;{selectedScheme.eligibility.reasoning}&rdquo;
                                </p>
                            </div>

                            {selectedScheme.eligibility?.checklist?.length > 0 && (
                                <div className="space-y-3">
                                    <h5 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Document Requirements</h5>
                                    <div className="space-y-2">
                                        {selectedScheme.eligibility.checklist.map((item: { item: string, status: string }, idx: number) => (
                                            <div key={idx} className="flex items-center justify-between p-3 bg-secondary/50 rounded-xl">
                                                <span className="text-sm font-medium">{item.item}</span>
                                                <span className={cn(
                                                    "text-[10px] font-bold px-2 py-0.5 rounded-full border",
                                                    item.status === "verified" ? "bg-green-100 text-green-700 border-green-200" : "bg-amber-100 text-amber-700 border-amber-200"
                                                )}>
                                                    {item.status.toUpperCase()}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="p-6 bg-muted/10 border-t flex gap-3">
                            <button 
                                onClick={() => setSelectedScheme(null)}
                                className="flex-1 px-4 py-3 bg-secondary text-secondary-foreground font-bold rounded-2xl hover:bg-secondary/80 transition-colors"
                            >
                                Close
                            </button>
                            {selectedScheme.eligibility.is_eligible && (
                                <button className="flex-1 px-4 py-3 bg-primary text-primary-foreground font-bold rounded-2xl hover:bg-primary/90 transition-primary flex items-center justify-center gap-2">
                                    <span>Apply Now</span>
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
