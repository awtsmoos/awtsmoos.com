
/**
 * B"H
 * Olam Initialization module (Angel Thread)
 */
import * as THREE from "/games/mitzvahWorld/systems/three/AwtsmoosThreeGateway.js";

// B"H: ABSOLUTE TIKKUN - The path descends into jsm to find its true manifestation.
import { GLTFLoader } from '/games/scripts/jsm/loaders/GLTFLoader.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
import { DRACOLoader } from '/games/scripts/jsm/loaders/DRACOLoader.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';

export default {
    /**
     * @method setupLoaders
     * @description
     * Establishing the gateways through which external assets enter the Olam.
     */
    setupLoaders() {
        // B"H: silent

        
        const dracoLoader = new DRACOLoader();
        dracoLoader.setDecoderPath('/games/scripts/jsm/loaders/draco/');
        
        // Ensure the draco decoder thread is also being established
        // B"H: silent


        const gltfLoader = new GLTFLoader();
        gltfLoader.setDRACOLoader(dracoLoader);

        /**
         * B"H: Wrapping the load method to provide hyper-visibility
         */
        const originalLoad = gltfLoader.load.bind(gltfLoader);
        gltfLoader.load = (url, onLoad, onProgress, onError) => {
            // B"H: silent

            
            const internalOnProgress = (xhr) => {
                const p = (xhr.loaded / xhr.total * 100).toFixed(1);
                // B"H: silent

                if (onProgress) onProgress(xhr);
            };

            const internalOnLoad = (gltf) => {
                // B"H: silent

                if (onLoad) onLoad(gltf);
            };

            const internalOnError = (err) => {
                console.error(`B"H - 🚨[GLTF_LOAD_ERR]: Gateway failed for [${url}]!`, err);
                if (onError) onError(err);
            };

            return originalLoad(url, internalOnLoad, internalOnProgress, internalOnError);
        };

        this.loader = gltfLoader;
        this.dracoLoader = dracoLoader;
    }
};
