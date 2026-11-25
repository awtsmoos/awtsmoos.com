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
