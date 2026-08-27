/* B"H
Manual video pump: the flame now flows through small vessels.
Queue samples, backpressure, monotonic timestamps, keyframes, and telemetry are separated,
while the old startVideoFramePump API remains stable for the app.
*/
import { supportedVideoConfig } from './recorderGuards.js';
import { createBackpressureController, shouldAcceptFrame } from './core/EncoderBackpressureController.js';
import { createEncodeQueueSampler, pushQueueSample, queueSampleSummary } from './core/EncodeQueueSampler.js';
import { createEncodingTelemetry, noteDroppedVideo, noteEncodedVideo, noteMuxedChunk, telemetrySummary } from './core/EncodingTelemetry.js';
import { createMonotonicClock } from './video/clock.js';
import { shouldRequestKeyFrame } from './video/keyframePolicy.js';

export async function startVideoFramePump({ canvas, fps, bitrate, profile, drawFrame, muxer, onStatus }) {
  const width = canvas.width, height = canvas.height;
  const supported = await supportedVideoConfig({ width, height, fps, bitrate, profile });
  const state = createPumpState(profile);
  const encoder = createEncoder(state, muxer);
  encoder.configure(supported.config);
  encoder.addEventListener?.('dequeue', () => catchUp(state, encoder, pump));
  const timer = setInterval(() => pump(), frameInterval(fps));
  await pump(true);
  onStatus?.(statusLine(profile, width, height, bitrate, state));
  return createPumpApi({ state, encoder, timer, supported, pump });

  async function pump(forceKeyFrame = false, catchUpFrame = false) {
    if (state.stopped || state.pumping) return;
    pushQueueSample(state.queueSampler, encoder.encodeQueueSize);
    if (!shouldAcceptFrame(state.backpressure, encoder.encodeQueueSize, forceKeyFrame)) return drop(state);
    if (catchUpFrame && encoder.encodeQueueSize >= state.backpressure.maxQueue) return;
    state.pumping = true;
    try { encodeOneFrame({ canvas, drawFrame, encoder, fps, profile, state, forceKeyFrame }); }
    catch (error) { state.errors.push(error?.message || String(error)); }
    finally { state.pumping = false; }
  }
}

function createPumpState(profile) {
  return { frameIndex:0, encodedFrames:0, droppedFrames:0, stopped:false, pumping:false, errors:[], clock:createMonotonicClock(), backpressure:createBackpressureController({ maxQueue:profile.maxQueue || 2, softQueue:Math.max(1, (profile.maxQueue || 2) - 1) }), queueSampler:createEncodeQueueSampler(), telemetry:createEncodingTelemetry(), catchUpFrames:profile.catchUpFrames || 1 };
}
function createEncoder(state, muxer) {
  return new VideoEncoder({ output:(chunk, meta) => { muxer.addVideoChunk(chunk, meta); state.encodedFrames++; noteEncodedVideo(state.telemetry); noteMuxedChunk(state.telemetry); }, error:error => state.errors.push(error?.message || String(error)) });
}
function encodeOneFrame({ canvas, drawFrame, encoder, fps, profile, state, forceKeyFrame }) {
  drawFrame?.();
  const frame = new VideoFrame(canvas, { timestamp:state.clock.timestamp() });
  encoder.encode(frame, { keyFrame:forceKeyFrame || shouldRequestKeyFrame(state.frameIndex, fps, profile) });
  frame.close();
  state.frameIndex++;
}
function catchUp(state, encoder, pump) { for (let i = 0; i < state.catchUpFrames && encoder.encodeQueueSize < state.backpressure.maxQueue; i++) pump(false, true); }
function drop(state) { state.droppedFrames++; noteDroppedVideo(state.telemetry); }
function frameInterval(fps) { return Math.max(8, Math.round(1000 / fps)); }
function statusLine(profile, width, height, bitrate, state) { return `Manual ${profile.label} ${width}×${height}; queue cap ${state.backpressure.maxQueue}; bitrate ${Math.round(bitrate / 1000)}kbps.`; }
function createPumpApi({ state, encoder, timer, supported, pump }) {
  return { stop:() => stopPump({ state, encoder, timer, supported }), pumpNow:pump, config:supported.config, muxCodec:supported.muxCodec, mimeCodec:supported.mimeCodec, errors:state.errors, get frames(){ return state.frameIndex; }, get dropped(){ return state.droppedFrames; }, get telemetry(){ return telemetrySummary(state.telemetry); }, get queue(){ return queueSampleSummary(state.queueSampler); } };
}
async function stopPump({ state, encoder, timer, supported }) {
  state.stopped = true; clearInterval(timer);
  if (state.pumping) await new Promise(resolve => setTimeout(resolve, 20));
  if (state.frameIndex === 0) throw new Error(`Manual WebCodecs recorder produced zero frames: ${state.errors.join('; ') || 'no frame pump'}`);
  await encoder.flush(); encoder.close();
  return { frames:state.frameIndex, encodedFrames:state.encodedFrames, droppedFrames:state.droppedFrames, codec:supported.config.codec, mimeCodec:supported.mimeCodec, errors:state.errors.slice(), queue:queueSampleSummary(state.queueSampler), telemetry:telemetrySummary(state.telemetry) };
}
