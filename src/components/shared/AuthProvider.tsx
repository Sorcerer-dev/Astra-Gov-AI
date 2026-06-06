"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function AuthProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const checkAuth = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            
            if (!session) {
                if (pathname !== "/login") {
                    router.push("/login");
                }
            } else {
                // User is logged in, check their role
                const userEmail = session.user.email || "";
                const userRole = userEmail.endsWith("@gov.in") ? "admin" : "citizen";
                
                // Set the role state (if you have one) or handle redirection
                console.log("Detected user role:", userRole);

                if (pathname.startsWith("/admin") && userRole !== "admin") {
                    router.push("/login");
                    return;
                }
                
                if (pathname === "/login" && session) {
                    router.push(userRole === "admin" ? "/admin" : "/");
                    return;
                }
            }
            setIsLoading(false);
        };

        checkAuth();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            if (event === 'SIGNED_OUT') {
                router.push("/login");
            }
        });

        return () => {
            subscription.unsubscribe();
        };
    }, [pathname, router]);

    if (isLoading && pathname !== "/login") {
        return (
            <div className="h-screen w-screen flex items-center justify-center bg-background">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    return <>{children}</>;
}
