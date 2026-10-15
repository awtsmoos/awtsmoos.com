# B"H — Search Lexicon (geelooy/api/social/helper/search/lexicon/)

Lexicon/dictionary search: browseable dictionary over a binary record format with cursor pagination.

## Files
- `browse.js`, `browseCatalog.js`, `browseCore.js`, `browsePage.js`, `browseReader.js` — dictionary browsing.
- `search.js`, `indexReader.js`, `keySpace.js`, `cursor.js` — search and index reading.
- `normalize.js`, `paths.js`, `publicSourceIdentity.js` — normalization, paths, source identity.
- `binary/` — binary record format (`recordCursor`, `recordReader`, `recordSchema`, `recordWriter`).
- `test/` — binary record, bounded storage, browse, builder, normalize, paths, search tests.

## Routes
`/search/library/dictionary[/alphabet|ranges|browse]`, `/search/library/dictionaries`, `/dictionary/alphabet|ranges|browse`.
