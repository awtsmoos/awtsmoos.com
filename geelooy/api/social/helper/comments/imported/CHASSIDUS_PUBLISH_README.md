# Chassidus Publish — production procedure (read this before touching live data)

B"H. This document describes how Chassidus phrase translations and summaries get
onto the live site. Written 2026-09-23 after the first successful canary.

## Where translations LIVE (two separate stores!)

The live site serves translations from TWO different stores. Publishing to only
one leaves the other empty:

1. **Packed rich-comment store** — `dayuhChadash/socialPacked/social.richComments.v1.fs.awtsdb`
   (Linux production path: `/mnt/HC_Volume_102267213/dayuhChadash/...`).
   - One full comment per phrase: `verseSection` = section index,
     `subsectionId` = phrase id. English in `content`, NEVER truncated.
   - Aliases (see `registry.js` `familyFor`): `likkutei_translation_en`,
     `sefer_hasichos_translation_en`, `sichos_kodesh_translation_en`,
     `meluket_translation_en`, `likkuteitorah_translation_en`,
     `torahohr_translation_en`, `ayinbeis_translation_en`,
     `derechmitzvosecha_translation_en`.
   - Summaries use the same store with `_summary_en` aliases
     (`likkutei_summary_en`, …): 1 section summary per section + 1 post summary.
   - Served by: `GET /api/social/heichelos/ikar/comments/inSeries/<series>/atPost/<post>?aliasId=<alias>`.
   - Writer: `~/workspace/chassidus-rebuild/publish/import_packed.js` (translations)
     and `import_summaries.js` (summaries). Single exclusive writer — server must be
     STOPPED (`systemctl stop awtsmoos`) during writes. Idempotent.

2. **/translations v2 corpus archives** — read by
   `GET /api/social/heichelos/ikar/series/<series>/post/<post>/translations`.
   - FROZEN files: `social.heichel.ikar.comments.corpus.{likkuteiSichos,seferHaSichos}.alias.*_translation_en.v2.fs.awtsdb`.
   - Virtual path: `/social/heichelos/ikar/comments/atSeries/<series>/atPost/<post>/<alias>`.
   - Payload: `{ "0": [row,...], "1": [row,...] }` — section index → phrase rows,
     serialized with `awtsmoosBinaryJSON.serializeJSON`.
   - Registry coverage is strict: ONLY `likkuteiSichosVolume\d+` and
     `seferHaSichos\d+` map to corpora. All other series → `unsupported`.
   - Sichos Kodesh / Meluket /translations read STATIC bundles:
     `geelooy/api/social/helper/comments/imported/data/{sichosKodesh,meluket}/`.
   - Writer: `~/workspace/chassidus-rebuild/publish/pack_corpus.js`
     (run after OCR; `postResolver.alignment` drops out-of-bounds rows).

## Publish order (per series)

1. Dedupe payloads per postId (fullest payload wins — `canonicalCommentId` is
   random, duplicates would double-publish). See `PAYLOAD_MANIFEST_NOTES.md`.
2. `batch_publish.js` → grouped `.awtsmoosJSON` alias files.
3. Server stop → import translations → import summaries → server start.
4. Verify via public comments API: EXACT expected counts per (series, post, alias);
   spot-check coordinates, full English, summaries.
5. OCR pass for LS/SHS/SK (staged repairs at `/source/sections[N]/ocr/diff[]`;
   exact-byte `before` match, skip mismatches, q122 never).
6. `pack_corpus.js` for LS/SHS corpus families.
7. Verify `translated:true`, `meta.imported == expected count` via /translations.
8. Browser check (rendered page + reply/thread UI) — needs browser delegation.

## Rules

- Nothing is live until the public API returns it.
- Nothing is a summary under a `_translation_en` alias (the reader strips them).
- Never invent Hebrew or footnote bodies. q122 (`sichosKodesh5742_57421318`) is
  quarantined — never import or requeue.
- The Mac's `dayuhChadash` copy is NOT production (verified 2026-09-23: 242-byte
  richComments file vs live canary data). Production = Linux Hetzner host.

Full coordinator report: `~/workspace/chassidus-rebuild/publish/LIVE_PUBLISH_REPORT.md`
(import runbook: `IMPORT_RUNBOOK.md`, corpus trace: `TRACE_translations_corpus.md`).
