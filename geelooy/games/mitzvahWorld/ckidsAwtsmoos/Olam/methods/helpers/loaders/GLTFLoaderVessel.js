// B"H
import AssetCache from '../../../../utils/assetCache/index.js';
import LoaderMonitor from './LoaderMonitor.js';
import LoaderStateMap from './LoaderStateMap.js';

const GLTF_LOAD_TIMEOUT_MS = 30000;
const GLTF_FETCH_TIMEOUT_MS = 25000;

function canonicalGltfUrl(url) {
    if (typeof url !== "string") return url;

    try {
        const parsed = new URL(url, self.location?.href || globalThis.location?.href);
        if (parsed.pathname.endsWith("/chossid.glb")) {
            parsed.search = "";
            parsed.hash = "";
            return parsed.href;
        }
    } catch (error) {
        if (url.includes("chossid.glb")) return url.split("?")[0].split("#")[0];
    }

    return url;
}

/**
 * B"H
 * Chapter: The Model Gate With a Living Clock.
 *
 * GLTFLoader can wait forever when a remote asset server withholds its answer.
 * The Awtsmoos breathes worlds into being every instant; the renderer therefore
 * needs a merciful gate that opens, or yields to a simple fallback body, without
 * freezing the entire worker behind a black-blue veil.
 *
 * @param {Promise<any>} promise
 * Pending loader promise.
 *
 * @param {string} url
 * Asset URL being loaded.
 *
 * @returns {Promise<any|null>}
 * Loaded GLTF object, or null when the clock expires.
 */
async function withLoadTimeout(promise, url) {
    let timeoutHandle;
    const timeout = new Promise(resolve => {
        timeoutHandle = setTimeout(() => {
            console.warn(
                `B"H - GLTF load timed out after ${GLTF_LOAD_TIMEOUT_MS}ms: ${url}`
            );
            resolve(null);
        }, GLTF_LOAD_TIMEOUT_MS);
    });

    try {
        return await Promise.race([promise, timeout]);
    } finally {
        clearTimeout(timeoutHandle);
    }
}

/**
 * B"H
 * Chapter: One Descent, Many Garments.
 *
 * The same chossid.glb must not be requested by every resident like scattered
 * sparks forgetting their root. This fetches the binary once, stores it in the
 * browser cache when possible, and hands GLTFLoader a blob URL to parse.
 *
 * @param {string} url
 * Remote GLB URL.
 *
 * @returns {Promise<Blob|null>}
 * Binary GLB blob, or null if the network gate refuses.
 */
async function fetchAndRememberBlob(url) {
    const controller = new AbortController();
    const timeoutHandle = setTimeout(() => controller.abort(), GLTF_FETCH_TIMEOUT_MS);

    try {
        const response = await fetch(url, { signal: controller.signal, mode: "cors" });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        const blob = await response.blob();
        await AssetCache.put(url, blob);
        return blob;
    } catch (error) {
        console.warn(`B"H - GLTF blob fetch yielded to direct loader for ${url}:`, error?.message || error);
        return null;
    } finally {
        clearTimeout(timeoutHandle);
    }
}

/**
 * B"H
 * @class GLTFLoaderVessel
 */
export default class GLTFLoaderVessel {
    static async load(url, context) {
        if (!url) {
            LoaderMonitor.logLoad("GLTF", "null", "ABORTED");
            return null;
        }
        
        const cacheUrl = canonicalGltfUrl(url);
        
        if (LoaderStateMap.hasCache(cacheUrl)) {
            return await LoaderStateMap.getCache()[cacheUrl];
        }

        LoaderMonitor.logLoad("GLTF", cacheUrl, "STARTING_THE_DESCENT");

        const loadProcess = async () => {
            try {
                let blob = await AssetCache.get(cacheUrl);
                let fetchUrl = cacheUrl;

                if (blob) {
                    LoaderMonitor.logLoad("GLTF", cacheUrl, "LOCATED_IN_MEMORY");
                    fetchUrl = URL.createObjectURL(blob);
                } else {
                    LoaderMonitor.logLoad("GLTF", cacheUrl, "PULLING_FROM_NETWORK");
                    blob = await fetchAndRememberBlob(cacheUrl);
                    if (blob) fetchUrl = URL.createObjectURL(blob);
                }

                const { GLTFLoader } = await import('/games/scripts/jsm/loaders/GLTFLoader.js');
                const loader = new GLTFLoader();
                
                if (context && context.loader && context.loader.dracoLoader) {
                    loader.setDRACOLoader(context.loader.dracoLoader);
                }
                
                // B"H: silent

                const _tLoad = performance.now();
                
                // This parses the GLB binary. 
                // If it hangs here without errors, it implies WebGL/Draco stall.
                const gltf = await withLoadTimeout(loader.loadAsync(fetchUrl), cacheUrl);
                
                // B"H: silent


                if (blob) URL.revokeObjectURL(fetchUrl);

                if (!gltf) {
                    LoaderMonitor.logLoad("GLTF", cacheUrl, "ABORTED");
                    return null;
                }

                LoaderMonitor.logLoad("GLTF", cacheUrl, "VESSEL_SOLIDIFIED");
                return gltf;
            } catch(e) {
                LoaderMonitor.logLoad("GLTF", cacheUrl, "SHATTERED_VESSEL");
                console.error("B\"H - 🚨 Mesh Manifestation Failed:", e);
                return null;
            }
        };

        const activePromise = loadProcess();
        LoaderStateMap.setCache(cacheUrl, activePromise);
        
        return await activePromise;
    }
}
