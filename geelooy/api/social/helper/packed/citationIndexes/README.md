# Citation indexes — reader "Connections" data

B"H

This directory holds the reverse/forward citation indexes that power
`GET /api/social/packed/connections` (the reader "Connections" section).

## Format

- `forward_<name>.json`: `{ BH, files, postsWithCitations, forward: { postId: [{key, para, raw, kind}] } }`
  — citations each post makes (outgoing).
- `reverse_<name>.json`: `{ BH, uniqueKeys, index: { citationKey: [{post, para, raw}] } }`
  — posts citing each reference key (incoming).

## Adding new indexes

Drop in another `reverse_<name>.json` / `forward_<name>.json` pair (same
shape) and commit. The server loader (`../connectionsIndex.js`) scans this
directory on every request and rebuilds its in-memory cache whenever file
mtimes/sizes change — **no restart or deploy of code is needed** for new
data, only the data commit itself.

Files that fail to parse (e.g. still being written) are skipped and retried
on the next scan instead of failing the endpoint.

## Matching (incoming)

`../connectionsMatch.js` attributes reverse keys to posts with a
precision-first heuristic: sefer-kind keys only, standalone sefer-name
match, explicit chapter/siman number markers, plus parsha (Likkutei Torah)
or section (halachah) scoping. See that module's docblock for the full
rules and honest limitations.

## Snapshot note

Files here are a point-in-time copy of `~/workspace/citation-audit/`
(snapshotted 2026-10-13 ~02:00 EDT). Sibling index builders: prefer adding
new `reverse_*`/`forward_*` files over editing these in place.
