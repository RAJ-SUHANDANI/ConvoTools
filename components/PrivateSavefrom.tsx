"use client";

import { FormEvent, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight, ExternalLink, Instagram, Music2, Play, ShieldCheck, Youtube, Download } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import BrandLogo from "@/components/BrandLogo";
import { Button } from "@animate-ui/react/primitives/buttons/button";

type Platform = "YouTube" | "Instagram" | "TikTok" | "Direct media";
type Parsed = { platform: Platform; url: string; title: string; id?: string; kind: string; embed?: string; mediaType?: "image" | "video"; extension?: string };
function parseInput(input: string): Parsed | null {
  let url: URL;
  try { url = new URL(input.trim()); } catch { return null; }
  if (url.protocol !== "https:" && url.protocol !== "http:") return null;
  const host = url.hostname.toLowerCase().replace(/^www\./, "");
  if (["youtube.com", "m.youtube.com", "music.youtube.com", "youtu.be"].includes(host)) {
    const id = host === "youtu.be" ? url.pathname.split("/").filter(Boolean)[0] : url.searchParams.get("v") || url.pathname.match(/^\/(?:shorts|embed|live)\/([^/?]+)/)?.[1] || "";
    if (!/^[A-Za-z0-9_-]{11}$/.test(id)) return null;
    return { platform: "YouTube", url: "https://www.youtube.com/watch?v=" + id, title: "YouTube link", id, kind: url.pathname.includes("/shorts/") ? "Short" : "video", embed: "https://www.youtube-nocookie.com/embed/" + id };
  }
  if (host === "instagram.com") {
    const match = url.pathname.match(/^\/(reel|p|tv)\/([A-Za-z0-9_-]+)/);
    if (!match) return null;
    return { platform: "Instagram", url: "https://www.instagram.com/" + match[1] + "/" + match[2] + "/", title: "Instagram post", id: match[2], kind: match[1] === "reel" ? "Reel" : "post", embed: "https://www.instagram.com/" + match[1] + "/" + match[2] + "/embed/" };
  }
  if (["tiktok.com", "vm.tiktok.com", "vt.tiktok.com"].includes(host)) {
    const match = url.pathname.match(/\/@[^/]+\/(?:video|photo)\/(\d+)/);
    const id = match?.[1];
    return { platform: "TikTok", url: url.href, title: "TikTok post", id, kind: url.pathname.includes("/photo/") ? "photo post" : "video", embed: id && !url.pathname.includes("/photo/") ? "https://www.tiktok.com/player/v1/" + id : undefined };
  }
  const ext = url.pathname.split(".").pop()?.toLowerCase() || "";
  if (["mp4","webm","mov","m4v","jpg","jpeg","png","webp","gif","avif"].includes(ext)) {
    const mediaType = ["jpg","jpeg","png","webp","gif","avif"].includes(ext) ? "image" : "video";
    return { platform: "Direct media", url: url.href, title: "Direct media file", kind: ext.toUpperCase() + " file", mediaType, extension: ext };
  }
  return null;
}
const guides = {
  YouTube: { title: "Save through YouTube’s own tools", detail: "For a video you uploaded, YouTube Studio provides an official download. Premium offline viewing is provided inside the YouTube app, not as a standalone media file.", steps: ["Open YouTube Studio → Content → the video’s menu → Download.", "For offline viewing, use Download in the official YouTube app when available."], href: "https://support.google.com/youtube/answer/56100?hl=en", label: "YouTube download help", icon: Youtube },
  Instagram: { title: "Export your own Instagram media", detail: "For photos and reels from your own profile, request an export of your account information through Meta Accounts Center.", steps: ["Open Accounts Center → Your information and permissions → Download your information.", "Select your Instagram profile and choose the media included in the export."], href: "https://help.instagram.com/181231772500920", label: "Instagram export help", icon: Instagram },
  TikTok: { title: "Use the creator-enabled save action", detail: "TikTok offers Save video or Save photo when the creator allows downloads. If the action is missing, the creator has disabled downloads.", steps: ["Open the original post in the TikTok app.", "Tap Share → Save video or Save photo if the option is present."], href: "https://support.tiktok.com/en/using-tiktok/exploring-videos/video-downloads", label: "TikTok download help", icon: Music2 },
};

