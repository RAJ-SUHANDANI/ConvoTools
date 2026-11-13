import Link from "next/link";
import BrandLogo from "@/components/BrandLogo";
import { ArrowLeft, ArrowUpRight, FileText, ShieldCheck } from "lucide-react";
import { Fade } from "@animate-ui/react/primitives/effects/fade";
import { Button } from "@animate-ui/react/primitives/buttons/button";

export type LegalSection = { title: string; paragraphs: string[]; bullets?: string[] };
type Props = { eyebrow: string; heading: string; accent: string; description: string;
  reviewed: string; sections: LegalSection[]; note?: string; };

export default function LegalDocument({ eyebrow, heading, accent, description, reviewed, sections, note }: Props) {
  return <main className="ct-content-page ct-legal-page">
    <header className="ct-subpage-nav">
      <BrandLogo width={174}/>
      <nav aria-label="Primary navigation">
        <Link href="/#toolkit">Tools</Link>
        <Link href="/privacy">Privacy</Link>
        <Link className="ct-subpage-nav-cta" href="/dashboard">Workspace <ArrowUpRight size={14}/></Link>
      </nav>
    </header>
    <div className="ct-content-wrap">
      <div className="ct-content-hero ct-legal-hero">
        <Link className="ct-page-back" href="/"><ArrowLeft size={15}/> Back to ConvoTools</Link>
        <span className="ct-eyebrow">{eyebrow}</span>
        <h1>{heading} <em>{accent}</em></h1>
        <p>{description}</p>
        <span className="ct-page-stamp">Last reviewed · {reviewed}</span>
      </div>
      {note && <Fade inView><aside className="ct-legal-notice" role="note">
        <ShieldCheck size={20}/><p>{note}</p>
      </aside></Fade>}
      <div className="ct-content-detail ct-legal-detail">
        <div className="ct-content-aside">
          <span className="ct-eyebrow">CLEAR BY DESIGN</span>
          <h2>Know where<br/>you stand.</h2>
          <p>These pages describe how the present ConvoTools site works. They do not override rights you have under applicable law.</p>
          <div className="ct-legal-shortcuts">
            <Link href="/privacy">Privacy policy <ArrowUpRight size={14}/></Link>
            <Link href="/terms">Terms of use <ArrowUpRight size={14}/></Link>
            <Link href="/cookies">Cookies & storage <ArrowUpRight size={14}/></Link>
            <Link href="/contact">Contact & support <ArrowUpRight size={14}/></Link>
            <Link href="/accessibility">Accessibility <ArrowUpRight size={14}/></Link>
            <Link href="/licenses">Open-source notices <ArrowUpRight size={14}/></Link>
          </div>
        </div>
        <div className="ct-content-sections">
          {sections.map((section, i) => <Fade key={section.title} inView>
            <section className="ct-legal-section" id={"section-" + (i + 1)}>
              <span>{String(i + 1).padStart(2, "0")}</span>
              <div>
                <h2>{section.title}</h2>
                {section.paragraphs.map((p, j) => <p key={j}>{p}</p>)}
                {section.bullets && <ul>{section.bullets.map(item=><li key={item}>{item}</li>)}</ul>}
              </div>
            </section>
          </Fade>)}
        </div>
      </div>
      <div className="ct-content-cta">
        <span className="ct-eyebrow"><FileText size={15}/> YOUR WORKSPACE, YOUR CHOICE</span>
        <h2>Back to the work.</h2>
        <p>Explore the tools or review how ConvoTools handles files before you start.</p>
        <Button asChild><Link href="/#file-desk">Explore file tools <ArrowUpRight size={16}/></Link></Button>
      </div>
    </div>
    <footer className="ct-subpage-footer">
      <span>© 2026 ConvoTools</span>
      <nav aria-label="Legal navigation">
        <Link href="/privacy">Privacy</Link><Link href="/terms">Terms</Link>
        <Link href="/cookies">Storage</Link><Link href="/contact">Contact</Link>
        <Link href="/accessibility">Accessibility</Link><Link href="/licenses">Licenses</Link>
      </nav>
    </footer>
  </main>;
}
