# Third-party software notices

## Browser PDF-to-DOCX engine

ConvoTools can load the `pdf2docx-wasm` 0.1.0 package in a browser Web Worker for local PDF-to-DOCX conversion.

- License: GNU Affero General Public License v3.0 (AGPL-3.0).
- License text: [public/licenses/AGPL-3.0-PDF2DOCX-WASM.txt](public/licenses/pdf2docx-wasm-AGPL-3.0.txt)
- Corresponding source: https://github.com/jsscheller/pdf2docx-wasm
- Runtime assets are fetched from the package distribution at jsDelivr. PDF document bytes are transferred to the local browser worker and are not uploaded to a ConvoTools conversion server.

The package bundles PyMuPDF, pdf2docx, python-docx, OpenCV, NumPy, lxml and Pyodide wheels. Review the package's accompanying license notices and corresponding source when redistributing or modifying this engine. The AGPL-3.0 terms may affect distribution and hosted use; obtain legal review before commercial deployment.

The package is loaded only when a user starts PDF-to-DOCX conversion. Other ConvoTools tools do not load this engine.
