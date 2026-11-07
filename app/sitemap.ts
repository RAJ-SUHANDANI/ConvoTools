import type { MetadataRoute } from "next";
import { TOOLS, slugify } from "@/lib/tools";

const siteUrl = "https://convotool.vercel.app";

export default function sitemap(): MetadataRoute.Sitemap {
  const tools = TOOLS.filter((tool) => tool.category !== "AI lab");
  return [
    { url: siteUrl, changeFrequency: "weekly", priority: 1 },
    ...tools.map((tool) => ({
      url: siteUrl + "/tools/" + slugify(tool.name),
      changeFrequency: "monthly" as const,
      priority: 0.75,
    })),
  ];
}
