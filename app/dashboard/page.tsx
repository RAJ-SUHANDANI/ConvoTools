"use client";

import { ChangeEvent, DragEvent, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  Activity, ArrowDownRight, ArrowRight, ArrowUpRight, Bell, Check,
  ChevronDown, Clock3, Command, FileClock, FileImage, FileText,
  FolderOpen, Gauge, Heart, Home, Image as ImageIcon, LayoutDashboard,
  LockKeyhole, LogOut, Menu, Plus, Search, Settings, ShieldCheck,
  Sparkles, Star, UploadCloud, UserRound, WandSparkles, X, Zap
} from "lucide-react";
import FileActionPanel from "@/components/FileActionPanel";
import BrandLogo from "@/components/BrandLogo";
import { TOOLS, slugify } from "@/lib/tools";
import {
  clearActivity, readActivity, readFavorites, readProfile, readSettings,
  recordActivity, saveFavorites, saveProfile, saveSettings,
  type ActivityItem, type ProfileData, type UserSettings
} from "@/lib/activity";

type Tab = "Overview" | "My files" | "Activity" | "Favorites" | "Settings" | "All tools" | "PDF tools" | "Image lab" | "AI tools";

const tabIcons = {
  Overview: LayoutDashboard,
  "My files": FolderOpen,
  Activity: Activity,
  Favorites: Heart,
  Settings: Settings,
  "All tools": Command,
  "PDF tools": FileText,
  "Image lab": ImageIcon,
  "AI tools": WandSparkles,
};

function formatDate(timestamp: number) {
  return new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(new Date(timestamp));
}

