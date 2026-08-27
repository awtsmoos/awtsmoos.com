/* B"H
Generic HLS controller: the live stream receives a private chamber of timers.
Frames rise, segments gather, and the Awtsmoos renews every byte from ayin.
*/
import { createLiveStreamHealth, beginLiveHealth, finishLiveHealth, readLiveHealth } from '../live/liveStreamHealth.js';
import { getProvider } from '../providers/streamProviders.js';
import { createYoutubeHlsMpegTsStreamer as defaultStreamer } from '../youtube/hlsMpegTsStreamer.js';

export function createGenericHlsController(vessel, options = {}) {
  const runtime = makeRuntime(options);
  return {
    bind:() => bindButton(vessel, runtime),
    start:() => startGenericHlsStream(vessel, runtime),
    stop:() => stopGenericHlsStream(vessel, runtime),
    toggle:() => toggleGenericHlsStream(vessel, runtime),
    snapshot:() => runtime.health.last
  };
}
function makeRuntime(options) {
  return { hlsStream:null, frameTimer:null, healthTimer:null, pumping:false, health:createLiveStreamHealth(options.clock), createStreamer:options.createStreamer || defaultStreamer, setInterval:options.setInterval || globalThis.setInterval, clearInterval:options.clearInterval || globalThis.clearInterval };
}
function bindButton(vessel, runtime) { vessel.dom.fmp4StreamButton.onclick = () => toggleGenericHlsStream(vessel, runtime); }
async function toggleGenericHlsStream(vessel, runtime) { return runtime.hlsStream ? stopGenericHlsStream(vessel, runtime) : startGenericHlsStream(vessel, runtime); }
async function startGenericHlsStream(vessel, runtime) {
  const { dom, state, setStatus, setStreamHealth } = vessel;
  try {
    setStatus('Starting generic H.264 + AAC MPEG-TS HLS encoder...');
    setStreamHealth(beginLiveHealth(runtime.health));
    runtime.hlsStream = await runtime.createStreamer(streamOptions(vessel));
    setStreamHealth(beginLiveHealth(runtime.health, runtime.hlsStream.sessionId));
    dom.fmp4StreamButton.textContent = 'Stop Generic HLS';
    runtime.frameTimer = runtime.setInterval(() => pumpHlsFrame(vessel, runtime), frameMs(state));
    runtime.healthTimer = runtime.setInterval(() => updateStreamHealth(vessel, runtime), 500);
    await pumpHlsFrame(vessel, runtime); updateStreamHealth(vessel, runtime);
    setStatus(`Generic HLS running for ${getProvider(state.providerId).name}; session ${runtime.hlsStream.sessionId}.`);
    return runtime.health.last;
  } catch (e) { return failStart(vessel, runtime, e); }
}
function streamOptions({ dom, state, drawStage, setStatus, tunnelBase }) {
  return { canvas:dom.stage, fps:state.fps || 30, bitrate:Math.max(900000, state.width * state.height * 2), targetDuration:2, tunnelBase, drawFrame:() => drawStage(state), onStatus:setStatus };
}
async function stopGenericHlsStream(vessel, runtime) {
  const { dom, setStatus, setStreamHealth } = vessel;
  cleanupStreamTimers(runtime); const stream = runtime.hlsStream;
  if (!stream) return setStopped(vessel, runtime, { sessionId:runtime.health.session, frames:0, segments:0, uploaded:0, errors:[] });
  setStreamHealth(readLiveHealth(runtime.health, stream, 'Stopping'));
  const stopped = await stream.stop(); runtime.hlsStream = null;
  dom.fmp4StreamButton.textContent = 'Start Generic HLS';
  return setStopped(vessel, runtime, stopped);
}
async function pumpHlsFrame(vessel, runtime) {
  if (!runtime.hlsStream || runtime.pumping) return;
  runtime.pumping = true;
  try { await runtime.hlsStream.addFrame(); } catch (e) { noteFrameError(vessel, runtime, e); }
  runtime.pumping = false;
}
function failStart({ dom, setStatus, setStreamHealth }, runtime, e) {
  cleanupStreamTimers(runtime); runtime.hlsStream = null; dom.fmp4StreamButton.textContent = 'Start Generic HLS';
  const health = { state:'Failed', errors:1, summary:`Failed · needs attention · ${e.message}` };
  setStreamHealth(health); setStatus(`Generic HLS failed: ${e.message}`); runtime.health.last = health; return health;
}
function setStopped({ setStatus, setStreamHealth }, runtime, stopped) {
  const health = finishLiveHealth(runtime.health, stopped, 'Stopped');
  setStreamHealth(health); setStatus(`Generic HLS stopped: ${health.summary}.`); return health;
}
function noteFrameError({ setStatus }, runtime, e) { runtime.hlsStream?.state?.errors?.push(e.message); setStatus(`HLS frame skipped: ${e.message}`); }
function updateStreamHealth(vessel, runtime) { vessel.setStreamHealth(readLiveHealth(runtime.health, runtime.hlsStream, 'Running')); }
function cleanupStreamTimers(runtime) { runtime.clearInterval(runtime.frameTimer); runtime.clearInterval(runtime.healthTimer); runtime.frameTimer = null; runtime.healthTimer = null; }
function frameMs(state) { return Math.max(16, Math.round(1000 / (state.fps || 30))); }
