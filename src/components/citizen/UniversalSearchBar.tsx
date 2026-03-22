"use client";

import { Search, CheckCircle2, XCircle, Info, ChevronRight, AlertCircle, MessageSquare, Bot, Mic, MicOff, Volume2, VolumeX, Sparkles, Languages, Loader2, User, ListPlus } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import ThinkingOverlay from "@/components/shared/ThinkingOverlay";
import { mockComplaints } from "@/lib/mock_data";
import { cn } from "@/lib/utils";
import { BACKEND_URL } from "@/lib/api-client";

const LANGUAGES = [
    { code: "hi-IN", name: "Hindi", label: "हिन्दी" },
    { code: "ta-IN", name: "Tamil", label: "தமிழ்" },
    { code: "te-IN", name: "Telugu", label: "తెలుగు" },
    { code: "kn-IN", name: "Kannada", label: "ಕನ್ನಡ" },
    { code: "mr-IN", name: "Marathi", label: "मराठी" },
    { code: "bn-IN", name: "Bengali", label: "বাংলা" },
    { code: "en-IN", name: "English", label: "English" },
];

export interface ChatMessage {
    id: string;
    query: string;
    aiAnswer: string | null;
    englishAnswer: string | null;
    showEnglish: boolean;
    isSpeaking: boolean;
    language: typeof LANGUAGES[0];
    results: any[];
    error: string | null;
    isThinking: boolean;
}

