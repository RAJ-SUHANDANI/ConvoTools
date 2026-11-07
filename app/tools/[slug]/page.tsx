import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ToolDetail from "@/components/ToolDetail";
import ComingSoon from "@/components/ComingSoon";
import { getToolBySlug, TOOLS, slugify } from "@/lib/tools";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return TOOLS.map((tool) => ({ slug: slugify(tool.name) }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const tool = getToolBySlug(slug);
  if (!tool) return { title: "Tool not found · ConvoTools" };
  const canonical = "/tools/" + slug;
  return {
    title: tool.name + " Online",
    description: tool.description + " Use the ConvoTools online " + tool.name.toLowerCase() + " tool in your browser.",
    alternates: { canonical },
    openGraph: {
      title: tool.name + " Online | ConvoTools",
      description: tool.description,
      url: canonical,
      siteName: "ConvoTools",
      type: "website",
    },
    twitter: { card: "summary", title: tool.name + " Online | ConvoTools", description: tool.description },
  };
}

export default async function ToolPage({ params }: Props) {
  const { slug } = await params;
  const tool = getToolBySlug(slug);
  if (!tool) notFound();
  if (tool.category === "AI lab") return <ComingSoon toolName={tool.name} />;
  return <ToolDetail tool={{
    name: tool.name,
    description: tool.description,
    category: tool.category,
    inputLabel: tool.inputLabel,
    outputLabel: tool.outputLabel,
  }} />;
}
