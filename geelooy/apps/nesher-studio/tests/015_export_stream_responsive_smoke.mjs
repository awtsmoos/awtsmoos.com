/* B"H */
import assert from 'node:assert/strict';
import { createExportPipeline, makeExportPlan, queueExportPlan, runDescriptorExport } from '../modules/export/ExportPipeline.js';
import { queueStats } from '../modules/export/ExportQueue.js';
import { ffprobeProofDescriptor } from '../modules/export/Validation.js';
import { createStreamManager, startManagedStream, publishManagedSegment, stopManagedStream } from '../modules/streaming/StreamManager.js';
import { createProviderRegistry, getProvider } from '../modules/streaming/ProviderRegistry.js';
import { validateProviderConfig } from '../modules/streaming/GenericProvider.js';
import { createSceneCollection, addCollectionScene, setActiveScene } from '../modules/studio/SceneCollection.js';
import { createStudioTransition, applyTransition, transitionComplete } from '../modules/studio/StudioTransition.js';
import { createReplayBuffer, pushReplayFrame, exportReplayDescriptor } from '../modules/studio/ReplayBuffer.js';
import { createResponsiveShell, createTouchEventMap } from '../components/index.js';

const pipeline = createExportPipeline();
const mobile = makeExportPlan(pipeline, 'mobile-720p');
assert.equal(mobile.validation.ok, true);
queueExportPlan(pipeline, mobile, 'Mobile Master');
assert.equal(queueStats(pipeline.queue).queued, 1);
const job = await runDescriptorExport(pipeline);
assert.equal(job.status, 'complete');
assert.equal(job.artifacts[0].kind, 'mp4');
const hls = makeExportPlan(pipeline, 'stream-hls-720p');
queueExportPlan(pipeline, hls, 'Live HLS');
const hlsJob = await runDescriptorExport(pipeline);
assert.ok(hlsJob.artifacts[0].playlist.includes('#EXTM3U'));
assert.equal(ffprobeProofDescriptor('codec_name=h264\ncodec_name=aac').ok, true);

const registry = createProviderRegistry();
assert.equal(validateProviderConfig(getProvider(registry, 'generic-hls')).ok, true);
const manager = createStreamManager({ registry });
const session = startManagedStream(manager, 'generic-hls');
publishManagedSegment(manager, session, { name:'seg-000000.ts', duration:2, bytes:2048 });
stopManagedStream(manager, session);
assert.equal(session.status, 'stopped');
assert.ok(session.playlist.includes('seg-000000.ts'));

const collection = createSceneCollection();
addCollectionScene(collection, { id:'scene-a' }); addCollectionScene(collection, { id:'scene-b' }); setActiveScene(collection, 'scene-b');
assert.equal(collection.activeSceneId, 'scene-b');
const transition = applyTransition(createStudioTransition({ type:'fade', duration:1 }), 1);
assert.equal(transitionComplete(transition), true);
const replay = createReplayBuffer({ seconds:1, fps:2 }); pushReplayFrame(replay, 'a'); pushReplayFrame(replay, 'b'); pushReplayFrame(replay, 'c');
assert.equal(exportReplayDescriptor(replay).frames, 2);
assert.equal(createResponsiveShell({ width:390 }).mode, 'mobile');
assert.equal(createResponsiveShell({ width:1400 }).mode, 'desktop');
assert.equal(createTouchEventMap().drag, 'pointermove');
console.log(JSON.stringify({ ok:true, exports:pipeline.queue.completed.length, streamSegments:session.segments.length, mode:createResponsiveShell({ width:390 }).mode }));
