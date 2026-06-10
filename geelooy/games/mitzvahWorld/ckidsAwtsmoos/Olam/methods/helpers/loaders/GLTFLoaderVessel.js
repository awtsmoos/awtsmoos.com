// B"H
/**
 * @file GLTFLoaderVessel.js
 * @description
 * Chapter 72: The remote garment must testify.
 *
 * The Awtsmoos does not let `chossid.glb` disappear behind silence. Every gate
 * now reports: canonical URL, fetch status, blob size, parse completion, scene
 * child count, animation count, and failure reason. If the browser refuses the
 * garment, the console will say where.
 */
import AssetCache from '../../../../utils/assetCache/index.js';
import LoaderMonitor from './LoaderMonitor.js';
import LoaderStateMap from './LoaderStateMap.js';

const GLTF_LOAD_TIMEOUT_MS = 30000;
const GLTF_FETCH_TIMEOUT_MS = 25000;
const TRACE_SEAL = 'chossid-model-load-20260610-bh709';

/** @param {string} stage Trace stage. @param {object} payload Trace data. */
function traceModelLoad(stage, payload = {}) {
  const data = { seal: TRACE_SEAL, stage, at: Date.now(), ...payload };
  try {
    globalThis.__AWTSMOOS_MODEL_LOAD_TRACE__ ||= [];
    globalThis.__AWTSMOOS_MODEL_LOAD_TRACE__.push(data);
    globalThis.__AWTSMOOS_MODEL_LOAD_TRACE__ = globalThis.__AWTSMOOS_MODEL_LOAD_TRACE__.slice(-160);
  } catch {}
  console.info('B"H | MODEL_LOAD_TRACE', data);
}

/** @param {string} url Original URL. @returns {string} Canonical URL. */
function canonicalGltfUrl(url) {
  if (typeof url !== 'string') return url;
  try {
    const parsed = new URL(url, self.location?.href || globalThis.location?.href);
    if (parsed.pathname.endsWith('/chossid.glb')) {
      parsed.search = '';
      parsed.hash = '';
      return parsed.href;
    }
  } catch (error) {
    if (url.includes('chossid.glb')) return url.split('?')[0].split('#')[0];
  }
  return url;
}

/** @param {Promise<any>} promise Load promise. @param {string} url URL. @returns {Promise<any|null>} GLTF or null. */
async function withLoadTimeout(promise, url) {
  let timeoutHandle;
  const timeout = new Promise(resolve => {
    timeoutHandle = setTimeout(() => {
      traceModelLoad('parse-timeout', { url, ms: GLTF_LOAD_TIMEOUT_MS });
      console.warn(`B"H - GLTF load timed out after ${GLTF_LOAD_TIMEOUT_MS}ms: ${url}`);
      resolve(null);
    }, GLTF_LOAD_TIMEOUT_MS);
  });
  try { return await Promise.race([promise, timeout]); }
  finally { clearTimeout(timeoutHandle); }
}

/** @param {string} url Remote GLB URL. @returns {Promise<Blob|null>} Blob or null. */
async function fetchAndRememberBlob(url) {
  const controller = new AbortController();
  const timeoutHandle = setTimeout(() => controller.abort(), GLTF_FETCH_TIMEOUT_MS);
  traceModelLoad('fetch-start', { url });
  try {
    const response = await fetch(url, { signal: controller.signal, mode: 'cors' });
    traceModelLoad('fetch-response', { url, ok: response.ok, status: response.status, type: response.type, contentType: response.headers?.get?.('content-type'), contentLength: response.headers?.get?.('content-length') });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const blob = await response.blob();
    traceModelLoad('fetch-blob', { url, size: blob.size, type: blob.type });
    try { await AssetCache.put(url, blob); }
    catch (error) { traceModelLoad('cache-put-skipped', { url, reason: error?.message || String(error) }); }
    return blob;
  } catch (error) {
    traceModelLoad('fetch-failed-direct-loader-next', { url, reason: error?.message || String(error), name: error?.name });
    console.warn(`B"H - GLTF blob fetch yielded to direct loader for ${url}:`, error?.message || error);
    return null;
  } finally { clearTimeout(timeoutHandle); }
}

