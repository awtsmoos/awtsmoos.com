/* B"H
Executable smoke for the next real slice: source serialization, render graph
frame accounting, and timeline edits. No media is generated.
*/
import assert from 'node:assert/strict';
import { createProject, addProjectScene } from '../modules/project/index.js';
import { createColorSource } from '../modules/sources/ColorSource.js';
import { createRenderGraph } from '../modules/rendergraph/RenderGraph.js';
import { createFrameScheduler, stepFrameScheduler } from '../modules/rendergraph/FrameScheduler.js';
import { createTimeline, addClip, moveClip, razorClip, rippleDelete, findClip } from '../modules/timeline/Timeline.js';
import { addMarker } from '../modules/timeline/MarkerEngine.js';
import { collectSnapPoints, snapTime } from '../modules/timeline/SnapEngine.js';

const project = createProject({ width:640, height:360, fps:30 });
const scene = addProjectScene(project, { id:'scene-smoke', name:'Smoke scene' });
const source = createColorSource({ id:'color-smoke', color:'#123456', x:10, y:20, w:100, h:80 });
scene.sources.push(source);
const serialized = source.serialize();
assert.equal(serialized.type, 'color');
assert.equal(serialized.settings.color, '#123456');

const calls = [];
const ctx = fakeContext(calls);
const graph = createRenderGraph({ project, ctx });
assert.equal(graph.render(), 1);
assert.equal(graph.stats.frames, 1);
const scheduler = createFrameScheduler({ fps:30, tick:() => graph.render() });
stepFrameScheduler(scheduler, 2);
assert.equal(graph.stats.frames, 3);

const timeline = createTimeline();
const clip = addClip(timeline, { id:'clip-a', assetId:'asset-a', name:'A', start:0, duration:10 });
moveClip(timeline, clip.id, 2);
assert.equal(findClip(timeline, clip.id).clip.start, 2);
const right = razorClip(timeline, clip.id, 5);
assert.equal(Boolean(right), true);
assert.equal(findClip(timeline, clip.id).clip.duration, 3);
addMarker(timeline, { time:5, name:'Cut point', chapter:true });
assert.equal(snapTime(5.04, collectSnapPoints(timeline), .1), 5);
rippleDelete(timeline, clip.id);
assert.equal(findClip(timeline, clip.id), null);

console.log(JSON.stringify({ ok:true, frames:graph.stats.frames, drawCalls:calls.length, clips:timeline.tracks[0].clips.length, markers:timeline.markers.length }));

function fakeContext(calls) {
  const ctx = { canvas:{ width:640, height:360 } };
  for (const name of ['save','restore','translate','rotate','fillRect','fillText','drawImage']) ctx[name] = (...args) => calls.push([name, ...args]);
  Object.defineProperty(ctx, 'fillStyle', { set(value) { calls.push(['fillStyle', value]); } });
  Object.defineProperty(ctx, 'font', { set(value) { calls.push(['font', value]); } });
  Object.defineProperty(ctx, 'globalAlpha', { set(value) { calls.push(['globalAlpha', value]); } });
  return ctx;
}
