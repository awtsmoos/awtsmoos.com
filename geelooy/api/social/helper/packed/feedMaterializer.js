//B"H
/**
 * @module feedMaterializer
 * @description Materializes simple packed feeds from post/index records.
 */

const { logicalKey } = require('./shardPaths.js');
const { listPackedRecords, writePacked } = require('./socialPacked.js');

function materializeHeichelFeed({ $i, heichelId, limit = 100 }) {
  const posts = listPackedRecords({ $i, shard: 'search' })
    .filter(record => record.meta?.index === 'postsByHeichel')
    .map(record => record.value)
    .filter(value => !heichelId || value.heichelId === heichelId)
    .sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0))
    .slice(0, limit);
  const key = logicalKey(['feed', 'heichel', heichelId || 'all']);
  const feed = { kind: 'heichelFeed', heichelId: heichelId || 'all', items: posts, materializedAt: Date.now() };
  writePacked({ $i, shard: 'feed', key, value: feed, meta: { kind: 'feed', feedType: 'heichel' } });
  return feed;
}

function materializeAliasFeed({ $i, aliasId, limit = 100 }) {
  const posts = listPackedRecords({ $i, shard: 'search' })
    .filter(record => record.meta?.index === 'postsByAlias')
    .map(record => record.value)
    .filter(value => !aliasId || value.aliasId === aliasId)
    .sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0))
    .slice(0, limit);
  const key = logicalKey(['feed', 'alias', aliasId || 'all']);
  const feed = { kind: 'aliasFeed', aliasId: aliasId || 'all', items: posts, materializedAt: Date.now() };
  writePacked({ $i, shard: 'feed', key, value: feed, meta: { kind: 'feed', feedType: 'alias' } });
  return feed;
}

module.exports = { materializeHeichelFeed, materializeAliasFeed };
