import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ConvoTools — Every file. One workspace.",
  description:
    "Convert, edit, compress and enhance files in one beautifully simple workspace. Free-first file tools, designed for creators and developers.",
  applicationName: "ConvoTools",
  keywords: ["file converter", "PDF tools", "image converter", "document tools"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
