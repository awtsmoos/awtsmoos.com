//B"H
/** Graph transaction batches with journaled all-or-none validation. */
const { put, list } = require('./platformStore.js');
const { mirrorGraphReference } = require('../packed/socialPacked.js');
const { addGraphReference } = require('../socialGraph.js');
function validateEdge(edge) {
  if (!edge || !edge.from || !edge.to || !edge.from.type || !edge.from.id || !edge.to.type || !edge.to.id) return 'BAD_EDGE_ENTITY';
  if (!edge.kind) return 'BAD_EDGE_KIND';
  return null;
}
async function runGraphTransaction({ $i, edges = [], actor = '' }) {
  const id = `gtx_${Date.now()}_${Math.random().toString(36).slice(2)}`;
  const failures = edges.map((edge, index) => ({ index, code: validateEdge(edge) })).filter(item => item.code);
  if (failures.length) {
    const failed = { id, actor, status: 'rejected', failures, edges, createdAt: Date.now() };
    put({ $i, shard:'audit', parts:['graphTransactions', id], value: failed, meta:{kind:'graphTransaction', status:'rejected'} });
    return { error: { code: 'GRAPH_TRANSACTION_REJECTED', failures, id } };
  }
  const written = [];
  for (const edge of edges) {
    const ref = await addGraphReference({ $i, kind: edge.kind, from: edge.from, to: edge.to, aliasId: actor || edge.aliasId, excerpt: edge.excerpt || '', note: edge.note || '' });
    if (ref.success) written.push(ref.success);
  }
  const journal = { id, actor, status: 'committed', edges: written.map(edge => edge.id), count: written.length, createdAt: Date.now() };
  put({ $i, shard:'audit', parts:['graphTransactions', id], value: journal, meta:{kind:'graphTransaction', status:'committed'} });
  return { success: journal };
}
function listGraphTransactions({ $i }) { return { success: list({ $i, shard:'audit', predicate:r=>r.meta?.kind==='graphTransaction' }).map(r=>r.value) }; }
module.exports = { runGraphTransaction, listGraphTransactions, validateEdge };
