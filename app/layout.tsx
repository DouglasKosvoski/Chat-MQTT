"use client";

import "./globals.css";

import { Toaster } from "@/components/ui/toaster";
import { Next13ProgressBar } from "next13-progressbar";
import { Inter } from "next/font/google";
const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
          <div className="text-primary m-0 p-0">
            <Next13ProgressBar
              height="2px"
              color="pink"
              options={{ showSpinner: false }}
              showOnShallow
            />
          </div>

          {children}

          <Toaster />
      </body>
    </html>
  );
}
