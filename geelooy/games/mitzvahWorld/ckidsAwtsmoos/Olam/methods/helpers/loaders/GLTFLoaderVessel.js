// B"H
/**
 * @file GLTFLoaderVessel.js
 * @description Chapter 503: the remote garment descends through one monitored
 * gate. Fetch, cache, parse, inspect, and readiness all testify together.
 */
import AssetCache from '../../../../utils/assetCache/index.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
import LoaderMonitor from './LoaderMonitor.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
import LoaderStateMap from './LoaderStateMap.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
import { getRuntimeSubsystemRegistry } from '../../../runtime/readiness/RuntimeSubsystemRegistry.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
import { inspectGltf } from '../../../graphics/inspection/ModelInspectionReporter.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
const GLTF_LOAD_TIMEOUT_MS = 30000, GLTF_FETCH_TIMEOUT_MS = 25000;
const TRACE_SEAL = 'visible-root-binding-20260610-bh710';
function trace(stage, payload = {}) {
  const data = { seal:TRACE_SEAL, stage, at:Date.now(), ...payload };
  try { globalThis.__AWTSMOOS_MODEL_LOAD_TRACE__ ||= []; globalThis.__AWTSMOOS_MODEL_LOAD_TRACE__.push(data); globalThis.__AWTSMOOS_MODEL_LOAD_TRACE__ = globalThis.__AWTSMOOS_MODEL_LOAD_TRACE__.slice(-180); } catch {}
  if (globalThis.__AWTSMOOS_MODEL_LOAD_LOGS__ === true) console.info('B"H | MODEL_LOAD_TRACE', data);
}
function registry() { return getRuntimeSubsystemRegistry(); }
function mark(url, progress, status, data = {}) { registry().update(`model:${url}`, { progress, status, data:{ url, ...data }, weight:2 }); }
function canonicalGltfUrl(url) {
  if (typeof url !== 'string') return url;
  try { const parsed = new URL(url, self.location?.href || globalThis.location?.href); if (parsed.pathname.endsWith('/chossid.glb')) { parsed.search = ''; parsed.hash = ''; return parsed.href; } }
  catch { if (url.includes('chossid.glb')) return url.split('?')[0].split('#')[0]; }
  return url;
}
async function withTimeout(promise, url) {
  let timeoutHandle;
  const timeout = new Promise(resolve => { timeoutHandle = setTimeout(() => { trace('parse-timeout', { url, ms:GLTF_LOAD_TIMEOUT_MS }); mark(url, 96, 'timeout', { phase:'parse-timeout' }); console.warn(`B"H - GLTF load timed out after ${GLTF_LOAD_TIMEOUT_MS}ms: ${url}`); resolve(null); }, GLTF_LOAD_TIMEOUT_MS); });
  try { return await Promise.race([promise, timeout]); } finally { clearTimeout(timeoutHandle); }
}
async function fetchBlob(url) {
  const controller = new AbortController(), timeoutHandle = setTimeout(() => controller.abort(), GLTF_FETCH_TIMEOUT_MS);
  trace('fetch-start', { url }); mark(url, 18, 'loading', { phase:'fetch-start' });
  try {
    const response = await fetch(url, { signal:controller.signal, mode:'cors' });
    trace('fetch-response', { url, ok:response.ok, status:response.status, type:response.type, contentType:response.headers?.get?.('content-type'), contentLength:response.headers?.get?.('content-length') });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const blob = await response.blob(); trace('fetch-blob', { url, size:blob.size, type:blob.type });
    try { await AssetCache.put(url, blob); } catch (error) { trace('cache-put-skipped', { url, reason:error?.message || String(error) }); }
    return blob;
  } catch (error) { trace('fetch-failed-direct-loader-next', { url, reason:error?.message || String(error), name:error?.name }); console.warn(`B"H - GLTF blob fetch yielded to direct loader for ${url}:`, error?.message || error); return null; }
  finally { clearTimeout(timeoutHandle); }
}
function compact(report) { return report?.summary || { meshes:0, skinnedMeshes:0, clips:0, cameras:0 }; }
async function parse(cacheUrl, fetchUrl, blob, context) {
  const { GLTFLoader } = await import('/games/scripts/jsm/loaders/GLTFLoader.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1');
  const loader = new GLTFLoader(); if (context?.loader?.dracoLoader) loader.setDRACOLoader(context.loader.dracoLoader);
  trace('parse-start', { cacheUrl, fetchUrlKind:blob ? 'blob-url' : 'direct-url' }); mark(cacheUrl, 72, 'loading', { phase:'parse-start' });
  const started = performance.now(), gltf = await withTimeout(loader.loadAsync(fetchUrl), cacheUrl);
  if (blob && fetchUrl.startsWith('blob:')) URL.revokeObjectURL(fetchUrl);
  if (!gltf) { LoaderMonitor.logLoad('GLTF', cacheUrl, 'ABORTED'); trace('parse-null', { cacheUrl }); mark(cacheUrl, 96, 'failed', { phase:'parse-null' }); return null; }
  const report = inspectGltf(gltf, cacheUrl), summary = compact(report);
  trace('parse-complete', { cacheUrl, elapsedMs:Math.round(performance.now() - started), ...summary });
  mark(cacheUrl, 100, 'ready', { phase:'parse-complete', modelReport:summary }); LoaderMonitor.logLoad('GLTF', cacheUrl, 'VESSEL_SOLIDIFIED'); return gltf;
}
function stackText(error) { return String(error?.stack || '').split('\\n').slice(0, 5).join(' | '); }
export default class GLTFLoaderVessel {
  static async load(url, context) {
    if (!url) { LoaderMonitor.logLoad('GLTF', 'null', 'ABORTED'); trace('aborted-null-url'); return null; }
    const cacheUrl = canonicalGltfUrl(url); trace('request', { originalUrl:url, cacheUrl }); mark(cacheUrl, 5, 'loading', { phase:'request' });
    if (LoaderStateMap.hasCache(cacheUrl)) { trace('state-cache-hit', { cacheUrl }); mark(cacheUrl, 100, 'ready', { phase:'state-cache-hit' }); return await LoaderStateMap.getCache()[cacheUrl]; }
    LoaderMonitor.logLoad('GLTF', cacheUrl, 'STARTING_THE_DESCENT');
    const loadProcess = async () => {
      try {
        let blob = null; try { blob = await AssetCache.get(cacheUrl); } catch (error) { trace('cache-get-skipped', { cacheUrl, reason:error?.message || String(error) }); }
        let fetchUrl = cacheUrl;
        if (blob) { LoaderMonitor.logLoad('GLTF', cacheUrl, 'LOCATED_IN_MEMORY'); trace('cache-blob-hit', { cacheUrl, size:blob.size, type:blob.type }); mark(cacheUrl, 55, 'loading', { phase:'cache-hit' }); fetchUrl = URL.createObjectURL(blob); }
        else { LoaderMonitor.logLoad('GLTF', cacheUrl, 'PULLING_FROM_NETWORK'); blob = await fetchBlob(cacheUrl); if (blob) fetchUrl = URL.createObjectURL(blob); }
        return await parse(cacheUrl, fetchUrl, blob, context);
      } catch (error) {
        LoaderMonitor.logLoad('GLTF', cacheUrl, 'SHATTERED_VESSEL');
        trace('load-failed', { cacheUrl, name:error?.name, reason:error?.message || String(error), stack:stackText(error) });
        registry().fail(`model:${cacheUrl}`, error, { data:{ url:cacheUrl } }); console.error('B"H - 🚨 Mesh Manifestation Failed:', error); return null;
      }
    };
    const activePromise = loadProcess(); LoaderStateMap.setCache(cacheUrl, activePromise); return await activePromise;
  }
}
