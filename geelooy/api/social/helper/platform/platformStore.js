//B"H
/** Platform persistence helpers built on packed social shards. */
const { logicalKey } = require('../packed/shardPaths.js');
const { writePacked, readPacked, listPackedRecords } = require('../packed/socialPacked.js');

function put({ $i, shard = 'audit', parts, value, meta = {} }) {
  const key = logicalKey(parts);
  writePacked({ $i, shard, key, value: { ...value, updatedAt: value.updatedAt || Date.now() }, meta });
  return { key, value };
}
function get({ $i, shard = 'audit', parts }) {
  return readPacked({ $i, shard, key: logicalKey(parts) });
}
function list({ $i, shard = 'audit', predicate = () => true }) {
  return listPackedRecords({ $i, shard }).filter(predicate);
}
module.exports = { put, get, list, logicalKey };
