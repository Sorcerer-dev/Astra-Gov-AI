"use client";

import { useState, useRef, useEffect } from "react";
import { Mic, MicOff, Volume2, VolumeX, X, Globe, Loader2, Languages, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

const BACKEND_URL = "http://localhost:8000";

const LANGUAGES = [
    { code: "hi-IN", name: "Hindi", label: "हिन्दी" },
    { code: "ta-IN", name: "Tamil", label: "தமிழ்" },
    { code: "te-IN", name: "Telugu", label: "తెలుగు" },
    { code: "kn-IN", name: "Kannada", label: "ಕನ್ನಡ" },
    { code: "mr-IN", name: "Marathi", label: "मराठी" },
    { code: "bn-IN", name: "Bengali", label: "বাংলা" },
    { code: "en-IN", name: "English", label: "English" },
];

interface VoiceAssistantProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function VoiceAssistant({ isOpen, onClose }: VoiceAssistantProps) {
    const [selectedLang, setSelectedLang] = useState(LANGUAGES[0]);
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState("");
    const [aiAnswer, setAiAnswer] = useState("");
    const [originalAnswer, setOriginalAnswer] = useState("");
    const [translatedQuery, setTranslatedQuery] = useState("");
    const [isProcessing, setIsProcessing] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const recognitionRef = useRef<any>(null);

    useEffect(() => {
        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.stop();
            }
            window.speechSynthesis?.cancel();
        };
    }, []);

    const startListening = () => {
        setError(null);
        setAiAnswer("");
        setOriginalAnswer("");
        setTranslatedQuery("");
        setTranscript("");

        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (!SpeechRecognition) {
            setError("Speech recognition is not supported in this browser. Please use Chrome or Edge.");
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
            setTranscript(finalTranscript || interimTranscript);

            if (finalTranscript) {
                handleVoiceQuery(finalTranscript);
            }
        };

        recognition.onerror = (event: any) => {
            setIsListening(false);
            if (event.error === "not-allowed") {
                setError("Microphone access denied. Please allow microphone access in your browser settings.");
            } else {
                setError(`Speech recognition error: ${event.error}`);
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

    const handleVoiceQuery = async (text: string) => {
        setIsProcessing(true);
        setError(null);
        try {
            const response = await fetch(`${BACKEND_URL}/api/voice-chat`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    query: text,
                    language: selectedLang.name,
                }),
            });

            if (response.ok) {
                const data = await response.json();
                setAiAnswer(data.answer);
                setOriginalAnswer(data.original_answer);
                setTranslatedQuery(data.translated_query);
            } else {
                setError("Could not get a response. Please try again.");
            }
        } catch {
            setError("Could not reach the AI backend. Make sure the server is running on port 8000.");
        }
        setIsProcessing(false);
    };

    const speakAnswer = () => {
        if (!aiAnswer) return;
        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(aiAnswer);
        utterance.lang = selectedLang.code;
        utterance.rate = 0.9;
        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = () => setIsSpeaking(false);
        window.speechSynthesis.speak(utterance);
    };

    const stopSpeaking = () => {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
            <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in slide-in-from-bottom-8 duration-500">
                {/* Header */}
                <div className="p-6 pb-4 border-b bg-gradient-to-r from-violet-50 to-indigo-50 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center shadow-lg shadow-violet-200">
                            <Languages className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h2 className="text-lg font-extrabold text-slate-900">Voice Assistant</h2>
                            <p className="text-xs text-slate-500 font-medium">Speak in your language</p>
                        </div>
                    </div>
                    <button
                        onClick={() => { stopListening(); stopSpeaking(); onClose(); }}
                        className="p-2 hover:bg-white/80 rounded-xl transition-colors"
                    >
                        <X className="w-5 h-5 text-slate-500" />
                    </button>
                </div>

                <div className="p-6 space-y-5">
                    {/* Language Selector */}
                    <div className="flex flex-wrap gap-2">
                        {LANGUAGES.map((lang) => (
                            <button
                                key={lang.code}
                                onClick={() => setSelectedLang(lang)}
                                className={cn(
                                    "px-3 py-1.5 rounded-xl text-xs font-bold transition-all border",
                                    selectedLang.code === lang.code
                                        ? "bg-violet-500 text-white border-violet-500 shadow-md shadow-violet-200"
                                        : "bg-white text-slate-600 border-slate-200 hover:border-violet-300 hover:text-violet-600"
                                )}
                            >
                                <span className="mr-1">{lang.label}</span>
                            </button>
                        ))}
                    </div>

                    {/* Microphone Button */}
                    <div className="flex flex-col items-center py-4">
                        <button
                            onClick={isListening ? stopListening : startListening}
                            disabled={isProcessing}
                            className={cn(
                                "w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 shadow-xl",
                                isListening
                                    ? "bg-red-500 shadow-red-200 animate-pulse scale-110"
                                    : isProcessing
                                    ? "bg-slate-300 cursor-not-allowed"
                                    : "bg-gradient-to-br from-violet-500 to-indigo-500 shadow-violet-200 hover:scale-105 hover:shadow-2xl"
                            )}
                        >
                            {isProcessing ? (
                                <Loader2 className="w-8 h-8 text-white animate-spin" />
                            ) : isListening ? (
                                <MicOff className="w-8 h-8 text-white" />
                            ) : (
                                <Mic className="w-8 h-8 text-white" />
                            )}
                        </button>
                        <p className="mt-3 text-xs font-bold text-slate-400 uppercase tracking-widest">
                            {isProcessing ? "Processing..." : isListening ? "Listening..." : `Tap to speak in ${selectedLang.name}`}
                        </p>
                    </div>

                    {/* Transcript */}
                    {transcript && (
                        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 animate-in fade-in slide-in-from-top-2">
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">You said:</p>
                            <p className="text-sm font-medium text-slate-800">{transcript}</p>
                            {translatedQuery && selectedLang.name !== "English" && (
                                <p className="text-xs text-slate-500 mt-1 italic">→ {translatedQuery}</p>
                            )}
                        </div>
                    )}

                    {/* Error */}
                    {error && (
                        <div className="p-4 bg-red-50 border border-red-100 rounded-2xl text-red-700 text-sm font-semibold animate-in fade-in">
                            {error}
                        </div>
                    )}

                    {/* AI Answer */}
                    {aiAnswer && (
                        <div className="p-5 bg-gradient-to-br from-violet-50 to-indigo-50 rounded-2xl border border-violet-100 animate-in fade-in slide-in-from-bottom-4">
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                    <Sparkles className="w-4 h-4 text-violet-500" />
                                    <p className="text-xs font-bold text-violet-600 uppercase tracking-widest">
                                        Astra AI ({selectedLang.name})
                                    </p>
                                </div>
                                <button
                                    onClick={isSpeaking ? stopSpeaking : speakAnswer}
                                    className={cn(
                                        "p-2 rounded-xl transition-all",
                                        isSpeaking
                                            ? "bg-violet-500 text-white shadow-md"
                                            : "bg-white text-violet-500 hover:bg-violet-100 border border-violet-200"
                                    )}
                                >
                                    {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                                </button>
                            </div>
                            <p className="text-sm text-slate-800 leading-relaxed font-medium">{aiAnswer}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
