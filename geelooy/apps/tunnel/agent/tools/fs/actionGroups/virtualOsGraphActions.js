// B"H
const Registry = require('../../../lib/virtualOsGraph/registry.js');
const Sample = require('../../../lib/virtualOsGraph/sample.js');
const graphs = new Map();
function graphId(payload = {}) { return payload.graphId || 'default'; }
function graph(id = 'default') { if (!graphs.has(id)) graphs.set(id, Sample.sample()); return graphs.get(id); }
function current(payload = {}) { return graph(graphId(payload)); }
function objectPayload(payload = {}) { return payload.object || payload.node || payload; }
function operations(payload = {}) { return payload.operations || payload.ops || []; }
function watchPayload(payload = {}) { return payload.watcher || payload.watch || payload; }
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
    async virtualOsGraphTransaction() { const result = current(payload).transaction(operations(payload)); return { action:'virtualOsGraphTransaction', ...result }; },
    async virtualOsGraphSubscribe() { return { ok:true, action:'virtualOsGraphSubscribe', watcher:current(payload).subscribe(watchPayload(payload)) }; },
    async virtualOsGraphUnsubscribe() { return { ok:true, action:'virtualOsGraphUnsubscribe', watcher:current(payload).unsubscribe(payload.watcherId || payload.id) }; },
    async virtualOsGraphWatchers() { return { ok:true, action:'virtualOsGraphWatchers', watchers:current(payload).watchers() }; },
    async virtualOsGraphWatchPoll() { return { ok:true, action:'virtualOsGraphWatchPoll', result:current(payload).drain(payload.watcherId || payload.id, payload.limit) }; }
  };
}
/** B"H: public graph gates now include listeners, so the tunnel can hear change without inventing a second river. */
module.exports = { buildVirtualOsGraphActions };
