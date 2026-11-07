import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Workspace",
  description: "Your personal ConvoTools file workspace.",
  robots: { index: false, follow: false, noarchive: true, nosnippet: true },
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return children;
}
