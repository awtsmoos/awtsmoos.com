// B"H
const Registry = require('../../../lib/virtualOsGraph/registry.js');
const Sample = require('../../../lib/virtualOsGraph/sample.js');
const graphs = new Map();
function graphId(payload = {}) { return payload.graphId || 'default'; }
function graph(id = 'default') { if (!graphs.has(id)) graphs.set(id, Sample.sample()); return graphs.get(id); }
function current(payload = {}) { return graph(graphId(payload)); }
function objectPayload(payload = {}) { return payload.object || payload.node || payload; }
function operations(payload = {}) { return payload.operations || payload.ops || []; }
function buildVirtualOsGraphActions(ctx) {
  const { payload = {} } = ctx;
  return {
    async virtualOsGraphSample() { return { ok:true, action:'virtualOsGraphSample', graph:Sample.sample().snapshot() }; },
    async virtualOsGraphStatus() { return { ok:true, action:'virtualOsGraphStatus', graphs:[...graphs.keys()], current:current(payload).snapshot() }; },
    async virtualOsGraphUpsert() { const g = current(payload); return { ok:true, action:'virtualOsGraphUpsert', object:g.upsert(objectPayload(payload)), graph:g.snapshot() }; },
    async virtualOsGraphGet() { return { ok:true, action:'virtualOsGraphGet', object:current(payload).get(payload.id) }; },
    async virtualOsGraphSearch() { return { ok:true, action:'virtualOsGraphSearch', results:current(payload).search(payload.query || payload.q || '') }; },
    async virtualOsGraphReset() { graphs.set(graphId(payload), Registry.create()); return { ok:true, action:'virtualOsGraphReset', graph:current(payload).snapshot() }; },
    async virtualOsGraphDelete() { const g = current(payload); return { ok:true, action:'virtualOsGraphDelete', deleted:g.remove(payload.id), graph:g.snapshot() }; },
    async virtualOsGraphHistory() { return { ok:true, action:'virtualOsGraphHistory', events:current(payload).history({ id:payload.id, type:payload.type, limit:payload.limit }) }; },
    async virtualOsGraphReferences() { return { ok:true, action:'virtualOsGraphReferences', id:payload.id, references:current(payload).references(payload.id) }; },
    async virtualOsGraphDiff() { return { ok:true, action:'virtualOsGraphDiff', diff:current(payload).diff(payload.graph || payload.compare || payload.objects || payload.object || {}) }; },
    async virtualOsGraphTraverse() { return { ok:true, action:'virtualOsGraphTraverse', traversal:current(payload).traverse(payload) }; },
    async virtualOsGraphPathLookup() { return { ok:true, action:'virtualOsGraphPathLookup', object:current(payload).pathLookup(payload.path || payload.url || payload.id || payload.title || payload.query || '') }; },
    async virtualOsGraphTransaction() { const result = current(payload).transaction(operations(payload)); return { action:'virtualOsGraphTransaction', ...result }; }
  };
}
/**
 * B"H
 * These actions are the public gates of the server mirror. Nothing hides in a
 * private chamber: search, delete, history, refs, diffs, traversals, path
 * lookup, and transactions all answer through the same object graph altar.
 */
module.exports = { buildVirtualOsGraphActions };
