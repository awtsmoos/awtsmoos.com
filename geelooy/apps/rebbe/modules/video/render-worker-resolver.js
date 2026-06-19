//B"H
// modules/video/render-worker-resolver.js

export const WORKER_PROTOCOL_VERSION = 1;

const MODULE_WORKER_PATH = '../../workers/rebbe-video-worker.js';
const LEGACY_WORKER_PATH = 'workers/rebbe-video-worker.js';
const ABSOLUTE_APP_WORKER_PATH = '/geelooy/apps/rebbe/workers/rebbe-video-worker.js';

/**
 * B"H
 * The Awtsmoos breathes a worker into the page, but paths are only garments.
 * This resolver keeps the Rebbe studio from trusting one brittle string. It
 * gathers the known doors, tries them in order, and records which gate opened.
 * Future renderers may add a URL without tearing the export pipeline apart.
 */
export function createRenderWorker(options = {}) {
  if (typeof Worker !== 'function') {
    throw new Error('Video workers are not available in this runtime.');
  }

  const candidates = getRenderWorkerCandidates(options);
  const failures = [];

  for (const url of candidates) {
    try {
      const worker = new Worker(url, { name: options.name || 'rebbe-video-worker' });
      worker.awtsmoosWorkerResolution = {
        url,
        candidates,
        protocolVersion: WORKER_PROTOCOL_VERSION
      };
      return worker;
    } catch (error) {
      failures.push(`${url}: ${error?.message || error}`);
    }
  }

  throw new Error(`Unable to start Rebbe render worker. Attempts: ${failures.join(' | ')}`);
}

export function resolveRenderWorkerUrl(options = {}) {
  const candidates = getRenderWorkerCandidates(options);
  return {
    url: candidates[0],
    candidates,
    protocolVersion: WORKER_PROTOCOL_VERSION
  };
}

export function getRenderWorkerCandidates(options = {}) {
  return uniqueClean([
    options.workerUrl,
    globalThis.REBBE_VIDEO_WORKER_URL,
    moduleUrl(MODULE_WORKER_PATH),
    LEGACY_WORKER_PATH,
    ABSOLUTE_APP_WORKER_PATH
  ]);
}

export function describeRenderWorker(worker) {
  return worker?.awtsmoosWorkerResolution || {
    url: null,
    candidates: getRenderWorkerCandidates(),
    protocolVersion: WORKER_PROTOCOL_VERSION
  };
}

function moduleUrl(path) {
  try {
    return new URL(path, import.meta.url).href;
  } catch {
    return null;
  }
}

function uniqueClean(values) {
  const seen = new Set();
  const clean = [];
  for (const value of values) {
    if (!value || seen.has(value)) continue;
    seen.add(value);
    clean.push(value);
  }
  return clean;
}
