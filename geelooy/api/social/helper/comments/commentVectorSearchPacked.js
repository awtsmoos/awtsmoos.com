// B"H
/**
 * @file commentVectorSearchPacked.js
 * @description Chapter 632: compatibility name, AwtsmoosDB source. Lists comment
 * records from native shards for vector reindex/backfill.
 */
const { list } = require("../awtsmoosDb/shardStore.js");
function matchesComment(record, { heichelId, seriesId }) {
  return record.meta?.kind === "comment" && record.value && record.value.lifecycle !== "deleted" && record.meta?.heichelId === heichelId && (!seriesId || record.meta?.seriesId === seriesId);
}
function packedCommentRecords({ heichelId, seriesId }) {
  const latest = new Map();
  for (const record of list({ shard: "core", predicate: r => r.meta?.kind === "comment" })) if (record.key) latest.set(record.key, record);
  return [...latest.values()].filter(record => matchesComment(record, { heichelId, seriesId }));
}
module.exports = { packedCommentRecords };
