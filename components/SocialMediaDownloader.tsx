"use client";

import { FormEvent, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight, Check, Clipboard, ExternalLink, Instagram, LockKeyhole, Music2, Play, ShieldCheck, Youtube } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import BrandLogo from "@/components/BrandLogo";

type Platform = "YouTube" | "Instagram" | "TikTok";
type Parsed = { platform: Platform; url: string; postId: string; kind: string; embed: string | null };
function parseSocialUrl(input: string): Parsed | null {
  let parsed: URL;
  try { parsed = new URL(input.trim()); } catch { return null; }
  if (parsed.protocol !== "https:" && parsed.protocol !== "http:") return null;
  const host = parsed.hostname.toLowerCase().replace(/^www\./, "");
  if (["youtube.com", "m.youtube.com", "music.youtube.com", "youtu.be"].includes(host)) {
    const id = host === "youtu.be" ? parsed.pathname.split("/").filter(Boolean)[0] :
      parsed.searchParams.get("v") || parsed.pathname.match(/^\/(?:shorts|embed|live)\/([^/?]+)/)?.[1] || "";
    if (!/^[A-Za-z0-9_-]{11}$/.test(id)) return null;
    return { platform: "YouTube", url: "https://www.youtube.com/watch?v=" + id, postId: id, kind: parsed.pathname.includes("/shorts/") ? "Short" : "video", embed: "https://www.youtube-nocookie.com/embed/" + id };
  }
  if (host === "instagram.com") {
    const match = parsed.pathname.match(/^\/(reel|p|tv)\/([A-Za-z0-9_-]+)/);
    if (!match) return null;
    const type = match[1] === "reel" ? "Reel" : match[1] === "p" ? "post" : "video";
    const id = match[2];
    return { platform: "Instagram", url: "https://www.instagram.com/" + match[1] + "/" + id + "/", postId: id, kind: type, embed: "https://www.instagram.com/" + match[1] + "/" + id + "/embed/" };
  }
  if (["tiktok.com", "vm.tiktok.com", "vt.tiktok.com"].includes(host)) {
    const video = parsed.pathname.match(/\/@[^/]+\/video\/(\d+)/);
    const photo = parsed.pathname.match(/\/@[^/]+\/photo\/(\d+)/);
    const id = video?.[1] || photo?.[1] || "";
    const kind = photo ? "photo post" : "video";
    return { platform: "TikTok", url: parsed.href, postId: id, kind, embed: id ? "https://www.tiktok.com/embed/v2/" + id : null };
  }
  return null;
}

const platformInfo = {
  YouTube: {
    title: "Use YouTube’s own download options",
    body: "YouTube Studio can export videos you uploaded. YouTube Premium offers offline viewing in supported locations, but those are in-app downloads rather than standalone MP4 files.",
    steps: ["For your own upload, open YouTube Studio → Content → video menu → Download.", "For offline viewing, use the Download option in the official YouTube app when it is offered."],
    link: "https://support.google.com/youtube/answer/56100?hl=en",
    linkLabel: "YouTube upload download help",
    icon: Youtube,
  },
  Instagram: {
    title: "Export the Instagram content you own",
    body: "For your own photos and reels, request a copy of your Instagram information through Accounts Center. This is the official export route for your account content.",
    steps: ["Open Accounts Center → Your information and permissions → Download your information.", "Choose the Instagram profile and the media you want included in the export."],
    link: "https://help.instagram.com/181231772500920",
    linkLabel: "Instagram data download help",
    icon: Instagram,
  },
  TikTok: {
    title: "Save only when the creator allows it",
    body: "TikTok exposes Save video / Save photo in the app when the creator has enabled downloads. If the save action is absent, the creator has restricted downloads.",
    steps: ["Open the original TikTok post in the official app.", "Tap Share → Save video or Save photo when that action is available."],
    link: "https://support.tiktok.com/en/using-tiktok/exploring-videos/video-downloads",
    linkLabel: "TikTok download settings",
    icon: Music2,
  },
};

