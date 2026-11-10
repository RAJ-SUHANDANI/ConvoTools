import Link from "next/link";
import { ArrowLeft, ArrowUpRight, Compass, FileQuestion } from "lucide-react";
import { Button } from "@animate-ui/react/primitives/buttons/button";
import { CountingNumber } from "@animate-ui/react/primitives/texts/counting-number";
import { Fade } from "@animate-ui/react/primitives/effects/fade";
import BrandLogo from "@/components/BrandLogo";
export default function NotFound(){
 return <main className="ct-state-page"><header className="ct-subpage-nav"><BrandLogo width={173}/><nav><Link href="/#toolkit">All tools</Link><Link href="/privacy">Privacy</Link></nav></header>
 <section className="ct-state-shell"><Fade><div className="ct-state-art" aria-hidden="true"><span className="ct-state-orbit ct-state-orbit-one"/><span className="ct-state-orbit ct-state-orbit-two"/><FileQuestion size={60}/></div></Fade>
 <span className="ct-eyebrow">LOST FILE? WRONG TURN?</span><h1><CountingNumber number={404} initiallyStable/></h1><h2>This page went missing.</h2><p>The link might have changed or the tool may not exist. Your files aren&apos;t affected. We can get you back to the right place.</p>
 <div className="ct-state-actions"><Button asChild><Link href="/">Back home <ArrowLeft size={17}/></Link></Button><Link href="/#toolkit">Browse the tools <Compass size={16}/></Link></div></section>
 </main>;
}
