import { mockActivities } from "@/lib/mock_data";
import ProgressChecklist from "@/components/shared/ProgressChecklist";
import { FolderOpen } from "lucide-react";

export default function MyActivitiesSidebar() {
    return (
        <div className="w-80 bg-card border-r h-full p-6 overflow-y-auto">
            <div className="flex items-center space-x-2 mb-6 text-primary">
                <FolderOpen className="h-5 w-5" />
                <h2 className="text-xl font-semibold tracking-tight">My Activities</h2>
            </div>

            <div className="space-y-6">
                {mockActivities.map(activity => (
                    <div key={activity.id} className="p-4 border rounded-xl bg-background/50 hover:border-primary/50 transition-colors shadow-sm">
                        <h3 className="font-semibold mb-3 leading-tight text-foreground">{activity.title}</h3>
                        <ProgressChecklist tasks={activity.tasks} />
                    </div>
                ))}
            </div>
        </div>
    );
}
