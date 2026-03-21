/** @type {import('next').NextConfig} */
const nextConfig = {
    experimental: {
        optimizePackageImports: ["lucide-react", "framer-motion", "recharts"],
    },
};

export default nextConfig;
