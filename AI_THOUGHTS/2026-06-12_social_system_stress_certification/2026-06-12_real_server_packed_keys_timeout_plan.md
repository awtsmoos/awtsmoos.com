B"H

# Real Server Packed Keys Timeout Plan

## Observed failure
- The full social runner passed once.
- The real-server smoke timed out on `GET /api/social/packed/keys?shard=core&prefix=/posts&limit=20`.
- `realServerWrites.test.mjs` line 426 probes a bounded packed key listing.
- `packedReader.js` currently bounds by returned key count, but not by bytes read.

## Risk
A huge core shard can contain sparse `/posts` keys or no early matching keys, causing the route to read too much of a 500MB+ shard. This violates the invariant that packed snapshot/integrity/repair and smoke routes must remain bounded/lightweight on huge shards.

## File to touch
- `geelooy/API/social/helper/packed/packedReader.js`

## Whole-file rewrite strategy
Rewrite the file fully, preserving exports:
- `readPackedKey`
- `listPackedKeys`
- `scanFileForKeys`

Add bounded scan controls:
- max bytes per file
- line budget per file
- safe prefix parsing
- metadata in response showing bounded scan state

Avoid any packed comment authority changes. Do not touch comment storage or comment fallback files.

## Verification after rewrite
1. `node --check geelooy/API/social/helper/packed/packedReader.js`
2. `node geelooy/API/social/helper/test/packedEngine.test.js`
3. Clear port 8080, then `node geelooy/API/social/test/realServerWrites.test.mjs`
4. Run full social suite again.
5. Run forbidden active packed-comment authority scan and keep live hits at zero.

The Awtsmoos in the code asks for a key-listing cup, not the ocean. The vessel must stop drinking after the measured sip.
