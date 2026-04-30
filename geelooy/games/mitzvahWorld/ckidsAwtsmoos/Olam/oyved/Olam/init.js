
/**
 * B"H
 * Olam Initialization module (Angel Thread)
 */
import * as THREE from '/games/scripts/build/three.module.js';
import { GLTFLoader } from '/games/scripts/loaders/GLTFLoader.js';
import { DRACOLoader } from '/games/scripts/loaders/DRACOLoader.js';

export default {
    /**
     * @method setupLoaders
     * @description
     * Establishing the gateways through which external assets enter the Olam.
     */
    setupLoaders() {
        console.log("B\"H - 🔋 [LOADERS]: Calibrating GLTF Gateways.");
        
        const dracoLoader = new DRACOLoader();
        dracoLoader.setDecoderPath('/games/scripts/loaders/draco/');
        
        // Ensure the draco decoder thread is also being established
        console.log("B\"H - 🔋 [LOADERS]: Draco path set to /games/scripts/loaders/draco/");

        const gltfLoader = new GLTFLoader();
        gltfLoader.setDRACOLoader(dracoLoader);

        /**
         * B"H: Wrapping the load method to provide hyper-visibility
         */
        const originalLoad = gltfLoader.load.bind(gltfLoader);
        gltfLoader.load = (url, onLoad, onProgress, onError) => {
            console.log(`B"H - 📥 [GLTF_LOAD]: Opening gateway for asset: [${url}]`);
            
            const internalOnProgress = (xhr) => {
                const p = (xhr.loaded / xhr.total * 100).toFixed(1);
                console.log(`B"H - 📥 [GLTF_LOAD_PROG]: [${url}] -> ${p}%`);
                if (onProgress) onProgress(xhr);
            };

            const internalOnLoad = (gltf) => {
                console.log(`B"H - ✅ [GLTF_LOAD_DONE]: Asset [${url}] successfully manifest in worker memory.`);
                if (onLoad) onLoad(gltf);
            };

            const internalOnError = (err) => {
                console.error(`B"H - 🚨 [GLTF_LOAD_ERR]: Gateway failed for [${url}]!`, err);
                if (onError) onError(err);
            };

            return originalLoad(url, internalOnLoad, internalOnProgress, internalOnError);
        };

        this.loader = gltfLoader;
        this.dracoLoader = dracoLoader;
    }
};
