import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/context/LanguageContext";
import LanguageToggle from "@/components/LanguageToggle";

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "ShembeArk - Registration",
  description: "Register for complimentary internet access through ShembeArk. Free internet for the community.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${montserrat.variable} font-sans antialiased`}
      >
        <LanguageProvider>
          {/* Language Toggle - Top for all pages */}
          <div className="relative z-50">
            <div className="flex justify-end p-2 bg-white sm:p-0 sm:bg-transparent sm:absolute sm:top-4 sm:right-4">
              <LanguageToggle />
            </div>
          </div>
          {children}
        </LanguageProvider>
      </body>
    </html>
  );
}
