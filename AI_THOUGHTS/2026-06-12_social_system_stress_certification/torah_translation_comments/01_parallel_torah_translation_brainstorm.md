B"H

# Parallel Torah Translation Comment Automation Brainstorm

## Goal
Write a Node.js automation that can translate multiple Torah sub-series at once, beginning with the first five chapters of Genesis and the first five chapters of Tehillim. The automation must use Minimax through the existing Awtsmoos agent client, and then attach English translations as social comments to each verse section under a dedicated translation alias.

## Non-negotiable design
- Hebrew source posts are never modified.
- English translations are comments, one comment per verse section.
- A dedicated alias owns these comments, likely `torah_translation_en`.
- The script must be resumable: before translating/writing a verse, it reads existing comments by that alias at the verseSection and skips already-completed source hashes.
- Parallelism happens across chapter jobs / sub-series, not by blasting the same post without control.
- Every write must be verified by reading comments back.
- Minimax output must be JSON-validated before any write.
- Default should be dry-run unless `--write` is passed.

## Expected input corpus
- Written Torah / Queen Torah area contains sub-series like Genesis/Bereishis and Tehillim/Psalms.
- Each chapter is a post or child content item with sections/segments corresponding to verses.
- The script should discover real IDs instead of hardcoding if possible.

## Proposed job graph
- Book job: Genesis first 5 chapters.
- Book job: Tehillim first 5 chapters.
- Chapter jobs are independent.
- Minimax requests can run with a worker pool, e.g. concurrency 2 by default.
- Writes are more conservative, e.g. per chapter sequential, or small parallelism per verse.

## State tracking
Keep a local state file in AI_THOUGHTS as an audit trail, but do not rely on it as authority.
Authority is the actual social comments already present by translation alias at each verseSection.

State file records:
- runId
- source book/chapter/post/series/heichel
- sourceHash per verse
- status: discovered, skipped_existing, translated, write_attempted, written_verified, failed
- Minimax usage if returned
- comment IDs written

## Existing comment read/write API shape
Write:
POST /api/social/heichelos/:heichel/post/:post/comments/
body: aliasId, seriesId, content, dayuh JSON containing verseSection and metadata.

Read existing translation comments:
GET /api/social/heichelos/:heichel/comments/inSeries/:series/atPost/:post/atAlias/:alias?verseSection=:verseSection

## First implementation approach
Use direct DosDB discovery for the corpus because the exact series names may vary. Use HTTP only for comment writes/readbacks if possible.
If discovery cannot locate the books, produce a diagnostic list of likely Torah/Genesis/Tehillim series and stop before translating.

## Divine name policy
- יהוה -> Awtsmoos
- אלהים -> Elokim
- אל -> El
- אל שדי -> El-Shaddai
- שדי -> Shaddai
- צבאות -> Tzevaos
- אדני -> Adonai, unless the source context clearly marks the Four-Letter Name, which remains Awtsmoos.

## Minimax prompt
Send one chapter at a time:
- book name
- chapter number
- ordered list of verseSection + Hebrew text
- JSON-only output schema
- exact divine name policy
- no commentary
- preserve verseSection IDs exactly

## Safety
Begin with `--dry-run --limit-books Genesis,Tehillim --limit-chapters=5`.
Only use `--write` after schema validation and a preview confirms correct targets.

The Awtsmoos in this plan is a translation river: two streams, Genesis and Tehillim, flowing together, each verse receiving an English lamp as a comment, never scratching the Hebrew stone beneath it.