export default function SocialMediaDownloader() {
  const [url, setUrl] = useState("");
  const [submitted, setSubmitted] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const parsed = useMemo(() => submitted ? parseSocialUrl(submitted) : null, [submitted]);
  const info = parsed ? platformInfo[parsed.platform] : null;

  const analyze = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setCopied(false);
    setError("");
    const next = parseSocialUrl(url);
    if (!next) {
      setSubmitted("");
      setError("Paste a supported public YouTube video, Instagram post/Reel or TikTok video/photo URL.");
      return;
    }
    setSubmitted(next.url);
  };

  const copyUrl = async () => {
    if (!parsed) return;
    try { await navigator.clipboard.writeText(parsed.url); setCopied(true); }
    catch { setError("Your browser blocked clipboard access. Copy the address from the field instead."); }
  };
  const PlatformIcon = info?.icon;

  return (
    <main className="tool-page social-saver-page">
      <motion.header className="tool-page-header" initial={{ y: -18, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: .5 }}>
        <BrandLogo className="brand-tool" width={190} priority />
        <nav><Link href="/#toolkit">All tools</Link><Link href="/dashboard">Workspace</Link><a href="https://github.com/RAJ-SUHANDANI/ConvoTools" target="_blank" rel="noreferrer">GitHub <ArrowUpRight size={12} /></a></nav>
        <Link className="tool-header-cta" href="/dashboard">Open workspace <ArrowUpRight size={13} /></Link>
      </motion.header>

      <motion.section className="social-saver-hero" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .55 }}>
        <span className="tool-detail-kicker">SOCIAL MEDIA / LINK PREVIEW & SAVE GUIDE</span>
        <h1>One link.<br /><em>Clear save options.</em></h1>
        <p>Paste a public YouTube, Instagram or TikTok link. ConvoTools identifies the platform, previews supported posts and points you to the creator-authorized way to save content.</p>
        <form className="social-url-form" onSubmit={analyze}>
          <div className="social-url-input"><Play size={17} /><input aria-label="Social media post URL" type="url" value={url} onChange={(event) => setUrl(event.target.value)} placeholder="Paste a YouTube, Instagram or TikTok URL…" required /><button type="submit">Check link <ArrowUpRight size={14} /></button></div>
          {error && <motion.small className="social-url-error" initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}>{error}</motion.small>}
        </form>
        <div className="social-platform-list"><span><Youtube size={16} /> YouTube</span><span><Instagram size={16} /> Instagram</span><span><Music2 size={16} /> TikTok</span></div>
      </motion.section>

      <AnimatePresence mode="wait">
        {parsed && info && PlatformIcon && (
          <motion.section key={parsed.platform + parsed.postId} className="social-result-grid" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: .3 }}>
            <div className="social-preview-card">
              <div className="social-card-topline"><span><PlatformIcon size={15} /> {parsed.platform.toUpperCase()}</span><small>{parsed.kind.toUpperCase()}</small></div>
              {parsed.embed ? <iframe className="social-embed" src={parsed.embed} title={parsed.platform + " " + parsed.kind + " preview"} loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen /> : <div className="social-embed-unavailable"><Play size={24} /><span>Open this short link on its platform to preview the post.</span></div>}
              <div className="social-preview-actions"><a href={parsed.url} target="_blank" rel="noreferrer">Open original <ExternalLink size={13} /></a><button onClick={copyUrl}><Clipboard size={13} /> {copied ? "Copied" : "Copy link"}</button></div>
            </div>
            <div className="social-official-card">
              <span className="social-official-kicker"><ShieldCheck size={14} /> OFFICIAL SAVE ROUTE</span>
              <h2>{info.title}</h2>
              <p>{info.body}</p>
              <ol>{info.steps.map((step, index) => <li key={index}><span>0{index + 1}</span>{step}</li>)}</ol>
              <a className="social-help-link" href={info.link} target="_blank" rel="noreferrer">{info.linkLabel} <ArrowUpRight size={14} /></a>
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      <motion.aside className="social-saver-notice" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
        <LockKeyhole size={18} />
        <div><b>Respect creator settings and platform restrictions.</b><p>ConvoTools does not scrape private profiles, remove watermarks, bypass disabled downloads or extract restricted video streams. Save only content you own or have permission to use.</p></div>
      </motion.aside>
      <section className="social-saver-bottom"><Link href="/#toolkit"><ArrowLeft size={14} /> Back to all tools</Link><span>CONVOTOOLS · LINKS STAY IN YOUR BROWSER</span></section>
    </main>
  );
}
