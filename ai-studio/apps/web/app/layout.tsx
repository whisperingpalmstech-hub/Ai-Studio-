import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/providers";

// Use system fonts to avoid network issues with Google Fonts
const fontVariables = "font-sans";

export const metadata: Metadata = {
    title: {
        default: "AI Studio | Enterprise AI Image & Video Generation",
        template: "%s | AI Studio",
    },
    description:
        "Create stunning AI-generated images and videos with our enterprise-grade platform. Features node-based workflows, custom models, LoRAs, and ControlNet support.",
    keywords: [
        "AI image generation",
        "Stable Diffusion",
        "AI art",
        "text to image",
        "image generation",
        "AI video",
        "LoRA",
        "ControlNet",
        "ComfyUI alternative",
    ],
    authors: [{ name: "AI Studio" }],
    creator: "AI Studio",
    openGraph: {
        type: "website",
        locale: "en_US",
        url: "https://ai-studio.dev",
        siteName: "AI Studio",
        title: "AI Studio | Enterprise AI Image & Video Generation",
        description:
            "Create stunning AI-generated images and videos with our enterprise-grade platform.",
        images: [
            {
                url: "/og-image.png",
                width: 1200,
                height: 630,
                alt: "AI Studio Preview",
            },
        ],
    },
    twitter: {
        card: "summary_large_image",
        title: "AI Studio | Enterprise AI Image & Video Generation",
        description:
            "Create stunning AI-generated images and videos with our enterprise-grade platform.",
        images: ["/og-image.png"],
    },
    robots: {
        index: true,
        follow: true,
    },
    manifest: "/manifest.json",
    metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
};

export const viewport = {
    themeColor: [
        { media: "(prefers-color-scheme: light)", color: "#ffffff" },
        { media: "(prefers-color-scheme: dark)", color: "#0f0f23" },
    ],
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" suppressHydrationWarning className="dark">
            <body className="font-sans min-h-screen bg-background antialiased">
                <Providers>{children}</Providers>
            </body>
        </html>
    );
}
