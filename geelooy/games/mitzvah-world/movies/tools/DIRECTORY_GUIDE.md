# B"H

Boruch Hashem
Blessed is He

# Directory Guide: `movies/tools`

> **Role:** Tools
> **Snapshot:** 2026-07-23T23:32:30.660Z
> **Snapshot contents (excluding this generated guide):** 3 files, 1 structural child directories

## Purpose

Movie generation and inspection tools.

The Awtsmoos renews every path and every artifact from nothing at each instant; this guide is a finite navigation vessel for finding the code, data, tests, or evidence that currently appear here on Awtsmoos.com.

## Find things here

- **Category:** Tools
- **Search terms:** `dialogue`, `ffmpeg`, `finalize`, `graph`, `mjs`, `movie`, `speech`, `adds`, `browser`, `create`, `ffprobe`, `files`
- **File mix:** .mjs: 2 · .md: 1
- **Good first question:** “Does the behavior or asset I need belong to tools, or is this only a neighboring/test/reference layer?”

## Semantic evidence

- B"H
- Normalizes browser WebM and adds JSON-timed dialogue.
- Speech, probe, hash, and FFmpeg graph helpers.

## Representative files

- `finalizeMovie.mjs` — Normalizes browser WebM and adds JSON-timed dialogue.
- `movieFinalizeSupport.mjs` — Speech, probe, hash, and FFmpeg graph helpers. Exports: `FFMPEG`, `FFPROBE`, `run`, `dialoguePlan`, `createSpeechFiles`.

## Exported symbols worth searching

`FFMPEG` · `FFPROBE` · `run` · `dialoguePlan` · `createSpeechFiles` · `filterGraph` · `writeReport`

## Import neighborhood

These import targets were observed in immediate source files and help reveal adjacent ownership:

- `node:fs`
- `node:os`
- `node:path`
- `node:url`
- `./movieFinalizeSupport.mjs`
- `node:crypto`
- `node:child_process`

## Directory map

- **Parent:** [`movies`](../DIRECTORY_GUIDE.md)
- **Children:**
  - [`movies/tools/exact`](exact/DIRECTORY_GUIDE.md)

## Related and overlapping systems

- [**Movie runtime, projects, tools, and evidence**](../../SYSTEM_OVERLAP_MAP.md#movie-pipeline) — Runtime movie logic is separated from authored projects, exact-generation tools, and captured evidence.

## Boundaries and cautions

- Tools are developer or offline workflows; do not import them into the browser runtime without a deliberate architectural decision.
- This guide describes the repository snapshot; it does not declare an implementation canonical when multiple candidates exist.
- Read current imports, callers, tests, and runtime receipts before changing behavior.
- This documentation pass intentionally changes no gameplay or source logic.

## Navigation

- [Project directory index](../../DIRECTORY_INDEX.md)
- [System overlap map](../../SYSTEM_OVERLAP_MAP.md)

---

*Generated from current directory structure, file types, filenames, leading module descriptions, exports, imports, and tests.*