/** @param {object} gltf Parsed GLTF. @returns {object} Compact summary. */
function summarizeGltf(gltf) {
  let meshes = 0;
  let skinnedMeshes = 0;
  let vertices = 0;
  gltf?.scene?.traverse?.(child => {
    if (!child?.isMesh && !child?.isSkinnedMesh) return;
    meshes += 1;
    if (child.isSkinnedMesh) skinnedMeshes += 1;
    vertices += Number(child.geometry?.attributes?.position?.count || 0);
  });
  return { hasScene: Boolean(gltf?.scene), sceneChildren: gltf?.scene?.children?.length || 0, meshes, skinnedMeshes, vertices, animations: gltf?.animations?.length || 0, cameras: gltf?.cameras?.length || 0 };
}

export default class GLTFLoaderVessel {
  /** @param {string} url Model URL. @param {object} context Loader context. @returns {Promise<object|null>} GLTF. */
  static async load(url, context) {
    if (!url) {
      LoaderMonitor.logLoad('GLTF', 'null', 'ABORTED');
      traceModelLoad('aborted-null-url');
      return null;
    }
    const cacheUrl = canonicalGltfUrl(url);
    traceModelLoad('request', { originalUrl: url, cacheUrl });
    if (LoaderStateMap.hasCache(cacheUrl)) {
      traceModelLoad('state-cache-hit', { cacheUrl });
      return await LoaderStateMap.getCache()[cacheUrl];
    }
    LoaderMonitor.logLoad('GLTF', cacheUrl, 'STARTING_THE_DESCENT');
    const loadProcess = async () => {
      try {
        let blob = null;
        try { blob = await AssetCache.get(cacheUrl); }
        catch (error) { traceModelLoad('cache-get-skipped', { cacheUrl, reason: error?.message || String(error) }); }
        let fetchUrl = cacheUrl;
        if (blob) {
          LoaderMonitor.logLoad('GLTF', cacheUrl, 'LOCATED_IN_MEMORY');
          traceModelLoad('cache-blob-hit', { cacheUrl, size: blob.size, type: blob.type });
          fetchUrl = URL.createObjectURL(blob);
        } else {
          LoaderMonitor.logLoad('GLTF', cacheUrl, 'PULLING_FROM_NETWORK');
          blob = await fetchAndRememberBlob(cacheUrl);
          if (blob) fetchUrl = URL.createObjectURL(blob);
        }
        const { GLTFLoader } = await import('/games/scripts/jsm/loaders/GLTFLoader.js');
        const loader = new GLTFLoader();
        if (context?.loader?.dracoLoader) loader.setDRACOLoader(context.loader.dracoLoader);
        traceModelLoad('parse-start', { cacheUrl, fetchUrlKind: blob ? 'blob-url' : 'direct-url' });
        const started = performance.now();
        const gltf = await withLoadTimeout(loader.loadAsync(fetchUrl), cacheUrl);
        if (blob && fetchUrl.startsWith('blob:')) URL.revokeObjectURL(fetchUrl);
        if (!gltf) {
          LoaderMonitor.logLoad('GLTF', cacheUrl, 'ABORTED');
          traceModelLoad('parse-null', { cacheUrl });
          return null;
        }
        const summary = summarizeGltf(gltf);
        traceModelLoad('parse-complete', { cacheUrl, elapsedMs: Math.round(performance.now() - started), ...summary });
        LoaderMonitor.logLoad('GLTF', cacheUrl, 'VESSEL_SOLIDIFIED');
        return gltf;
      } catch (error) {
        LoaderMonitor.logLoad('GLTF', cacheUrl, 'SHATTERED_VESSEL');
        traceModelLoad('load-failed', { cacheUrl, name: error?.name, reason: error?.message || String(error), stack: String(error?.stack || '').split('\n').slice(0, 5).join(' | ') });
        console.error('B"H - 🚨 Mesh Manifestation Failed:', error);
        return null;
      }
    };
    const activePromise = loadProcess();
    LoaderStateMap.setCache(cacheUrl, activePromise);
    return await activePromise;
  }
}
