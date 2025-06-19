"use client";
import { ImageKitProvider } from "@imagekit/next";
import { SessionProvider } from "next-auth/react";
import { NotificationProvider } from "./Notification";
import { useEffect } from "react";

const urlEndpoint = process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT!;

export default function Providers({ children }: { children: React.ReactNode }) {
    useEffect(() => {
        const savedTheme = localStorage.getItem("theme");
        const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        const initialTheme = savedTheme || (prefersDark ? "dark" : "light");
        
        document.documentElement.setAttribute("data-theme", initialTheme);
        if (initialTheme === "dark") {
            document.documentElement.classList.add("dark");
        } else {
            document.documentElement.classList.remove("dark");
        }
    }, []);

    return (
        <SessionProvider refetchInterval={5 * 60}>
            <ImageKitProvider urlEndpoint={urlEndpoint}>
                <NotificationProvider>
                    {children}
                </NotificationProvider>
            </ImageKitProvider>
        </SessionProvider>
    );
}