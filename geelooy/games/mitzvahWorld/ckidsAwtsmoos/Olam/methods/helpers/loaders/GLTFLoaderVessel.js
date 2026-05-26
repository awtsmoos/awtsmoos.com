// B"H
import LoaderMonitor from './LoaderMonitor.js';
import LoaderStateMap from './LoaderStateMap.js';

/**
 * B"H
 * @class GLTFLoaderVessel
 * @description
 * Direct Three.js GLTF loading vessel. No AssetCache, no Blob URL, no indirect
 * binary rewriting. The only cache here is the existing promise cache keyed by
 * the exact URL, so duplicate NPC/player requests share one network descent.
 */
export default class GLTFLoaderVessel {
    /**
     * B"H
     * Loads a GLTF/GLB through the standard local Three.js GLTFLoader file.
     *
     * @param {string} url
     * Verified model URL.
     * @param {object} context
     * Olam context, optionally carrying dracoLoader.
     * @returns {Promise<object|null>}
     * GLTF object or null on failure.
     */
    static async load(url, context) {
        if (!url) {
            LoaderMonitor.logLoad("GLTF", "null", "ABORTED");
            return null;
        }

        if (LoaderStateMap.hasCache(url)) {
            return await LoaderStateMap.getCache()[url];
        }

        const loadProcess = async () => {
            try {
                LoaderMonitor.logLoad("GLTF", url, "STARTING_DIRECT_THREE_LOADER");

                const { GLTFLoader } = await import('/games/scripts/jsm/loaders/GLTFLoader.js');
                const loader = new GLTFLoader();

                if (context?.loader?.dracoLoader) {
                    loader.setDRACOLoader(context.loader.dracoLoader);
                } else if (context?.dracoLoader) {
                    loader.setDRACOLoader(context.dracoLoader);
                }

                const gltf = await loader.loadAsync(url);
                LoaderMonitor.logLoad("GLTF", url, "DONE");
                return gltf;
            } catch (error) {
                delete LoaderStateMap.getCache()[url];
                LoaderMonitor.logLoad("GLTF", url, "SHATTERED_VESSEL");
                console.error(`B"H - GLTF direct load failed for [${url}]`, error);
                return null;
            }
        };

        const activePromise = loadProcess();
        LoaderStateMap.setCache(url, activePromise);
        return await activePromise;
    }
}
