# Merge report — local d19afdb25 + true GitHub main ce8accdca (scratch, 2026-10-11)

## What this is
Non-destructive reconciliation of the VM's local work with true GitHub main into a
single deployable tree. Built in a detached scratch worktree; no real branch was
touched, nothing was reset/reverted/deleted in `~/workspace/mw-repo`.

- Ours (worktree base): `ce8accdcadfc641205974a2a46e076d96c034a9c` (true GitHub main)
- Theirs (merged in): `d19afdb25c9f3f524860fc4f3386f8eccdfdf00c` (local HEAD, clean tree)
- Real merge base: `ffa5dd2f8d238db76a9bbd32556b73cc4a13a6b6` (2026-10-08, found after
  deepening the main fetch; the initial shallow fetch had no common ancestor)
- Distance from base: 24 commits (main side), 242 commits (local side)
- Result: 1169 files changed, 121264 insertions(+), 5033 deletions(-); 324 files added

## Conflicts (7) and per-file resolutions

1. `geelooy/api/social/helper/routes/packed/deployRoutes.js` — CONFLICT (add/add).
   Both sides added the file independently. Diff showed the ONLY difference is local's
   extra `POST /packed/deploy/restart` endpoint (auth-gated, 46 lines). Resolution:
   took local's version (strict superset, 306 lines). Nothing dropped.

2. `geelooy/heichelos/post/_awtsmoos.post.html` — content conflict, 1 hunk.
   Local added `<link ... meluket-reader-overhaul.css?v=reader-overhaul-1>`.
   Purely additive. Resolution: kept the line (both sides' intent).
   Verified `geelooy/heichelos/post/styles/meluket-reader-overhaul.css` exists in tree.

3. `geelooy/heichelos/post/logic/scribe/MeluketSeferReader.js` — content conflict, 3 hunks.
   Local's hunks are reader-overhaul additions (footnote glide nav: fnPrevEl/fnNextEl/…).
   Per the merge task's explicit requirement, deploy-critical files must stay
   byte-identical to the live baseline. Resolution: took MAIN's version
   (md5 1c9b647c63a6a1a98704b818b35f0254, 46712 bytes — live-identical).
   Local's newer version preserved at
   `_set_aside_from_merge/MeluketSeferReader.js.local-d19afdb25` + `.main-vs-local.diff`
   for re-application after deploy.

4. `geelooy/heichelos/post/styles/meluket-sefer.css` — content conflict, 3 hunks.
   Substantive design divergence: main sets Hebrew `clamp(3.2rem, 9vw, 5.2rem)`;
   local sets `clamp(2rem, 5.2vw, 2.8rem)` per Yaakov's "Hebrew EXACTLY the same size
   as English" directive. Per the merge task's explicit requirement, deploy-critical
   files must stay byte-identical to the live baseline. Resolution: took MAIN's version
   (md5 175550f15a252f8a42d2bd1cf5008fb5, 22110 bytes — live-identical).
   Local's newer version preserved at
   `_set_aside_from_merge/meluket-sefer.css.local-d19afdb25` + `.main-vs-local.diff`.
   NOTE: Yaakov gave both directives at different times; the live (main) sizing is
   what users see today. Do NOT flip this in a merge — needs his explicit call.

5. `geelooy/heichelos/post/styles/comments/editor.css` — delete-vs-modify.
   Main's 8f85dd92e emptied the file (101 deletions, 0 bytes); local kept it and
   applied a theme-token fix (`color:#fff` → `var(--btn-active-ink,#fff)`).
   Resolution: kept LOCAL's version (more complete; main's emptying unexplained).
   0 `!important`.

6. `geelooy/heichelos/post/styles/ideal/reborn/study-sheet-results.css` — delete-vs-modify.
   Main's 8f85dd92e emptied the file (85 deletions, 0 bytes); local kept it and
   applied theme-token fixes (`#cbd5e1` → `var(--study-sheet-muted-ink,#cbd5e1)`).
   Resolution: kept LOCAL's version (more complete). 0 `!important`.

7. `geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-vm/thread.js` — 2 hunks.
   Both hunks are local's additive JSON.parse/stringify fast-path blocks (SYS 50/51).
   Resolution: kept local's insertions; merged file is byte-identical to local's
   version (598 lines), which already contains main's expansion of the file.
   `node --check` passes.

## Deletions applied by the merge (16 files, all backed up)
`_set_aside_from_merge/deleted-in-merge/` holds main-tip copies + MANIFEST.txt.
- 3 `.lightning_tmp` test DBs + `vector_test.db` (temp/test artifacts)
- 10 generated `.exe` files under `geelooy/apps/exe-emulator/tests/generated/`
- `geelooy/games/mitzvahWorld/build/generated/assets/essential-grass.jpg` (build output)
- `geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-vm/closureBridge.js`
  (intentionally removed by local: dead code, zero references)
- `plugins/awtsmoos-shliach/assets/gpt-icon.png`
  (intentionally removed by local: asset moved to Drive)
These follow local's code-only-repo cleanup and Yaakov's standing code-only rule.
One main-side test file (`geelooy/apps/tunnel/agent/testing/manualStatusRegistration.test.cjs`)
was RETAINED (real code, added by main side).

## Already-in-sync items (no action needed)
- `geelooy/heichelos/parsha-index/index.html` + `index.json`: byte-identical on both
  sides (local 2daffcafb/31efd1e86 == main d99e2ad76/ce8accdca). Auto-merged.
- `geelooy/api/social/helper/routes/packed/postImportRoutes.js`: byte-identical on
  both sides; required by `geelooy/api/social/_awtsmoos.packed.js:16`. Survives. ✓

## Verification
- meluket-sefer.css: md5 175550f15a252f8a42d2bd1cf5008fb5, 22110 bytes — LIVE-IDENTICAL ✓
- MeluketSeferReader.js: md5 1c9b647c63a6a1a98704b818b35f0254, 46712 bytes — LIVE-IDENTICAL ✓
- postImportRoutes.js present (21552 bytes) and required by packed routes ✓
- CSS validator (`~/workspace/site-audit/css-validator.py` over `geelooy/`):
  100 errors / 8 warnings — ALL PRE-EXISTING, 0 introduced by this merge.
  (16 in files untouched by the merge; 8 in files where the merge took local's
  version byte-identical, so the errors were already in local tip.)
  Full output: /tmp/cssval.txt (on the merge machine).
- `!important`: 0 real declarations in all 636 CSS files touched by the merge
  (comment mentions excluded). Yaakov's CSS law holds. ✓
- Conflict markers: none left from the merge (14 files contain `<<<<<<<` as
  pre-existing content, byte-identical counts in main/local/merged). ✓
- thread.js: `node --check` passes. ✓

## Known follow-ups (not done here — needs decisions)
1. Local's newer reader/CSS work (set aside in `_set_aside_from_merge/`) still needs
   Yaakov's call on the Hebrew-sizing question before re-application.
2. The 100 pre-existing CSS validator errors need a dedicated cleanup pass.
3. Deploy is still blocked by the wiped `AWTSMOOS_DEPLOY_KEY` (production systemd).
   This tree is deploy-ready once the key is restored.
