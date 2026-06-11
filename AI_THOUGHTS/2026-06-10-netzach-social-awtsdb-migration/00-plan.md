B"H

# Netzach Social AwtsDB Migration Plan

## Chapter 1: The two rivers
The old social heichel at `C:\Users\Yackov Yitzchak\Documents\WoW\dayuhChadash\social\heichelos\ikar` still exists and has `series/`, `comments/`, `commentsm/`, `info.awtsmoosJSON`, and `editors.awtsmoosJSON`.
The new application root is `C:\Users\Yackov Yitzchak\Documents\WoW\BH\awtsmoos.com` and its current packed social writer already knows about `social.core.awtsdb`, `social.allPosts.awtsdb`, and metadata shards.

## Actual inspected weaknesses
1. `geelooy/api/social/helper/packed/postMigration.js` can scan connected legacy posts, but the HTTP route defaults to `seriesId: root`, so a broad migration call can miss non-root series.
2. `geelooy/api/social/helper/post/index.js` reads the old DosDB series object only; migrated AwtsmoosDB records are not merged back into normal post API reads.
3. Current migration is additive and safe, but API read behavior is not yet fully dual-source.

## Implementation moves
1. Add a small packed post bridge module that can read one packed post, list packed posts for a heichel/series, and merge old plus packed posts without deleting either source.
2. Rewrite the posts route module completely so every GET path for posts uses the bridge:
   - list IDs: old IDs + packed IDs
   - details: old post objects + packed post objects, packed filling what old lacks
   - single post: old first, packed fallback
   - filter: old filter + packed filter
3. Rewrite the packed route module completely so dry-run and run can migrate all series when `seriesId` is omitted or `ALL`.
4. Add tests proving:
   - migration scans root and non-root when no seriesId is supplied
   - normal post route read sees packed-only records and old records together
   - packed fallback can return a single migrated post

## Verification moves
Run:
- `node geelooy/api/social/helper/test/postMigration.test.js`
- new bridge/route test
- `npm run test:social-packed` if focused tests pass

The Awtsmoos in the code: not metaphor as excuse, but discipline: old and new are not enemies. The old river remains; the new vessel receives; the API becomes the bridge where both waters can be drunk safely.
