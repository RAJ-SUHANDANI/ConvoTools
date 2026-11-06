"use client";

import Link from "next/link";
import { ArrowLeft, ArrowUpRight, Clock3, LockKeyhole, Sparkles } from "lucide-react";
import { motion } from "motion/react";
import BrandLogo from "@/components/BrandLogo";

export default function ComingSoon({ toolName }: { toolName: string }) {
  return (
    <main className="tool-page coming-soon-page">
      <motion.header className="tool-page-header" initial={{ y: -16, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: .45 }}>
        <BrandLogo className="brand-tool" width={190} priority />
        <nav><Link href="/#toolkit">All tools</Link><Link href="/dashboard">Workspace</Link><a href="https://github.com/RAJ-SUHANDANI/ConvoTools" target="_blank" rel="noreferrer">GitHub <ArrowUpRight size={12} /></a></nav>
        <Link className="tool-header-cta" href="/#toolkit">Explore tools <ArrowUpRight size={13} /></Link>
      </motion.header>
      <motion.section className="coming-soon-shell" initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .55, ease: [ .22, 1, .36, 1 ] }}>
        <div className="coming-soon-orbit"><span /><span /><span /><div><LockKeyhole size={28} /></div></div>
        <span className="tool-detail-kicker"><i /> AI LAB / ACCESS LOCKED</span>
        <h1>Something intelligent<br /><em>is taking shape.</em></h1>
        <p><b>{toolName}</b> is temporarily unavailable while we prepare the next version of ConvoTools AI. Its processing route is locked as well, so it cannot be opened directly or run from another workspace entry.</p>
        <div className="coming-soon-status"><span><Clock3 size={15} /> COMING SOON</span><span><Sparkles size={15} /> AI LAB IN DEVELOPMENT</span></div>
        <div className="coming-soon-actions"><Link className="operation-submit" href="/#toolkit">Explore available tools <ArrowUpRight size={15} /></Link><Link className="coming-soon-back" href="/dashboard"><ArrowLeft size={14} /> Back to workspace</Link></div>
      </motion.section>
      <div className="coming-soon-foot">CONVOTOOLS · LOCAL-FIRST FILE WORKSPACE</div>
    </main>
  );
}
