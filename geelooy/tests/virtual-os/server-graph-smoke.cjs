// B"H
const { create } = require('../../apps/tunnel/agent/lib/virtualOsGraph/registry.js');

const graph = create();
const watcher = graph.subscribe({ id:'watch:server-test', filter:{ objectType:'preview' } });

graph.upsert({ id:'preview:server-test', type:'preview' });
graph.upsert({ id:'process:noise', type:'process' });

const drained = graph.drain(watcher.id);
assert(drained.events.length === 1, 'server watcher should receive exactly one event');
assert(drained.events[0].data.id === 'preview:server-test', 'server watcher should receive preview event');

const failed = graph.transaction([
  { op:'upsert', object:{ id:'preview:rollback', type:'preview' } },
  { op:'unsupported' }
]);
assert(!failed.ok, 'server transaction should fail');
assert(!graph.get('preview:rollback'), 'server rollback should remove object');
console.log('B"H server-graph-smoke passed');

function assert(condition, message) { if (!condition) throw new Error(message); }
