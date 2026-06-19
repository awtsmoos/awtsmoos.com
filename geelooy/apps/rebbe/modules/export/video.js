//B"H
// modules/export/video.js
import * as Render from '../../render.js';
import { bakeAudioTimeline } from './audio.js';
import { createRenderWorker, describeRenderWorker } from '../video/render-worker-resolver.js';

export async function renderFinalVideo(state) {
  Render.openModal('modal-video');
  Render.updateVideoProgress('PREPARING ASSETS...', 0);
  await bakeAudioTimeline(state);

  const resolution = getResolution(state.resolutionSetting);
  const workerLayers = await buildWorkerLayers(state.mediaLayers || []);
  Render.updateVideoProgress('INITIALIZING RENDER KERNEL...', 0.1);

  const worker = startWorker('video-render');
  worker.onmessage = event => handleVideoWorkerMessage(worker, event);
  worker.onerror = error => failWorker(worker, `WORKER ERROR: ${error.message || error}`);

  worker.postMessage({
    type: 'START_EXPORT',
    payload: {
      audioShim: state.pendingAudioShim,
      captions: state.captions || [],
      mediaLayers: workerLayers,
      settings: {
        resolution,
        particles: {},
        fx: state.studioFX || {}
      }
    }
  }, workerLayers.map(layer => layer.bitmap).filter(Boolean));
}

export async function handleDownloadAudioSlice(state) {
  if (!state.sourceAudioBuffer) return alert('NO AUDIO SOURCE');
  await bakeAudioTimeline(state);
  Render.updateVideoProgress('ENCODING WAV...', 0);

  const worker = startWorker('audio-encoder');
  worker.onmessage = event => handleAudioWorkerMessage(worker, event);
  worker.onerror = error => failWorker(worker, `AUDIO WORKER ERROR: ${error.message || error}`);
  worker.postMessage({ type: 'ENCODE_AUDIO', payload: state.pendingAudioShim });
}

function startWorker(name) {
  const worker = createRenderWorker({ name: `rebbe-${name}` });
  const info = describeRenderWorker(worker);
  Render.log?.(`RENDER WORKER: ${info.url}`);
  return worker;
}

function getResolution(setting) {
  if (setting === 'landscape') return { width: 1920, height: 1080 };
  if (setting === 'square') return { width: 1080, height: 1080 };
  return { width: 1080, height: 1920 };
}

async function buildWorkerLayers(mediaLayers) {
  const layers = [];
  for (const layer of mediaLayers) {
    if (layer.type === 'effect') continue;
    const workerLayer = await loadImageLayer(layer);
    if (workerLayer) layers.push(workerLayer);
  }
  return layers;
}

async function loadImageLayer(layer) {
  try {
    const response = await fetch(layer.src);
    const blob = await response.blob();
    const bitmap = await createImageBitmap(blob);
    return {
      bitmap,
      start: Number(layer.start || 0),
      end: Number(layer.end || 0),
      x: Number(layer.x ?? 0.5),
      y: Number(layer.y ?? 0.5),
      scale: Number(layer.scale || 1),
      rotation: Number(layer.rotation || 0),
      opacity: layer.opacity !== undefined ? Number(layer.opacity) : 1,
      blendMode: layer.blendMode || 'source-over',
      filter: layer.filter || { brightness: 100, blur: 0 },
      type: 'image'
    };
  } catch (error) {
    console.error('Failed to load layer', layer, error);
    Render.log?.(`LAYER LOAD FAILED: ${error.message || error}`, true);
    return null;
  }
}

function handleVideoWorkerMessage(worker, event) {
  const { type, payload } = event.data || {};
  if (type === 'STATUS_UPDATE') {
    Render.updateVideoProgress(payload.message, payload.progress);
    return;
  }
  if (type === 'VIDEO_COMPLETE') {
    downloadBlob(payload, `rebbe-studio-export-${Date.now()}.mp4`);
    worker.terminate();
    Render.updateVideoProgress('DONE', 1);
    setTimeout(() => Render.closeModal('modal-video'), 2000);
    return;
  }
  if (type === 'FATAL_ERROR') failWorker(worker, `RENDER ERROR: ${payload.message}`);
}

function handleAudioWorkerMessage(worker, event) {
  const { type, payload } = event.data || {};
  if (type === 'AUDIO_PROGRESS') {
    Render.updateVideoProgress(`ENCODING ${(payload * 100).toFixed(0)}%`, payload);
    return;
  }
  if (type === 'AUDIO_COMPLETE') {
    downloadBlob(payload, `rebbe-audio-edit-${Date.now()}.wav`);
    worker.terminate();
    Render.updateVideoProgress('DOWNLOAD READY', 1);
  }
  if (type === 'FATAL_ERROR') failWorker(worker, `AUDIO ERROR: ${payload.message}`);
}

function downloadBlob(blob, fileName) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}

function failWorker(worker, message) {
  Render.log(message, true);
  Render.updateVideoProgress('FAILED', 1);
  worker.terminate();
}
