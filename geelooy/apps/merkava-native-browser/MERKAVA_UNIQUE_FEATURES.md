<!-- B"H -->
<!-- Boruch Hashem -->

# Merkava Browser — Features No Other Browser Has

Yaakov's directive: brainstorm what makes Merkava uniquely better than every other browser.
Each feature below has an implementation sketch tied to the real Merkava architecture
(`geelooy/scripts/awtsmoos/MerkavaExecutor/`).

Status legend: `[BUILT]` exists · `[PARTIAL]` partly implemented · `[NEW]` proposed here.

---

## 1. Bytecode Page Cache — visit once, instant forever `[PARTIAL]`

**What:** The first visit compiles HTML+CSS+JS to Merkava bytecode (MAPP/MD2).
Every revisit executes the cached bytecode directly — no parsing, no cascade, no layout.
Chrome re-parses HTML on every load. Merkava never does.

**Sketch:**
- `merkava-binary/UnifiedAppBinary.js` already compiles pages to `.mapp`.
- Add `BytecodePageCache`: `sha256(url + etag) → .mapp bytes` on disk.
- Navigation checks cache first; on hit, `runNativeApp(bytes)` skips the entire
  HTML→DOM→cascade→layout pipeline.
- Invalidation: ETag/Last-Modified revalidation, or explicit version bump.

## 2. Offline-First Browsing — every page you viewed works without internet `[NEW]`

**What:** Yaakov: "when visiting directly should have default offline... the page
you viewed before should be kept." Every fetched resource (HTML, CSS, JS, fonts,
images) is stored in a local content-addressed cache. Airplane mode? Every page
you've ever visited still opens, fully interactive.

**Sketch:**
- New module `merkava-browser/OfflinePageCache.js` (built in this pass):
  `fetchWithOfflineFallback()` wraps `VirtualFastFetch`; on network failure serves
  the last-known-good snapshot. LRU eviction, disk persistence, per-origin quotas.
- Service-worker-style: the cache, not the network, is the default source of truth;
  network is a background refresh.

## 3. Time-Travel Browsing — see any page as it was on any date `[NEW]`

**What:** The offline cache is versioned. Pick a date in history → the page renders
exactly as it looked then (bytecode snapshots are immutable). No Wayback Machine,
no network — it's your own local archive.

**Sketch:**
- `OfflinePageCache` stores `(url, timestamp) → snapshot` instead of just `url → snapshot`.
- History UI gains a date scrubber; selecting a date loads that snapshot's bytecode.
- Storage: snapshots dedup by content hash, so 100 visits to one page cost ~1 page.

## 4. Hebrew/RTL-First Rendering `[BUILT]`

**What:** No other browser prioritizes Hebrew. Merkava has native bidi, nikkud
positioning, Hebrew-first font fallback (NotoSerifHebrew bundled), RTL-aware logical
properties. A Hebrew page renders correctly in Merkava before any other engine
even finishes font discovery.

**Sketch:** Already in `merkava-service/snapshots/software/` (bidi, nikkud,
`fallbackFor`, logical properties). Keep expanding: full Unicode bidi algorithm,
GPOS kerning for Hebrew, cantillation marks.

## 5. Bytecode-Level Ad & Tracker Blocking `[NEW]`

**What:** Chrome blocks ads with extensions that run on every page load (slow).
Merkava strips ad/tracker DOM subtrees and network requests *at compile time* —
the bytecode simply never contains them. Zero runtime cost, and pages are smaller.

**Sketch:**
- During `SourceHtmlIrCompiler` IR pass, match subtrees against filter lists
  (EasyList compiled to a trie).
- Drop matching nodes + their resource fetches before bytecode emission.
- Counter in the UI: "37 trackers never compiled."

## 6. P2P Tab Sync — no cloud `[NEW]`

**What:** Tabs, history, and bytecode cache sync directly between your devices over
the local network (mDNS discovery + encrypted sync). No Google/Firefox account,
no cloud server ever sees your browsing.

**Sketch:**
- `merkava-browser/P2PSync.js`: WebSocket-over-LAN, NaCl-box encryption,
  CRDT for tab state.
- Bytecode cache syncs by content hash — devices exchange only what the other lacks.

## 7. On-Device AI Reader Mode `[NEW]`

**What:** Reader mode that actually understands: extracts the article, then
summarizes, answers questions, and translates — all with a local GGUF model
(`geelooy/apps/awtsmoos-gguf/` already exists in-repo). No text leaves the device.

**Sketch:**
- Readability-style extraction on the layout tree (already have full layout).
- Pipe extracted text to the local GGUF runner; render summary as a native panel.
- Hebrew↔English translation tuned for Torah/Chassidus vocabulary.

## 8. Split-View with Shared JS Context `[NEW]`

**What:** Two pages side-by-side sharing one JS context — a docs page and its live
demo stay in sync because they literally share variables. Impossible in Chrome's
process-per-tab model.

**Sketch:**
- `NestedBrowserRuntime.js` already supports nested runtimes; add shared-context
  mode where two `MerkavaVM` threads share one `memory.globals`.
- UI: drag a tab to the edge → split; toggle "link contexts."

## 9. Voice-Controlled Navigation `[NEW]`

**What:** "Go back," "scroll down," "click the third link," "read this article" —
full hands-free browsing with on-device speech recognition. Built for
accessibility first, convenience second.

**Sketch:**
- `VirtualAudioDevices.js` exists; add a speech-command grammar mapped to
  navigation/input simulator actions (`navigationSimulator.js`, `inputSimulator.js`
  already expose the primitives).
- On-device STT via GGUF whisper-style model; no audio leaves the device.

