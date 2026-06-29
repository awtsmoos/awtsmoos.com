//B"H
/** Platform persistence helpers built directly on AwtsmoosDB native shards. */
const { put: dbPut, get: dbGet, list: dbList, key: logicalKey } = require('../awtsmoosDb/shardStore.js');
function put({ shard = 'events', parts, value, meta = {} }) {
  const record = dbPut({ shard, parts, value: { ...value, updatedAt: value.updatedAt || Date.now() }, meta });
  return { key: record.key, value: record.value };
}
function get({ shard = 'events', parts }) {
  return dbGet({ shard, parts });
}
function list({ shard = 'events', predicate = () => true }) {
  return dbList({ shard, predicate });
}
module.exports = { put, get, list, logicalKey };
