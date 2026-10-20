//B"H
//Blessed is He
//Boruch Hashem
/**
 * socialPacked batched packed-mirror write for imports (split from socialPacked.js).
 */
const fs = require('fs');
const path = require('path');
const { engineFor, fileRoot, fileFor, envelope } = require('./socialPackedEngine.js');
const { writePacked } = require('./socialPackedCore.js');
const { mirrorPostRecords, mirrorPostBulk } = require('./socialPackedMirrorBulk.js');
/**
 * B"H 2026-10-11 (import-speed): batched packed-mirror write. Builds the
 * exact envelopes mirrorPostBulk would write and appends ONE chunk per
 * shard file — 4 appends per batch instead of 6 per post. File bytes are
 * identical to the per-post path (same JSONL lines, same per-shard order);
 * the append-only "last record wins" read contract is unchanged. Falls
 * back to per-post writes when there is no file root (native-shard mode).
 */
function mirrorPostsBulk({ $i, posts }) {
  const list = Array.isArray(posts) ? posts : [];
  const root = fileRoot($i);
  if (!root) {
    for (const post of list) mirrorPostBulk({ $i, post });
    return list.length;
  }
  const byShard = new Map();
  const dbRecords = [];
  for (const post of list) {
    for (const r of mirrorPostRecords({ $i, post })) {
      // B"H 2026-10-20 (json-migration M0): a shard flipped to AwtsmoosDB
      // bypasses the batched file append and writes through writePacked,
      // so a mixed-engine batch can never land DB records in a JSONL file.
      if (engineFor($i, r.shard) !== 'JSONL') { dbRecords.push(r); continue; }
      let lines = byShard.get(r.shard);
      if (!lines) { lines = []; byShard.set(r.shard, lines); }
      lines.push(JSON.stringify(envelope({ op: 'put', key: r.key, value: r.value, meta: r.meta })) + '\n');
    }
  }
  for (const [shard, lines] of byShard) {
    const file = fileFor(root, shard);
    if (!file) continue;
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.appendFileSync(file, lines.join(''));
  }
  for (const r of dbRecords) writePacked({ $i, shard: r.shard, key: r.key, value: r.value, meta: r.meta });
  // B"H 2026-10-20 (flap-fix): read caches are NOT deleted here either -
  // stat validation + tail merge in listPackedRecords keeps reads fresh
  // without a full re-parse after every batched write (see mirrorPostBulk).
  try {
    const allPostsIndex = require('./allPostsIndex.js');
    if (allPostsIndex.clearGroupedCache) allPostsIndex.clearGroupedCache();
  } catch (_) {}
  return list.length;
}
module.exports = { mirrorPostsBulk };
