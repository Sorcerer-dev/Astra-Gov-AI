"use client";

import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { AlertCircle, FileText, CheckCircle2, ServerCrash, Clock, Activity, Zap, Loader2, Download } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const departmentData = [
    { name: "PWD", count: 42 },
    { name: "Electricity", count: 35 },
    { name: "Sanitation", count: 28 },
    { name: "Water Supply", count: 18 },
    { name: "Traffic", count: 12 }
];

const statusData = [
    { name: "Pending", value: 45, color: "#f59e0b" },    // amber-500
    { name: "In Progress", value: 30, color: "#3b82f6" }, // blue-500
    { name: "Resolved", value: 60, color: "#22c55e" }     // green-500
];

export default function VisualAnalyticsDashboard() {
    const [isExporting, setIsExporting] = useState(false);
    const [exportSuccess, setExportSuccess] = useState(false);

    const handleExport = () => {
        setIsExporting(true);
        // Simulate PDF/CSV generation
        setTimeout(() => {
            setIsExporting(false);
            setExportSuccess(true);
            
            // Revert success icon after 3 seconds
            setTimeout(() => setExportSuccess(false), 3000);
            
            // Actual file download simulation
            const msg = "Municipal_Health_Report_" + new Date().toISOString().split('T')[0] + ".pdf";
            console.log("Downloading " + msg);
            alert("Report Generated: " + msg + " has been saved to your downloads.");
        }, 2000);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between mb-2">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">System Analytics</h2>
                    <p className="text-muted-foreground">Live municipal health overview</p>
                </div>
                <div className="flex space-x-2">
                    <button className="px-3 py-1.5 text-sm font-medium bg-secondary text-secondary-foreground rounded-lg">Last 7 Days</button>
                    <button 
                        onClick={handleExport}
                        disabled={isExporting}
                        className={cn(
                            "px-4 py-1.5 text-sm font-bold border-2 rounded-xl flex items-center shadow-sm transition-all",
                            exportSuccess 
                                ? "bg-green-100 border-green-500 text-green-700" 
                                : "bg-card border-primary/20 text-foreground hover:border-primary/50 hover:bg-secondary"
                        )}
                    >
                        {isExporting ? (
                            <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                        ) : exportSuccess ? (
                            <CheckCircle2 className="w-4 h-4 mr-1.5 text-green-600" />
                        ) : (
                            <Download className="w-4 h-4 mr-1.5 text-primary" />
                        )}
                        {isExporting ? "Generating..." : exportSuccess ? "Exported!" : "Export Report"}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                {/* CHART 1: Resolution Pie Chart */}
                <div className="bg-card border rounded-2xl shadow-sm p-6 col-span-1 min-h-[300px] flex flex-col">
                    <h3 className="font-semibold mb-4 flex items-center space-x-2">
                        <Activity className="w-5 h-5 text-primary" />
                        <span>Resolution Status</span>
                    </h3>
                    <div className="flex-1 w-full relative">
                        <ResponsiveContainer width="100%" height={220}>
                            <PieChart>
                                <Pie
                                    data={statusData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                    stroke="none"
                                >
                                    {statusData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-4">
                            <span className="text-3xl font-bold">135</span>
                            <span className="text-xs text-muted-foreground uppercase tracking-wider">Total</span>
                        </div>
                    </div>
                    <div className="flex justify-center space-x-4 mt-2">
                        {statusData.map((stat, i) => (
                            <div key={i} className="flex items-center space-x-1.5 text-xs font-medium">
                                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: stat.color }} />
                                <span>{stat.name}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* CHART 2: Department Bar Chart */}
                <div className="bg-card border rounded-2xl shadow-sm p-6 col-span-1 lg:col-span-2 min-h-[300px] flex flex-col">
                    <h3 className="font-semibold mb-4 flex items-center space-x-2">
                        <ServerCrash className="w-5 h-5 text-primary" />
                        <span>Complaints by Department</span>
                    </h3>
                    <div className="flex-1 w-full mt-4">
                        <ResponsiveContainer width="100%" height={250}>
                            <BarChart data={departmentData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <XAxis dataKey="name" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} dy={10} />
                                <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                                <Tooltip
                                    cursor={{ fill: 'rgba(0,0,0,0.05)' }}
                                    contentStyle={{
                                        borderRadius: '8px',
                                        border: 'none',
                                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                                        backgroundColor: '#1e293b',
                                        color: '#f8fafc'
                                    }}
                                    itemStyle={{ color: '#f8fafc', fontWeight: 600 }}
                                />
                                <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={40} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* INFOGRAPHIC 3: Department Efficiency */}
                <div className="bg-card border border-primary/20 rounded-2xl shadow-sm p-6 col-span-1 md:col-span-2 relative overflow-hidden group">
                    <div className="absolute -right-16 -top-16 opacity-5 transition-transform group-hover:scale-110 duration-700">
                        <Zap className="w-64 h-64" />
                    </div>
                    <h3 className="font-semibold mb-6 flex items-center space-x-2">
                        <Zap className="w-5 h-5 text-amber-500" />
                        <span>Efficiency Infographic</span>
                    </h3>
                    <div className="space-y-5 relative z-10">
                        <div>
                            <div className="flex justify-between items-center mb-1">
                                <span className="text-sm font-medium">Electricity Board (Fastest)</span>
                                <span className="text-sm font-bold text-green-500 flex items-center"><CheckCircle2 className="w-3.5 h-3.5 mr-1" /> 4h avg</span>
                            </div>
                            <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                                <div className="h-full bg-green-500 w-[92%]" />
                            </div>
                        </div>
                        <div>
                            <div className="flex justify-between items-center mb-1">
                                <span className="text-sm font-medium">Municipal Sanitation</span>
                                <span className="text-sm font-bold text-amber-500 flex items-center"><Clock className="w-3.5 h-3.5 mr-1" /> 12h avg</span>
                            </div>
                            <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                                <div className="h-full bg-amber-500 w-[65%]" />
                            </div>
                        </div>
                        <div>
                            <div className="flex justify-between items-center mb-1">
                                <span className="text-sm font-medium">Public Works (Slowest)</span>
                                <span className="text-sm font-bold text-red-500 flex items-center"><AlertCircle className="w-3.5 h-3.5 mr-1" /> 48h+ avg</span>
                            </div>
                            <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                                <div className="h-full bg-red-500 w-[20%]" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* HEATMAP 4: Activity Hotspot CSS Sim */}
                <div className="bg-card border rounded-2xl shadow-sm p-6 col-span-1">
                    <h3 className="font-semibold mb-6 flex items-center space-x-2">
                        <Activity className="w-5 h-5 text-red-500" />
                        <span>Incident Heatmap</span>
                    </h3>
                    <div className="w-full aspect-square bg-secondary/30 rounded-xl relative overflow-hidden border">
                        {/* Map wireframe background */}
                        <svg className="absolute inset-0 w-full h-full text-muted opacity-50" fill="none" stroke="currentColor" viewBox="0 0 100 100">
                            <path d="M10 20 Q 30 10 50 30 T 90 40" strokeWidth="1" strokeDasharray="3 3" />
                            <path d="M20 80 Q 40 90 60 70 T 80 80" strokeWidth="1" strokeDasharray="3 3" />
                            <path d="M10 50 L 90 50" strokeWidth="0.5" />
                            <path d="M50 10 L 50 90" strokeWidth="0.5" />
                        </svg>

                        {/* Hotspots */}
                        <div className="absolute top-[30%] left-[60%] w-12 h-12 bg-red-500/20 rounded-full animate-pulse flex items-center justify-center">
                            <div className="w-6 h-6 bg-red-500/40 rounded-full animate-ping" />
                            <div className="w-3 h-3 bg-red-500 rounded-full absolute" />
                        </div>

                        <div className="absolute top-[60%] left-[20%] w-16 h-16 bg-amber-500/20 rounded-full flex items-center justify-center">
                            <div className="w-4 h-4 bg-amber-500 rounded-full" />
                        </div>

                        <div className="absolute top-[75%] left-[80%] w-8 h-8 bg-amber-500/20 rounded-full flex items-center justify-center">
                            <div className="w-2 h-2 bg-amber-500 rounded-full" />
                        </div>

                        {/* Overlay UI */}
                        <div className="absolute bottom-2 left-2 right-2 p-2 bg-background/90 backdrop-blur rounded border text-xs text-center font-medium shadow-sm">
                            North Zone PWD Alert (High Density)
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
