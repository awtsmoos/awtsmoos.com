B'H
# Plan: Fix /packed/keys Timeout

## Finding
After fixing snapshot and integrity, realServerWrites reaches GET /api/social/packed/keys?shard=core&prefix=/posts and hangs. packedReader.js calls listPackedRecords, parsing the entire core shard, then applies prefix/limit.

## Fix
Rewrite packedReader.js:
- readPackedKey stays latest-record based
- listPackedKeys streams JSONL files line by line in bounded chunks
- parse only enough lines to collect limit unique keys
- no full core shard replay for route key listing

## Verification
- node --check packedReader.js
- direct packed keys route in realServerWrites should move past previous hang

Chapter 12: The Gatekeeper Stopped Reading The Whole Library To Find The First Shelf
A key list asked for two hundred names. The gatekeeper opened every scroll in the empire. The Awtsmoos said: stop when the cup is full.
