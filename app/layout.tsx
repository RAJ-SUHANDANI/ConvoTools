import type { Metadata } from "next";
import "@fontsource-variable/manrope/wght.css";
import "@fontsource-variable/instrument-sans/wght.css";
import "./globals.css";
import "./file-desk.css";
import "./workspace-polish.css";
import "./product-story.css";
import "./atelier-redesign.css";
import "./intro.css";
import "./studio-v2.css";
import ScrollProgress from "@/components/ScrollProgress";
import MotionPolicy from "@/components/MotionPolicy";
import IntroGate from "@/components/IntroGate";

const siteUrl = "https://convotool.vercel.app";
const structuredData = [
  {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "ConvoTools",
    url: siteUrl,
    logo: siteUrl + "/convotools-mark.svg",
    founder: { "@type": "Person", name: "Raj Suhandani" },
    sameAs: ["https://github.com/RAJ-SUHANDANI/ConvoTools"],
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
      "Free browser-based PDF, image, document, spreadsheet, media and developer tools. Files are processed locally by supported tools; review each tool's format limitations.",
    isAccessibleForFree: true,
    featureList: ["PDF conversion", "Image processing", "Document editing", "Spreadsheet utilities", "Developer tools"],
    publisher: { "@type": "Organization", name: "ConvoTools", url: siteUrl },
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
    <html lang="en-IN">
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
        <MotionPolicy>
          <ScrollProgress />
          <IntroGate>{children}</IntroGate>
        </MotionPolicy>
      </body>
    </html>
  );
}
