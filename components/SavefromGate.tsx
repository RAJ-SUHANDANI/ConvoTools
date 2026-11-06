"use client";

import { FormEvent, useState } from "react";
import { ArrowLeft, ArrowUpRight, KeyRound, LockKeyhole } from "lucide-react";
import Link from "next/link";
import { motion } from "motion/react";
import BrandLogo from "@/components/BrandLogo";

export default function SavefromGate({ configured }: { configured: boolean }) {
  const [accessKey, setAccessKey] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(""); setBusy(true);
    try {
      const response = await fetch("/api/savefrom/access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accessKey }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.error || "Access could not be verified.");
      window.location.reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Access could not be verified.");
    } finally { setBusy(false); }
  }
  return (
    <main className="tool-page savefrom-gate-page">
      <header className="tool-page-header"><BrandLogo className="brand-tool" width={190} priority /><nav><Link href="/">Home</Link></nav></header>
      <motion.section className="savefrom-gate-card" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .45 }}>
        <div className="savefrom-gate-icon"><LockKeyhole size={25} /></div>
        <span className="tool-detail-kicker">PRIVATE WORKSPACE / RESTRICTED ACCESS</span>
        <h1>Private by<br /><em>default.</em></h1>
        {!configured ? (
          <p className="savefrom-gate-copy">This private workspace is not enabled on this deployment. Configure <code>SAVEFROM_ACCESS_KEY</code> as a server-only environment variable with at least 32 random characters, then redeploy.</p>
        ) : (
          <>
            <p className="savefrom-gate-copy">Enter your private access key to open this workspace. The key is checked on the server and is never stored in browser storage.</p>
            <form className="savefrom-access-form" onSubmit={submit}>
              <label htmlFor="savefrom-access-key">Private access key</label>
              <div><KeyRound size={15} /><input id="savefrom-access-key" type="password" autoComplete="current-password" value={accessKey} onChange={(event) => setAccessKey(event.target.value)} placeholder="Enter your private key" required minLength={32} /></div>
              {error && <small role="alert">{error}</small>}
              <button disabled={busy || accessKey.length < 32}>{busy ? "Verifying…" : "Unlock workspace"} <ArrowUpRight size={14} /></button>
            </form>
          </>
        )}
        <Link className="savefrom-gate-back" href="/"><ArrowLeft size={14} /> Back to ConvoTools</Link>
      </motion.section>
      <span className="savefrom-gate-foot">NO PUBLIC NAVIGATION · SERVER-VERIFIED ACCESS</span>
    </main>
  );
}
