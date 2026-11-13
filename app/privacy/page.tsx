import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight, Database, EyeOff, HardDrive, LockKeyhole, ShieldCheck } from "lucide-react";
import { Fade } from "@animate-ui/react/primitives/effects/fade";
import { Button } from "@animate-ui/react/primitives/buttons/button";
import BrandLogo from "@/components/BrandLogo";

const site="https://convotool.vercel.app";
export const metadata:Metadata={
 title:"Privacy Policy & File Handling | ConvoTools",
 description:"Learn exactly how ConvoTools handles PDF, image, document and other files, what is stored locally, and which browser features or third-party resources are used.",
 alternates:{canonical:"/privacy"},
 openGraph:{title:"Privacy and file handling | ConvoTools",description:"How ConvoTools processes files in your browser and stores only local workspace preferences.",url:site+"/privacy",type:"article"},
 robots:{index:true,follow:true}
};
const items=[
 {icon:LockKeyhole,title:"File processing in your browser",description:"Supported conversions use browser-side libraries, workers and WebAssembly. Choosing a file does not create a ConvoTools server-side file library."},
 {icon:HardDrive,title:"History is your choice",description:"New visitors start with local activity history switched off. You can opt in and clear saved filenames and other workspace information in Settings."},
 {icon:EyeOff,title:"Optional, not a cloud account",description:"Profile name and email fields are optional and stored only in this browser. ConvoTools does not use those fields to sign in, send messages or create an online account."},
 {icon:Database,title:"Third-party previews ask first",description:"Media previews from external sites are click-to-load. ConvoTools does not create those remote requests until you choose to load the preview."}
];
const sections=[
 {title:"Operator and scope",text:"ConvoTools is maintained by Raj Suhandani. The public source and operator profile are at github.com/RAJ-SUHANDANI/ConvoTools. A registered business address or private privacy email has not been verified for publication. This notice covers the current browser-first website, not unrelated third-party sites."},
 {title:"What data is handled, and why",text:"To run a requested tool, your browser accesses selected files and the settings needed to transform them. Supported converters process file bytes locally rather than uploading them to a ConvoTools conversion backend. The optional dashboard profile contains display name and email; favorites and motion preferences are stored locally. If enabled, activity history may include filenames, file sizes, tool names and timestamps. Those details can themselves be personal data."},
 {title:"Storage, choice and retention",text:"Activity-history saving is off by default for new visitors and is switched on only if you enable it in Dashboard → Settings. Existing preferences already saved in your browser remain in effect. Activity history retains up to 100 records until cleared, replaced or removed by the browser. Favorites, profile and preferences stay in localStorage until cleared. Some file selections are temporarily passed between tool screens in memory; the intro animation can use sessionStorage."},
 {title:"External requests and service providers",text:"Site hosting and delivery can involve infrastructure request logs, including network metadata such as IP addresses. Certain PDF, OCR, video, language or AI tools can retrieve library, WASM or model assets from external content networks while processing locally. The media-link workspace can connect to third-party media hosts on direct download or when you explicitly load a preview. Those providers have their own policies."},
 {title:"Cookies, analytics and third-party embeds",text:"The reviewed application source does not include a dedicated advertising pixel or analytics SDK. ConvoTools uses functional browser storage; hosting services and external providers may use cookies or collect request data outside this application's control. You can decline optional external media previews without blocking the rest of the toolkit. See our Cookies & Storage page for specific keys and controls."},
 {title:"Your options and privacy rights",text:"You can turn off activity history, clear history and favorites, or erase all ConvoTools local profile and preference data in Dashboard → Settings. You can also remove site data from browser settings. Downloaded documents on your device are not deleted when browser data is cleared. Depending on applicable law, you may have rights to information, access, correction, erasure or complaint. See the Contact page for currently available contact channels; never put confidential information in a public GitHub issue."},
 {title:"Security and accurate expectations",text:"Browser-side processing reduces the need to transfer file contents to an application server, but it does not make every browser, plugin, device or third-party resource risk-free. Some formats may be inaccurate or incomplete after conversion. Avoid sharing sensitive files on public issue trackers, and retain original copies of important documents."},
 {title:"Children, international access and changes",text:"ConvoTools is a general file utility and is not designed to solicit children's personal information. Visitors and external content providers may be located in different countries. The laws relevant to a particular visitor or operation can vary. We update this page when data handling changes and provide the review date below."},
 {title:"Contact and third-party references",text:"For non-sensitive questions, use the public ConvoTools project and its issues page. A verified confidential legal/privacy contact channel is not yet published. Do not post identity documents, passwords, private filenames, or private information in public issues. Third-party license notices and source references are available on the Licenses page."}
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
   <Fade><div className="ct-content-hero"><Link href="/" className="ct-page-back"><ArrowLeft size={15}/> Back to ConvoTools</Link><span className="ct-eyebrow">NO MYSTERY. NO FINE PRINT.</span><h1>Privacy should be <em>simple.</em></h1><p>When you work with personal files, you should know exactly what happens to them. Here&apos;s what happens to your files, what the browser remembers, and which external services you choose to load.</p><span className="ct-page-stamp">Last reviewed · November 13, 2026</span></div></Fade>
   <div className="ct-privacy-grid">{items.map(({icon:Icon,title,description})=><Fade key={title} inView><article className="ct-privacy-tile"><span className="ct-privacy-icon"><Icon size={24}/></span><h2>{title}</h2><p>{description}</p></article></Fade>)}</div>
   <div className="ct-content-detail"><div className="ct-content-aside"><span className="ct-eyebrow">THE DETAILS</span><h2>Your questions,<br/>answered clearly.</h2><p>These statements describe the current application source—not a guarantee about every browser extension, network provider, or linked website.</p><Link href="https://github.com/RAJ-SUHANDANI/ConvoTools" target="_blank" rel="noreferrer">Read the source <ArrowUpRight size={15}/></Link><div className="ct-legal-shortcuts"><Link href="/cookies">Cookies & storage <ArrowUpRight size={14}/></Link><Link href="/terms">Terms of use <ArrowUpRight size={14}/></Link><Link href="/contact">Contact & support <ArrowUpRight size={14}/></Link></div></div><div className="ct-content-sections">{sections.map((section,i)=><Fade key={section.title} inView><section><span>{String(i+1).padStart(2,"0")}</span><div><h3>{section.title}</h3><p>{section.text}</p></div></section></Fade>)}</div></div>
   <div className="ct-content-cta"><span className="ct-eyebrow">BACK TO WHAT MATTERS</span><h2>Good tools. Clear boundaries.</h2><p>Start with your files, without creating an account.</p><Button asChild><Link href="/#file-desk">Start with a file <ArrowUpRight size={16}/></Link></Button></div>
  </div>
  <footer className="ct-subpage-footer"><span>© 2026 ConvoTools</span><nav><Link href="/">Home</Link><Link href="/about">About</Link><Link href="/#toolkit">All tools</Link><Link href="/terms">Terms</Link><Link href="/cookies">Storage</Link><Link href="/contact">Contact</Link><Link href="/licenses">Licenses</Link></nav></footer>
 </main>;
}
