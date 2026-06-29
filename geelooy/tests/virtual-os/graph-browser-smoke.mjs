// B"H
import { makeObjectGraph } from '../../os/graph/registry.js';
import { syncOsGraph } from '../../os/graph/osGraphSync.js';
import { routeInput } from '../../os/input/router.js';
import { ProcessManager } from '../../os/process/processManager.js';
import { bindWindowToProcess } from '../../os/process/windowBinding.js';

const graph = makeObjectGraph();
const opened = graph.emit('custom.opened', { id:'custom:one', type:'custom' });
assert(Number.isInteger(opened.seq) && opened.seq > 0, 'graph events should carry monotonic seq');

const watcher = graph.subscribe({ id:'watch:browser-test', filter:{ objectType:'preview' } });
graph.upsert({ id:'preview:test', type:'preview', title:'Browser Test' });
graph.upsert({ id:'process:noise', type:'process', title:'Noise' });
graph.upsert({ id:'feed:forYou', type:'feed', title:'For You Feed' });
graph.upsert({ id:'post:home-test', type:'post', title:'Home Post', parentId:'feed:forYou' });

const drained = graph.drain(watcher.id);
assert(drained.events.length === 1, 'preview watcher should receive exactly one event');
assert(drained.events[0].data.id === 'preview:test', 'watcher should receive preview:test');
assert(drained.events[0].seq > watcher.lastSeq, 'watcher event seq should advance beyond subscription point');
assert(drained.watcher.lastSeq === drained.events[0].seq, 'polling should advance watcher lastSeq');
assert(graph.search('Browser Test')[0].id === 'preview:test', 'ObjectGraph.search should delegate to query search');
assert(graph.get('post:home-test').type === 'post', 'browser graph should keep social post type');
assert(graph.snapshot().indexes.byParent['feed:forYou'][0] === 'post:home-test', 'feed should index social children');
assert(graph.snapshot().watchers.length === 1, 'snapshot should expose watcher summary');

const inputGraph = makeObjectGraph();
routeInput({ graph:inputGraph, windowHandler:{ windows:[] } }, { type:'click', data:{ x:1, y:2 } });
assert(inputGraph.history({ type:'input.routed' })[0].seq > 0, 'input routing should emit through graph pipeline');

const processManager = new ProcessManager(graph);
const proc = processManager.spawn({ pid:'process:test', app:'awtsmoosText', title:'Text Process' });
const win = { id:'window:test', title:'Bound Window', programId:'awtsmoosText', processId:proc.pid, win:{ style:{ display:'block' } } };
bindWindowToProcess(proc, win);
syncOsGraph({
  graph,
  vfs:{ mounts:() => [] },
  drives:{ list:() => [] },
  windowHandler:{ windows:[win] },
  processes:{ list:() => [proc] },
  display:{}, clipboard:{}, aiSession:{}
});
assert(graph.get('window:test').refs.includes('process:test'), 'window graph object should ref its process');
assert(graph.get('process:test').refs.includes('window:test'), 'process graph object should ref its window');

const failed = graph.transaction([
  { op:'upsert', object:{ id:'preview:rollback', type:'preview' } },
  { op:'unsupported' }
]);
assert(!failed.ok, 'bad transaction should fail');
assert(!graph.get('preview:rollback'), 'failed transaction should roll object back');
assert(graph.unsubscribe(watcher.id), 'watcher should unsubscribe');
console.log('B"H graph-browser-smoke passed');

function assert(condition, message) { if (!condition) throw new Error(message); }