export default function UniversalSearchBar({ userName = "Citizen" }: { userName?: string }) {
    const [query, setQuery] = useState("");
    const [history, setHistory] = useState<ChatMessage[]>([]);

    // Load history on mount to avoid hydration mismatch
    useEffect(() => {
        if (typeof window !== "undefined") {
            const saved = sessionStorage.getItem("astra_chat_session");
            if (saved) {
                try {
                    setHistory(JSON.parse(saved));
                } catch (e) {
                    console.error("Failed to parse chat session", e);
                }
            }
        }
    }, []);

    const [selectedScheme, setSelectedScheme] = useState<any | null>(null);
    
    // Voice Assistant State
    const [selectedLang, setSelectedLang] = useState(LANGUAGES[6]); // English by default
    const [isListening, setIsListening] = useState(false);
    const [globalError, setGlobalError] = useState<string | null>(null);
    const [toastMessage, setToastMessage] = useState<string | null>(null);
    const recognitionRef = useRef<any>(null);
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    const isAnyThinking = history.some(m => m.isThinking);
    const showFullScreenOverlay = history.length === 1 && isAnyThinking;
    const hasSearched = history.length > 0 || isAnyThinking;

    // Stop speaking/recording on unmount
    useEffect(() => {
        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.stop();
            }
            window.speechSynthesis?.cancel();
        };
    }, []);

    // Save history to sessionStorage to retain chat when navigating tabs
    useEffect(() => {
        sessionStorage.setItem("astra_chat_session", JSON.stringify(history));
    }, [history]);

    // Auto-scroll to bottom when new AI answer streams in
    useEffect(() => {
        if (scrollContainerRef.current && hasSearched) {
            scrollContainerRef.current.scrollTo({
                top: scrollContainerRef.current.scrollHeight,
                behavior: 'smooth'
            });
        }
    }, [history.map(h => h.isThinking).join(","), history.length]);

    const showToast = (msg: string) => {
        setToastMessage(msg);
        setTimeout(() => setToastMessage(null), 4000);
    };

    const performSearch = async (searchQuery: string) => {
        const trimmedQuery = searchQuery.trim();
        if (!trimmedQuery) return;

        const messageId = Date.now().toString();
        const newMessage: ChatMessage = {
            id: messageId,
            query: trimmedQuery,
            aiAnswer: null,
            englishAnswer: null,
            showEnglish: false,
            isSpeaking: false,
            language: selectedLang,
            results: [],
            error: null,
            isThinking: true
        };

        setHistory(prev => [...prev, newMessage]);
        setQuery("");
        setGlobalError(null);

        try {
            const response = await fetch(`${BACKEND_URL}/api/voice-chat`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ 
                    query: trimmedQuery,
                    language: selectedLang.name
                }),
            });

            if (response.ok) {
                const data = await response.json();
                
                // Filter mock complaints
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

                setHistory(prev => prev.map(msg => 
                    msg.id === messageId ? { ...msg, aiAnswer: data.answer, englishAnswer: data.original_answer || null, results: filteredComplaints, isThinking: false } : msg
                ));
            } else {
                setHistory(prev => prev.map(msg => 
                    msg.id === messageId ? { ...msg, error: "Sorry, the AI assistant is currently unavailable.", isThinking: false } : msg
                ));
            }
        } catch {
            setHistory(prev => prev.map(msg => 
                msg.id === messageId ? { ...msg, error: "Could not reach the AI backend. Please check your internet connection or try again later.", isThinking: false } : msg
            ));
        }
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        stopListening();
        performSearch(query);
    };

    const startListening = () => {
        setGlobalError(null);
        setQuery("");

        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (!SpeechRecognition) {
            setGlobalError("Speech recognition is not supported in this browser. Please use Chrome or Edge.");
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.lang = selectedLang.code;
        recognition.continuous = false;
        recognition.interimResults = true;

        recognition.onstart = () => setIsListening(true);
        recognition.onend = () => setIsListening(false);

        recognition.onresult = (event: any) => {
            let finalTranscript = "";
            let interimTranscript = "";
            for (let i = event.resultIndex; i < event.results.length; i++) {
                if (event.results[i].isFinal) {
                    finalTranscript += event.results[i][0].transcript;
                } else {
                    interimTranscript += event.results[i][0].transcript;
                }
            }
            const currentTranscript = finalTranscript || interimTranscript;
            setQuery(currentTranscript);

            if (finalTranscript) {
                performSearch(finalTranscript);
            }
        };

        recognition.onerror = (event: any) => {
            setIsListening(false);
            if (event.error === "not-allowed") {
                setGlobalError("Microphone access denied. Please allow microphone access in your browser settings.");
            } else {
                setGlobalError(`Speech recognition error: ${event.error}`);
            }
        };

        recognitionRef.current = recognition;
        recognition.start();
    };

    const stopListening = () => {
        if (recognitionRef.current) {
            recognitionRef.current.stop();
        }
        setIsListening(false);
    };

    const toggleListening = () => {
        if (isListening) stopListening();
        else startListening();
    };

    const speakAnswer = (messageId: string, text: string | null, langCode: string) => {
        if (!text) return;
        window.speechSynthesis.cancel();
        
        // Mark all as not speaking, then set current to speaking
        setHistory(prev => prev.map(msg => ({ ...msg, isSpeaking: msg.id === messageId })));

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = langCode;
        utterance.rate = 0.9;
        
        utterance.onend = () => setHistory(prev => prev.map(msg => ({ ...msg, isSpeaking: false })));
        utterance.onerror = () => setHistory(prev => prev.map(msg => ({ ...msg, isSpeaking: false })));
        
        window.speechSynthesis.speak(utterance);
    };

    const stopSpeaking = () => {
        window.speechSynthesis.cancel();
        setHistory(prev => prev.map(msg => ({ ...msg, isSpeaking: false })));
    };

    const toggleEnglish = (messageId: string) => {
        setHistory(prev => prev.map(msg => 
            msg.id === messageId ? { ...msg, showEnglish: !msg.showEnglish } : msg
        ));
    };

    const extractTasksFromResponse = (text: string | null) => {
        if (!text) return null;
        
        const lines = text.split('\n');
        const tasks = [];
        
        for (const line of lines) {
            const trimmed = line.trim();
            // Matches "1. Text", "1) Text", "- Text", "* Text"
            const match = trimmed.match(/^(\d+[\.\)]|[-*])\s+(.+)$/);
            if (match && match[2].length > 5) {
                // Strip markdown bolding and formatting
                let cleanedText = match[2].replace(/\*\*/g, '').trim();
                // Make concise without splitting at abbreviations like "Rs."
                if (cleanedText.length > 130) {
                    const spaceIndex = cleanedText.lastIndexOf(' ', 130);
                    cleanedText = cleanedText.substring(0, spaceIndex > 0 ? spaceIndex : 130) + "...";
                }
                tasks.push({ name: cleanedText, completed: false });
            }
        }
        
        return tasks.length > 0 ? tasks.slice(0, 8) : null;
    };

    const handleSaveInsightToActivities = (msg: ChatMessage) => {
        const aiText = msg.showEnglish && msg.englishAnswer ? msg.englishAnswer : msg.aiAnswer;
        const extractedTasks = extractTasksFromResponse(aiText);
        
        const newActivity = {
            id: "act-" + Date.now(),
            type: "scheme",
            status: "ongoing",
            title: msg.query.length > 30 ? msg.query.substring(0, 30) + "..." : msg.query,
            progress: 0,
            tasks: extractedTasks || [
                { name: "Review official scheme guidelines", completed: false },
                { name: "Gather required identity and domain documents", completed: false },
                { name: "Submit official application", completed: false },
                { name: "Track approval and follow up", completed: false }
            ]
        };
        const stored = localStorage.getItem("astra_activities");
        const currentActivities = stored ? JSON.parse(stored) : [];
        localStorage.setItem("astra_activities", JSON.stringify([newActivity, ...currentActivities]));
        window.dispatchEvent(new Event("astra_activity_updated"));
        showToast("Saved this AI Insight as an Action Plan in your Activity Tracker!");
    };

    const handleAddToActivities = (scheme: any) => {
        const newActivity = {
            id: "act-" + Date.now(),
            type: "scheme",
            status: "ongoing",
            title: scheme.title,
            progress: 0,
            tasks: scheme.eligibility?.checklist?.length > 0
                ? scheme.eligibility.checklist.map((c: any) => ({ name: c.item, completed: c.status === "verified" }))
                : [
                    { name: "Review full eligibility criteria", completed: true },
                    { name: "Gather required identity documents", completed: false },
                    { name: "Submit official application online", completed: false },
                    { name: "Track approval status", completed: false }
                ]
        };

        const stored = localStorage.getItem("astra_activities");
        const currentActivities = stored ? JSON.parse(stored) : [];
        localStorage.setItem("astra_activities", JSON.stringify([newActivity, ...currentActivities]));
        
        window.dispatchEvent(new Event("astra_activity_updated"));
        
        showToast(`Successfully added to your Activity Tracker! You can track your document checklist in the Activities tab.`);
        setSelectedScheme(null);
    };

    return (
        <div className="flex flex-col h-full w-full relative bg-background">
            <ThinkingOverlay isVisible={showFullScreenOverlay} />
            
            {/* Scrollable Chat History Area */}
            <div 
                ref={scrollContainerRef}
                className={cn(
                    "flex-1 overflow-y-auto w-full px-4 pt-6 pb-40 transition-all duration-300",
                    !hasSearched ? "flex flex-col items-center justify-center pb-0" : ""
                )}
            >
                {!hasSearched ? (
                    <div className="w-full max-w-3xl mx-auto flex flex-col items-center justify-center -mt-20 mb-8 fade-in animate-in">
                        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4 text-center text-foreground">
                            How can we help you today, {userName}?
                        </h1>
                        <p className="text-muted-foreground text-lg text-center max-w-xl">
                            Describe your civic needs, business goals, or issues in plain English.
                        </p>
                    </div>
                ) : (
                    <div className="w-full max-w-4xl mx-auto space-y-12">
                        {history.map((msg, index) => (
                            <div key={msg.id} className="flex flex-col gap-6 fade-in animate-in slide-in-from-bottom-2">
                                
                                {/* User Query Bubble */}
                                <div className="flex items-center gap-4 self-end max-w-[90%] md:max-w-[85%]">
                                    <div className="bg-white border border-slate-200 text-slate-800 px-5 md:px-6 py-3.5 md:py-4 rounded-3xl rounded-tr-sm shadow-sm">
                                        <p className="text-[15px] md:text-lg font-semibold">{msg.query}</p>
                                    </div>
                                    <div className="shrink-0 w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center border-2 border-white shadow-sm self-start mt-1">
                                        <User className="w-5 h-5 text-slate-400" />
                                    </div>
                                </div>

                                {/* AI Response Block */}
                                <div className="self-start w-full">
                                    {msg.isThinking ? (
                                        <div className="flex items-center gap-3 text-muted-foreground ml-2">
                                            <Loader2 className="w-5 h-5 animate-spin text-primary" />
                                            <span className="text-sm font-semibold animate-pulse">Astra AI is thinking...</span>
                                        </div>
                                    ) : (
                                        <div className="w-full">
                                            {msg.error ? (
                                                <div className="p-4 bg-red-50 border border-red-100 rounded-2xl text-red-700 text-sm font-semibold flex items-center gap-3">
                                                    <AlertCircle className="w-5 h-5 shrink-0" />
                                                    <p>{msg.error}</p>
                                                </div>
                                            ) : (
                                                <>
                                                    {/* AI Insight Card */}
                                                    {msg.aiAnswer && (
                                                        <div className="bg-gradient-to-br from-primary/5 via-card to-background border-t border-b border-primary/10 py-6 md:py-8 px-4 md:px-10 relative overflow-hidden -mx-4 md:rounded-3xl md:border md:shadow-sm">
                                                            <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
                                                            
                                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5 md:mb-6 relative z-10 w-full">
                                                                <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                                                                    <Sparkles className="w-4 h-4 text-primary" />
                                                                    AI Insight
                                                                </h3>
                                                                {/* Buttons Array */}
                                                                <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
                                                                    <button 
                                                                        onClick={() => handleSaveInsightToActivities(msg)}
                                                                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] md:text-xs font-bold transition-all border shadow-sm bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100 hover:shadow-md"
                                                                    >
                                                                        <ListPlus className="w-3.5 h-3.5" />
                                                                        Save as Tracker
                                                                    </button>
                                                                    
                                                                    {msg.englishAnswer && msg.language.code !== "en-IN" && (
                                                                        <button
                                                                            onClick={() => toggleEnglish(msg.id)}
                                                                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] md:text-xs font-bold transition-all border shadow-sm bg-card text-slate-600 border-slate-200 hover:bg-slate-50 hover:shadow-md"
                                                                        >
                                                                            <Languages className="w-3.5 h-3.5" />
                                                                            {msg.showEnglish ? `View in ${msg.language.name}` : "English"}
                                                                        </button>
                                                                    )}
                                                                    <button
                                                                        onClick={() => msg.isSpeaking ? stopSpeaking() : speakAnswer(msg.id, msg.showEnglish && msg.englishAnswer ? msg.englishAnswer : msg.aiAnswer, msg.language.code)}
                                                                        className={cn(
                                                                            "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all border shadow-sm hover:shadow-md",
                                                                            msg.isSpeaking 
                                                                                ? "bg-primary text-primary-foreground border-primary" 
                                                                                : "bg-card text-primary border-primary/20 hover:bg-primary/5"
                                                                        )}
                                                                    >
                                                                        {msg.isSpeaking ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                                                                        {msg.isSpeaking ? "Stop" : `Listen in ${msg.language.name}`}
                                                                    </button>
                                                                </div>
                                                            </div>

                                                            <div className="flex flex-col md:flex-row items-start gap-4 md:gap-6 relative z-10 w-full">
                                                                <div className="shrink-0 mt-1 w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-gradient-to-br from-primary/80 to-primary flex items-center justify-center shadow-lg shadow-primary/20">
                                                                    <Bot className="w-5 h-5 md:w-6 md:h-6 text-primary-foreground" />
                                                                </div>
                                                                <div className="flex-1 min-w-0 w-full">
                                                                    <div className="flex items-center gap-3 mb-2 md:mb-3">
                                                                        <p className="text-sm md:text-base font-bold text-slate-800">Astra AI {msg.showEnglish ? "(English)" : `(${msg.language.name})`}</p>
                                                                        <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold tracking-wider uppercase">Verified</span>
                                                                    </div>
                                                                    <div className="text-slate-700 leading-relaxed font-medium text-[15px] md:text-lg whitespace-pre-wrap">
                                                                        {msg.showEnglish && msg.englishAnswer ? msg.englishAnswer : msg.aiAnswer}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* Found Documents Grid */}
                                                    {msg.results.length > 0 && (
                                                        <div className="mt-6 space-y-4">
                                                            <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground px-4">Found Documents</h3>
                                                            <div className="grid gap-3">
                                                                {msg.results.map((result) => (
                                                                    <div 
                                                                        key={result.id}
                                                                        onClick={() => {
                                                                            if (result.type === 'scheme') setSelectedScheme(result);
                                                                            else alert("This is a public report. You can view more details in the 'Complaint Portal' tab.");
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
                                                                                    result.eligibility.is_eligible ? "bg-green-100 text-green-700 border-green-200" : "bg-red-100 text-red-700 border-red-200"
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

                                                    {!msg.aiAnswer && msg.results.length === 0 && !msg.error && (
                                                        <div className="mt-4 p-8 bg-muted/20 border border-dashed rounded-3xl text-center">
                                                            <h4 className="text-lg font-bold text-slate-600">No results found for exactly this query.</h4>
                                                        </div>
                                                    )}
                                                </>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Sticky/Fixed Search Bar Section */}
            <div className={cn(
                "w-full px-4 z-40 transition-all duration-500 ease-in-out",
                !hasSearched 
                    ? "absolute top-1/2 left-0 right-0 -translate-y-1/2" 
                    : "absolute bottom-0 left-0 right-0 pb-6 pt-10 bg-gradient-to-t from-background via-background/95 to-transparent"
            )}>
                <div className="max-w-3xl mx-auto w-full relative">
                    {/* Language Selector Above Search Bar */}
                    <div className="flex justify-end mb-3">
                        <div className="flex items-center gap-2 bg-card/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-primary/20 shadow-sm text-xs group hover:border-primary/50 transition-colors">
                            <Languages className="w-4 h-4 text-primary group-hover:scale-110 transition-transform" />
                            <select 
                                value={selectedLang.code}
                                onChange={(e) => {
                                    const lang = LANGUAGES.find(l => l.code === e.target.value);
                                    if (lang) setSelectedLang(lang);
                                }}
                                className="bg-transparent border-none text-muted-foreground font-medium focus:outline-none focus:ring-0 cursor-pointer appearance-none outline-none py-1 pr-4"
                                style={{ WebkitAppearance: 'none' }}
                            >
                                {LANGUAGES.map(lang => (
                                    <option key={lang.code} value={lang.code} className="text-slate-800">
                                        {lang.name} ({lang.label})
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <form onSubmit={handleSearch} className="relative group w-full">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Search className="h-6 w-6 text-muted-foreground group-focus-within:text-primary transition-colors" />
                        </div>
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            disabled={isListening || isAnyThinking}
                            className="block w-full pl-12 pr-[120px] py-4 text-sm md:text-lg bg-card border-2 border-transparent rounded-full shadow-2xl focus:outline-none focus:ring-4 focus:ring-primary/20 focus:border-primary transition-all duration-300 placeholder:text-muted-foreground disabled:opacity-70 disabled:bg-slate-50"
                            placeholder={isListening ? `Listening in ${selectedLang.label}...` : "Ask about schemes, permits, or report an issue..."}
                        />
                        
                        {/* Voice / Mic Button */}
                        <button
                            type="button"
                            onClick={toggleListening}
                            disabled={isAnyThinking}
                            className={cn(
                                "absolute right-[96px] md:right-[120px] top-2 bottom-2 px-3 transition-colors flex items-center justify-center rounded-full duration-300 group focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed",
                                isListening 
                                    ? "text-red-500 bg-red-100 animate-pulse scale-105" 
                                    : "text-muted-foreground hover:text-primary hover:bg-primary/10"
                            )}
                            title={isListening ? "Stop listening" : "Voice search"}
                        >
                            {isListening ? <MicOff className="w-5 h-5 fill-red-100" /> : <Mic className="w-5 h-5" />}
                        </button>

                        <button
                            type="submit"
                            disabled={isListening || isAnyThinking}
                            className="absolute right-2 top-2 bottom-2 px-4 md:px-6 bg-primary text-primary-foreground font-medium rounded-full hover:bg-primary/90 transition-colors text-sm md:text-base disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            {isAnyThinking ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                            {isAnyThinking ? "Thinking" : "Search"}
                        </button>
                    </form>

                    {globalError && (
                        <div className="absolute -top-16 left-0 right-0 p-3 bg-red-50 border border-red-100 rounded-2xl text-red-700 text-sm font-semibold animate-in fade-in shadow-lg flex items-center gap-3">
                            <AlertCircle className="w-5 h-5 shrink-0" />
                            <p>{globalError}</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Scheme Eligibility Modal/Detail */}
            {selectedScheme && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm fade-in animate-in">
                    <div className="bg-card border rounded-[2rem] shadow-2xl max-w-lg w-full overflow-hidden zoom-in animate-in duration-300">
                        {/* (Omitted for brevity, kept exactly same as before but inside the fixed modal rendering) */}
                        <div className="p-6 border-b bg-muted/20 flex justify-between items-start">
                            <div>
                                <div className={cn(
                                    "inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold mb-3 shadow-sm",
                                    selectedScheme.eligibility.is_eligible ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                                )}>
                                    {selectedScheme.eligibility.is_eligible ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                                    {selectedScheme.eligibility.is_eligible ? "ELIGIBLE" : "NOT ELIGIBLE"}
                                </div>
                                <h3 className="text-xl font-extrabold leading-tight text-slate-900">{selectedScheme.title}</h3>
                            </div>
                            <button 
                                onClick={() => setSelectedScheme(null)}
                                className="p-2 hover:bg-slate-200 rounded-full transition-colors bg-white shadow-sm"
                            >
                                <AlertCircle className="w-5 h-5 text-slate-500" />
                            </button>
                        </div>
                        
                        <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
                            <div className="space-y-2">
                                <h5 className="text-xs font-bold uppercase tracking-widest text-slate-400">About Scheme</h5>
                                <p className="text-sm leading-relaxed text-slate-700 font-medium">{selectedScheme.description}</p>
                            </div>

                            <div className="bg-indigo-50/50 rounded-2xl p-5 border border-indigo-100">
                                <div className="flex items-center gap-2 mb-2 text-indigo-600">
                                    <Sparkles className="w-4 h-4" />
                                    <h5 className="text-sm font-bold">AI Eligibility Analysis</h5>
                                </div>
                                <p className="text-sm text-slate-700 italic leading-relaxed font-medium">
                                    &ldquo;{selectedScheme.eligibility.reasoning}&rdquo;
                                </p>
                            </div>

                            {selectedScheme.eligibility?.checklist?.length > 0 && (
                                <div className="space-y-3">
                                    <h5 className="text-xs font-bold uppercase tracking-widest text-slate-400">Document Requirements</h5>
                                    <div className="space-y-2">
                                        {selectedScheme.eligibility.checklist.map((item: { item: string, status: string }, idx: number) => (
                                            <div key={idx} className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-100 rounded-xl shadow-sm">
                                                <span className="text-sm font-semibold text-slate-700">{item.item}</span>
                                                <span className={cn(
                                                    "text-[10px] font-bold px-2 py-0.5 rounded-full border shadow-sm",
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

                        <div className="p-6 bg-slate-50 border-t flex flex-col sm:flex-row gap-3">
                            <button 
                                onClick={() => setSelectedScheme(null)}
                                className="sm:flex-none flex-1 px-4 py-3.5 bg-white border border-slate-200 text-slate-700 font-bold rounded-2xl hover:bg-slate-50 transition-colors shadow-sm"
                            >
                                Close
                            </button>

                            <button 
                                onClick={() => handleAddToActivities(selectedScheme)}
                                className="flex-1 px-4 py-3.5 bg-white border-2 border-primary text-primary font-bold rounded-2xl hover:bg-primary/5 transition-colors shadow-sm"
                            >
                                Save to Activity Tracker
                            </button>

                            {selectedScheme.eligibility.is_eligible && (
                                <button className="flex-1 px-4 py-3.5 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all flex items-center justify-center gap-2">
                                    <span>Apply Now</span>
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Custom Toast Notification */}
            {toastMessage && (
                <div className="fixed bottom-6 right-6 z-[100] bg-slate-900 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-bottom-5 fade-in duration-300">
                    <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center shrink-0">
                        <CheckCircle2 className="w-5 h-5 text-green-400" />
                    </div>
                    <p className="font-semibold text-sm mr-2">{toastMessage}</p>
                    <button onClick={() => setToastMessage(null)} className="ml-auto text-slate-400 hover:text-white transition-colors">
                        <XCircle className="w-5 h-5" />
                    </button>
                </div>
            )}
        </div>
    );
}