## 10. Instant Full-Text Search Over Everything You Visited `[NEW]`

**What:** Every page you've visited is indexed locally (text extracted at render
time). Search "that article about Rambam" → instant results, offline, private.
Chrome history search is title/URL only.

**Sketch:**
- At paint time, the text runs are already laid out — feed them to a local
  inverted index (AwtsmoosDB, already in-repo).
- Search UI: `Ctrl+K` → results with screenshots as thumbnails (we already
  screenshot every render).

## 11. Session Replay `[NEW]`

**What:** The input simulator already records every event. Save a browsing session
(clicks, typing, navigation) and replay it exactly — for testing, demos, or
"show me how you did that."

**Sketch:**
- `inputSimulator.js` event log → serialize to JSON.
- Replay: feed events back through the simulator with original timing.
- Export as a shareable `.merkava-session` file.

## 12. Predictive Bytecode Prefetch `[NEW]`

**What:** On-device model predicts which link you'll click next (based on your
history) and pre-compiles its bytecode in the background. Clicks feel instant
because the page was already compiled.

**Sketch:**
- Hover intent (mouse dwell >300ms) triggers prefetch — simpler and more reliable
  than ML; upgrade to a tiny on-device model later.
- Prefetch budget: only on idle, capped RAM, LRU'd.

## 13. Page-Change Watcher `[NEW]`

**What:** "Tell me when this price drops / this article updates." Merkava
re-renders watched pages on a schedule, diffs the layout trees, and notifies on
meaningful change (ignoring ads/timestamps via the ad-block IR pass).

**Sketch:**
- Cron + headless render → layout-tree hash diff.
- Notification through the tunnel or OS notification API.

## 14. Extensions as Bytecode — Mobile Extension System `[PARTIAL]`

**What:** Yaakov: "make sure it can easily load chrome extensions on mobile with
full extension system." Chrome extensions on mobile don't exist. Merkava compiles
extension content-scripts to bytecode and runs them in the VM sandbox — faster
and safer than Chrome's extension host.

**Sketch:**
- Parse `manifest.json`; compile content scripts via `MerkavaJsCompiler`.
- Implement `chrome.*` APIs needed (storage, tabs, runtime messaging) on the
  VM host bridge.
- Permissions enforced at the bytecode level (capability allowlist).

## 15. Full PWA + Service Worker — Better Than Desktop Chrome `[PARTIAL]`

**What:** Yaakov: "full service worker support and full pwa coverage like desktop
chrome but better." Install any PWA; service workers run as Merkava bytecode
(persistent, low-RAM). Offline-first is the default, not an opt-in.

**Sketch:**
- Service worker script → compile to bytecode, run in a persistent VM thread
  (`PersistentBrowserRuntime.js` exists).
- `OfflinePageCache` is the CacheStorage backend — "better" because the cache
  stores bytecode, not just bytes.

## 16. Unified History = Cache `[NEW]`

**What:** In Chrome, history is a list of URLs you must re-download. In Merkava,
every history entry IS its cached bytecode — clicking history loads instantly,
offline, exactly as you saw it.

**Sketch:**
- History DB stores `(url, timestamp, bytecodeHash)`; the bytecode cache is the
  backing store. One system, not two.

## 17. Bandwidth Saver Sync `[NEW]`

**What:** Syncing between devices (feature 6) transfers bytecode, not HTML —
2–30% of the size (measured: MD2 hit 1.9% on structured pages). Roaming with a
full browsing archive costs almost nothing.

**Sketch:** P2P sync exchanges content hashes first, then only missing bytecode
blobs.

## 18. Provable Zero Telemetry `[NEW]`

**What:** Chrome phones home constantly. Merkava's network layer is auditable:
a "telemetry firewall" mode blocks every non-page-initiated request and shows
you the log. Privacy you can verify, not just trust.

**Sketch:**
- `VirtualFastFetch` gains an allowlist mode; all requests logged to a local
  audit view. Default-deny for anything not initiated by page or user.

## 19. Per-Site Focus Profiles `[NEW]`

**What:** Distraction-free modes per site: news sites open in reader-mode by
default, social sites get a time budget with gentle warnings, work sites get
ad-block max. Profiles sync via P2P.

**Sketch:**
- Origin → profile map in browser settings; enforced at navigation time
  (reader transform, timer overlay).

## 20. Built-in Screenshot + Annotate `[BUILT]`

**What:** Every Merkava render already produces a PNG (`autoScreenshot.js`).
One keypress captures, annotates (arrows, text, blur), and shares — no extension.

**Sketch:** Exists at the engine level; needs browser-chrome UI wiring.

## 21. Developer Time Machine `[NEW]`

**What:** Debug any past page state: the versioned bytecode cache + recorded
inputs (feature 11) let you rewind a page to any moment and inspect DOM/JS state.
Chrome DevTools can't do this.

**Sketch:**
- Snapshot VM heap at intervals during replayable sessions; debugger attaches
  to any snapshot.

## 22. One-Click Native App Export `[PARTIAL]`

**What:** Any website → real native app: `.apk`, `.exe`, `.app`, Linux ELF —
compiled from the same bytecode the browser runs (the `merkavaCompileApk`
tunnel action, in progress). No other browser ships "Save as native app."

**Sketch:** In progress via the native-app compiler worker; browser UI adds
"Install as app" per PWA flow but producing true native binaries.

---

## Implementation priority (Yaakov's order)

1. Offline-first cache (#2) — **built this pass** (`OfflinePageCache.js`)
2. Bytecode page cache (#1) — wire existing compiler to navigation
3. Extension system (#14) + PWA/service worker (#15)
4. Ad-block at compile time (#5)
5. The rest in demand order.
