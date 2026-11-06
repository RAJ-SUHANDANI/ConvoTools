"use client";

import { FormEvent, useState } from "react";
import { ArrowLeft, ArrowUpRight, KeyRound, LockKeyhole, UserRound } from "lucide-react";
import Link from "next/link";
import { motion } from "motion/react";
import BrandLogo from "@/components/BrandLogo";

export default function SavefromGate({ configured }: { configured: boolean }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setBusy(true);
    try {
      const response = await fetch("/api/savefrom/access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.error || "Login could not be verified.");
      window.location.reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login could not be verified.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="tool-page savefrom-gate-page">
      <header className="tool-page-header"><BrandLogo className="brand-tool" width={190} priority /><nav><Link href="/">Home</Link></nav></header>
      <motion.section className="savefrom-gate-card" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .45 }}>
        <div className="savefrom-gate-icon"><LockKeyhole size={25} /></div>
        <span className="tool-detail-kicker">PRIVATE WORKSPACE / RESTRICTED ACCESS</span>
        <h1>Private by<br /><em>default.</em></h1>
        {!configured ? (
          <p className="savefrom-gate-copy">Private login is not configured on this deployment. Add the server-side <code>SAVEFROM_USERNAME</code> and <code>SAVEFROM_PASSWORD</code> environment secrets, then restart the Codespace or redeploy.</p>
        ) : (
          <>
            <p className="savefrom-gate-copy">Enter your username and password to unlock this private workspace. Credentials are checked on the server and are never saved in browser storage.</p>
            <form className="savefrom-access-form" onSubmit={submit}>
              <label htmlFor="savefrom-username">Username</label>
              <div><UserRound size={15} /><input id="savefrom-username" name="username" type="text" autoComplete="username" value={username} onChange={(event) => setUsername(event.target.value)} placeholder="Enter username" required /></div>
              <label htmlFor="savefrom-password">Password</label>
              <div><KeyRound size={15} /><input id="savefrom-password" name="password" type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Enter password" required minLength={8} /></div>
              {error && <small role="alert">{error}</small>}
              <button disabled={busy || !username.trim() || password.length < 8}>{busy ? "Verifying…" : "Unlock workspace"} <ArrowUpRight size={14} /></button>
            </form>
          </>
        )}
        <Link className="savefrom-gate-back" href="/"><ArrowLeft size={14} /> Back to ConvoTools</Link>
      </motion.section>
      <span className="savefrom-gate-foot">NO PUBLIC NAVIGATION · SERVER-VERIFIED LOGIN</span>
    </main>
  );
}
