import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { I18nProvider } from "../components/I18nProvider";
import MainLayout from "../components/Layout/MainLayout";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ARCANUM AI | Full Platform Architecture",
  description: "Advanced strategic decision-making powered by specialized AI agents.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased bg-[#050505] min-h-screen`}>
        <I18nProvider>
          <MainLayout>
            {children}
          </MainLayout>
        </I18nProvider>
      </body>
    </html>
  );
}
