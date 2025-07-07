
"use client";

import type { Metadata } from "next";
import { AppLayout } from "@/components/app-layout";
import { Toaster } from "@/components/ui/toaster";
import "./globals.css";
import { usePathname, useRouter } from "next/navigation";
import { useUserStore } from "@/lib/store";
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

// Metadata cannot be exported from a client component.
// We can either move it to a server component or define it statically.
// export const metadata: Metadata = {
//   title: "BFN Production",
//   description: "AI-Powered Production Management",
// };


function RootLayoutContent({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
    const pathname = usePathname();
    const router = useRouter();
    const { currentUser } = useUserStore();

    // This hook must be called on every render to follow the Rules of Hooks.
    React.useEffect(() => {
        // We only want to redirect if not on the login page and no user is found.
        if (!currentUser && pathname !== '/login') {
            router.replace('/login');
        }
    }, [currentUser, pathname, router]);

    // Conditional rendering logic is safe after all hooks have been called.

    // If we're on the login page, render it without the main AppLayout.
    if (pathname === '/login') {
        return <>{children}</>;
    }

    // If we are not on the login page and there is no user, show a loading skeleton.
    // The useEffect above will handle the redirect.
    if (!currentUser) {
        return (
            <div className="flex h-screen items-center justify-center bg-background">
                <Card className="w-full max-w-md">
                    <CardHeader>
                        <CardTitle><Skeleton className="h-8 w-3/4" /></CardTitle>
                        <CardDescription><Skeleton className="h-4 w-1/2" /></CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                    </CardContent>
                </Card>
            </div>
        );
    }
    
    // If we have a user and are not on the login page, show the full app layout.
    return (
        <AppLayout>
            {children}
        </AppLayout>
    );
}


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <title>BFN Production</title>
        <meta name="description" content="AI-Powered Production Management" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Source+Code+Pro&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-body antialiased">
        <RootLayoutContent>{children}</RootLayoutContent>
        <Toaster />
      </body>
    </html>
  );
}
