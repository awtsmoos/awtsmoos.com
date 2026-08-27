//B"H
/**
 * @module PlatformStore
 * @description Chapter 648: platform operations now preserve the caller's `$i`
 * vessel. Tests write JSONL temp shards, while production falls through to the
 * packed AwtsmoosDB bridge without opening an unrelated default path.
 */
const { logicalKey } = require('../packed/shardPaths.js');
const { writePacked, readPacked, listPackedRecords } = require('../packed/socialPacked.js');

function put({ $i, shard = 'events', parts = [], value, meta = {} }) {
  const next = { ...(value || {}), updatedAt: value?.updatedAt || Date.now() };
  const record = writePacked({ $i, shard, key: logicalKey(parts), value: next, meta });
  return { key: record.key, value: record.value, meta: record.meta };
}
function get({ $i, shard = 'events', parts = [] }) {
  return readPacked({ $i, shard, key: logicalKey(parts) });
}
function list({ $i, shard = 'events', predicate = () => true }) {
  return listPackedRecords({ $i, shard }).filter(predicate);
}
module.exports = { put, get, list, logicalKey };
