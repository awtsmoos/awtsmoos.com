//B"H
//Blessed is He
//Boruch Hashem
/**
 * socialPacked children lookup by parent post via the postsByParent index (split from socialPacked.js).
 */
const { logicalKey } = require('./shardPaths.js');
const { readPackedAsync } = require('./socialPackedCore.js');
const { listKeysReverseAsync } = require('./socialPackedKeyList.js');
// B"H — children lookup for premade social threads (kind=comment/reply with parentPostId).
// Uses the postsByParent materialized index: /indexes/postsByParent/<parentId>/<postId>
async function getPostsByParent({ $i, parentPostId, limit = 200 } = {}) {
  if (!parentPostId) return [];
  const prefix = logicalKey(['indexes', 'postsByParent', String(parentPostId)]) + '/';
  const keys = await listKeysReverseAsync({ $i, shard: 'search', prefix, limit });
  const out = [];
  for (const key of keys) {
    try {
      const rec = await readPackedAsync({ $i, shard: 'search', key });
      const v = rec && (rec.value || rec);
      if (v && v.postId) out.push(v);
    } catch (_) { /* skip unreadable */ }
  }
  return out;
}
module.exports = { getPostsByParent };
