// B"H
import { makeVfsRegistry } from '../../os/vfs/registry.js';
import { makeObjectGraph } from '../../os/graph/registry.js';
import { syncOsGraph } from '../../os/graph/osGraphSync.js';

const vfs = makeVfsRegistry();
for (const id of ['virtual','tunnel','preview','custom','closed']) vfs.register(adapter(id));

assert(vfs.adapterFor('/home')?.id === 'virtual', 'root mount should resolve virtual');
assert(vfs.adapterFor('awtsmoos://tunnels/root')?.id === 'tunnel', 'tunnel URI should resolve tunnel');
assert(vfs.adapterFor('awtsmoos://previews/x')?.id === 'preview', 'preview URI should resolve preview');

vfs.mount({ id:'mount:custom', prefix:'/home/projects', adapterId:'custom', permissions:{ list:true, read:['current'], write:['current'], delete:['current'] } });
assert(vfs.adapterFor('/home/projects/a', 'list')?.id === 'custom', 'longest custom mount should win');
assert(vfs.can('/home/projects/a', 'read', { userId:'current' }).ok, 'current principal should read custom mount');
assert(!vfs.can('/home/projects/a', 'read', { userId:'stranger' }).ok, 'stranger should not read custom mount');
assert((await vfs.write('/home/projects/a.txt', 'hi', { userId:'current' })).method === 'write', 'write should reach custom adapter');
await rejects(() => vfs.write('/home/projects/b.txt', 'no', { userId:'stranger' }), 'stranger write should reject');
assert((await vfs.mkdir('/home/projects/new', { userId:'current' })).method === 'mkdir', 'mkdir should reach custom adapter');
assert((await vfs.remove('/home/projects/a.txt', { userId:'current' })).method === 'remove', 'remove should reach custom adapter');
assert(vfs.adapterFor('/home2')?.id === 'virtual', 'mount prefix should respect boundary');

vfs.mount({ id:'mount:closed', prefix:'/closed', adapterId:'closed', permissions:{ deny:['list'] } });
await rejects(() => vfs.list('/closed'), 'denied mount should reject list');
vfs.unmount('mount:custom');
assert(vfs.adapterFor('/home/projects/a')?.id === 'virtual', 'unmounted path should fall back');

const graph = makeObjectGraph();
syncOsGraph({ graph, vfs, drives:{ list(){ return []; } }, windowHandler:{ windows:[] }, processes:{ list(){ return []; } } });
assert(graph.get('mount:tunnels'), 'mount:tunnels should sync into graph');
assert(graph.get('mount:closed').data.permissions.deny[0] === 'list', 'mount permissions should sync into graph');
console.log('B"H vfs-mount-smoke passed');

function adapter(id) { return { id, async list(path){ return [{ id, path }]; }, async read(path){ return { id, path }; }, async stat(path){ return { id, path, type:'file' }; }, async write(path){ return { ok:true, method:'write', path }; }, async mkdir(path){ return { ok:true, method:'mkdir', path }; }, async remove(path){ return { ok:true, method:'remove', path }; } }; }
async function rejects(fn, message) { try { await fn(); } catch { return; } throw new Error(message); }
function assert(condition, message) { if (!condition) throw new Error(message); }
