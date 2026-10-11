B"H

# Translation Workflow — Agent Handoff

How a new agent picks up a Hebrew corpus, translates it, converts it to reader posts, imports it, and verifies it — with zero prior context. All paths below are on the VM (`~` = `/home/hatch`).

---

## 1. Pipeline overview

```
Hebrew sources → claim a chunk → translate → convert to post JSONs → stage → import → verify → deploy
~/workspace/ikar-corpora/sources/     (READ, byte-exact)
~/workspace/ikar-corpora/queue/<corpus>/pending/   (claim files)
~/workspace/ikar-corpora/translations/<corpus>/    (your English output, mirrors sources/)
~/workspace/bulk-import-fix/to_posts*.py           (converters)
~/workspace/bulk-import-fix/staging/<corpus>/      (post_*.json)
scripts/vmImportStaged.mjs                         (import + verify)
```

## 2. Claim and translate

1. **Claim:** take a file from `~/workspace/ikar-corpora/queue/<corpus>/pending/`. The claim cites `source_files: {n: {rel, sha256}}`. Move it to `in-progress/` while you work; move to `done/` **only** after verification, `&&`-chained with absolute paths.
2. **Read the live Hebrew bytes** from `~/workspace/ikar-corpora/sources/<CorpusDir>/...`. Never draft from a summary or memory — verify every dibur-hamatchil quote against live bytes.
3. **Write the translation** to `~/workspace/ikar-corpora/translations/<corpus>/` using the **same relative name** as the source. Schema (`translations/SCHEMA.md`, ikar-translation v1.2):
```json
{ "ref": "1:1",
  "hebrew": "<full Hebrew, byte-exact>",
  "phrases": [ {"n": 1, "he": "...", "en": "..."} ],
  "headline": "<≤120 chars>",
  "summary": "<1–3 sentences, original English>",
  "qa": [ {"question": "<real learner question>",
            "answers": [{"angle": "plain reading|commentary|practical",
                         "source": "Rashi on 4:1", "text": "..."} ] } ] }
```
Q&A rules: 2–4 questions/unit, 2–4 answers/question, distinct perspectives, `source` names the commentary. (Torah Ohr V6 uses its own study-edition schema: sections with `he_paras`/`en_paras`, short `phrases` pairs, `flowchart`, `table`, `concept_map`, `synthesis`, `citations`.)

## 3. Convert to post JSONs

```bash
python3 ~/workspace/bulk-import-fix/to_posts.py <corpus> <src_dir> <out_dir>
#   corpus: bavli|mishnah|yerushalmi|rambam|midrash|tanach
python3 ~/workspace/bulk-import-fix/to_posts_rambam.py <out_dir>   # Rambam commentArray prebuild
python3 ~/workspace/bulk-import-fix/to_posts_v6.py [out_dir]       # Torah Ohr V6 (defaults to staging/torahohr_v6)
```

The converters strip build metadata (`worker`, `claim_id`, `_work`), split posts >4.5MB, and set `translation_reviewed` / `publication_approved: false`. Output lands in `~/workspace/bulk-import-fix/staging/<corpus>/post_00000.json…`.

Each staged post carries: `postId, heichelId, seriesId, title, title_he, contentType, corpus, kind (commentary|base|minor|chassidus), commentator, commentary_on, source_rel, source_sha256, provenance, sefaria_ref, units[]`.

**postId conventions** (`{corpus}-{slug(...)}`, slug = lowercase, `[^a-z0-9]+` → `-`, ≤120 chars):
- generic: `bavli-bavli-ahevukha-ad-mavet-cbeafb5421`
- rambam: `rambam-rambam-ahavah-berachot-p01-kesef-mishneh`
- torahohr v6: `torahohr-v6-torahohr-vayishlach-regular-05` (= heichel `torahohr`, edition `v6`, maamar `torahohr_Vayishlach_regular_05`)

Companion fields: `heichelId` = corpus (`tanach`, `bavli`, `mishnah`, `yerushalmi`, `rambam`, `midrash`, `torahohr`); `seriesId` = e.g. `torah-ohr-v6` or `{corpus}-commentary`; `commentator` = human name (`Alter Rebbe`, `Kesef Mishneh`, `Penei Moshe`…).

## 4. Import and verify

```bash
# Full run (stage → signed chunked upload → import job → poll → byte-exact verify):
node ~/workspace/mw-repo/scripts/vmImportStaged.mjs --heichel <corpus> --posts-dir ~/workspace/bulk-import-fix/staging/<corpus>

# Canary first for a new corpus: point --posts-dir at a few files, confirm verify passes, then run the full set.
```

**⚠️ `--heichel` MUST equal the posts' `heichelId`.** The importer stores the raw doc's `heichelId` but derives the alias from the CLI flag — a mismatch fails verification with `PACKED_HASH_MISMATCH` on every post. See `geelooy/api/social/helper/routes/packed/README.md` §7.

Independent verify tooling (`~/workspace/bulk-import-fix/`): `vmVerifySigned.mjs`, `vmVerifyFull.mjs`, `vmDryRunVerify.mjs`, `pollJob.mjs`, `retryStart.mjs`, `vmBacklinksSigned.mjs`. **HTTP 200 is not proof — byte-exact hash equality is.**

## 5. Binding rules

- **Hebrew byte-exact, never normalize.** Sources carry real spelling variants side by side (`שמתחייבי'` vs `שמתחייבים`, `ומהר"מ` vs `ומהר"ם`, `פאד"מ` vs `פאד"ם`, `הניזמין` vs `הניזומין`). These are source-faithful, not typos. Only an `ord()` codepoint dump distinguishes look-alikes.
- **Names — literal, never anglicized:** Yackov (not Jacob/Yaakov), Yisroel, Awtsmoos. **Divine names:** Elokim (not Elohim/God), Havayah, El-Shaddai, G-d (hyphen, always). Never invent a transliteration — flag it.
- **Content quality:** reject fragment-questions (1–2 word stubs) and pseudo-template filler chains (`"The X: the Y."` circular definitions) regardless of gate verdicts. Sample ≥3 units + question-uniqueness check.
- **Filing safety:** final placement is one atomic guarded step (`test ! -e dest && mv tmp dest || echo COLLISION`, never `;`); collisions get suffixed names (`chNNb`), never overwrites. Write multi-step scripts to files under `_work/`, never shell heredocs.

## 6. Do NOT import: Shulchan Aruch / Tur

`queue/shulchanaruch/done/` and `queue/tur/done/` contain **work-order claim files, not translations**. There is no `translations/shulchanaruch/` or `translations/tur/` corpus. Do not run converters or imports for these until real translated corpora exist.
