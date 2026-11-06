import type { Metadata } from "next";
import "./globals.css";
import ScrollProgress from "@/components/ScrollProgress";
import { AmbientCursor } from "@/components/LandingEnhancements";

export const metadata: Metadata = {
  title: "ConvoTools — Make files work for you",
  description:
    "A considered workspace for converting, refining, organizing and editing PDFs, images, documents, spreadsheets, presentations, video and audio.",
  applicationName: "ConvoTools",
  icons: { icon: "/convotools-mark.svg", shortcut: "/convotools-mark.svg" },
  keywords: [
    "file converter",
    "PDF tools",
    "image converter",
    "document tools",
    "image enhancement",
    "batch file conversion",
    "developer utilities",
  ],
  openGraph: {
    title: "ConvoTools — Make files work for you",
    description:
      "Convert, refine, organize and edit everyday files in one thoughtfully designed workspace.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body><ScrollProgress /><AmbientCursor />{children}</body>
    </html>
  );
}
