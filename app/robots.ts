import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: ["/dashboard", "/savefrom"] },
      { userAgent: "Googlebot", allow: "/", disallow: ["/dashboard", "/savefrom"] },
    ],
    sitemap: "https://convotool.vercel.app/sitemap.xml",
    host: "https://convotool.vercel.app",
  };
}
