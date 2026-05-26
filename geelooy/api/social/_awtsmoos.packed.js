//B"H
/**
 * Packed social sidecar routes: inspect shard stats and safely migrate legacy posts.
 */

const { allShardStats } = require('./helper/packed/socialPacked.js');
const { exportPackedSnapshot } = require('./helper/packed/snapshot.js');
const { scanPackedIntegrity, repairMissingPostManifests } = require('./helper/packed/repairScanner.js');
const {
  dryRunPostMigration,
  runPostMigration
} = require('./helper/packed/postMigration.js');
const { er } = require('./helper/general.js');
const { readPackedKey, listPackedKeys } = require('./helper/packed/packedReader.js');
const { compactShard, compactAllShards } = require('./helper/packed/compactor.js');
const { materializeHeichelFeed, materializeAliasFeed } = require('./helper/packed/feedMaterializer.js');

module.exports = ({ $i } = {}) => ({
  "/packed/stats": async () => {
    if ($i.request.method !== 'GET') return er({ code: 'BAD_METHOD', message: 'Use GET.' });
    return { success: allShardStats({ $i }) };
  },

  "/packed/snapshot": async () => {
    if ($i.request.method !== 'GET') return er({ code: 'BAD_METHOD', message: 'Use GET.' });
    return { success: exportPackedSnapshot({ $i }) };
  },

  "/packed/integrity": async () => {
    if ($i.request.method !== 'GET') return er({ code: 'BAD_METHOD', message: 'Use GET.' });
    return { success: scanPackedIntegrity({ $i }) };
  },

  "/packed/repair/posts/manifests": async () => {
    if ($i.request.method !== 'POST') return er({ code: 'BAD_METHOD', message: 'Use POST.' });
    return { success: repairMissingPostManifests({ $i, limit: Number($i.$_POST.limit || $i.$_GET.limit || 100) }) };
  },


  "/packed/read": async () => {
    if ($i.request.method !== 'GET') return er({ code: 'BAD_METHOD', message: 'Use GET.' });
    return readPackedKey({ $i, shard: $i.$_GET.shard || 'core', key: $i.$_GET.key });
  },

  "/packed/keys": async () => {
    if ($i.request.method !== 'GET') return er({ code: 'BAD_METHOD', message: 'Use GET.' });
    return listPackedKeys({ $i, shard: $i.$_GET.shard || 'core', prefix: $i.$_GET.prefix || '', limit: Number($i.$_GET.limit || 200) });
  },

  "/packed/compact": async () => {
    if ($i.request.method !== 'POST') return er({ code: 'BAD_METHOD', message: 'Use POST.' });
    return { success: $i.$_POST.shard || $i.$_GET.shard ? compactShard({ $i, shard: $i.$_POST.shard || $i.$_GET.shard }) : compactAllShards({ $i }) };
  },

  "/packed/feed/materialize": async () => {
    if ($i.request.method !== 'POST') return er({ code: 'BAD_METHOD', message: 'Use POST.' });
    const heichelFeed = materializeHeichelFeed({ $i, heichelId: $i.$_POST.heichelId || $i.$_GET.heichelId || '', limit: Number($i.$_POST.limit || $i.$_GET.limit || 100) });
    const aliasFeed = $i.$_POST.aliasId || $i.$_GET.aliasId ? materializeAliasFeed({ $i, aliasId: $i.$_POST.aliasId || $i.$_GET.aliasId, limit: Number($i.$_POST.limit || $i.$_GET.limit || 100) }) : null;
    return { success: { heichelFeed, aliasFeed } };
  },
  "/packed/migrations/posts/v2/dryRun": async () => {
    if ($i.request.method !== 'GET') return er({ code: 'BAD_METHOD', message: 'Use GET.' });
    return {
      success: await dryRunPostMigration({
        $i,
        heichelId: $i.$_GET.heichelId,
        seriesId: $i.$_GET.seriesId || 'root'
      })
    };
  },

  "/packed/migrations/posts/v2/run": async () => {
    if ($i.request.method !== 'POST') return er({ code: 'BAD_METHOD', message: 'Use POST.' });
    return {
      success: await runPostMigration({
        $i,
        heichelId: $i.$_POST.heichelId || $i.$_GET.heichelId,
        seriesId: $i.$_POST.seriesId || $i.$_GET.seriesId || 'root',
        limit: Number($i.$_POST.limit || $i.$_GET.limit || 100)
      })
    };
  }
});
