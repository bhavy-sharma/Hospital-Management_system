import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata = {
  title: {
    default: "Hospital Management System",
    template: "%s | Hospital Management",
  },
  description: "Complete hospital management solution for managing patients, doctors, staff, pharmacy, and expenses efficiently.",
  keywords: ["hospital", "management", "healthcare", "patients", "doctors", "pharmacy"],
  authors: [{ name: "Hospital Management" }],
  icons: {
    icon: "/favicon.ico",
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
  },
  themeColor: "#2563eb",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} h-full`}>
      <body className="min-h-full flex flex-col antialiased bg-gray-50 text-gray-900 font-sans">
        {children}
      </body>
    </html>
  );
}