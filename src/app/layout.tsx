import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
    title: "Personal Item Manager — Track Your Belongings",
    description:
        "A sleek personal item manager to catalog, search, and organize your belongings with images and locations.",
    keywords: ["item manager", "personal inventory", "belongings tracker"],
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className="antialiased">{children}</body>
        </html>
    );
}
