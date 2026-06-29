// B"H
const { create } = require('../../apps/tunnel/agent/lib/virtualOsGraph/registry.js');

const graph = create();
const watcher = graph.subscribe({ id:'watch:server-test', filter:{ objectType:'preview' } });

graph.upsert({ id:'preview:server-test', type:'preview' });
graph.upsert({ id:'process:noise', type:'process' });
graph.upsert({ id:'feed:server-home', type:'feed', title:'Server Home Feed' });
graph.upsert({ id:'event:server-home', type:'event', title:'Server Home Event', parentId:'feed:server-home' });

const drained = graph.drain(watcher.id);
assert(drained.events.length === 1, 'server watcher should receive exactly one event');
assert(drained.events[0].data.id === 'preview:server-test', 'server watcher should receive preview event');
assert(graph.get('event:server-home').type === 'event', 'server graph should keep social event type');
assert(graph.indexes().byParent['feed:server-home'][0] === 'event:server-home', 'server graph should index social children');

const failed = graph.transaction([
  { op:'upsert', object:{ id:'preview:rollback', type:'preview' } },
  { op:'unsupported' }
]);
assert(!failed.ok, 'server transaction should fail');
assert(!graph.get('preview:rollback'), 'server rollback should remove object');
console.log('B"H server-graph-smoke passed');

function assert(condition, message) { if (!condition) throw new Error(message); }
