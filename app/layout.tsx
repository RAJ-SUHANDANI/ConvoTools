import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import "./file-desk.css";
import "./workspace-polish.css";
import "./product-story.css";
import ScrollProgress from "@/components/ScrollProgress";
import MotionPolicy from "@/components/MotionPolicy";

const siteUrl = "https://convotool.vercel.app";
const sansFont = localFont({
  src: "../node_modules/@fontsource-variable/dm-sans/files/dm-sans-latin-wght-normal.woff2",
  variable: "--font-dm-sans",
  display: "swap",
  weight: "100 1000",
});
const headingFont = localFont({
  src: "../node_modules/@fontsource-variable/space-grotesk/files/space-grotesk-latin-wght-normal.woff2",
  variable: "--font-space-grotesk",
  display: "swap",
  weight: "300 700",
});
const structuredData = [
  {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "ConvoTools",
    url: siteUrl,
    logo: siteUrl + "/convotools-mark.svg",
    founder: { "@type": "Person", name: "Raj Suhandani" },
  },
  {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "ConvoTools",
    url: siteUrl,
    description:
      "A browser-first workspace for practical file conversion, PDF, image, document, spreadsheet, media and developer tools.",
    inLanguage: "en",
  },
  {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "ConvoTools",
    applicationCategory: "UtilitiesApplication",
    operatingSystem: "Any device with a modern web browser",
    url: siteUrl,
    description:
      "Use browser-based tools to convert, organize and prepare PDFs, images, documents, spreadsheets, presentations, video, audio and developer files.",
  },
];

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "ConvoTools — Online File Converter & PDF Tools",
    template: "%s | ConvoTools",
  },
  description:
    "Convert PDFs, images, Word documents, spreadsheets, presentations and media with practical online file tools. Explore practical file tools in one workspace.",
  applicationName: "ConvoTools",
  category: "technology",
  icons: { icon: "/convotools-mark.svg", shortcut: "/convotools-mark.svg" },
  keywords: [
    "free online file converter",
    "PDF converter",
    "PDF to Word",
    "image converter",
    "PNG to JPG",
    "WEBP converter",
    "Word to PDF",
    "Excel to PDF",
    "video converter",
    "audio converter",
    "online file tools",
    "browser-based file tools",
  ],
  alternates: { canonical: "/" },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  openGraph: {
    title: "ConvoTools — Free Online File Converter & PDF Tools",
    description:
      "Convert and prepare PDFs, images, documents, spreadsheets and media with practical browser-based tools.",
    url: siteUrl,
    siteName: "ConvoTools",
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "ConvoTools — Free Online File Converter & PDF Tools",
    description:
      "A practical workspace for converting and preparing everyday files.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en-IN"
      className={`${sansFont.variable} ${headingFont.variable}`}
    >
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
        <MotionPolicy>
          <ScrollProgress />
          {children}
        </MotionPolicy>
      </body>
    </html>
  );
}
