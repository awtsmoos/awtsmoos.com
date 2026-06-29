// B"H
const domWindows = [fakeWindow('win-one', 'process-one', 'Alpha Window')];

global.MouseEvent = class MouseEvent { constructor(type, init = {}) { this.type = type; this.init = init; } };
global.document = {
  title:'Virtual OS Test',
  fullscreenElement:null,
  querySelectorAll(selector) { return selector === '.window' ? domWindows : []; },
  querySelector(selector) { return selector.includes('win-one') ? domWindows[0] : null; }
};
global.window = { os:{ graph:fakeGraph(), vfs:fakeVfs(), drives:{ list(){ return []; } }, processes:{ list(){ return []; } } } };

const { createHandlers } = await import('../../os/tunnel/handlers.js');
const handlers = createHandlers();

assert(handlers.graphSubscribe({ watcher:{ id:'watch:tunnel' } }).watcher.id === 'watch:tunnel', 'graphSubscribe should delegate');
assert(handlers.graphSearch({ q:'alpha' }).results[0].id === 'object:alpha', 'graphSearch should delegate to ObjectGraph.search');
assert((await handlers.vfsList({ path:'/' })).items.length === 1, 'vfsList should delegate');
assert((await handlers.vfsWrite({ path:'/a.txt', content:'hi' })).result.method === 'write', 'vfsWrite should delegate');
assert((await handlers.vfsMkdir({ path:'/folder' })).result.method === 'mkdir', 'vfsMkdir should delegate');
assert((await handlers.vfsRemove({ path:'/a.txt' })).result.method === 'remove', 'vfsRemove should delegate');
assert(handlers.vfsCan({ path:'/', action:'read' }).permission.ok, 'vfsCan should expose permission');
assert(handlers.vfsMounts({}).mounts[0].id === 'mount:virtual', 'vfsMounts should expose mounts');
assert(handlers.vfsResolve({ path:'/' }).permission.ok, 'vfsResolve should expose permission verdict');
assert(handlers.windows({}).windows[0].id === 'win-one', 'windows should return stable window ids');
assert(handlers.windows({}).windows[0].processId === 'process-one', 'windows should return process ids');
assert(handlers.focusWindow({ id:'win-one' }).focused.id === 'win-one', 'focusWindow should find by data-window-id');
assert(domWindows[0].lastEvent.type === 'mousedown', 'focusWindow should dispatch focus gesture');
assert(handlers.scene({}).scene.windows[0].id === 'win-one', 'scene snapshot should preserve window identity');
console.log('B"H tunnel-handlers-smoke passed');

function fakeWindow(id, processId, title) {
  return {
    dataset:{ id, windowId:id, processId },
    className:'BH-test-window window active',
    textContent:title,
    lastEvent:null,
    getBoundingClientRect(){ return { x:1, y:2, width:300, height:200 }; },
    querySelector(selector){ return selector === '.window-header' ? { textContent:title } : null; },
    dispatchEvent(event){ this.lastEvent = event; }
  };
}

function fakeGraph() {
  return {
    search(){ return [{ id:'object:alpha', title:'Alpha Object' }]; },
    subscribe(input){ return { id:input.watcher?.id || input.id || 'watch:auto' }; },
    unsubscribe(id){ return { id }; },
    watchers(){ return []; },
    drain(id){ return { watcher:{ id }, events:[] }; }
  };
}

function fakeVfs() {
  return {
    async list(){ return ['item']; },
    async read(){ return { ok:true }; },
    async write(path){ return { ok:true, method:'write', path }; },
    async mkdir(path){ return { ok:true, method:'mkdir', path }; },
    async remove(path){ return { ok:true, method:'remove', path }; },
    mounts(){ return [{ id:'mount:virtual', prefix:'/' }]; },
    resolve(){ return { mount:{ id:'mount:virtual' }, adapter:{ id:'virtual' }, path:'/' }; },
    can(){ return { ok:true }; }
  };
}

function assert(condition, message) { if (!condition) throw new Error(message); }
