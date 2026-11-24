# B"H Project Perfection — Phase 1 ledger (2026-11-25)

## Baseline
- Start HEAD: 3057b51c7a6a03269f695ef74b55880cf1baa4da (main). Tree moved during run by other sessions; HEAD at ledger time: 7c1645afe (= origin/main, verified by fetch).
- Pre-existing dirty: 105 modified tracked at start (111 at end), plus hundreds untracked (other sessions: piano, tunnel, social-composer, revelation). NONE touched, NONE committed by this run.

## Audit (46,709 css/js/html files scanned; full output /tmp/audit_out.txt on server)
- Killer rules (body itself :hover/:active with filter/transform): 0 in tracked geelooy+ayzarim. Literal body:hover/body:active: only a policy test (geelooy/scripts/awtsmoos/ui/audit/cssOwnershipPolicy.test.mjs) and unrelated .feed-card-body class. 310 broader matches are descendant button/link hovers (legit feedback, not whole-page).
- Generator that CAN emit the pattern: geelooy/apps/tunnel/css-guarantee/layer1/interactiveStates.mjs (":hover": "filter: brightness(1.08);") — TUNNEL path, forbidden to this run; flagged for tunnel owner. It emits per-selector, not body by default.
- !important: raw 469 in 209 css files (incl. comments); CODE-ONLY 267 in 47 files. Top: social-composer quick-post*.css 90 (UNTRACKED other-session files — not touched), bais-shimon community ~61+22 print, vivera print.css 22, piano settingsPanel.css 10 (other session). Most remaining clusters are canonical patterns: prefers-reduced-motion universal resets (ashen-ridge, chabadofch motion.css) and print-isolation (vivera print.css) — removal NOT provably safe without rendered QA.
- Duplicate tokens with differing values: 1,240 of 4,277 custom props site-wide (mostly scoped per-app systems). Main-shell provable case: --g-cyan defined 3 ways: geelooy/style/geelooy-app/tokens.css #70d5c8; geelooy/style/geelooy-system/tokens.css #40d8ef; geelooy/style/social-system/tokens.css #0f766e.
- Foreign hues in CSS: slate 2,551 hits/968 files (mostly Tailwind-style class names + code editors), cyan 1,372/511, violet 258/135, magenta 123/62, pink 78/32, purple 57/27, rainbow 3. Shell tokens (geelooy-app/tokens.css, dark shell) carry --g-cyan #70d5c8, --g-blue #78a8d8, --g-violet, --g-magenta, --g-pink #f472b6 and cyan->blue gradients; --g-cyan used 70x in geelooy-app sheets. Recoloring the whole shell accent to gold = visual redesign, NOT done without rendered signed-in QA; top remainder.
- Duplicate stylesheet loads: 14 basename hits, ALL false positives on exact-href check (different index.css paths, or second copy inside a JS template string for a separate generated document: login/index.html:96, register/index.html:105). Exact-duplicate loads in one document: 0.
- Cache pins (?v= refs): 2,185 total; 1,252 match sha256[10:20]; 902 mismatch (many equal sha256[0:10] of current file, rest stale after edits); 31 unresolved. NOTE: pin slice convention in live HTML is mixed [0:10]/[10:20] — mass-rewriting 902 pins is a freshness-guard system change (geelooy/scripts/freshness/, other session, dirty) — NOT done; flagged.
- Shell entrance: ALREADY CORRECT — mobile-shell-motion.css settled .is-ready uses translate: none (documented 2026-11-23 identity-menu fix); legend page-enter keyframes end transform: none (sheet unreferenced/dead).
- Fixed-height pane main-padding: not verified this run (remainder).

## Timings (curl, live, 2026-11-25)
- / 200 ttfb 0.033s total 0.033s 12,473B
- /profile/ 200 ttfb 0.031s total 0.032s 22,448B
- /heichelos/ 200 ttfb 1.327s total 1.327s 50,617B (slowest; no >5s hang)
- /email/ 200 ttfb 0.033s total 0.033s 4,162B
- Series page: not timed (heichelos index links are JS-rendered; remainder).

## Fixes made this run
- NONE to CSS/JS/HTML. Every candidate was either absent (killer rules, exact dup loads), already fixed (shell entrance), in forbidden/untracked/other-session files (tunnel generator, quick-post, piano), or not provably safe without rendered QA (print/reduced-motion !important, 902-pin rewrite, shell recolor). Per instructions: only provably-safe defects get fixed; the rest are listed, not forced.
- This ledger is the only committed file.

## Remainder (needs rendered, signed-in, 390+1280 browser verification — NOT done, NOT claimed)
1. Shell accent recolor decision (cyan/teal family -> gold) incl. --g-cyan 3-value consolidation.
2. !important removal: quick-post (owner session), bais-shimon/vivera print+reduced-motion patterns, piano settingsPanel.
3. Pin convention unification ([0:10] vs [10:20]) + 902 stale pins, with freshness-guard owner.
4. Tunnel css-guarantee generator brightness(1.08) default (tunnel owner).
5. All per-page signed-in checks: profile tabs/settings save, alias pages, identity menu, heichel/series/reader, comments, email threads, composer flow, feed/Signals, games/Mitzvah World; series-page timing; fixed-height pane padding check.
6. No restart / no BH.sh performed or needed for this run.
