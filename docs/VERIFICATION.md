# Redesign verification

Verified 8 November 2026.

Expanded release: the full production-build suite passed 62 checks in 4.5 minutes; 42 duplicate mobile matrix checks were intentionally skipped. An independent 42-route matrix also passed against the public deployment. After the final editor navigation/heading adjustments, all 20 responsive flow checks passed again in 49.5 seconds. Automated accessibility results describe the homepage scan, not a certification of every screen or assistive technology.

## Checks
- `npm run build`: passes; generates 51 pages.
- `npm run lint`: no errors, 17 pre-existing warnings in legacy code.
- `npm run test:e2e`: 20 desktop/mobile flow checks plus a 42-route tool matrix. The engine matrix runs once on desktop; its mobile copies are skipped. Final release results are recorded below.
- Homepage axe checks: no WCAG 2 A/AA or WCAG 2.1 AA violations detected.
- Reviewed rendered homepage, dashboard and tool screenshots on desktop and phone.

## Browser coverage
1440×1000 desktop and iPhone 13 viewport/touch emulation, using headless Edge
locally. CI installs Chromium and runs the same suite. Phone emulation is not
a physical iOS Safari test.

The suite covers tool discovery, 42-tool expansion, search and reset, category
filtering, clearly marked unavailable AI entries, format preview selection and
navigation, file removal, empty-file feedback, file handoff through client
navigation, FAQ, mobile navigation, reduced motion, keyboard search, viewport
overflow, and workspace/tool rendering.

The download tests inspect content, not just filenames: CSV input must produce
the expected cells in a valid XLSX workbook, and merging two source PDFs must
produce a valid two-page PDF. These checks exposed an existing shared binary
helper bug: passing an ArrayBuffer into Uint8Array.set produced zero-filled
exports. The helper now normalizes input before copying bytes.

## Performance evidence
During this change, the production build's initial JavaScript for the generic
tool route fell from 624 kB to 256 kB after deferring conversion-engine loading
until processing. This is a build-report comparison, not a measured Core Web
Vitals or real-user speed result. The expanded homepage reports 180 kB initial JavaScript.
Two Latin variable fonts are served locally with swap behavior and preloading.

## Reproduce
```
npm ci
npm run lint
npm run build
npx playwright install chromium
npm run test:e2e
```
On a Windows development machine with Edge installed, set
`PLAYWRIGHT_CHANNEL=msedge` before running the test command to use headless Edge.
Browser tests use a production server on port 3100 and write screenshots/traces
to the ignored `test-results` directory.

## Expanded tool coverage

The 42-route matrix passed against the public site before release. Thirty-eight available tools accept real inputs or exercise their dedicated editor. Four AI lab routes are checked for an honest unavailable state. Tests generate PDF, DOCX, PPTX, spreadsheet, image, text, archive and audio inputs. Media tests use the public Big Buck Bunny sample at W3Schools. Downloads are read and checked with PDF, ZIP/Office, spreadsheet and image parsers where applicable. A passing sample does not guarantee fidelity for arbitrary inputs.

New landing-page tests export a real canvas image and inspect its dimensions, validate both valid and invalid JSON, remove a repeated row, and pass a generated PDF into the organizer. The visual capture script visits the landing page, workspace, image converter, Word editor and JSON editor at desktop and phone sizes, failing on browser exceptions or missing titles.

Media encoding now has a two-minute execution limit and rejects empty output rather than offering an empty download. Review also corrected insufficient contrast, missing JSON page semantics and inconsistent editor navigation.

## Limits
The redesign preserves the existing conversion implementations. This suite does
not establish fidelity for every supported document, media codec, OCR model, or
specialized editor. AI tools remain coming soon. Existing dependency warnings
and the deferred Hugging Face import.meta build warning remain follow-up work.
