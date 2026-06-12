B"H

# Concrete Parallel Torah Translation Plan

## Real corpus discovered
- Heichel: `ikar`
- Genesis series: `bereishis`
- Tehillim series: `tehillim`
- Parent series: `theWrittenTorah`
- Posts are stored directly in `/social/heichelos/ikar/series/:series/posts`
- Each post is a chapter object with `title: "Chapter N"` and `dayuh.sections` array.
- Each `dayuh.sections[index]` is a Hebrew verse string.

## Verse section mapping
For now the automation maps:
- `dayuh.sections[0]` -> `verse-1`
- `dayuh.sections[1]` -> `verse-2`
- etc.

This matches the current comment API convention used in stress tests.

## Script to write
`AI_THOUGHTS/2026-06-12_social_system_stress_certification/torah_translation_comments/parallel_minimax_torah_translation_comments.mjs`

## Runtime modes
- Default dry-run if no `--write`.
- `--write` creates real comments.
- `--books=bereishis,tehillim` default.
- `--chapters=5` default.
- `--parallel=2` default Minimax chapter concurrency.
- `--force` retranslates even if existing matching hash exists.

## State files
- `parallel_translation_state.json` stores run audit and per-verse results.
- `parallel_translation_latest.log` stores human-readable progress.

## Authority for resume
The authority is not the state file. The script reads existing translation alias comments from DosDB:
`/social/heichelos/ikar/comments/atSeries/:series/atPost/:postId/torah_translation_en`

It scans the verse array for comments whose `dayuh.translation === true`, `dayuh.language === "en"`, `dayuh.source === "minimax"`, and `dayuh.sourceHash` equals current sourceHash.

## Minimax call
Use existing working path:
- `loadConfig()` from tunnel agent config
- `sendAgentMessage(config, { provider:'minimax', agentId:'minimax-deep', stream:false, message })`

## Write path
Start local server on port 8080 and seed API key using the API key helper. Ensure alias `torah_translation_en` exists by POSTing `/api/social/aliases`.

For each verse translation, write comment:
`POST /api/social/heichelos/ikar/post/:postId/comments/`

Body:
- aliasId: `torah_translation_en`
- seriesId: `bereishis` or `tehillim`
- content: English translation
- dayuh: JSON metadata with verseSection, sourceHash, book, chapter, source etc.

Then read back from DosDB or HTTP route and verify comment exists.

## Parallelism
The script processes chapter jobs concurrently. Each job translates one chapter through one Minimax call. Writes inside a chapter are sequential to avoid comment write contention.

## Safety
- No Hebrew post edits.
- No packed comment writing.
- Existing matching translations are skipped.
- JSON from Minimax is parsed and validated before any write.
- Write mode is explicit.

Chapter 109: Two books open at once, Bereishis and Tehillim, and the Awtsmoos does not rush the ink. The Hebrew remains the mountain; the English arrives as lamps beside each verse.
