// B"H
import AssetCache from '../../../../utils/assetCache/index.js';
import LoaderMonitor from './LoaderMonitor.js';
import LoaderStateMap from './LoaderStateMap.js';

const GLTF_LOAD_TIMEOUT_MS = 30000;
const GLTF_FETCH_TIMEOUT_MS = 25000;

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
        
        if (LoaderStateMap.hasCache(url)) {
            return await LoaderStateMap.getCache()[url];
        }

        LoaderMonitor.logLoad("GLTF", url, "STARTING_THE_DESCENT");

        const loadProcess = async () => {
            try {
                let blob = await AssetCache.get(url);
                let fetchUrl = url;

                if (blob) {
                    LoaderMonitor.logLoad("GLTF", url, "LOCATED_IN_MEMORY");
                    fetchUrl = URL.createObjectURL(blob);
                } else {
                    LoaderMonitor.logLoad("GLTF", url, "PULLING_FROM_NETWORK");
                    blob = await fetchAndRememberBlob(url);
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
                const gltf = await withLoadTimeout(loader.loadAsync(fetchUrl), url);
                
                // B"H: silent


                if (blob) URL.revokeObjectURL(fetchUrl);

                if (!gltf) {
                    LoaderMonitor.logLoad("GLTF", url, "ABORTED");
                    return null;
                }

                LoaderMonitor.logLoad("GLTF", url, "VESSEL_SOLIDIFIED");
                return gltf;
            } catch(e) {
                LoaderMonitor.logLoad("GLTF", url, "SHATTERED_VESSEL");
                console.error("B\"H - 🚨 Mesh Manifestation Failed:", e);
                return null;
            }
        };

        const activePromise = loadProcess();
        LoaderStateMap.setCache(url, activePromise);
        
        return await activePromise;
    }
}
