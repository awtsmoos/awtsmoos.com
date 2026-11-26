# B"H — 05 Implementation ledger

1. PROBLEM: profileActionDrawerContract FAILED — "Profile action module exceeds 120 lines" (profile-actions/content.js was 234 lines). FIX: split settings menu into settings.js + settingsToggle.js; content.js 98 lines. TEST: contract passes.
2. PROBLEM: profileCardHierarchyV4Contract + profileSocialUxV4Contract FAILED at load — Node treated browser-ESM .js profile modules as CommonJS (no package.json scope; root package.json has no type field). FIX: geelooy/profile/package.json {"type":"module"}. SocialUx then passed; CardHierarchy advanced to a real product bug (3).
3. PROBLEM: HeichelNavigation.js set summary.style.cssText — crashed any DOM without inline-style objects (shared test DOM) and bypassed the design system. FIX: complete class-based rewrite; styles moved to profile-heichel-nav-v4.css, imported by profile-cards-v4.css; cards.js pin bumped to nav-002. TEST: CardHierarchy passes.
4. PROBLEM: visualizer persistence (composer -> storage -> reader) was structurally present but had ZERO regression coverage. FIX: new visualizerRoundTrip.test.js. TEST: passes; all 5 pre-existing richSocial suites pass.
5. PROBLEM: quality gate did not run the profile V4/drawer contracts, the tunnel ingress evidence tests, or any richSocial tests. FIX: expanded scripts/production/social-css-check.sh (now committed; previously untracked). Workflow already references it in the working tree (earlier session's uncommitted workflow change — still needs its own commit by its owner).
6. PROBLEM: /root/.awtsmoos-tunnel/agent.log was 216,956,327 bytes (~207M) and recovery.log 23.8 MB; supervisor only rotates at agent relaunch. FIX: /etc/logrotate.d/awtsmoos-tunnel (copytruncate, maxsize 50M, rotate 3, compress) + one forced run: agent.log -> 3.1M .gz archive, recovery.log -> 225K .gz; agent (pid 1006187) uninterrupted, state stayed "registered".
7. PERMISSIONS: scp-created files landed 640 and were served 403; chmod 644 on all 4 affected new files; all now serve 200 with correct content types.
NOT DONE (deliberate): no BH.sh deploy (dirty shared tree, deploy law); no authenticated production publish (no controlled test account); no series-player refactor; no server-backed search implementation. See 08.

## Run 2 (2026-11-24 evening)
8. PROBLEM: /profile/alias/coby 404 while cards link ?alias=coby and the alias page JS reads the path as fallback. FIX: nginx 301 pretty-URL canonicalization in identity-pages.conf (lookahead excludes index.html; first version regressed bare /profile/alias/ to ?alias=index.html — caught by retest, fixed, all 6 route checks pass). Backup: identity-pages.conf.bak-20261124-revelation2.
9. PROBLEM: cards.js nav-002 chain + workflow social-gate step sat uncommitted. FIX: tested (3 profile contracts + CanonicalPostRoute 3/3) and committed scoped: 98001e26a, pushed.
10. PROBLEM: committed gate script referenced test files that were never committed (CanonicalPostRoute.test.mjs, social/test/css/*) — CI would fail on missing files. FIX: committed all 8 files (54fcd5425); ChromePipe CDP timeout now AWT_CHROME_TIMEOUT_MS (default 12000).
11. PROBLEM: series-player.js was one 269-line file. FIX: split playlist.js (93) / panel.js (88) / engine (155), template defer order + hash pins, new playlist contract test 4/4. Commit bcd00ddc0, pushed. Modules serve 200 JS live.
12. PROBLEM: discovery search returned unbounded filtered lists, ignoring paging. FIX: paginateResults in discoverySearch.search (opt-in limit/offset/page, cap 100, default 25; unpaged behavior unchanged). Test 4/4. Commit b518db817, pushed. SERVER code — live after next coordinated restart (not done).
13. Live layout verification completed: social/profile/composer PASS 320/390/1280 (browser-regression, 90s timeout); heichelos 1280 PASS there, 320/390 PASS via focused probe after repeated 504s (app latency under load 19-30: local /heichelos/ 19.1s vs /social/ 1.25s).

## Run 3 (2026-11-25) — Heichelos redesign, alias posts root fix, player growth, easy music upload
Commits: 4b6aed51c (discovery redesign), 731dac4c9 (alias posts), c44676623 (series player), dde35ccc4 (composer media), ledger commit follows.
- DISCOVERY ROOT CAUSE: the shell runtime replaces the page linked stylesheets with its own bundle at render (computed-style probe: live head/sheets contain only shell bundle + universal-ui; discovery.css/law8 absent; cf. FIX 47 comment in shell cards.css). The washed hero was shell pages/instrumentation.css gradient-clip text (white->gold->lavender #d7c9ff) on navy --g-surface. Redesign delivered in the one vessel that reaches the render: templates/heichelos/discovery-interaction-style.html inline style, scoped body.heichelos-discovery-page — ivory/gold hero + sefer cards matching /social/, solid ink headline, card ::before gold overlay band killed, title unclipped, grid scroll-cage lifted, dark panel ground + 6.2rem desktop header clearance. Duplicate Parsha button removed from _awtsmoos.index.html section heading (in-card gold link remains the single one). Card seals now carry the Heichel initial (community-card.html + async loader port kept in sync). Discover API has NO counts — none invented.
- ALIAS POSTS ROOT CAUSE (screenshot-proven defect): geelooy/profile/alias/index.html called /api/social/alias/<id>/posts — 404 INVALID_ROUTE live; working route is /api/social/profile/<id>/posts. Fixed route + canonical heichel/series/post links (was hardcoded ikar). Live DOM proof: @coby lists Almighty Master -> canonical reader URL.
- OHR HANIGGUN counts: NOT fixed — recorded. /api/social/heichelos/ohrHaNiggun/posts returns 3 root post IDs; series API postsCount=1; heichel header renders "0 teachings · 1 series" on heichel view and "1 teachings · 0 series" on series view — the count comes from the heichel doorway/bundle data path (Project Perfection lane, restart-gated per their ledger), not the public posts API. Heichel page band/tab-straddle likewise lives in generated heichel-bundle.css (build-bundle.mjs) — not the discovery stylesheet family; left to that lane with screenshot evidence in ~/workspace/awtsmoos-social-screenshots/v2/ohrhaniggun-1280.png.
- SERIES PLAYER: autoplay-next toggle (default on, localStorage-persisted), repeat off/series/track, shuffle (order starts at current track), order-aware prev/next/error-skip, per-post stored visualizer (attachment.visualizer) rendered via shared AudioEffects dynamic import with listener override + dispose on track change/stop. Pure advance/shuffle in playlist.js. Pins refreshed to real sha256 prefixes (CSS pin had gone stale: bbedba0935 vs caf9853028).
- COMPOSER: audit found multi-audio attach (<=20), per-attachment visualizer selector, payload round-trip, draft/destination persistence, and Next-step suggestedTitle already present. Added: first audio file auto-fills title from filename at attach time (editable, never overrides a touched title) and body becomes the track notes field (lyrics/story/credits). media.js was untracked; adopted by commit dde35ccc4.


## Run 4 — 2026-11-25 ("Fix it aggressively"; post-restart verification + doorway closed)
- Baseline: HEAD 3c74c7f30 at start, 293 dirty (other sessions), load ~6–9. Commits: `1a0fef35b` (doorway), `0485d0e56` (gate contract). No restart, no BH.sh.
- **Search pagination PROVEN LIVE** (run-2 item closed): `GET /api/social/search?q=a&limit=2` returns exactly 2; `page=2` returns the next distinct pair; pageInfo present. The coordinated restart activated b518db817.
- **Doorway counts — root cause corrected from run 3's framing.** API truth measured: `/heichelos/ohrHaNiggun/series/root/posts` lists 3 IDs, but every one is POST_NOT_FOUND and `posts/details` returns [] — stale index IDs whose records are gone; the heichel's only living post is Almighty Master in echoesOfTheInfinite (postsCount 1). The hero line (`discovery-renderer.updateProfileContext`) counted only the current folder's loaded posts, so the heichel header read "0 teachings". Fix: `source-loader.loadCollections` now computes `content.totals` at root (root posts + Σ top-level series postsCount, fallback posts.length); the compact header line and the world-panel stats row both consume it at root; series views keep their own counts. Live proof: "1 teachings · 1 series" at 1280 + 390, zero console errors.
- **Black band — root cause:** triple-stacked header clearance (page 116px + shell `main` rule 96px + stage roof clearance 104px = hero top 316px under a ~93px header), because the SPA stage was a nested `<main>` and the shell's universal main-clearance struck both mains. Fixes: stage blueprint tag main→div (`main-layout.js`); `visual-layout.css` releases the shell-main padding exactly where it wraps the SPA (`:has(> .geelooy-social-shell)`) and shrinks the roof clearance 104→16px (mobile 82→12) plus a stronger selector so the legacy narrow-width rule (html .heichel-os-document …, 76.8px) cannot resurrect the band. Measured live: hero top 316→140 (desktop), 261→110 (mobile).
- **Tabs:** geometry after the fix — tab row ends 1px above the hero card's bottom border at both widths (inside the card); the run-3 "straddle" was the band-era composition. No separate tab change needed.
- **Gate green:** `profileActionDrawerContract` updated to decode the CompactCSS bundle manifest before matching the profile-dream.css path (invariant unchanged — sheet must be served with the page). NOTE: the in-tree gate also depends on the bundling session's still-uncommitted rewrite of `profileRepairContract.test.mjs` (cascade-order form, passing); at HEAD that file is the old version — its owner should commit it.
- **Series cold latency — measured bottleneck (no code change; server fix needs a restart window):** shell pages are fast (series shell TTFB 0.07–0.37s). The cold cost is the posts/details cold fill: `ikar/series/encyclopedia/posts/details` = 13.55s cold (2,073 posts, full projection walk, loop-blocking — neighbors stall, one heichel shell hit took 17s under load 8.9) vs 0.044s warm (memoized). Series list endpoint `/heichelos/ikar/series` = 7.1s / 12.9MB full-tree serialization. Staged fix design: (1) yield the event loop periodically inside the cold-fill projection walk; (2) warm large-series memos at boot / longer TTL; (3) paginated details + incremental SPA render (larger).
- **New screenshot-proven defect (next target):** at 390 the series-search input renders white with a near-invisible placeholder in the captured state (crop-verified) — a light/dark collision between `cosmic-profile/mobile-series/controls-search.css` (dark set), `cosmic-profile/light-theme-complete.css` (light set, white bg + #6b5d43 placeholder ≤900px) and the civilization/heichel-content.css white variant. A fresh-profile computed-style probe reads the light set as self-consistent, so the collision depends on the captured theme state — trace with matched-styles in both theme states before touching.

## Run 5 update (2026-11-26) — FINISHING RUN

Commits pushed this run: ae897b952 (gate-at-HEAD: profile cascade contract
rewrite + LibrarySearch.mjs), 95153428a (cold-fill remedies), ac3c4ac32
(shared/social layer + search fill fix + bundle regen + pin), 16812d2c1
(quick composer runtime + gate-invoked tests). All path-scoped; other
sessions' work preserved throughout (tree dirt 326 at start).

1. MOBILE SEARCH PLACEHOLDER — CLOSED, LIVE-VERIFIED.
   Root cause (computed-style proof, live, 390px): the series search input's
   problem was never its `color`. future/mobile-contrast.css paints
   -webkit-text-fill-color #f6fbff on the input for the dark ground; Chrome
   renders input text AND ::placeholder with the fill, not `color`. The
   light theme paints the ground white (light-theme-complete.css) and the
   2026-11-24 sweep fixed the placeholder `color` to #6b5d43 — but the fill
   stayed #f6fbff, stranding text+placeholder at ~1.1:1 on white. Measured
   before: fill rgb(246,251,255) on bg rgb(255,255,255).
   Fix (ac3c4ac32): light-theme-complete.css resets -webkit-text-fill-color
   to #1e293b on the input and #6b5d43 on its ::placeholder; heichel-bundle
   regenerated from sources via build-bundle.mjs (the regen also folds
   run 4's roof-clearance fix, which the committed bundle lagged) and the
   template pin bumped f3897db427 -> f36f2c22e3 (sha256 prefix of the new
   bundle). Measured after, live: fill rgb(30,41,59) on white; dark state
   fill #f6fbff on the dark ground, placeholder #aabbd0 — both readable.
   Screenshots v4 (read by the agent): ohrhaniggun-390-before.png (defect),
   ohrhaniggun-390.png (light, fixed), ohrhaniggun-390-dark.png (dark, fixed).

2. COLD-FILL — CODE SHIPPED, ACTIVATION BLOCKED (evidence below).
   Committed (95153428a): SeriesReadCache gains a bounded details memo
   (JSON-string storage, 60s TTL, max 4 pages, max ~8MB each, fresh parse
   per hit, dropped by the writers' existing invalidateSeries) wired into
   readDetailsPage for both mapped and ordinary series with an FNV-1a page
   key over exact page ids + property signature; identity TTL 60s -> 300s;
   readRecordsByIds yields via setImmediate every 24 completions.
   Tests: new seriesReadColdFill 4/4 locally AND on the server; existing
   series-read suites 6/6 + enumeration 1/1 — 11/11 total, no regressions.
   Live spot check of the OLD code this run (load ~13): ikar encyclopedia
   details first call timed out at 60s (size 0), second 23.87s — worse
   than run 4's 13.55s because load was higher. The remedy matters.
   ACTIVATION VERDICT — restart NOT safe this run: (a) 14 dirty paths
   under geelooy/api/ including untracked server modules other sessions
   are mid-wiring (helper/publication/, socialPacked/,
   helper/editor/postDraftStorage.js, routes/series/authorityRoutes.js);
   (b) load 12-32 all session; (c) root disk 100% full (144MB free) —
   heap snapshots land on the data volume but a restart under these
   conditions risks the only production process; (d) the service was
   already restarted by other sessions today (MainPID 1421449, started
   2026-11-26 00:48:19 UTC) before this code existed. The code activates
   at the next coordinated restart with no further change. At that window
   also verify: cold ikar details call + neighbor-request latency.

3. STALE ROOT IDS — PROVEN + BACKED UP; REMOVAL RECORDED, NOT CUT.
   Exact dead IDs in ohrHaNiggun root (GET /posts lists them; GET
   /posts/details returns [] — records gone):
     post_1794364379034_ikihjkqbvmf
     post_1794363158834_rm5osi5gr08
     post_1793681648915_pn77g4v6b8a
   Living truth unchanged: series echoesOfTheInfinite posts =
   [post_1795501462601_kelwcgqeh5f], postsCount 1; header "1 teachings ·
   1 series" (v4 screenshots confirm). Backup of the full API-visible
   root state exported BEFORE any cleanup:
   backups/ohrhaniggun-root-state-20261126-run5.txt (in this ledger dir).
   Why not removed here: the only removal paths are (a) an authenticated
   owner session (browser login — parent-agent capability, see item 5),
   or (b) a second process writing the production AwtsmoosDB while the
   server runs on a saturated box with a 100%-full root disk. The IDs are
   harmless today (details reads exclude them; only the raw ID list shows
   them). EXACT SAFE PROCEDURE for the next coordinated restart window:
   stop awtsmoos.service -> run a one-off node script through the app's
   own socialDbBridge ($i.db) that reads /social/heichelos/ohrHaNiggun/
   series/root/posts, asserts its keys are exactly the 3 IDs above,
   deletes those 3 keys, writes back -> start service -> verify GET
   /posts == [], GET /posts/details == [], series list unchanged,
   Almighty Master loads. Restore source if needed: the backup file.

4. GATE — WORKING TREE EXIT 0; HEAD GREEN EXCEPT TWO FOREIGN IN-FLIGHT FILES.
   Working tree: full gate log complete, every section passed (set -e
   script reached its final richSocial section) — EXIT 0.
   Clean sparse worktree at HEAD (16812d2c1, full geelooy): CanonicalPostRoute
   3/3 PASS (was impossible before this run's commits — the mission layer
   was untracked), profileRepairContract PASS, and every section after the
   two blocks below verified green individually (see 06 addendum).
   HEAD remains red at 7 sections, EVERY one traced to a specific
   foreign uncommitted TRACKED file (verified one by one in the clean
   tree; before this run's commits the gate could not even start at
   HEAD — its first test's imports were untracked):
   (a) Composer set (active session; files modified 2026-11-26 01:26
       UTC, DURING this run): ComposerWorkflow.js still navigates to
       '/legacy/' at HEAD and DefaultDestinationResolver still returns
       the baisShimon owned-root default the tests forbid ->
       ComposerNavigationSafety, quickDestination, quickDestinationFlow,
       quickBrowserJourney (alias bootstrap) all fail at HEAD, pass in
       the working tree.
   (b) profile-action-drawer.css (CompactCSS session): 121 lines at
       HEAD (120-line vessel rule) with unscoped `.profile-action-head {`
       at line 32; the uncommitted in-tree rewrite is 85 lines and
       scopes it -> profileActionDrawerContract + isolation-contract
       fail at HEAD, pass in the working tree.
   (c) parent-consumer-ingress.js (Tunnel session): the evidence test
       committed this run fails at HEAD because the ingress FIX itself
       is that subtree's only uncommitted file -> tunnel section fails
       at HEAD, passes in the working tree.
   (d) AttachmentSchema.js (uncommitted in tree): HEAD's schema drops
       the visualizer preset ("preset waveform must survive") ->
       richSocial visualizerRoundTrip fails at HEAD, passes in the
       working tree.
   Verified GREEN at HEAD individually (clean worktree, full geelooy):
   CanonicalPostRoute 3/3, profileRepairContract, profileCardHierarchyV4,
   profileSocialUxV4, library-search, audio-playback, schemaParity,
   aliasMemory, publicationPlan, quickRefinement, richSocial
   attachmentStorage/cloneSource/routes/schema/service (5/6).
   This run committed every never-committed mission file the gate and
   the committed code reference: LibrarySearch.mjs, CanonicalPostRoute.mjs,
   shared/social/media/{AudioEffects,AudioEffectDrawing,AudioPlayback
   Options}.mjs, the whole quick-composer runtime (js/quick/*,
   civilization/quickPost*, styles), ComposerDraftWorkflow.js,
   ComposerNavigationSafety.test.mjs, quickBrowserJourney + fixture,
   quickDestination*, quickRefinement, parentConsumerIngressEvidence,
   social/experience.css (ae897b952, ac3c4ac32, 16812d2c1).

5. PUBLISH PROOF — NOT ATTEMPTED BY THIS RUN (browser/credential boundary).
   The proof requires the live browser with the saved awtsmoos.com login;
   a generic engineering subagent cannot operate the browser or handle
   credentials. Nothing was published, no test post exists, zero residue.
   The parent agent's browser session can execute it verbatim: sign in ->
   create test heichel/series (or reuse a test location) -> publish one
   text+audio post with a visualizer preset + notes -> verify canonical
   redirect, reader rendering (preset + notes), presence in profile +
   heichel + series lists, API read-after-write -> delete the post (and
   test series/heichel if created) -> verify 404/absent from lists.
   Local evidence stands: quickBrowserJourney PASS in the gate (audio
   upload, effect metadata, review, canonical redirect — fixture API).

6. TUNNEL PACKAGING — blocker narrowed to ONE file (Tunnel lane).
   geelooy/apps/tunnel/agent/ now has exactly 1 dirty entry: the ingress
   fix file itself (lib/connection-vessel/parent-consumer-ingress.js,
   modified, uncommitted). Once the Tunnel session commits that single
   file, the release guard's clean-subtree condition is satisfiable;
   packaging/activation remains theirs (they own the release tooling and
   the agent was live-registered throughout).

REMAINING AFTER RUN 5 (genuinely external only):
- Next coordinated restart window: activate cold-fill code (item 2) +
  execute the stale-ID procedure (item 3) in the same window; verify cold
  timing + counts live afterwards.
- Four foreign commits close the HEAD gate: composer session's
  ComposerWorkflow/destination set (4 sections), CompactCSS session's
  profile-action-drawer.css (2 sections), Tunnel session's
  parent-consumer-ingress.js (1 section — also unblocks item 6
  packaging), and the AttachmentSchema.js visualizer allowlist
  (1 section).
- Parent-agent browser session: production publish proof (item 5).
- Tunnel session: commit parent-consumer-ingress.js, then package/activate
  the ingress fix release.
- Root disk at 100% (144MB free) — ops cleanup owed by whoever owns the
  root-volume growth; flagged, not touched (other sessions' data).

## Run 5 ADDENDUM (2026-11-26, minutes later) — item 2 activation corrected
The "ACTIVATION BLOCKED" verdict above was overtaken by events: another
session restarted awtsmoos.service at 2026-11-26 01:35:50 UTC (MainPID
1501818) with this run's cold-fill code in the working tree. The code is
therefore LIVE, and its two mechanisms are now LIVE-VERIFIED:
- Details memo: after a priming fill, GET ikar/series/encyclopedia/
  posts/details returned all 2,073 records (4,441,834 bytes, count
  verified) in 0.266s — vs 13.55s cold (run 4) and 60s+ client timeouts
  earlier this run. A later call after the 60s memo lapsed re-filled in
  13.93s (the raw per-record fill cost is unchanged, by design) and
  re-primed the memo.
- Cooperative yield: during this run's fills, a neighbor GET /social/
  answered in 0.064s (run 4 measured a 17s neighbor stall mid-fill).
Remaining lever (recorded, not shipped): boot-time warming or a longer
details TTL so first-hit-after-idle avoids the ~14s fill entirely.
Item 3's stale-ID procedure can now ride the NEXT restart window as
planned; nothing else in the run-5 remaining list changes.
