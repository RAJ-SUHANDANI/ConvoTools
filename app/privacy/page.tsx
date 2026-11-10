import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight, Database, EyeOff, HardDrive, LockKeyhole, ShieldCheck } from "lucide-react";
import { Fade } from "@animate-ui/react/primitives/effects/fade";
import { Button } from "@animate-ui/react/primitives/buttons/button";
import BrandLogo from "@/components/BrandLogo";

const site="https://convotool.vercel.app";
export const metadata:Metadata={
 title:"Privacy & file handling — Browser-first tools",
 description:"Learn exactly how ConvoTools handles PDF, image, document and other files, what is stored locally, and which browser features or third-party resources are used.",
 alternates:{canonical:"/privacy"},
 openGraph:{title:"Privacy and file handling | ConvoTools",description:"How ConvoTools processes files in your browser and stores only local workspace preferences.",url:site+"/privacy",type:"article"},
 robots:{index:true,follow:true}
};
const items=[
 {icon:LockKeyhole,title:"Your files, your browser",description:"Supported conversion, editing and utility workflows process files using client-side JavaScript, WebAssembly or browser APIs. Selecting a local file does not create a server-side ConvoTools file library."},
 {icon:HardDrive,title:"Local workspace metadata",description:"Recent activity, favorite tools, profile preferences and settings are saved in this browser's local storage when those features are enabled. This is not a cloud account or a recoverable copy of your file."},
 {icon:EyeOff,title:"No hidden account requirement",description:"The current tools do not require account registration. The optional display name and email in the dashboard are stored locally; they are not a sign-in mechanism."},
 {icon:Database,title:"Downloads stay in your control",description:"Files created by a tool are offered as browser downloads. Their final storage location depends on your browser and device settings; clearing browser data does not erase downloads."}
];
const sections=[
 {title:"What ConvoTools processes",text:"When you choose a file, the working conversion and editing tools access it in the browser session for the action you requested. Conversion engines can use local browser APIs, workers, PDF or Office libraries, and WebAssembly. Processing limits and fidelity vary by format: always check the tool-specific notes before relying on an exported result."},
 {title:"What ConvoTools stores",text:"The current personal workspace can store recent file names, sizes, activity records, favorite tool choices, an optional profile name and email, and settings in browser localStorage. Uploaded file bytes are not recovered from activity history. Some in-progress files are kept only in the active browser session to hand them to the chosen tool."},
 {title:"External resources and third-party sites",text:"Some capabilities can download JavaScript, WASM, language or model resources needed for local processing. The separate media-link workspace may preview embeds from external social platforms or request a direct media URL you supply. Opening GitHub, social media, or support links takes you to those services, which follow their own privacy policies. Hosting providers may maintain normal infrastructure logs."},
 {title:"Cookies, analytics, and consent",text:"The current application source does not include a dedicated advertising tracker or analytics SDK. The browser can still use functional storage for settings and session behavior. Browser, platform and network providers can have their own caching and diagnostic data independent of the application code."},
 {title:"Clearing your information",text:"In Dashboard → Settings you can clear stored activity and favorites. You can also remove ConvoTools site data in your browser settings to clear locally saved preferences. Downloaded files on your device must be managed separately."},
 {title:"Updates and questions",text:"This page reflects the browser-first product design as of November 11, 2026. The behavior of specific tools may change as the project develops. For corrections, implementation questions or privacy issues, refer to the public source repository and its issue tracker."}
];
const schema=[
 {"@context":"https://schema.org","@type":"WebPage","name":"ConvoTools privacy and file handling","url":site+"/privacy","description":"First-party explanation of client-side file processing and local browser storage","isPartOf":{"@type":"WebSite","name":"ConvoTools","url":site}},
 {"@context":"https://schema.org","@type":"BreadcrumbList","itemListElement":[{"@type":"ListItem","position":1,"name":"Home","item":site},{"@type":"ListItem","position":2,"name":"Privacy","item":site+"/privacy"}]}
];
export default function PrivacyPage(){
 return <main className="ct-content-page ct-privacy-page">
  <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(schema)}}/>
  <header className="ct-subpage-nav"><BrandLogo width={174}/><nav aria-label="Primary"><Link href="/#toolkit">All tools</Link><Link href="/about">About</Link><Link href="/dashboard" className="ct-subpage-nav-cta">Open workspace <ArrowUpRight size={15}/></Link></nav></header>
  <div className="ct-content-wrap">
   <Fade><div className="ct-content-hero"><Link href="/" className="ct-page-back"><ArrowLeft size={15}/> Back to ConvoTools</Link><span className="ct-eyebrow">NO MYSTERY. NO FINE PRINT.</span><h1>Privacy should be <em>simple.</em></h1><p>When you work with personal files, you should know exactly what happens to them. Here&apos;s how ConvoTools handles your content, your browser workspace, and your choices.</p><span className="ct-page-stamp">Last reviewed · November 11, 2026</span></div></Fade>
   <div className="ct-privacy-grid">{items.map(({icon:Icon,title,description})=><Fade key={title} inView><article className="ct-privacy-tile"><span className="ct-privacy-icon"><Icon size={24}/></span><h2>{title}</h2><p>{description}</p></article></Fade>)}</div>
   <div className="ct-content-detail"><div className="ct-content-aside"><span className="ct-eyebrow">THE DETAILS</span><h2>Your questions,<br/>answered clearly.</h2><p>These statements describe the current application source—not a guarantee about every browser extension, network provider, or linked website.</p><Link href="https://github.com/RAJ-SUHANDANI/ConvoTools" target="_blank" rel="noreferrer">Read the source <ArrowUpRight size={15}/></Link></div><div className="ct-content-sections">{sections.map((section,i)=><Fade key={section.title} inView><section><span>{String(i+1).padStart(2,"0")}</span><div><h3>{section.title}</h3><p>{section.text}</p></div></section></Fade>)}</div></div>
   <div className="ct-content-cta"><span className="ct-eyebrow">BACK TO WHAT MATTERS</span><h2>Good tools. Clear boundaries.</h2><p>Start with your files, without creating an account.</p><Button asChild><Link href="/#file-desk">Start with a file <ArrowUpRight size={16}/></Link></Button></div>
  </div>
  <footer className="ct-subpage-footer"><span>© 2026 ConvoTools</span><nav><Link href="/">Home</Link><Link href="/about">About</Link><Link href="/#toolkit">All tools</Link></nav></footer>
 </main>;
}
