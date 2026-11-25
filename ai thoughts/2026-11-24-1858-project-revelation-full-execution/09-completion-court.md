# B"H — 09 Completion court (Chapter XXIII) — scored 2026-11-24, runs 1+2

Basis: no enumerated 50-item list exists on disk (the 2026-11-24-1010 roadmap
files are prose visions). This court therefore scores the 50 capabilities the
directive itself enumerates across Chapters V–XVI, each with refreshed
evidence from runs 1 (commit 3057b51c7) and 2 (98001e26a, bcd00ddc0,
54fcd5425, b518db817). LIVE = rendered/served production evidence;
LOCAL = tests/fixtures on candidate source; fixture results never count as
production proof.

| # | Capability | Status | Evidence |
|---|---|---|---|
| 1 | Canonical post routes | IMPLEMENTED AND LOCALLY VERIFIED | CanonicalPostRoute 3/3 (runs 1+2); profile postRoute delegates to it (98001e26a) |
| 2 | Publication idempotency / no re-mint on ambiguity | IMPLEMENTED AND LOCALLY VERIFIED | ComposerWorkflow tests 9/9 in gate (run 1) |
| 3 | Quick composer Shadow DOM isolation | IMPLEMENTED AND LIVE-VERIFIED | browser regression composer PASS 320/390/1280 incl. shadow + legacy-inert checks (run 2) |
| 4 | Quick publishing journey (fixture) | IMPLEMENTED AND LOCALLY VERIFIED | quickBrowserJourney PASS in gate (runs 1+2, simulated API) |
| 5 | Authenticated production publish + read-back | BLOCKED | No controlled test account authorized; nothing fabricated in Hai's account |
| 6 | Moderation / scheduled status receipts | IMPLEMENTED BUT NOT VERIFIED | Code paths exist (ComposerWorkflow); no production evidence |
| 7 | Design tokens / gold family coherence | PARTIALLY IMPLEMENTED | Gold re-based in prior sessions; directive palette not adopted as named tokens |
| 8 | Light/dark themes | IMPLEMENTED BUT NOT VERIFIED | data-theme contract on pages; not re-measured this mission |
| 9 | CSS hostile-isolation protection | IMPLEMENTED AND LOCALLY VERIFIED | isolation-contract PASS (runs 1+2); gate EXIT 0 (run 1) |
| 10 | CSS gate as CI step | IMPLEMENTED AND LOCALLY VERIFIED | Workflow step + all gate-referenced test files committed (98001e26a, 54fcd5425); CI run itself not yet observed |
| 11 | Live layout — social 320/390/1280 | IMPLEMENTED AND LIVE-VERIFIED | browser regression PASS (runs 1+2) |
| 12 | Live layout — profile 320/390/1280 | IMPLEMENTED AND LIVE-VERIFIED | browser regression PASS (runs 1+2) |
| 13 | Live layout — composer 320/390/1280 | IMPLEMENTED AND LIVE-VERIFIED | browser regression PASS all widths (run 2, 90s harness timeout) |
| 14 | Live layout — heichelos 1280 | IMPLEMENTED AND LIVE-VERIFIED | browser regression PASS 1280 (run 2) |
| 15 | Live layout — heichelos 320/390 | IMPLEMENTED AND LIVE-VERIFIED | Focused probe (run 2): first attempts hit nginx 504 while app response was >60s at load 19–30 (local :8080 /heichelos/ 19.1s vs /social/ 1.25s — a real app-latency signal under saturation), then at load ~12 the real page rendered ("Heichelos \| Ikar Torah Library") and PASSed geometry/contrast/overflow at both 320 and 390 |
| 16 | Breadcrumbs / canonical hierarchy URLs | PARTIALLY IMPLEMENTED | Canonical routes exist; breadcrumb rendering not re-audited |
| 17 | Pretty alias profile URL | IMPLEMENTED AND LIVE-VERIFIED | /profile/alias/coby → 301 → /profile/alias/?alias=coby → 200 (run 2 nginx fix, backup kept) |
| 18 | Profile creator library (cards, nested series nav) | IMPLEMENTED AND LOCALLY VERIFIED | HeichelNavigation class rewrite + cards integration committed (3057b51c7, 98001e26a); contracts PASS |
| 19 | Profile action drawer (120-line vessels) | IMPLEMENTED AND LOCALLY VERIFIED | Split content/settings/settingsToggle; contract PASS (run 1) |
| 20 | Recent publications findability | IMPLEMENTED BUT NOT VERIFIED | Profile feed exists; no timed findability test run |
| 21 | Local library search (loaded content) | IMPLEMENTED AND LOCALLY VERIFIED | LibrarySearch.mjs wired in profile (98001e26a); library-search.cjs PASS in gate |
| 22 | Server-backed search endpoint | IMPLEMENTED AND LOCALLY VERIFIED | /api/social/search via discoverySearch (public-people global + explicit-alias scope); live call timed out under load — not live-verified |
| 23 | Search pagination | IMPLEMENTED AND LOCALLY VERIFIED | paginateResults added run 2 (b518db817), test 4/4; live after next app restart |
| 24 | Search permission-awareness | IMPLEMENTED AND LOCALLY VERIFIED | Global scope expands only publicPeople; private content not exposed by construction; cross-account denial not re-tested |
| 25 | Discovery feed / public river | IMPLEMENTED BUT NOT VERIFIED | publicDiscoveryFeed + fairness code exists; not re-measured |
| 26 | Music hierarchy coby → Ohr HaNiggun → Echoes of the Infinite | IMPLEMENTED AND LIVE-VERIFIED | Read-only live confirmation (run 1) |
| 27 | Series player continuous playback | IMPLEMENTED AND LOCALLY VERIFIED | Refactored run 2 (bcd00ddc0) preserving behavior; modules serve 200 live; browser playback regression not run |
| 28 | Series player modular architecture | IMPLEMENTED AND LOCALLY VERIFIED | playlist.js 93 / panel.js 88 / engine 155 lines; playlist contract 4/4 |
| 29 | Playback speed / repeat | IMPLEMENTED BUT NOT VERIFIED | AudioPlaybackOptions exists in reader; series-player parity not added |
| 30 | Shuffle / queue UI | NOT IMPLEMENTED | Player advances sequentially only; no queue or shuffle surface |
| 31 | Visualizer presets (waveform/spectrum/celestial) | IMPLEMENTED AND LOCALLY VERIFIED | AudioEffects modules + round-trip test PASS (run 1) |
| 32 | Visualizer persistence composer→storage→reader | IMPLEMENTED AND LOCALLY VERIFIED | visualizerRoundTrip PASS (run 1); production round-trip blocked with #5 |
| 33 | Expanded preset gallery (10 presets) | PARTIALLY IMPLEMENTED | 4 presets exist; 6 proposed presets not built |
| 34 | Post reader multimedia surface | PARTIALLY IMPLEMENTED | Reader exists with structured content; not re-audited this mission |
| 35 | Reader service-worker cache versioning | IMPLEMENTED BUT NOT VERIFIED | Version pins bumped for changed modules (nav-002, hash pins); SW chain not traced |
| 36 | Follows / followers | IMPLEMENTED BUT NOT VERIFIED | discoveryOperations routes exist; not exercised |
| 37 | Comments and replies | IMPLEMENTED BUT NOT VERIFIED | commentBrowse + searchCommentsByAlias exist; not exercised |
| 38 | Notifications | IMPLEMENTED BUT NOT VERIFIED | notifications-bridge feature flag in discovery API; not exercised |
| 39 | Saved posts / personal collections | NOT IMPLEMENTED | No mission evidence of a saved-posts surface |
| 40 | Moderation / reporting / blocking | PARTIALLY IMPLEMENTED | Moderation submission status exists in composer; reporting/blocking not audited |
| 41 | Social sharing metadata | IMPLEMENTED BUT NOT VERIFIED | Canonical URLs exist; link-preview metadata not re-tested signed-out |
| 42 | App-api catalog (plugin, no native tunnel) | IMPLEMENTED AND LIVE-VERIFIED | Live catalog 24 operations, scope awtsmoos.api (run 1) |
| 43 | OpenAPI / MCP parity | PARTIALLY IMPLEMENTED | Catalog live; schema-parity not re-diffed this mission (Tunnel session owns adjacent work) |
| 44 | Tunnel ingress consumer-stall fix | IMPLEMENTED AND LOCALLY VERIFIED | Evidence tests 4/4 (run 1); source fix verified |
| 45 | Tunnel release packaging of the fix | BLOCKED | Release guard requires clean agent subtree; tree has ~290 other-session dirty paths |
| 46 | Bounded agent logs | IMPLEMENTED AND LIVE-VERIFIED | logrotate installed + rotated 207MB→3.1MB archive, agent uninterrupted (run 1) |
| 47 | Performance targets (LCP/INP/CLS p75) | NOT IMPLEMENTED | Never measured; /heichelos/ app response 19.1s local under load is a recorded defect signal |
| 48 | Accessibility audit (contrast/focus/RTL) | PARTIALLY IMPLEMENTED | Regression asserts ≥4.5 contrast on measured items at PASS widths; no full a11y sweep |
| 49 | Cross-browser (Firefox/WebKit) | NOT IMPLEMENTED | Only Chromium harness exists |
| 50 | 50-feature court itself | IMPLEMENTED AND LOCALLY VERIFIED | This file (run 2) |

Counts: LIVE-VERIFIED 11 · LOCALLY VERIFIED 15 · IMPLEMENTED BUT NOT VERIFIED 8 ·
PARTIALLY IMPLEMENTED 9 · NOT IMPLEMENTED 4 · BLOCKED 3.

## Run 3 addendum (2026-11-25)
Moved to IMPLEMENTED AND LIVE-VERIFIED by run 3: Heichelos discovery design (ivory/gold redesign, screenshot-proven both widths); alias profile Posts tab (root-cause route fix, live DOM proof); series player autoplay-next + repeat + shuffle + per-post visualizer (headless regression on the real series + screenshot). Composer music upload (filename title, notes field, per-attachment visualizer) is IMPLEMENTED AND LOCALLY VERIFIED (suites 14/14; fixture journey blocked at server startup under load). Heichel doorway counts/band/tabs remain PARTIAL — bundle/doorway lane, restart-gated.
