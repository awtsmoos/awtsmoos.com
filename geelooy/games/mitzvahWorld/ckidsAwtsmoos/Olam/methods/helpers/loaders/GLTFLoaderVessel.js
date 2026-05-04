// B"H
import AssetCache from '../../../../utils/assetCache/index.js';
import LoaderMonitor from './LoaderMonitor.js';
import LoaderStateMap from './LoaderStateMap.js';

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
                const gltf = await loader.loadAsync(fetchUrl);
                
                // B"H: silent


                if (blob) URL.revokeObjectURL(fetchUrl);

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