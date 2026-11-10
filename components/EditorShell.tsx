import Link from "next/link";
import BrandLogo from "@/components/BrandLogo";

export default function EditorShell({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="editor-shell">
      <header className="editor-shell-nav">
        <BrandLogo width={165} />
        <nav aria-label="Editor navigation">
          <Link href="/#toolkit">All tools</Link>
          <Link href="/privacy">Privacy</Link>
          <Link href="/dashboard">Your workspace ↗</Link>
        </nav>
      </header>
      {children}
    </main>
  );
}
