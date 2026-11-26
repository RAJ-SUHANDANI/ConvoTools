# Conversion reliability investigation — 26 November 2026

The report was that Image to PDF stayed on Processing without providing output. The user clarified that this was **25 images on a mobile device**, with an expected capacity of **50 images / 50 PDF pages**. Production was serving commit `93e49da`. A clean-browser baseline passed all 42 route checks (38 available tools, four explicitly unavailable AI entries), including a standard PNG and a 24-megapixel JPEG selected through the real file chooser. Single-file checks did not cover the reported batch workload.

An intercepted converter-chunk request reproduced an indefinite Processing state in production. The shared handler awaited lazy loading and processing without any deadline. Image to PDF additionally loaded the entire general conversion engine and decoded/re-encoded every image through a full-resolution canvas, even when PDF could embed it directly.

The batch-specific memory mechanism was confirmed in the installed pdf-lib implementation: PNG embedders retain decoded RGB/alpha planes until embedding. The old loop deferred every embed until the final document save. `PDFImage.embed()` explicitly clears its embedder to permit garbage collection; calling it for each completed page prevents accumulating the decoded raster data for 25–50 pages. Other image converters also started every selected image concurrently using Promise.all. Both patterns are unsuitable for large mobile batches.

Changes:

- Load only the PDF/image dependencies for Image to PDF. Embed valid PNG and ordinary JPEG bytes directly; browser-decode other image formats and EXIF-rotated camera images. Rotated JPEGs remain JPEG rather than becoming much larger PNGs.
- Embed/compress each PDF image before decoding the next; release canvas backing stores after ordinary image exports and process image-conversion batches sequentially.
- Avoid an extra JavaScript copy of the complete PDF before creating the download Blob.
- Use a consistent 50-file upload capacity on the landing page and dashboard. Add a combined-image PDF action that hands off the entire selected image batch, instead of only one image. Image to PDF validates its 50-image capacity without silently truncating selections.
- Bound converter loading to 30 seconds, file reads and fallback image loading to 20 seconds, fallback encoding to 30 seconds, and a complete conversion to five minutes. Failures return an actionable notice and re-enable the controls. Late results cannot trigger downloads through the timed-out caller, and late progress cannot overwrite its error. A timeout does not forcibly interrupt synchronous JavaScript or terminate every underlying third-party engine.
- Reject PNGs over 32 megapixels before raster allocation. The fallback decoder has the same pixel limit. Preserve transparent PNGs, image selection order, and camera orientation.
- Keep downloads independent of the general conversion engine. Reveal the output list and explain how to save manually if automatic downloading is blocked.
- For jobs producing multiple output files, prepare one ZIP instead of firing 50 automatic downloads. A constrained-heap phone-emulated test reproduced missing later downloads after the old burst. Keep cached, user-clicked ZIP and individual download controls; preserve duplicate output filenames using distinct ZIP entry names. Image to PDF still produces one combined PDF.

Regression tests use real chooser events and inspect exported PDF page counts and dimensions. They cover canvas/bitmap-unavailable PNG/JPEG conversion, 24-megapixel JPEGs, mixed-image batches, WEBP, EXIF rotation, invalid-image recovery, and a stalled converter request. The stalled-load check fails against the previous production version and passes against the fix on desktop and phone emulation.

The 25- and 50-image tests use 1800×2400 PNG inputs and inspect every PDF page's count/dimensions. Both mobile viewport emulation and a 256 MB JavaScript-heap Chromium configuration are used; this does not substitute for the user's physical phone or original images. Landing and dashboard tests verify that all 50 selections reach the converter. Image conversion tests inspect a 50-file ZIP and exercise a manual individual save.

The existing 100-check suite passed before the additional batch coverage. Policy accessibility audits now wait for visible Fade wrappers to reach full opacity, matching the existing converter audit's settled-animation approach; no accessibility rules are disabled. AI lab availability is unchanged.

A clean Linux CI install also exposed an ONNX Runtime 1.21 CUDA installer downloading a removed GPU release archive (HTTP 404). CI and Vercel now set the installer's supported `ONNXRUNTIME_NODE_INSTALL_CUDA=skip` option. This browser application does not use server CUDA; ordinary dependency install scripts and browser/WASM runtimes remain enabled.
