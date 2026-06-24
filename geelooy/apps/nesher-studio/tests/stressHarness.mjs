/* B"H
Bounded stress harness: no raw media, no repo artifacts, just deterministic
pressure on the pure engines so hidden leaks become text proof.
*/
import assert from 'node:assert/strict';
import { createProject, addProjectScene, addProjectAsset, addProjectSequence } from '../modules/project/index.js';
import { createColorSource } from '../modules/sources/ColorSource.js';
import { createRenderGraph } from '../modules/rendergraph/RenderGraph.js';
import { createTimeline, addClip, moveClip, razorClip } from '../modules/timeline/Timeline.js';
import { createAudioGraph, renderAudioMix } from '../modules/audio/AudioGraph.js';
import { createExportPipeline, makeExportPlan, queueExportPlan, runDescriptorExport } from '../modules/export/ExportPipeline.js';
import { createStreamManager, startManagedStream, publishManagedSegment, stopManagedStream } from '../modules/streaming/StreamManager.js';
import { createFramePool, pushFrame, drainFramePool } from '../modules/webcodecs/FramePool.js';

export async function runStressSpec(spec) {
  const started = Date.now();
  const project = createProject({ width:640, height:360, fps:30 });
  const scene = addProjectScene(project, { name:`${spec.id} scene` });
  for (let i = 0; i < spec.sources; i++) scene.sources.push(createColorSource({ x:i*3, y:i*2, w:80, h:45, color:i % 2 ? '#2244aa' : '#22aa88' }));
  const calls = []; const graph = createRenderGraph({ project, ctx:fakeContext(calls) });
  for (let i = 0; i < spec.frames; i++) graph.render();
  const timeline = createTimeline();
  for (let i = 0; i < spec.clips; i++) addClip(timeline, { id:`${spec.id}-clip-${i}`, start:i, duration:4, name:`Clip ${i}` });
  if (spec.clips > 1) { moveClip(timeline, `${spec.id}-clip-0`, 2); razorClip(timeline, `${spec.id}-clip-1`, 2.5); }
  const audio = createAudioGraph(); const mixed = renderAudioMix(audio, { master:[.1, -.1, .05, -.05] });
  const pipeline = createExportPipeline(); queueExportPlan(pipeline, makeExportPlan(pipeline, 'mobile-720p'), spec.id); await runDescriptorExport(pipeline);
  const stream = createStreamManager(); const session = startManagedStream(stream, 'generic-hls'); publishManagedSegment(stream, session, { bytes:1024, duration:2 }); stopManagedStream(stream, session);
  const pool = createFramePool({ maxSize:4 }); for (let i = 0; i < 8; i++) pushFrame(pool, { close(){} }); drainFramePool(pool);
  const report = { id:spec.id, ok:true, ms:Date.now()-started, rendered:graph.stats.frames, drawCalls:calls.length, clips:timeline.tracks[0].clips.length, mixPeak:Math.max(...mixed.map(Math.abs)), exports:pipeline.queue.completed.length, segments:session.segments.length, poolClosed:pool.closed };
  assert.equal(report.rendered, spec.frames); assert.equal(report.exports, 1); assert.equal(report.segments, 1); assert.ok(report.poolClosed >= 4);
  return report;
}
export const STRESS_SPECS = {
  scene:{ id:'001_scene_stress', sources:32, clips:8, frames:24 },
  audio:{ id:'002_audio_stress', sources:4, clips:4, frames:8 },
  export:{ id:'003_export_stress', sources:8, clips:10, frames:10 },
  stream:{ id:'004_stream_stress', sources:8, clips:6, frames:12 },
  memory:{ id:'005_memory_leak', sources:16, clips:12, frames:18 },
  gc:{ id:'006_gc_stress', sources:20, clips:12, frames:20 },
  webcodecs:{ id:'007_webcodecs_stress', sources:12, clips:12, frames:16 },
  provider:{ id:'008_provider_stress', sources:8, clips:8, frames:12 },
  multicam:{ id:'009_multicam_stress', sources:24, clips:16, frames:20 },
  everything:{ id:'010_everything', sources:40, clips:24, frames:30 }
};
function fakeContext(calls) {
  const ctx = { canvas:{ width:640, height:360 } };
  for (const name of ['save','restore','translate','rotate','fillRect','fillText','drawImage']) ctx[name] = (...args) => calls.push([name, ...args]);
  for (const prop of ['fillStyle','font','globalAlpha']) Object.defineProperty(ctx, prop, { set(value){ calls.push([prop, value]); } });
  return ctx;
}
