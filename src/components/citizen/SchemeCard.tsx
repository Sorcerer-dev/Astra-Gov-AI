import { mockSchemes } from "@/lib/mock_data";
import { CheckCircle2, XCircle, FileText, BookmarkPlus } from "lucide-react";

export default function SchemeCard() {
    const scheme = mockSchemes[0]; // Displaying first scheme as example

    return (
        <div className="w-full bg-card border rounded-2xl shadow-sm overflow-hidden mb-6">
            <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-bold leading-tight">{scheme.title}</h3>
                    <button className="flex items-center space-x-2 px-3 py-1.5 bg-primary/10 text-primary rounded-full hover:bg-primary hover:text-primary-foreground transition-colors text-sm font-medium">
                        <BookmarkPlus className="w-4 h-4" />
                        <span>Save</span>
                    </button>
                </div>
                <p className="text-muted-foreground mb-6">{scheme.description}</p>

                <div className="flex items-start space-x-3 mb-6 p-4 rounded-xl bg-accent/30 border">
                    {scheme.eligibility.is_eligible ? (
                        <CheckCircle2 className="w-6 h-6 text-green-600 mt-0.5" />
                    ) : (
                        <XCircle className="w-6 h-6 text-red-600 mt-0.5" />
                    )}
                    <div>
                        <span className="font-semibold block mb-1">
                            {scheme.eligibility.is_eligible ? "Eligible" : "Not Eligible"}
                        </span>
                        <span className="text-sm text-muted-foreground">{scheme.eligibility.reasoning}</span>
                    </div>
                </div>

                {/* Document Snippet Citations */}
                {scheme.eligibility.citations.length > 0 && (
                    <div className="space-y-3">
                        <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Source Citations</h4>
                        {scheme.eligibility.citations.map((cite, i) => (
                            <div key={i} className="relative pl-4 border-l-4 border-primary/40 bg-muted/50 p-4 rounded-r-lg">
                                <div className="flex items-center space-x-2 mb-2 text-xs font-medium text-primary">
                                    <FileText className="w-4 h-4" />
                                    <span>{cite.source}</span>
                                    <span className="px-1.5 py-0.5 bg-background rounded border text-muted-foreground">Page {cite.page}</span>
                                </div>
                                <p className="font-mono text-sm text-muted-foreground break-words italic">
                                    "{cite.text}"
                                </p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
