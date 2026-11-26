# B"H — 08 Remaining work — updated by run 2 (2026-11-24)

RUN 2 COMPLETED (commits 98001e26a, bcd00ddc0, 54fcd5425, b518db817 — all pushed):
- Live layout: ALL FOUR surfaces now LIVE-VERIFIED at 320/390/1280 (social,
  profile, composer via browser-regression with AWT_CHROME_TIMEOUT_MS=90000;
  heichelos 320/390 via focused probe after repeated nginx 504s under load).
- /profile/alias/coby 404 RESOLVED: canonical route is ?alias= (cards.js);
  page JS also reads path as fallback. nginx pretty-URL redirect added to
  /etc/nginx/awtsmoos.d/identity-pages.conf (backup .bak-20261124-revelation2):
  /profile/alias/<id>[/] → 301 /profile/alias/?alias=<id>, with a PCRE
  negative lookahead excluding index.html after the first version broke the
  bare /profile/alias/ route (caught + fixed + retested: bare 200, query 200,
  path 301→200, direct index 200, /@coby 200).
- cards.js chain + workflow gate step COMMITTED (98001e26a) — the diffs were
  stale Nov-24 revelation work (mtimes 10:12–19:01), not tonight's sessions.
- Gate test files COMMITTED (54fcd5425): the committed gate script referenced
  CanonicalPostRoute.test.mjs + geelooy/social/test/css/* which were never in
  git — CI at HEAD would have failed on missing files. ChromePipe timeout is
  now env-configurable (AWT_CHROME_TIMEOUT_MS, default 12000 unchanged).
- Series player REFACTORED (bcd00ddc0): playlist.js (93) + panel.js (88) +
  engine (155); template loads 3 defer scripts with hash pins; playlist
  contract test 4/4. Browser playback regression still owed.
- Discovery search: server-backed endpoint already existed (/api/social/search,
  public-people global + explicit-alias scope, permission-aware by
  construction). Added bounded pagination (b518db817, test 4/4) — SERVER code,
  live only after the next app restart, which was NOT done (load 10–30,
  ~290 other-session dirty paths; a restart deploys everyone's server code).
- Completion court written: 09-completion-court.md (LIVE 11 · LOCAL 15 ·
  UNVERIFIED 8 · PARTIAL 9 · NOT 4 · BLOCKED 3).

NEXT, in priority order:
1. Calm-window (load < 4): restart app service in coordination with other
   sessions so b518db817 (search pagination) + other sessions' server code go
   live deliberately; then verify /api/social/search?limit= live and re-run
   the full gate --live at default 12s timeouts.
2. Authenticated production publishing verification — still BLOCKED on a
   controlled test account/heichel with Hai's consent. Steps in run-1 08 §3.
   NEVER in Hai's personal library without explicit consent.
3. Series-player browser playback regression (real series page, launcher →
   track advance → stop) + speed/repeat parity check vs AudioPlaybackOptions;
   queue/shuffle remain NOT IMPLEMENTED (court #30).
4. Tunnel release packaging for the parent-consumer-ingress fix — needs a
   clean agent subtree; coordinate with the Tunnel session (very active).
5. Performance: /heichelos/ app latency under load (19.1s local vs 1.25s
   /social/) — profile the heichelos SSR path; Project Perfection session
   reported a "heichelos streaming" fix in its Phase 4 — check whether it
   landed and re-measure before duplicating work.
6. Court PARTIALs: preset gallery expansion (6 presets), reader re-audit,
   sharing metadata signed-out test, follows/comments/notifications exercise,
   performance budgets (LCP/INP/CLS), Firefox/WebKit harness.

KNOWN STATE: gate (non-live) EXIT 0 at 3057b51c7 (run 1); run 2 re-ran the
gate through the fixture suites and the live stage separately (full --live
single-process run still dies at heichelos under extreme load at the default
12s CDP timeout — use AWT_CHROME_TIMEOUT_MS=90000 until load calms).
Server load during run 2: 10–30 (Piano/Tunnel/Perfection/MW sessions active).
Disks 92%/94%. No BH.sh. No restart. No fabricated posts.

## Run 3 update (2026-11-25)
DONE this run: heichelos discovery redesign LIVE (4b6aed51c); alias Posts root fix LIVE (731dac4c9); series player autoplay/repeat/shuffle/visualizer LIVE (c44676623); composer filename-title + notes LIVE (dde35ccc4).
REMAINING, in order:
1. Heichel doorway lane (Project Perfection / bundle owner): Ohr HaNiggun header counts (root posts API=3, series postsCount=1, header says 0/1 and 1/0 depending on view) + ~250px black band + tab row straddling the details bar — all in generated heichel-bundle.css / doorway data path; restart-gated server pieces per PP ledger.
2. Profile contract pair (profileRepairContract, profileActionDrawerContract): update the profile-dream.css literal-link assertion to the CompactCSS bundle form — belongs to the 64436a22e session (their test file is dirty now).
3. Coordinated restart still owed: activates run-2 search pagination (b518db817) and any server-side doorway fixes.
4. Authenticated production publish proof still blocked on a controlled test account.
5. quickBrowserJourney fixture server startup under load — retry in a calm window.
6. Discovery nits (minor): desktop hero right-center still airy; mobile eyebrow carries a cyan shell bullet dot; search button sits below the input instead of inline.


## Run 4 update (2026-11-25) — supersedes Run 3 remaining items 1, 2, 3, 5
DONE this run (commits 1a0fef35b, 0485d0e56, both pushed):
- Search pagination PROVEN LIVE post-restart (limit/page verified) — Run 3 item 3 closed for search; no restart performed or needed by this run.
- Heichel doorway CLOSED (Run 3 item 1): counts fixed at the client totals layer (the "root posts API = 3" are stale IDs — records POST_NOT_FOUND; living total is 1, now rendered), black band fixed (nested-main double clearance + roof clearance), tabs verified inside the card by geometry + screenshots v3.
- Profile contract pair (Run 3 item 2): profileActionDrawerContract fixed + committed by this run; profileRepairContract passes ONLY via the bundling session's uncommitted in-tree rewrite — that session should commit it, or HEAD's gate stays red on that one section.
- quickBrowserJourney (Run 3 item 5): PASSED inside the full gate (EXIT 0) at load ~6–9.
REMAINING, in order:
1. Mobile series-search input placeholder invisibility at 390 (screenshot + crop proven, v3): theme-collision across controls-search.css / light-theme-complete.css / civilization heichel-content.css — trace with matched-styles in BOTH theme states, fix in the owning sheet.
2. Series posts/details cold fill: 13.55s full walk for a 2,073-post series (warm 0.044s) + ikar series list 7.1s/12.9MB. Staged fix: loop-yielding cold fill, boot warming/longer TTL for large series, then pagination + incremental render. Server code — needs a coordinated restart window to activate.
3. Stale root post IDs in ohrHaNiggun (3 IDs, records gone): data-layer cleanup decision — remove from the root series index or leave as harmless (details reads already exclude them; only the raw ID list endpoint shows them).
4. Authenticated production publish proof — still blocked on a controlled test account (unchanged).
5. Tunnel release packaging (unchanged, Tunnel session's lane).
6. Run 3 item 6 nits (discovery hero airiness, cyan bullet, search button stacking) — minor, unaddressed.

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
