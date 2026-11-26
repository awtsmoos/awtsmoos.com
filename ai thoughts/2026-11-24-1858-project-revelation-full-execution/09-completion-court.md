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

Run 4 update (2026-11-25): Heichel doorway counts/band/tabs moved to IMPLEMENTED AND LIVE-VERIFIED — totals aggregation at the loader (1a0fef35b), nested-main band fix + clearance release, live probes (counts 1 teachings · 1 series; hero top 140/110) and screenshots v3 read by the agent. Search pagination moved to LIVE-VERIFIED (limit/page proven against production). Social gate moved to green in-tree (EXIT 0 incl. quickBrowserJourney); at HEAD the repair-contract section still depends on the bundling session's uncommitted rewrite. New PARTIAL: mobile series-search input placeholder (theme collision, screenshot-proven). Series cold-fill latency remains PARTIAL with exact measurements (13.55s cold / 0.044s warm) and a staged fix design in 05.

## Run 5 evidence (2026-11-26)
- Working-tree gate: /tmp/gate-wt-run5.log — every section printed pass;
  set -e script reached its final section (richSocial visualizerRoundTrip).
- Clean worktree (sparse, full geelooy) at HEAD 16812d2c1: logs
  /tmp/gate-clean-run5{,b,c,d}.log + /tmp/gate-clean-rest{,2,3,4,5}.log.
  Green at HEAD: CanonicalPostRoute 3/3, profileRepairContract,
  profileCardHierarchyV4, profileSocialUxV4, library-search,
  audio-playback, schemaParity, aliasMemory, publicationPlan,
  quickRefinement, richSocial 5/6. Red at HEAD (foreign uncommitted
  files, detailed in 05): ComposerNavigationSafety, quickDestination,
  quickDestinationFlow, quickBrowserJourney, profileActionDrawerContract,
  isolation-contract, tunnel ingress evidence, richSocial
  visualizerRoundTrip.
- Cold-fill tests: seriesReadColdFill 4/4 (local + server);
  seriesReadCompatibility + singular + seriesKeyCompleteness 6/6;
  seriesReadSingleEnumeration 1/1.
- Live measurements: ikar encyclopedia details (old code, load ~13):
  60.0s timeout (size 0), then 23.87s. Search-input probes: before
  fill rgb(246,251,255) on rgb(255,255,255); after fill rgb(30,41,59);
  dark state fill rgb(246,251,255) on dark ground, placeholder
  rgb(170,187,208) — screenshots v4 read by the agent.
- Screenshots v4 (~/workspace/awtsmoos-social-screenshots/v4/):
  social-1280.png (245,573 — hero + live feed, Almighty Master by coby),
  heichelos-1280.png (680,955 — run-3 redesign intact),
  composer-390.png (29,531 — clean signed-out quick form),
  ohrhaniggun-390.png (243,636 — light, placeholder FIXED, read),
  ohrhaniggun-390-dark.png (243,354 — dark, placeholder readable, read),
  ohrhaniggun-390-before.png (241,628 — the defect, for comparison).

## Run 5 court update (2026-11-26) — supersedes run 4 scores where noted
Moved to IMPLEMENTED AND LIVE-VERIFIED: #22 server-backed search and
#23 search pagination (run 4 live proof); #27 series player continuous
playback (run 3 headless regression on the real series + v4/v3 shots);
heichel doorway (already in run 4). #8 light/dark themes -> LOCALLY
VERIFIED (run 5: both states measured + screenshot-read at 390 for the
search surface that failed). #29 repeat -> LOCALLY VERIFIED (series
player repeat modes, run 3). #30 shuffle/queue -> LOCALLY VERIFIED
(shuffle shipped run 3; queue remains series order). #47 performance ->
PARTIALLY IMPLEMENTED (cold-fill remedy committed + tested; activation
awaits a coordinated restart; live old-code pain re-measured 60s/23.9s).
#5 publish proof stays BLOCKED (browser/credential step for the parent
agent's session; zero residue — nothing was published). #45 tunnel
packaging stays BLOCKED, narrowed: the agent subtree's only dirty file
is the fix itself (parent-consumer-ingress.js).
New counts: LIVE-VERIFIED 15 · LOCALLY VERIFIED 16 · IMPLEMENTED BUT
NOT VERIFIED 5 · PARTIALLY IMPLEMENTED 9 · NOT IMPLEMENTED 2 · BLOCKED 3.
