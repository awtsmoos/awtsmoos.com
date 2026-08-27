//B"H
/**
 * @module SocialPackedRoutes
 * @description
 * Chapter 3: The migration gate stopped mistaking one root for the whole tree.
 *
 * The Awtsmoos constantly recreates leaf, branch, trunk, and invisible sap.
 * A migration that only sees `root` is a lantern pointed at one stone while
 * the mountain waits in silence. These routes now treat omitted or `ALL`
 * series ids as every series, while still allowing a precise single-series run.
 */

const { allShardStats } = require('./helper/packed/socialPacked.js');
const { exportPackedSnapshot } = require('./helper/packed/snapshot.js');
const { scanPackedIntegrity, repairMissingPostManifests } = require('./helper/packed/repairScanner.js');
const { dryRunPostMigration, runPostMigration } = require('./helper/packed/postMigration.js');
const { er } = require('./helper/general.js');
const { readPackedKey, listPackedKeys } = require('./helper/packed/packedReader.js');
const { compactShard, compactAllShards } = require('./helper/packed/compactor.js');
const { materializeHeichelFeed, materializeAliasFeed } = require('./helper/packed/feedMaterializer.js');

/**
 * @description Only GET may enter a read-only chamber.
 * @param {object} $i Request context.
 * @returns {object|null} Error or null.
 */
function requireGet($i) {
  return $i.request.method === 'GET' ? null : er({ code: 'BAD_METHOD', message: 'Use GET.' });
}

/**
 * @description Only POST may enter a mutating chamber.
 * @param {object} $i Request context.
 * @returns {object|null} Error or null.
 */
function requirePost($i) {
  return $i.request.method === 'POST' ? null : er({ code: 'BAD_METHOD', message: 'Use POST.' });
}

/**
 * @description Reads from body first, then query, like water choosing the
 * closest channel in the hewn stone of the request.
 * @param {object} $i Request context.
 * @param {string} key Field name.
 * @param {*} fallback Fallback value.
 * @returns {*} Parameter value.
 */
function param($i, key, fallback = '') {
  return $i.$_POST?.[key] ?? $i.$_GET?.[key] ?? fallback;
}

/**
 * @description Converts omitted, blank, or ALL series ids into broad migration.
 * @param {string} value Raw value.
 * @returns {string} Empty string for all series, otherwise one series id.
 */
function migrationSeries(value) {
  const text = String(value || '').trim();
  return !text || text === 'ALL' || text === '*' ? '' : text;
}

/**
 * @description Converts a limit param into a safe positive integer.
 * @param {*} value Raw value.
 * @param {number} fallback Fallback limit.
 * @returns {number} Limit.
 */
function limitValue(value, fallback = 100) {
  const parsed = Number(value || fallback);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

module.exports = ({ $i } = {}) => ({
  '/packed/stats': async () => {
    const bad = requireGet($i);
    return bad || { success: allShardStats({ $i }) };
  },

  '/packed/snapshot': async () => {
    const bad = requireGet($i);
    return bad || { success: exportPackedSnapshot({ $i }) };
  },

  '/packed/integrity': async () => {
    const bad = requireGet($i);
    return bad || { success: scanPackedIntegrity({ $i }) };
  },

  '/packed/repair/posts/manifests': async () => {
    const bad = requirePost($i);
    return bad || { success: repairMissingPostManifests({ $i, limit: limitValue(param($i, 'limit'), 100) }) };
  },

  '/packed/read': async () => {
    const bad = requireGet($i);
    return bad || readPackedKey({ $i, shard: param($i, 'shard', 'core'), key: param($i, 'key') });
  },

  '/packed/keys': async () => {
    const bad = requireGet($i);
    return bad || listPackedKeys({ $i, shard: param($i, 'shard', 'core'), prefix: param($i, 'prefix'), limit: limitValue(param($i, 'limit'), 200) });
  },

  '/packed/compact': async () => {
    const bad = requirePost($i);
    if (bad) return bad;
    const shard = param($i, 'shard');
    return { success: shard ? compactShard({ $i, shard }) : compactAllShards({ $i }) };
  },

  '/packed/feed/materialize': async () => {
    const bad = requirePost($i);
    if (bad) return bad;
    const aliasId = param($i, 'aliasId');
    return {
      success: {
        heichelFeed: materializeHeichelFeed({ $i, heichelId: param($i, 'heichelId'), limit: limitValue(param($i, 'limit'), 100) }),
        aliasFeed: aliasId ? materializeAliasFeed({ $i, aliasId, limit: limitValue(param($i, 'limit'), 100) }) : null
      }
    };
  },

  '/packed/migrations/posts/v2/dryRun': async () => {
    const bad = requireGet($i);
    return bad || {
      success: await dryRunPostMigration({
        $i,
        heichelId: param($i, 'heichelId'),
        seriesId: migrationSeries(param($i, 'seriesId'))
      })
    };
  },

  '/packed/migrations/posts/v2/run': async () => {
    const bad = requirePost($i);
    return bad || {
      success: await runPostMigration({
        $i,
        heichelId: param($i, 'heichelId'),
        seriesId: migrationSeries(param($i, 'seriesId')),
        limit: limitValue(param($i, 'limit'), 100)
      })
    };
  }
});
