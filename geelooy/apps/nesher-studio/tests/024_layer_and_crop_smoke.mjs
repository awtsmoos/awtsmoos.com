/* B"H */
import assert from 'node:assert/strict';
import { makeScene, addSource, moveSourceToEdge } from '../modules/graph/sceneGraph.js';
import { makeSourceNode, normalizeCrop } from '../modules/graph/sourceNode.js';
import { mediaRect } from '../modules/renderers/sourceRenderers.js';

const state = { scenes:[makeScene('s','Scene')], currentSceneId:'s', selectedId:null };
const a = addSource(state, makeSourceNode({ id:'a', name:'A' }));
addSource(state, makeSourceNode({ id:'b', name:'B' }));
addSource(state, makeSourceNode({ id:'c', name:'C' }));
assert.equal(moveSourceToEdge(state, a.id, 'top'), true);
assert.deepEqual(state.scenes[0].sources.map(s => s.id), ['b','c','a']);
assert.equal(moveSourceToEdge(state, a.id, 'bottom'), true);
assert.deepEqual(state.scenes[0].sources.map(s => s.id), ['a','b','c']);
assert.deepEqual(normalizeCrop({ left:99, top:-5, right:12.4, bottom:'bad' }), { left:90, top:0, right:12.4, bottom:0 });
const rect = mediaRect({ node:{ width:1000, height:500 }, crop:{ left:10, top:20, right:30, bottom:10 } });
assert.deepEqual(roundRect(rect), { sx:100, sy:100, sw:600, sh:350 });
console.log(JSON.stringify({ ok:true, order:state.scenes[0].sources.map(s => s.id), crop:roundRect(rect) }));
function roundRect(rect) { return Object.fromEntries(Object.entries(rect).map(([key, value]) => [key, Math.round(value)])); }