export default function PrivateSavefrom() {
  const [value, setValue] = useState("");
  const [submitted, setSubmitted] = useState("");
  const [error, setError] = useState("");
  const [downloadError, setDownloadError] = useState("");
  const [downloading, setDownloading] = useState(false);
  const [mediaDimensions, setMediaDimensions] = useState("");
  const parsed = useMemo(() => submitted ? parseInput(submitted) : null, [submitted]);
  const guide = parsed && parsed.platform !== "Direct media" ? guides[parsed.platform] : null;

  function analyse(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError("");
    const parsedValue = parseInput(value);
    if (!parsedValue) { setSubmitted(""); setError("Use a supported YouTube video, Instagram Reel/post, TikTok video/photo or direct media-file URL."); return; }
    setDownloadError(""); setMediaDimensions(""); setSubmitted(parsedValue.url);
  }
  async function downloadDirectMedia() {
    if (!parsed || parsed.platform !== "Direct media") return;
    setDownloading(true);
    setDownloadError("");
    try {
      const response = await fetch(parsed.url, { mode: "cors", credentials: "omit" });
      if (!response.ok) throw new Error("The media host returned HTTP " + response.status + ".");
      const blob = await response.blob();
      if (!blob.size) throw new Error("The source returned an empty file.");
      if (!blob.type.startsWith("image/") && !blob.type.startsWith("video/") && !["application/octet-stream", ""].includes(blob.type)) {
        throw new Error("The source did not return a recognized image or video file.");
      }
      const objectUrl = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      const filename = decodeURIComponent(new URL(parsed.url).pathname.split("/").pop() || "media-file").replace(/[^a-zA-Z0-9._-]/g, "_");
      anchor.href = objectUrl;
      anchor.download = filename;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      window.setTimeout(() => URL.revokeObjectURL(objectUrl), 60_000);
    } catch (cause) {
      setDownloadError(
        cause instanceof Error
          ? cause.message + " This host may block cross-origin downloads. Open the original file and use its download control if available."
          : "This host blocked the browser download. Open the original file and use its download control if available."
      );
    } finally {
      setDownloading(false);
    }
  }

  return (
    <main className="tool-page savefrom-private-page">
      <header className="tool-page-header savefrom-header"><BrandLogo className="brand-tool" width={190} priority /><nav aria-label="Main navigation"><Link href="/">Home</Link><Link href="/privacy">Privacy</Link><Link href="/dashboard">Workspace</Link></nav></header>
      <motion.section className="savefrom-private-hero" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .5 }}>
        <span className="tool-detail-kicker"><Download size={13} /> MEDIA LINK WORKSPACE</span>
        <h1>Drop the link.<br /><em>Know what you can save.</em></h1>
        <p>Paste a public post URL to identify its platform, preview supported embeds and open the correct save flow. Direct image and video file URLs can be downloaded in their original quality when the host permits browser access. Social platform links show the platform’s own save options.</p>
        <form className="savefrom-url-form" onSubmit={analyse}>
          <div className="savefrom-url-control"><Download size={17} /><input type="url" aria-label="Media URL" required value={value} onChange={(event) => setValue(event.target.value)} placeholder="Paste a video, Reel, TikTok or media-file URL…" /><Button type="submit">Analyse link <ArrowUpRight size={14} /></Button></div>
          {error && <small className="savefrom-error" role="alert">{error}</small>}
        </form>
        <div className="savefrom-platform-tags"><span><Youtube size={15} /> YouTube</span><span><Instagram size={15} /> Instagram</span><span><Music2 size={15} /> TikTok</span><span><Download size={15} /> Direct media</span></div>
      </motion.section>
      <AnimatePresence mode="wait">
        {parsed && (
          <motion.section className="savefrom-result-layout" key={parsed.platform+parsed.url} initial={{ opacity: 0, y: 13 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -7 }}>
            <article className="savefrom-preview-card">
              <div className="savefrom-card-head"><b>{parsed.title}</b><span>{parsed.platform.toUpperCase()} · {parsed.kind.toUpperCase()}</span></div>
              {parsed.platform === "Direct media" && parsed.mediaType === "video" ? <video className="savefrom-embed savefrom-direct-preview" src={parsed.url} controls playsInline preload="metadata" onLoadedMetadata={(event) => setMediaDimensions(event.currentTarget.videoWidth + " × " + event.currentTarget.videoHeight)} /> : parsed.platform === "Direct media" && parsed.mediaType === "image" ? <img className="savefrom-embed savefrom-direct-image" src={parsed.url} alt="Preview of the direct image file" onLoad={(event) => setMediaDimensions(event.currentTarget.naturalWidth + " × " + event.currentTarget.naturalHeight)} /> : parsed.embed ? <iframe className="savefrom-embed" src={parsed.embed} title={parsed.platform+" preview"} loading="lazy" allow="encrypted-media; picture-in-picture; web-share" allowFullScreen /> : <div className="savefrom-preview-placeholder"><Play size={24} /><span>This post type may not offer an embedded preview. Open the original post to view it.</span></div>}
              <a className="savefrom-original-link" href={parsed.url} target="_blank" rel="noreferrer">{parsed.platform === "Direct media" ? "Open source file" : "Open original post"} <ExternalLink size={13} /></a>
              {parsed.platform === "Direct media" && <div className="savefrom-download-panel"><div className="savefrom-download-meta"><span>DOWNLOAD QUALITY</span><b>{mediaDimensions ? "Original · " + mediaDimensions : "Original source quality"}</b><small>Only the quality supplied by this direct file is available. No artificial upscaling.</small></div><Button className="savefrom-download-button" type="button" onClick={downloadDirectMedia} disabled={downloading}><Download size={15} /> {downloading ? "Preparing download…" : "Download original file"}</Button>{downloadError && <p className="savefrom-download-error" role="alert">{downloadError} <a href={parsed.url} target="_blank" rel="noreferrer">Open source file</a></p>}</div>}
            </article>
            <article className="savefrom-guide-card">
              <span className="savefrom-guide-label"><ShieldCheck size={14} /> {guide ? "OFFICIAL SAVE ROUTE" : "DIRECT FILE LINK"}</span>
              {guide ? <><h2>{guide.title}</h2><p>{guide.detail}</p><ol>{guide.steps.map((step,index)=><li key={index}><span>0{index+1}</span>{step}</li>)}</ol><a className="savefrom-help-link" href={guide.href} target="_blank" rel="noreferrer">{guide.label} <ArrowUpRight size={13} /></a></> : <><h2>Download the original media file.</h2><p>This direct image or video URL points to a media file. Use the download control to save the original file when its host permits browser access. The original resolution is preserved.</p><p className="savefrom-guidance-note">Only use direct links for files you own, have permission to save, or are licensed to download.</p></>}
            </article>
          </motion.section>
        )}
      </AnimatePresence>
      <aside className="savefrom-legal-note"><ShieldCheck size={17} /><div><b>Platform-respecting behaviour.</b><p>This page does not bypass private accounts, DRM, login restrictions, watermarks or creator-disabled downloads. It does not scrape page source or extract platform media streams. Only save media that you own or are authorized to use.</p></div></aside>
      <footer className="savefrom-private-footer"><Link href="/"><ArrowLeft size={13} /> Return to ConvoTools</Link><span>MEDIA LINKS · OPENED FROM THEIR ORIGINAL SOURCE</span></footer>
    </main>
  );
}