function relativeDate(timestamp: number) {
  const days = Math.floor((Date.now() - timestamp) / 86400000);
  if (days <= 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return days + " days ago";
  return formatDate(timestamp);
}

function formatBytes(bytes = 0) {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(2) + " MB";
}

export default function DashboardPage() {
  const reducedMotion = useReducedMotion();
  const inputRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState<Tab>("Overview");
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [profile, setProfile] = useState<ProfileData>({ name: "", email: "" });
  const [settings, setSettings] = useState<UserSettings>({ saveHistory: true, motion: true });
  const [files, setFiles] = useState<File[]>([]);
  const [dragging, setDragging] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [fileSearch, setFileSearch] = useState("");
  const [toolSearch, setToolSearch] = useState("");
  const [dateLabel, setDateLabel] = useState("");

  const refreshLocalData = () => {
    setActivity(readActivity());
    setFavorites(readFavorites());
    setProfile(readProfile());
    setSettings(readSettings());
  };

  useEffect(() => {
    // Keep locale-dependent date formatting out of the server-rendered tree.
    setDateLabel(new Intl.DateTimeFormat("en-IN", {
      weekday: "long", day: "numeric", month: "long", timeZone: "Asia/Kolkata",
    }).format(new Date()).toUpperCase());
    refreshLocalData();
    const onData = () => refreshLocalData();
    window.addEventListener("convotools:local-data", onData);
    window.addEventListener("storage", onData);
    return () => {
      window.removeEventListener("convotools:local-data", onData);
      window.removeEventListener("storage", onData);
    };
  }, []);

  const uploads = useMemo(() => activity.filter((item) => item.type === "upload"), [activity]);
  const openedTools = useMemo(() => activity.filter((item) => item.type === "tool"), [activity]);
  const favoriteTools = useMemo(() => TOOLS.filter((tool) => favorites.includes(slugify(tool.name))), [favorites]);
  const filteredUploads = useMemo(() => {
    const term = fileSearch.trim().toLowerCase();
    return uploads.filter((item) => !term || (item.filename || item.title).toLowerCase().includes(term));
  }, [uploads, fileSearch]);
  const libraryTools = useMemo(() => {
    const category = activeTab === "PDF tools" ? "PDF"
      : activeTab === "Image lab" ? "Images"
      : activeTab === "AI tools" ? "AI lab"
      : null;
    const term = toolSearch.trim().toLowerCase();
    return TOOLS.filter((tool) => {
      const matchesCategory = !category || tool.category === category;
      const matchesSearch = !term || (tool.name + " " + tool.description + " " + tool.category).toLowerCase().includes(term);
      return matchesCategory && matchesSearch;
    });
  }, [activeTab, toolSearch]);

  const addFiles = (incoming: FileList | File[]) => {
    const next = Array.from(incoming).filter((file) => file.size > 0);
    next.forEach((file) => recordActivity({
      type: "upload",
      title: file.name,
      filename: file.name,
      size: file.size,
      description: "Added from the dashboard workspace",
    }));
    setFiles((current) => [...current, ...next].slice(0, 30));
  };

  const onChoose = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) addFiles(event.target.files);
    event.target.value = "";
  };

  const onDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragging(false);
    addFiles(event.dataTransfer.files);
  };

  const toggleFavorite = (slug: string) => {
    const next = favorites.includes(slug) ? favorites.filter((value) => value !== slug) : [...favorites, slug];
    setFavorites(next);
    saveFavorites(next);
  };

  const updateSettings = (patch: Partial<UserSettings>) => {
    const next = { ...settings, ...patch };
    setSettings(next);
    saveSettings(next);
  };

  const saveProfileChanges = () => {
    saveProfile(profile);
    setProfileSaved(true);
    window.setTimeout(() => setProfileSaved(false), 2200);
  };

  const viewMotion = reducedMotion || !settings.motion
    ? { initial: false as const, animate: { opacity: 1 } }
    : { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 } };

  const navButton = (tab: Tab, label?: string) => {
    const Icon = tabIcons[tab];
    return (
      <button
        key={tab}
        className={activeTab === tab ? "dash-nav-item active" : "dash-nav-item"}
        onClick={() => { setActiveTab(tab); setMobileSidebarOpen(false); }}
      >
        <Icon size={16} />
        <span>{label || tab}</span>
        {tab === "Favorites" && favorites.length > 0 && <small>{favorites.length}</small>}
      </button>
    );
  };

  const recentTools = openedTools.slice(0, 4);
  const recentItems = activity.slice(0, 6);

  return (
    <main className="dashboard-shell">
      <AnimatePresence>
        {mobileSidebarOpen && <motion.button className="dash-sidebar-scrim" aria-label="Close navigation" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setMobileSidebarOpen(false)} />}
      </AnimatePresence>
      <aside className={"dashboard-sidebar" + (mobileSidebarOpen ? " sidebar-open" : "")}>
        <div className="dash-sidebar-top">
          <BrandLogo variant="inverse" className="brand-dashboard" width={176} priority />
          <span className="dash-workspace-label">PERSONAL WORKSPACE</span>
        </div>

        <div className="dash-nav-group">
          <span className="dash-nav-caption">WORKSPACE</span>
          {navButton("Overview")}
          {navButton("My files")}
          {navButton("Activity")}
          {navButton("Favorites")}
        </div>
        <div className="dash-nav-group">
          <span className="dash-nav-caption">TOOLBOX</span>
          {navButton("All tools")}
          {navButton("PDF tools")}
          {navButton("Image lab")}
          {navButton("AI tools")}
        </div>
        <div className="dash-sidebar-bottom">
          <div className="dash-privacy-card"><ShieldCheck size={17} /><div><b>Local by default</b><span>Your history stays in this browser.</span></div></div>
          <button className="dash-nav-item" onClick={() => setActiveTab("Settings")}><Settings size={16} /><span>Settings</span></button>
          <Link className="dash-user-card" href="/dashboard">
            <span className="dash-user-avatar">{(profile.name.trim()[0] || "G").toUpperCase()}</span>
            <span><b>{profile.name.trim() || "Guest workspace"}</b><small>{profile.email || "Local profile"}</small></span>
            <ChevronDown size={14} />
          </Link>
        </div>
      </aside>

      <div className="dashboard-main">
        <header className="dashboard-topbar">
          <div className="dash-topbar-left">
            <button className="dash-mobile-menu" aria-label="Open navigation" onClick={() => setMobileSidebarOpen(true)}><Menu size={18} /></button>
            <div className="dash-breadcrumb"><span>ConvoTools</span><i>/</i><b>{activeTab}</b></div>
          </div>
          <div className="dash-topbar-actions">
            <span className="dash-local-pill"><i /> LOCAL WORKSPACE</span>
            <button className="dash-icon-button" aria-label="Activity" onClick={() => setActiveTab("Activity")}><Bell size={16} />{activity.length > 0 && <i />}</button>
            <button className="dash-profile-button" onClick={() => setActiveTab("Settings")}><span className="dash-user-avatar">{(profile.name.trim()[0] || "G").toUpperCase()}</span><span>{profile.name.trim() || "Guest"}</span><ChevronDown size={13} /></button>
          </div>
        </header>

        <div className="dashboard-content">
          <AnimatePresence mode="wait">
            <motion.div key={activeTab} className="dashboard-view" {...viewMotion} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}>
              {activeTab === "Overview" && (
                <>
                  <div className="dashboard-greeting">
                    <div><span className="section-kicker">YOUR FILE DESK{dateLabel ? " / " + dateLabel : ""}</span><h1>{profile.name.trim() ? "Welcome back, " + profile.name.trim().split(" ")[0] + "." : "Your workspace."}<em> Ready when you are.</em></h1><p>Pick up where you left off, or drop in something new.</p></div>
                    <button className="dash-primary-action" onClick={() => setActiveTab("All tools")}>Explore all tools <ArrowUpRight size={14} /></button>
                  </div>

                  <div className="dash-stat-grid">
                    <motion.div className="dash-stat-card" whileHover={settings.motion && !reducedMotion ? { y: -4 } : undefined} transition={{ type: "spring", stiffness: 320, damping: 24 }}><span className="dash-stat-icon violet"><Command size={17} /></span><small>AVAILABLE TOOLS</small><strong>{TOOLS.length}</strong><span>Across 10 categories</span></motion.div>
                    <motion.div className="dash-stat-card" whileHover={{ y: -4 }} transition={{ type: "spring", stiffness: 320, damping: 24 }}><span className="dash-stat-icon green"><FileImage size={17} /></span><small>FILES ADDED</small><strong>{uploads.length}</strong><span>Tracked in this browser</span></motion.div>
                    <motion.div className="dash-stat-card" whileHover={{ y: -4 }} transition={{ type: "spring", stiffness: 320, damping: 24 }}><span className="dash-stat-icon blue"><Activity size={17} /></span><small>TOOLS OPENED</small><strong>{openedTools.length}</strong><span>Tool pages visited</span></motion.div>
                    <motion.div className="dash-stat-card" whileHover={{ y: -4 }} transition={{ type: "spring", stiffness: 320, damping: 24 }}><span className="dash-stat-icon amber"><Heart size={17} /></span><small>FAVORITES</small><strong>{favorites.length}</strong><span>Your saved shortcuts</span></motion.div>
                  </div>

                  <div className="dash-main-grid">
                    <section className="dash-upload-card">
                      <div className="dash-card-heading"><div><span className="micro-label">UNIVERSAL WORKSPACE</span><h2>Start with a file.</h2><p>We&apos;ll identify the format and suggest useful next steps.</p></div><span className="dash-heading-symbol"><UploadCloud size={19} /></span></div>
                      <input ref={inputRef} type="file" className="operation-input" multiple onChange={onChoose} />
                      <div className={"dash-upload-zone" + (dragging ? " drag-active" : "")} onDragEnter={(event) => { event.preventDefault(); setDragging(true); }} onDragOver={(event) => event.preventDefault()} onDragLeave={(event) => { if (!event.currentTarget.contains(event.relatedTarget as Node)) setDragging(false); }} onDrop={onDrop}>
                        <span className="dash-upload-icon"><UploadCloud size={22} /></span><b>Drop files here</b><small>PDF, images, Office, video, audio and archives</small><button onClick={() => inputRef.current?.click()}>Browse files <Plus size={14} /></button>
                      </div>
                      {files.length > 0 && <FileActionPanel files={files} onRemove={(index) => setFiles((current) => current.filter((_, fileIndex) => fileIndex !== index))} />}
                    </section>

                    <section className="dash-activity-card">
                      <div className="dash-card-heading compact"><div><span className="micro-label">YOUR TRAIL</span><h2>Recent activity</h2></div><button onClick={() => setActiveTab("Activity")}>View all <ArrowUpRight size={13} /></button></div>
                      {recentItems.length === 0 ? <div className="dash-empty-state"><span><Clock3 size={19} /></span><b>Your activity starts here.</b><p>Uploads and opened tools will appear here as you use ConvoTools.</p></div> :
                        <div className="dash-activity-list">{recentItems.map((item) => <ActivityRow key={item.id} item={item} />)}</div>}
                    </section>
                  </div>

                  <section className="dash-quick-tools">
                    <div className="dash-card-heading compact"><div><span className="micro-label">QUICK ACCESS</span><h2>Popular tools</h2></div><button onClick={() => setActiveTab("All tools")}>Browse library <ArrowUpRight size={13} /></button></div>
                    <div className="dash-quick-grid">
                      {["PDF to Word", "Image to PDF", "PNG to JPG", "Image enhancer"].map((name) => {
                        const tool = TOOLS.find((item) => item.name === name)!;
                        const Icon = tool.icon;
                        const slug = slugify(tool.name);
                        return <Link className="dash-quick-tool" href={"/tools/" + slug} key={slug}><span><Icon size={17} /></span><b>{tool.name}</b><small>{tool.description}</small><ArrowUpRight size={14} /></Link>;
                      })}
                    </div>
                  </section>
                </>
              )}

              {activeTab === "My files" && (
                <section className="dash-page-panel">
                  <div className="dash-page-title"><div><span className="section-kicker">YOUR LIBRARY</span><h1>My files<em>.</em></h1><p>Recent upload details saved locally. File contents aren&apos;t stored in this history.</p></div><button className="dash-primary-action" onClick={() => inputRef.current?.click()}>Add files <Plus size={14} /></button></div>
                  <input ref={inputRef} type="file" className="operation-input" multiple onChange={onChoose} />
                  <label className="dash-list-search"><Search size={15} /><input value={fileSearch} onChange={(event) => setFileSearch(event.target.value)} placeholder="Search uploaded file names..." /></label>
                  {filteredUploads.length === 0 ? <EmptyPanel icon={<FolderOpen size={22} />} title="No files in your library yet" copy="Add a file from this page or the overview. Its details will appear here." /> :
                    <div className="dash-file-table"><div className="dash-table-head"><span>FILE</span><span>SIZE</span><span>ADDED</span><span>STATUS</span></div>{filteredUploads.map((item) => <div className="dash-file-table-row" key={item.id}><span className="dash-file-cell"><i><FileText size={16} /></i><b>{item.filename || item.title}</b></span><span>{formatBytes(item.size)}</span><span>{relativeDate(item.timestamp)}</span><span className="dash-local-state"><Check size={12} /> Local metadata</span></div>)}</div>}
                </section>
              )}

              {activeTab === "Activity" && (
                <section className="dash-page-panel">
                  <div className="dash-page-title"><div><span className="section-kicker">YOUR WORK HISTORY</span><h1>Activity<em>.</em></h1><p>Uploads and tool pages opened in this browser. Conversion completion is only recorded once processing is connected.</p></div>{activity.length > 0 && <button className="dash-quiet-button" onClick={() => { clearActivity(); setActivity([]); }}>Clear history <X size={13} /></button>}</div>
                  {activity.length === 0 ? <EmptyPanel icon={<Activity size={22} />} title="Nothing here just yet" copy="Your recent uploads and visited tool pages will show here." /> : <div className="dash-full-activity">{activity.map((item) => <ActivityRow key={item.id} item={item} detailed />)}</div>}
                </section>
              )}

              {activeTab === "Favorites" && (
                <section className="dash-page-panel">
                  <div className="dash-page-title"><div><span className="section-kicker">YOUR SHORTCUTS</span><h1>Favorites<em>.</em></h1><p>Keep the tools you reach for most close at hand.</p></div><button className="dash-primary-action" onClick={() => setActiveTab("All tools")}>Find tools <ArrowUpRight size={14} /></button></div>
                  {favoriteTools.length === 0 ? <EmptyPanel icon={<Heart size={22} />} title="Save your go-to tools" copy="Open any tool page and choose “Save this tool” to pin it here." /> :
                    <div className="dash-favorite-grid">{favoriteTools.map((tool) => { const Icon = tool.icon; const slug = slugify(tool.name); return <div className="dash-favorite-card" key={slug}><Link href={"/tools/" + slug}><span><Icon size={18} /></span><b>{tool.name}</b><small>{tool.description}</small></Link><button aria-label={"Remove " + tool.name + " from favorites"} onClick={() => toggleFavorite(slug)}><Heart size={15} fill="currentColor" /></button></div>; })}</div>}
                </section>
              )}

              {(activeTab === "All tools" || activeTab === "PDF tools" || activeTab === "Image lab" || activeTab === "AI tools") && (
                <section className="dash-page-panel dash-tool-library-page">
                  <div className="dash-page-title">
                    <div>
                      <span className="section-kicker">TOOLBOX / {activeTab.toUpperCase()}</span>
                      <h1>{activeTab}<em>.</em></h1>
                      <p>{activeTab === "AI tools"
                        ? "Explore every AI-assisted tool in one place, from image enhancement to OCR."
                        : activeTab === "Image lab"
                          ? "Convert, resize, compress and refine images with dedicated tools."
                          : activeTab === "PDF tools"
                            ? "Convert, combine, split, organize and protect PDF documents."
                            : "The complete ConvoTools library. Choose a category or search for the task you need."}</p>
                    </div>
                    <span className="dash-tool-count">{libraryTools.length} {libraryTools.length === 1 ? "TOOL" : "TOOLS"}</span>
                  </div>
                  <label className="dash-list-search dash-tool-library-search"><Search size={15} /><input value={toolSearch} onChange={(event) => setToolSearch(event.target.value)} placeholder={"Search " + activeTab.toLowerCase() + "..."} /></label>
                  {libraryTools.length === 0 ? <EmptyPanel icon={<Search size={22} />} title="No matching tools" copy="Try another search term to find the tool you need." /> : (
                    <div className="dash-tool-library-grid">
                      {libraryTools.map((tool) => {
                        const Icon = tool.icon;
                        const slug = slugify(tool.name);
                        return (
                          <Link className="dash-tool-library-card" href={"/tools/" + slug} key={slug}>
                            <div className="dash-tool-card-top"><span>{tool.category === "AI lab" ? "AI TOOLS" : tool.category.toUpperCase()}</span><ArrowUpRight size={14} /></div>
                            <span className="dash-tool-card-icon"><Icon size={19} /></span>
                            <b>{tool.name}</b>
                            <p>{tool.description}</p>
                            <span className="dash-tool-card-action">Open tool <ArrowRight size={13} /></span>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </section>
              )}

              {activeTab === "Settings" && (
                <section className="dash-page-panel">
                  <div className="dash-page-title"><div><span className="section-kicker">PREFERENCES</span><h1>Settings<em>.</em></h1><p>Manage your local profile and workspace preferences.</p></div></div>
                  <div className="dash-settings-grid">
                    <section className="dash-settings-card">
                      <div className="dash-settings-heading"><span><UserRound size={17} /></span><div><b>Profile</b><small>Personalize this browser workspace.</small></div></div>
                      <label className="dash-field-label">Display name<input value={profile.name} onChange={(event) => setProfile((current) => ({ ...current, name: event.target.value }))} placeholder="Your name" /></label>
                      <label className="dash-field-label">Email (optional)<input value={profile.email} onChange={(event) => setProfile((current) => ({ ...current, email: event.target.value }))} placeholder="you@example.com" type="email" /></label>
                      <button className="dash-primary-action" onClick={saveProfileChanges}>{profileSaved ? <><Check size={14} /> Saved</> : <>Save profile <ArrowRight size={14} /></>}</button>
                    </section>
                    <section className="dash-settings-card">
                      <div className="dash-settings-heading"><span><Gauge size={17} /></span><div><b>Workspace preferences</b><small>Choose how ConvoTools behaves.</small></div></div>
                      <SettingSwitch title="Save local activity" description="Keep upload metadata and recently opened tools in this browser." value={settings.saveHistory} onChange={(value) => updateSettings({ saveHistory: value })} />
                      <SettingSwitch title="Motion effects" description="Enable page reveals and interface motion. Reduced-motion preferences are always respected." value={settings.motion} onChange={(value) => updateSettings({ motion: value })} />
                    </section>
                    <section className="dash-settings-card dash-security-card">
                      <div className="dash-settings-heading"><span><ShieldCheck size={17} /></span><div><b>Privacy & storage</b><small>Local browser data only. No account is connected.</small></div></div>
                      <p>ConvoTools currently stores activity, favorites and profile preferences in local browser storage. Uploaded file contents are not stored by this dashboard.</p>
                      <button className="dash-danger-button" onClick={() => { clearActivity(); saveFavorites([]); setActivity([]); setFavorites([]); }}>Clear local history & favorites <X size={13} /></button>
                    </section>
                  </div>
                </section>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </main>
  );
}

function ActivityRow({ item, detailed = false }: { item: ActivityItem; detailed?: boolean }) {
  const isUpload = item.type === "upload";
  return (
    <div className={"dash-activity-row" + (detailed ? " detailed" : "")}>
      <span className={"dash-activity-icon " + (isUpload ? "upload" : "tool")}>{isUpload ? <UploadCloud size={15} /> : <Command size={15} />}</span>
      <div className="dash-activity-copy"><b>{isUpload ? item.filename || item.title : item.title}</b><small>{item.description}</small></div>
      <span className="dash-activity-time">{detailed ? formatDate(item.timestamp) : relativeDate(item.timestamp)}</span>
      {!isUpload && item.toolSlug && <Link href={"/tools/" + item.toolSlug} className="dash-activity-open">Open <ArrowUpRight size={12} /></Link>}
    </div>
  );
}

function EmptyPanel({ icon, title, copy }: { icon: React.ReactNode; title: string; copy: string }) {
  return <div className="dash-empty-large"><span>{icon}</span><b>{title}</b><p>{copy}</p></div>;
}

function SettingSwitch({ title, description, value, onChange }: { title: string; description: string; value: boolean; onChange: (value: boolean) => void }) {
  return (
    <div className="dash-switch-row"><span><b>{title}</b><small>{description}</small></span><button className={"dash-switch" + (value ? " on" : "")} role="switch" aria-checked={value} onClick={() => onChange(!value)}><i /></button></div>
  );
}
