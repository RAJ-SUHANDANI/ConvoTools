# ConvoTools review and improvement plan

Reviewed 8 November 2026: the public homepage, dashboard, and main-branch source.

## Findings

1. The homepage repeated the product pitch through eleven large sections. The
   useful actions competed with decorative workspaces, code streams, and media.
2. The rotating headline deleted its own content, leaving a large quiet gap.
3. Repeated uppercase metadata, numbered section labels, serif accents, and
   pseudo-workspace interfaces weakened the identity of a practical file tool.
4. AI enhancement was described in feature sections even though AI routes were
   locked. Availability needed to follow the actual registry.
5. Dashboard text often used 7–10px sizes. It needed readable controls and clearer
   relationships between the upload area, history, and tools.
6. A global cursor effect and blurred route transitions added work on every page.
7. Dependency versions were not locked, and generated PDF-worker output was not
   excluded from lint. Reproducible installation and verification needed attention.

## Implementation plan

### 1. Make the task obvious

Replace the long feature tour with the file desk composition in `DESIGN.md`.
Keep the main heading stable. Put a real file picker near the top, followed by
searchable tools. Use real links for named tools so keyboard navigation, browser
history, and opening in another tab work naturally.

Acceptance: the visitor can choose a file, search a task, or open a tool without
understanding the marketing site. All 42 registered tools remain discoverable;
38 are not marked coming soon and 4 AI entries remain explicitly labeled.

### 2. Establish a coherent identity

Keep the logo; use cool whites, violet actions, meaningful source/output paper
geometry, controlled surface radii, and a clear type hierarchy. Carry the palette
into the dashboard and existing tool surfaces. Replace the unavailable AI quick
shortcut with a working utility. Avoid manufactured social proof and stock media.

Acceptance: the homepage, workspace and tool surfaces feel related at desktop
and phone sizes. Product text stays readable and long file names cannot break
layout. There is one strong visual moment rather than competing decorations.

### 3. Give motion a purpose

Animate format selection to show replacement. Trace the three actual workflow
steps as the visitor scrolls. Keep navigation and reading stable. Remove the
global cursor decoration and route blur. Respect operating-system reduced motion.

Acceptance: the page is complete without animation; reduced motion retains all
content and controls. No pinned sections or scroll hijacking.

### 4. Verify the real work

Build the production app; lint source while excluding generated assets. Test
search, filters, preview links, empty states, file detection, removal, navigation,
an actual conversion/download, mobile overflow, and accessibility. Inspect the
screenshots. Use a lockfile for repeatable builds.

### 5. Ship to the requested destination

Commit and fast-forward push to `main` without force-pushing or creating a PR.
Inspect GitHub checks. Vercel may deploy automatically through the repository's
existing integration; do not change deployment settings or use a separate host.

## Follow-up product work

These are separate engineering projects, not promises made by the redesign:

- Build fixture-based fidelity checks for every conversion engine, especially
  complex PDF/Office layouts, password protection, and large media files.
- Split conversion engines and editor code further by tool; track actual route
  bundles, interaction latency, and Core Web Vitals rather than chasing effects.
- Consolidate the accumulated legacy stylesheet into product-specific styles
  after establishing screenshot coverage for the specialized editors.
- Typography is now self-hosted with two Latin variable fonts; no Google Fonts
  request is needed. Further subsets can be added when localization requires them.
- Before releasing AI tools, document model downloads, memory requirements,
  processing location, failure states, cancellation, and realistic limitations.
- Add persistent file storage only with explicit user controls and clear retention
  behavior; history metadata is not a recovered copy of an uploaded file.

## Installed skills selected through Find Skills

Frontend Design, No AI Design Slop, Animation Systems, and Token Coach.
Use focused source reads, deterministic build/test scripts and compact summaries.
Do not change model effort or global settings to make this session cheaper.
Token Coach's measurement command could not run because Python resolves to an
unavailable Windows Store alias. No measured saving or quality score is claimed.
