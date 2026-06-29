// B"H
global.window = { os:{ graph:fakeGraph(), vfs:fakeVfs(), drives:{ list(){ return []; } }, processes:{ list(){ return []; } } } };
global.document = { querySelectorAll(){ return []; }, querySelector(){ return null; }, fullscreenElement:null };
global.MouseEvent = class {};

const { createHandlers } = await import('../../os/tunnel/handlers.js');
const handlers = createHandlers();

assert(handlers.graphSubscribe({ watcher:{ id:'watch:tunnel' } }).watcher.id === 'watch:tunnel', 'graphSubscribe should delegate');
assert((await handlers.vfsList({ path:'/' })).items.length === 1, 'vfsList should delegate');
assert(Array.isArray(handlers.windows({}).windows), 'windows should return list');
console.log('B"H tunnel-handlers-smoke passed');

function fakeGraph() { return { subscribe(input){ return { id:input.id || 'watch:auto' }; }, unsubscribe(id){ return { id }; }, watchers(){ return []; }, drain(id){ return { watcher:{ id }, events:[] }; } }; }
function fakeVfs() { return { async list(){ return ['item']; }, async read(){ return { ok:true }; } }; }
function assert(condition, message) { if (!condition) throw new Error(message); }
