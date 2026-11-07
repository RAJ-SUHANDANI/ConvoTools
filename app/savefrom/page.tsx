import type { Metadata } from "next";
import PrivateSavefrom from "@/components/PrivateSavefrom";

export const metadata: Metadata = {
  title: "Media link workspace · ConvoTools",
  description: "Identify media links, preview supported embeds and open official save options.",
  robots: { index: false, follow: false, noarchive: true, nosnippet: true },
};

export default function SavefromPage() {
  return <PrivateSavefrom />;
}
