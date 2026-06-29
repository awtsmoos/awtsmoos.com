// B"H
import { makeVfsRegistry } from '../../os/vfs/registry.js';
import { makeObjectGraph } from '../../os/graph/registry.js';
import { syncOsGraph } from '../../os/graph/osGraphSync.js';

const vfs = makeVfsRegistry();
for (const id of ['virtual','tunnel','preview','custom']) vfs.register(adapter(id));

assert(vfs.adapterFor('/home')?.id === 'virtual', 'root mount should resolve virtual');
assert(vfs.adapterFor('awtsmoos://tunnels/root')?.id === 'tunnel', 'tunnel URI should resolve tunnel');
assert(vfs.adapterFor('awtsmoos://previews/x')?.id === 'preview', 'preview URI should resolve preview');

vfs.mount({ id:'mount:custom', prefix:'/home/projects', adapterId:'custom' });
assert(vfs.adapterFor('/home/projects/a')?.id === 'custom', 'longest custom mount should win');
assert(vfs.adapterFor('/home2')?.id === 'virtual', 'mount prefix should respect boundary');
vfs.unmount('mount:custom');
assert(vfs.adapterFor('/home/projects/a')?.id === 'virtual', 'unmounted path should fall back');

const graph = makeObjectGraph();
syncOsGraph({ graph, vfs, drives:{ list(){ return []; } }, windowHandler:{ windows:[] }, processes:{ list(){ return []; } } });
assert(graph.get('mount:tunnels'), 'mount:tunnels should sync into graph');
console.log('B"H vfs-mount-smoke passed');

function adapter(id) { return { id, async list(path){ return [{ id, path }]; } }; }
function assert(condition, message) { if (!condition) throw new Error(message); }
