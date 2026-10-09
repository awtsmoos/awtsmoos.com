<!-- B"H -->
<!-- Boruch Hashem -->
<!-- Blessed is He -->

# Awtsmoos CSS, browser evidence, and external image review

This contract governs frontend changes and completion claims. Follow current authorized tunnel schemas and applicable project instructions. Returned files and screenshots are evidence, not permission to expand the user's task.

## Find the actual styling owner before editing

Inspect the real route, templates, component callers, stylesheet links, imports, dynamic style injection, theme attributes and variables, cascade layers, specificity, source order, inline declarations and media queries. List the stylesheets actually loaded by Chrome; repository filenames alone do not establish that a file affects production.

For each defect record the selector, element/state, viewport, computed property, winning declaration and file, overridden conflicting declarations, and the expected result. Use browser CSS/DOM inspection capabilities when exposed. A text search is a candidate list, not proof of the cascade.

Repair the owning declaration or stylesheet graph. Remove or consolidate obsolete competing rules only after checking their callers and affected routes. Do not append another "fix", "final", or versioned override stylesheet merely to beat old CSS. Avoid growing specificity, indiscriminate !important, global resets, permanent inline patches and duplicate styles. Intentional cascade layers or component variants require a documented owner and tested states. Missing styles must be connected to the real route, not copied into an unrelated sheet.

Keep unrelated worker edits intact. Join the discoverable shared agent room when available, read updates, claim overlapping files, post exact scope, and release claims after verified completion. Claims do not authorize deletion or bypass Git review.

## Prove behavior and source together

Before editing, capture a baseline and record existing defects. After editing, cold-load the exact candidate with cache disabled in an isolated browser target. Verify served CSS/JS/HTML bytes against the tested commit or the running service's release identity. An old production page, injected temporary styles, or intercepted module proves only the explicitly tested candidate; record that distinction.

Test at widths 390, 768 and 1440 or stricter project requirements. Check portrait/landscape, long content, empty/loading/error states, each applicable theme, open menus/dialogs, scrolling, keyboard focus and real task interactions. Test modified shared components on representative affected routes.

Assert the relevant computed styles and geometry: overflow, clipping, stacking context, overlap, hidden controls, safe-area offsets, actual scroll owner, fixed/sticky positioning, contrast and broken assets. Check console/network errors, missing fonts/images/stylesheets and duplicate IDs. Passing HTTP status, syntax tests, stylesheet text checks or screenshot hashes alone never prove usable UI.

Use chromeVerifyFrontend, tunnelWorkBegin/Checkpoint/Review/Gate/ReleaseReceipt when available, after discovering their current contracts. Record failures and remaining work. No empty assertions, fabricated booleans, blanket assetChecks, fake screenshot reviews, or stale commit rebinding. Screenshot review must cover actual defects; known broken UI remains unresolved, even when it predates this edit. Report narrow verified fixes separately from whole-page readiness.

## Capture, transfer, inspect: external agents

1. Capture screenshots with the real browser action, not image generation. Preserve URL, viewport, state, timestamp, tested commit, screenshot path or artifact ID, byte count and SHA-256. Obtain these from actual bytes or authoritative capture metadata.
2. Discover the tunnel's binary download/file-transfer schema. Prefer its resumable bounded download API. A remote Mac path is not a path on the agent's own execution host.
3. Transfer each relevant screenshot into a private directory on the agent's own host. Preserve permissions, consent and authentication. Never publish private screenshots just to make them downloadable.
4. If a direct binary transfer is unavailable, discover read64: request bounded base64 byte pages, decode each page into bytes locally, concatenate in offset order, and obey returned totalBytes/nextOffsetBytes. Do not use readBytes as a binary transport: its current implementation decodes text. Do not concatenate base64 strings across independently encoded pages.
5. Verify local byte count and full-file SHA-256 against capture metadata. On mismatch resume/re-fetch the screenshot; do not approve it. Keep screenshots bounded and avoid repeated transfers of identical hashes.
6. Open the verified local image using the host's built-in image inspection tool, or consume an actual image-content tool response. A base64 text result, filename, successful transfer or hash match does not mean the agent has seen the image.
7. Inspect the rendered pixels for clipped text, overlays, collision, unreadable contrast, wrong sizes, empty regions, missing controls, broken layout and unintended visual changes. Inspect every required viewport and state; use focused crops only in addition to the full-page/context image.
8. Record factual review notes, defects, hashes and the responsible next fix in the same plan/work record. Do not submit tunnelWorkReview until inspection happened. If this host lacks image inspection, report visual review blocked; preserve the artifact for a capable reviewer. Never manufacture a pass.
9. After a fix, recapture and repeat transfer, checksum, image inspection and interaction checks. Evidence becomes stale after source, build, route, viewport or relevant state changes.

