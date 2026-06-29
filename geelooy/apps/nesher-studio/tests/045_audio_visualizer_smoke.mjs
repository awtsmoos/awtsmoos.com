import assert from 'node:assert/strict';
import { makeAudioVisualizerSource } from '../modules/visualizer/audioVisualizerSource.js';
import { renderAudioVisualizer } from '../modules/visualizer/renderAudioVisualizer.js';
const ctx = fakeContext(), state = { selectedId:'mic-1', sources:[{ id:'mic-1', name:'Mic Alef', type:'audioInput', audioOnly:true }] };
const source = makeAudioVisualizerSource(state, 'source.settings.customRan = true; helpers.drawHebrewOrbit(ctx, source, frame);');
assert.equal(source.type, 'livestreamVisualizer'); assert.equal(source.sourcesProvider().length, 1); assert.equal(renderAudioVisualizer(ctx, source), true);
assert.equal(source.settings.customRan, true); assert.ok(ctx.ops.includes('fillRect')); assert.ok(ctx.ops.includes('fillText'));
console.log('B"H audio visualizer smoke passed');
function fakeContext() { const ops = []; return { ops, fillStyle:'', strokeStyle:'', font:'', lineWidth:1, globalAlpha:1, createLinearGradient(){ return { addColorStop(){ ops.push('gradientStop'); } }; }, fillRect(){ ops.push('fillRect'); }, beginPath(){ ops.push('beginPath'); }, moveTo(){ ops.push('moveTo'); }, lineTo(){ ops.push('lineTo'); }, closePath(){ ops.push('closePath'); }, stroke(){ ops.push('stroke'); }, fillText(){ ops.push('fillText'); } }; }
