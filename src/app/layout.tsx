import "./globals.css";
import AuthProvider from "@/components/shared/AuthProvider";

// Using system fonts to avoid download timeouts in dev
const fontClassName = "font-sans";

export const metadata = {
    title: "Astra Gov AI",
    description: "Transparent Governance for Every Citizen",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" className="light">
            <body className={fontClassName}>
                <AuthProvider>
                    {children}
                </AuthProvider>
            </body>
        </html>
    );
}
