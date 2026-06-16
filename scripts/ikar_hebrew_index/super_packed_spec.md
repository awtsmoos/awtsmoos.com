B"H

# Ikar Hebrew Super-Packed Index v1

This is a new experimental format. It does **not** replace the existing builder.

## Problem with the old temp shards

Old token shards repeated objects like:

```json
{ "token": "...", "ref": { "seriesId": "...", "postId": "...", "segmentPath": "...", "hebrewPreview": "..." } }
```

That repeats post/title/path/preview thousands or millions of times.

## New shape

Output directory:

```text
searchPacked/ikar.hebrew.superpacked.awtsidx/
```

Files:

```text
meta.json
series.dict.json
posts.dict.json
paths.dict.json
tokens.dict.json
segments.rows.bin
postings.bin
postings.index.json
```

## Dictionaries

Strings are stored once:

- `series.dict.json`: index -> seriesId
- `posts.dict.json`: index -> postId
- `paths.dict.json`: index -> segmentPath
- `tokens.dict.json`: index -> token

## Segment rows

`segments.rows.bin` is a varint stream of fixed-width rows:

```text
segmentId, seriesIndex, postIndex, pathIndex, categoryIndex, verseNumber
```

No Hebrew text. No token arrays. No previews.

## Postings

`postings.index.json` maps tokenIndex to byte offset/length/count inside `postings.bin`.
Each posting list is sorted segment IDs encoded as delta-varints.

Example concept:

```text
token "שלום" -> [17, 31, 9000]
encoded as deltas [17, 14, 8969]
```

## Retrieval

1. Find token in `tokens.dict.json`.
2. Read byte slice from `postings.bin` using `postings.index.json`.
3. Delta-decode segment IDs.
4. Look up segment rows.
5. Resolve series/post/path via dictionaries.
6. Fetch actual post content from source DB only when displaying result.

## Why this is smaller

It stores references, not content. Actual Hebrew content remains in the original post DB/files.
The index only knows where a match lives.
