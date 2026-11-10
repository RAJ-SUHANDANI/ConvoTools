import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, Check, Code2, FileCheck2, Gauge, HeartHandshake, ShieldCheck } from "lucide-react";
import { RollingText } from "@animate-ui/react/primitives/texts/rolling";
import { Fade } from "@animate-ui/react/primitives/effects/fade";
import BrandLogo from "@/components/BrandLogo";
import { TOOLS } from "@/lib/tools";
export const metadata:Metadata={
 title:"About ConvoTools — One place for everyday file work",
 description:"ConvoTools brings PDF, image, document, spreadsheet, media and developer utilities into one browser-first workspace. Understand how it works and explore the available tools.",
 alternates:{canonical:"/about"},robots:{index:true,follow:true},
 openGraph:{title:"About ConvoTools",description:"Our approach to browser-first file tools, clear limitations and a usable workspace.",url:"https://convotool.vercel.app/about",type:"article"}
};
export default function AboutPage(){
 const available=TOOLS.filter(x=>x.tag!=="Coming soon").length;
 return <main className="ct-content-page ct-about-page">
 <header className="ct-subpage-nav"><BrandLogo width={174}/><nav><Link href="/#toolkit">Tools</Link><Link href="/privacy">Privacy</Link><Link href="/dashboard" className="ct-subpage-nav-cta">Open workspace <ArrowUpRight size={15}/></Link></nav></header>
 <div className="ct-content-wrap">
  <section className="ct-content-hero"><span className="ct-eyebrow">A TOOLKIT BUILT AROUND THE ACTUAL JOB</span><h1>Less file friction.<br/><em>More work done.</em></h1><p>ConvoTools is a free, browser-first toolkit built to help with the unglamorous tasks between your real projects: converting, organizing, editing and exporting everyday files.</p><div className="ct-about-numbers"><span><b>{available}</b> available tools</span><span><b>{TOOLS.length}</b> total in the library</span><span><b>0</b> accounts required</span></div></section>
  <div className="ct-about-features">
   {[
    {icon:FileCheck2,title:"Start with the file",text:"Choose a file and see suitable actions instead of hunting through menus. You always confirm the action and options."},
    {icon:ShieldCheck,title:"Clear about privacy",text:"Supported file-processing tools run in the browser; current workspace history is local metadata, not cloud file storage."},
    {icon:Gauge,title:"Honest about limitations",text:"PDFs, complex Office layouts and some media operations can vary by format. Tool-specific guides explain what to expect."},
    {icon:Code2,title:"Transparent by construction",text:"The application source, tool descriptions and third-party notices are available so you can inspect how the tools work."}
   ].map(({icon:Icon,title,text})=><Fade inView key={title}><article><Icon size={24}/><h2>{title}</h2><p>{text}</p></article></Fade>)}
  </div>
  <section className="ct-about-outro"><span className="ct-eyebrow">THOUGHTFULLY PRACTICAL</span><h2><RollingText text="The small jobs matter." inView /></h2><p>Browse the tools, find the format you need, or start by dropping in a file. ConvoTools is designed for the work, not the setup.</p><div><Link href="/#toolkit">Browse all tools <ArrowUpRight size={18}/></Link><Link href="/privacy">Read our privacy approach <ArrowUpRight size={18}/></Link></div></section>
 </div><footer className="ct-subpage-footer"><span>© 2026 ConvoTools</span><nav><Link href="/">Home</Link><Link href="/privacy">Privacy</Link><a href="https://github.com/RAJ-SUHANDANI/ConvoTools" target="_blank" rel="noreferrer">Source</a></nav></footer>
 </main>;
}
