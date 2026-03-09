import { mockAdminStats } from "@/lib/mock_data";
import { AlertCircle, CheckCircle2, ShieldCheck } from "lucide-react";

export default function KPICards() {
    return (
        <div className="grid gap-6 md:grid-cols-3 mb-8">
            <div className="bg-card border rounded-2xl p-6 shadow-sm flex items-center space-x-4">
                <div className="p-3 bg-red-100 text-red-600 rounded-xl">
                    <AlertCircle className="w-8 h-8" />
                </div>
                <div>
                    <p className="text-sm font-medium text-muted-foreground">Critical Issues</p>
                    <h3 className="text-3xl font-bold">{mockAdminStats.critical_issues}</h3>
                </div>
            </div>

            <div className="bg-card border rounded-2xl p-6 shadow-sm flex items-center space-x-4">
                <div className="p-3 bg-amber-100 text-amber-600 rounded-xl">
                    <ShieldCheck className="w-8 h-8" />
                </div>
                <div>
                    <p className="text-sm font-medium text-muted-foreground">Community Verified</p>
                    <h3 className="text-3xl font-bold">{mockAdminStats.verified_issues}</h3>
                </div>
            </div>

            <div className="bg-card border rounded-2xl p-6 shadow-sm flex items-center space-x-4">
                <div className="p-3 bg-green-100 text-green-600 rounded-xl">
                    <CheckCircle2 className="w-8 h-8" />
                </div>
                <div>
                    <p className="text-sm font-medium text-muted-foreground">Resolved Today</p>
                    <h3 className="text-3xl font-bold">{mockAdminStats.resolved_today}</h3>
                </div>
            </div>
        </div>
    );
}
