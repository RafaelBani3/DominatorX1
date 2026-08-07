import { Geist_Mono, Outfit, Bebas_Neue } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import PWAInstallModal from "@/components/landing/PWAInstallModal";

const outfit = Outfit({
  variable: "--font-body",
  subsets: ["latin"],
});

const bebasNeue = Bebas_Neue({
  variable: "--font-display",
  weight: "400",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Dominator XI - FC Mobile Community",
  description:
    "Join the most elite FC Mobile community, Dominator XI. Register, track your stats, and dominate the pitch.",
  manifest: "/manifest.json",
};

export const viewport = {
  themeColor: "#1a5c3a",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="id"
      className={`${outfit.variable} ${bebasNeue.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className={`${outfit.className} flex min-h-full flex-col`}>
        {children}
        <PWAInstallModal />
        <Toaster />
      </body>
    </html>
  );
}
