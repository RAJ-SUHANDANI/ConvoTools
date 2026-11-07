import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ToolDetail from "@/components/ToolDetail";
import ComingSoon from "@/components/ComingSoon";
import ToolLandingContent from "@/components/ToolLandingContent";
import WordEditorWorkspace from "@/components/WordEditorWorkspace";
import JsonFormatterWorkspace from "@/components/JsonFormatterWorkspace";
import { getToolBySlug, TOOLS, slugify } from "@/lib/tools";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return TOOLS.map((tool) => ({ slug: slugify(tool.name) }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const tool = getToolBySlug(slug);
  if (!tool) return { title: "Tool not found · ConvoTools", robots: { index: false, follow: false } };
  const canonical = "/tools/" + slug;
  const isComingSoon = tool.category === "AI lab";
  const input = tool.inputLabel || "supported files";
  const output = tool.outputLabel || "your chosen format";
  const specialTitle = tool.name === "Word editor"
    ? "Free Online Word Editor – Edit DOCX Documents in Your Browser"
    : tool.name === "JSON formatter"
      ? "JSON Formatter & Validator – Tree Viewer, JSON to XML and CSV"
      : null;
  const title = specialTitle || (tool.name + " Online – " + input + " to " + output + " Converter");
  const description = tool.name === "Word editor"
    ? "Open and edit DOCX Word documents online with a browser-based editor. Format text, add images, create lists and tables, then export an editable DOCX file. Files stay in your browser."
    : tool.name === "JSON formatter"
      ? "Format and validate JSON online with a live code editor, collapsible tree viewer, search, minify and convert JSON to XML or CSV. Open and download files in your browser."
      : "Use the ConvoTools " + tool.name.toLowerCase() + " online tool. Add " + input + ", choose your settings and download " + output + ". See supported formats, steps and conversion limitations.";
  const keywords = [
    tool.name.toLowerCase() + " online",
    tool.name.toLowerCase() + " converter",
    ...(tool.name === "Word editor" ? ["edit docx online", "online word processor", "docx editor", "word document editor"] : []),
    ...(tool.name === "JSON formatter" ? ["json validator", "json viewer", "json tree viewer", "json beautifier", "json to xml", "json to csv"] : []),
    input.toLowerCase() + " to " + output.toLowerCase(),
    "online " + tool.category.toLowerCase() + " tool",
    "ConvoTools " + tool.name.toLowerCase(),
  ];
  return {
    title,
    description,
    keywords,
    alternates: { canonical },
    robots: isComingSoon
      ? { index: false, follow: true }
      : { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 } },
    openGraph: {
      title: title + " | ConvoTools",
      description,
      url: canonical,
      siteName: "ConvoTools",
      locale: "en_IN",
      type: "website",
    },
    twitter: { card: "summary", title: title + " | ConvoTools", description },
  };
}

export default async function ToolPage({ params }: Props) {
  const { slug } = await params;
  const tool = getToolBySlug(slug);
  if (!tool) notFound();
  if (tool.category === "AI lab") return <ComingSoon toolName={tool.name} />;
  return (
    <>
      <ToolDetail tool={{
        name: tool.name,
        description: tool.description,
        category: tool.category,
        inputLabel: tool.inputLabel,
        outputLabel: tool.outputLabel,
      }} />
      <ToolLandingContent tool={tool} />
    </>
  );
}
