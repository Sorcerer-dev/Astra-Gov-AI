import { mockComplaints } from "@/lib/mock_data";
import { AlertTriangle, Clock, MoreVertical, ShieldCheck } from "lucide-react";

export default function PriorityTriageTable() {
    return (
        <div className="bg-card border rounded-2xl shadow-sm overflow-hidden">
            <div className="p-6 border-b flex justify-between items-center">
                <div>
                    <h3 className="text-xl font-bold">Complaint Triage</h3>
                    <p className="text-sm text-muted-foreground">Monitor and manage incoming civic issues</p>
                </div>
                <button className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg text-sm font-medium hover:bg-secondary/80 transition-colors">
                    Filter Options
                </button>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full min-w-[800px] text-sm text-left">
                    <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b">
                        <tr>
                            <th className="px-6 py-4 font-semibold">Complaint ID</th>
                            <th className="px-6 py-4 font-semibold">Description</th>
                            <th className="px-6 py-4 font-semibold">Department</th>
                            <th className="px-6 py-4 font-semibold">Priority</th>
                            <th className="px-6 py-4 font-semibold">Verifications</th>
                            <th className="px-6 py-4 font-semibold">Status</th>
                            <th className="px-6 py-4 font-semibold text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {mockComplaints.map((comp) => (
                            <tr key={comp.id} className="hover:bg-muted/20 transition-colors">
                                <td className="px-6 py-4 font-mono text-muted-foreground">{comp.id}</td>
                                <td className="px-6 py-4 font-medium max-w-xs truncate">{comp.description}</td>
                                <td className="px-6 py-4">
                                    <span className="px-2 py-1 bg-secondary text-secondary-foreground rounded-md text-xs font-semibold">
                                        {comp.department}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center space-x-1.5 text-red-600 font-semibold">
                                        <AlertTriangle className="w-4 h-4" />
                                        <span>{comp.priority_score}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center space-x-1.5 font-medium">
                                        <ShieldCheck className="w-4 h-4 text-amber-500" />
                                        <span>{comp.verification_count} verified</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded-md text-xs font-semibold ${comp.status === "Resolved" ? "bg-green-100 text-green-700" :
                                        comp.status === "In Progress" ? "bg-blue-100 text-blue-700" :
                                            "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                                        }`}>
                                        {comp.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex items-center justify-end space-x-3">
                                        <button className="flex items-center space-x-1 px-3 py-1.5 bg-yellow-400 text-yellow-950 font-bold rounded shadow-sm hover:bg-yellow-500 transition-colors text-xs uppercase tracking-wide">
                                            <ShieldCheck className="w-3.5 h-3.5" />
                                            <span>Verify</span>
                                        </button>
                                        <button className="p-1.5 text-muted-foreground hover:bg-secondary rounded-lg transition-colors">
                                            <MoreVertical className="w-4 h-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
