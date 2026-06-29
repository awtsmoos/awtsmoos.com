// B"H
import { makeObjectGraph } from '../../os/graph/registry.js';

const graph = makeObjectGraph();
const watcher = graph.subscribe({ id:'watch:browser-test', filter:{ objectType:'preview' } });

graph.upsert({ id:'preview:test', type:'preview', title:'Browser Test' });
graph.upsert({ id:'process:noise', type:'process', title:'Noise' });

const drained = graph.drain(watcher.id);
assert(drained.events.length === 1, 'preview watcher should receive exactly one event');
assert(drained.events[0].data.id === 'preview:test', 'watcher should receive preview:test');
assert(graph.snapshot().watchers.length === 1, 'snapshot should expose watcher summary');

const failed = graph.transaction([
  { op:'upsert', object:{ id:'preview:rollback', type:'preview' } },
  { op:'unsupported' }
]);
assert(!failed.ok, 'bad transaction should fail');
assert(!graph.get('preview:rollback'), 'failed transaction should roll object back');
assert(graph.unsubscribe(watcher.id), 'watcher should unsubscribe');
console.log('B"H graph-browser-smoke passed');

function assert(condition, message) { if (!condition) throw new Error(message); }