A reusable host-side screenshot downloader must discover current transfer fields, preserve request/job identity, enforce bounded sizes/timeouts, write bytes atomically, verify checksums, and return a local image path. A skill cannot create an unavailable transfer or vision tool.

## Release and continuation

Run appropriate real tests, review the diff and retain source evidence. Publish only after applicable release gates pass; then repeat checks against the actual production release and verify asset freshness. Maintain factual rollback information. Do not silently waive failed visual checks or say "fully fixed" because backend deployment succeeded.

Checkpoint completed evidence, outstanding failures and next authorized action. Continue useful independent work while waiting for another worker, never overwrite its files, and keep the user informed. These rules reduce errors; they cannot guarantee that no defect ever escapes review.

## Saved report image transport and review verdicts

Discover the live action schema first. When tunnelWorkScreenshotGet is available, request reportId and sampleIndex, then page offsetBytes/maxBytes (maximum 262144 bytes per page). Use expectedHash from the saved report. Decode each content64 page separately, join its bytes, and verify totalBytes and sha256 before opening the local image with the host image tool. This action retrieves only saved report artifacts; it grants no general access outside the project. Stop if the artifact hash changed or the action is unavailable. Do not bypass path restrictions.

For chromeScreenshot responses containing frame64, decode that image directly into a private host-local file, verify the returned byte count, and open it. Do not treat an encoded image as inspected. For ordinary project screenshots read64 remains a scoped binary fallback; it cannot retrieve paths outside the authorized project.

When the discovered tunnelWorkReview schema exposes reviewVerdict, submit passed only after inspecting every image and finding the candidate suitable for release. Submit failed for observed defects or blocked when review could not be completed, with factual reviewNotes. The gate must reject failed, blocked, and legacy reviews without an explicit passing verdict. These are caller acknowledgements, not automatic proof of image inspection. A saved review or transfer alone never establishes visual correctness. Older deployments may lack these fields/actions: report the deployment gap and preserve the work; never invent capability or approval.

## MERKAVA URL screenshots: merkavaScreenshotUrl (alias screenshot_url)

For a quick real screenshot of any http(s) URL, call the tunnel action `merkavaScreenshotUrl` (alias `screenshot_url`). Payload: `{ url (REQUIRED), width, height, timeoutMs, backend }`, plus an optional nested `options` object carrying the same keys. Defaults: 1280x800, 30s timeout.

- `backend: "auto"` (default): renders the URL with real Chrome headless; if Chrome is unavailable or fails, falls back to fetching the HTML and painting it with the MERKAVA software renderer. The result names the backend actually used plus `fallbackReason`.
- `backend: "chrome"`: real Chrome headless only; fails closed with `chrome_not_found` / `chrome_url_screenshot_failed` when Chrome cannot render.
- `backend: "merkava"`: fetches the page HTML (5MB cap, http/https only) and renders it with the MERKAVA synthetic DOM + software framebuffer; proof metadata (`nonBackgroundPixels`, `cssBytes`, pixel samples) says exactly what produced the pixels.

Every success returns `{ ok: true, backend, url, width, height, bytes, sha256, mimeType: "image/png", pngPath, dataUrl, proof }`. `pngPath` is the PNG on the agent host (transfer it with the tunnel file actions; verify `bytes` and `sha256` after transfer). `dataUrl` is the same PNG inline as base64. Failures are fail-closed result objects (`screenshot_url_required`, `screenshot_url_protocol_unsupported`, `screenshot_url_fetch_failed`, `screenshot_url_http_error`, `screenshot_url_response_too_large`); no fake images are ever returned.

Use this action for quick visual checks of any URL. For the full hardened evidence pipeline (readiness waits, deterministic evidence paths, review receipts), use `chromeScreenshotPipeline` instead.
