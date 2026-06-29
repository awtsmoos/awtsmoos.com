/* B"H
Generic HLS controller: the live stream receives a private chamber of timers.
Frames rise, segments gather, and the Awtsmoos renews every byte from ayin.
*/
import { getProvider } from '../providers/streamProviders.js';
import { createYoutubeHlsMpegTsStreamer as createGenericHlsStreamer } from '../youtube/hlsMpegTsStreamer.js';

export function createGenericHlsController(vessel) {
  const runtime = { hlsStream:null, frameTimer:null, healthTimer:null, pumping:false };
  return { bind:() => bindButton(vessel, runtime), stop:() => stopGenericHlsStream(vessel, runtime) };
}

function bindButton(vessel, runtime) {
  vessel.dom.fmp4StreamButton.onclick = () => toggleGenericHlsStream(vessel, runtime);
}

async function toggleGenericHlsStream(vessel, runtime) {
  if (runtime.hlsStream) return stopGenericHlsStream(vessel, runtime);
  return startGenericHlsStream(vessel, runtime);
}

async function startGenericHlsStream(vessel, runtime) {
  const { dom, state, setStatus, setStreamHealth, tunnelBase } = vessel;
  try {
    setStatus('Starting generic H.264 + AAC MPEG-TS HLS encoder...');
    setStreamHealth({ state:'Starting' });
    runtime.hlsStream = await createGenericHlsStreamer(streamOptions(vessel));
    dom.fmp4StreamButton.textContent = 'Stop Generic HLS';
    runtime.frameTimer = setInterval(() => pumpHlsFrame(vessel, runtime), frameMs(state));
    runtime.healthTimer = setInterval(() => updateStreamHealth(vessel, runtime), 500);
    await pumpHlsFrame(vessel, runtime);
    updateStreamHealth(vessel, runtime);
    setStatus(`Generic HLS running for ${getProvider(state.providerId).name}; session ${runtime.hlsStream.sessionId}.`);
  } catch (e) {
    cleanupStreamTimers(runtime);
    runtime.hlsStream = null;
    dom.fmp4StreamButton.textContent = 'Start Generic HLS';
    setStreamHealth({ state:'Failed', errors:1 });
    setStatus(`Generic HLS failed: ${e.message}`);
  }
}

function streamOptions({ dom, state, drawStage, setStatus, tunnelBase }) {
  return {
    canvas:dom.stage, fps:state.fps || 30, bitrate:Math.max(900000, state.width * state.height * 2),
    targetDuration:2, tunnelBase, drawFrame:() => drawStage(state), onStatus:setStatus
  };
}

async function stopGenericHlsStream(vessel, runtime) {
  const { dom, setStatus, setStreamHealth } = vessel;
  cleanupStreamTimers(runtime);
  setStreamHealth(readHealth(runtime, 'Stopping'));
  const stopped = await runtime.hlsStream.stop();
  runtime.hlsStream = null;
  dom.fmp4StreamButton.textContent = 'Start Generic HLS';
  setStreamHealth({ state:'Stopped', session:stopped.sessionId, frames:stopped.frames, segments:stopped.segments, uploaded:stopped.uploaded, errors:stopped.errors?.length || 0 });
  setStatus(`Generic HLS stopped: ${stopped.frames} frames, ${stopped.segments} segments, ${stopped.uploaded} bytes.`);
}

async function pumpHlsFrame(vessel, runtime) {
  if (!runtime.hlsStream || runtime.pumping) return;
  runtime.pumping = true;
  try { await runtime.hlsStream.addFrame(); }
  catch (e) { noteFrameError(vessel, runtime, e); }
  runtime.pumping = false;
}

function noteFrameError({ setStatus }, runtime, e) {
  runtime.hlsStream?.state?.errors?.push(e.message);
  setStatus(`HLS frame skipped: ${e.message}`);
}

function updateStreamHealth(vessel, runtime) {
  vessel.setStreamHealth(readHealth(runtime, 'Running'));
}

function readHealth(runtime, streamState) {
  const s = runtime.hlsStream?.state;
  return { state:streamState, session:runtime.hlsStream?.sessionId, frames:s?.frameIndex, segments:s?.segments?.length, uploaded:s?.uploaded, errors:s?.errors?.length };
}

function cleanupStreamTimers(runtime) {
  clearInterval(runtime.frameTimer);
  clearInterval(runtime.healthTimer);
  runtime.frameTimer = null;
  runtime.healthTimer = null;
}

function frameMs(state) {
  return Math.max(16, Math.round(1000 / (state.fps || 30)));
}
