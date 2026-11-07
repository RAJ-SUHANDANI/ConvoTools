# ConvoTools: the product playground

The approved expanded direction is recorded in [.tastemaker/style-lock.md](.tastemaker/style-lock.md) and [docs/EXPANDED-REDESIGN.md](docs/EXPANDED-REDESIGN.md). The original short file-desk composition below is historical context; the current page adds six product chapters, real interactive samples and a workspace feature before the complete tool directory. The user explicitly chose an expressive light product playground.

## Product and audience

ConvoTools helps people get everyday file jobs out of the way: convert, resize,
organize, edit, and export. The primary task is choosing a file and finding a
compatible action. The secondary task is finding a named tool. Both must work
before any decorative experience earns its place.

## Visual thesis

A digital file desk: the overlapping geometry of source and output documents,
a stable typographic voice, cool white space, and a few colored working surfaces.
The format transformation is the memorable moment. Surrounding navigation and
controls stay quiet. Preserve the existing ConvoTools logo and violet identity.

## Tokens

- Canvas: `#f8f9fc`; work surfaces: `#ffffff`; ink: `#222433`.
- Primary action: `#5542cf`; preview lilac: `#e9e5fa`; borders: `#dfe1eb`.
- Peach and mint communicate alternate sample formats, not arbitrary emphasis.
- Space Grotesk for headings, DM Sans for controls and prose. Sentence case.
- Desktop content: maximum 1440px, 5% gutters. Phone: 6% gutters.
- Headline: 60–104px; section titles: 32–48px; body: 14–17px.
- Radii follow purpose: controls 6–7px, tool links 9px, preview surfaces 15px.
- One icon family, Lucide, generally 1.5px stroke. No ornamental icon tiles.

## Page composition

```
Logo                  Toolkit / How it works / FAQ           Workspace

Stable headline + action          Selectable source → output file preview
Useful short description         (clearly identified as a format preview)

File desk: choose/drop → detect format → choose an action

Tool library: search → category filters → real tool links → show all

Three-step file journey: source → action → download

Privacy explanation              Original-file note
FAQ                              Native expandable questions
Closing action                   Footer and source repository
```

Keep reading order and control order identical to source order. On phones,
place the real action before secondary exploration, stack workflow steps, and
let category buttons wrap rather than hiding them in a clipped scroller.

## Motion contract

- A single 700ms hero settlement, with the headline always readable.
- Format choice: 280ms file replacement, triggered by the person using it.
- Scroll journey: small opposing translations and rotations tied to actual
  scroll progress; no pinned reading, scroll hijacking, or full-page effects.
- Controls: 180–200ms feedback. Avoid moving the target out from under a pointer.
- Reduced motion: static workflow and preview states; no smooth scrolling.
- Initial HTML contains the page. Content must not depend on an observer firing.

## Quality rules

Use accurate product descriptions. Never claim unfinished AI capabilities are
available. No fake adoption statistics, processing indicators, or testimonials.
The sample preview is illustrative; file processing occurs on the real tool page.
Keep input limitations visible and preserve existing conversion engines.

Search, keyboard focus, mobile navigation, file handoff, removal, and downloads
are part of the design. Verify behavior and actual screenshots at multiple sizes.
