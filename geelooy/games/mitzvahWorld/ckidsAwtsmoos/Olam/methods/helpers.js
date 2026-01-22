// B"H
import * as THREE from '/games/scripts/build/three.module.js';
import Utils from '../../utils.js'
import { GLTFLoader } from '/games/scripts/jsm/loaders/GLTFLoader.js';
import ShlichusHandler from "../../systems/quests/ShlichusHandler.js";
import { ITEM_REGISTRY } from '../../systems/inventory/data/registry.js';

/**
 * Helpers - The practical vessels that facilitate the manifestation of the Olam.
 * Integrated loading and transform utilities.
 */
export default class {
    /**
     * $gc - Sacred alias for getComponent.
     */
    $gc(shaym) {
        return this.getComponent(shaym);
    }
    
    /**
     * B"H
     * loadGLTF - Brings a complex form into the world.
     * @param {string} url 
     */
    async loadGLTF(url) {
        try {
            const gltf = await (new GLTFLoader().loadAsync(url));
            return gltf;
        } catch(e) {
            console.log(e);
            return null;
        }
    }

    /**
     * B"H
     * loadTexture - Draws a texture from the infinite potential into the physical world.
     * Re-engineered for Worker compatibility by using native createImageBitmap,
     * bypassing all document dependencies.
     * @param {Object} options
     */
    async loadTexture({ url, shouldRepeat = false, repeatX = 1, repeatY = 1 }) {
        if (!url) return null;

        try {
            /**
             * B"H: Native Vessel Loading
             * We fetch the raw bytes and manifest an ImageBitmap directly.
             */
            const response = await fetch(url);
            if (!response.ok) throw new Error("B\"H: Texture fetch failed.");
            
            const blob = await response.blob();
            
            /**
             * B"H: Orientation is key.
             * Three.js standard UVs expect flipped Y for bitmaps.
             */
            const imageBitmap = await createImageBitmap(blob, { imageOrientation: 'flipY' });

            const texture = new THREE.Texture(imageBitmap);
            
            if (shouldRepeat) {
                texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
                texture.repeat.set(repeatX, repeatY);
            }
            
            texture.needsUpdate = true;
            return texture;
        } catch (err) {
            console.warn('B"H: Worker texture manifestation failed:', url, err);
            return null;
        }
    }

    /**
     * B"H
     * serialize - Converts the state of the world into a portable essence.
     */
    serialize() {
        super.serialize();
        this.serialized = {
            ...this.serialized,
            nivrayim: this.nivrayim.map(q=>q.serialize())
        };
        return this.serialized;
    }

    /**
     * B"H
     * getForwardVector - Determines the path ahead.
     */
    getForwardVector() {
        return Utils.getForwardVector(
            this.ayin.camera,
            this.cameraObjectDirection
        )
    }

    /**
     * B"H
     * getSideVector - Determines the lateral potential.
     */
    getSideVector() {
        return Utils.getSideVector(
            this.ayin.cameraFollower,
            this.cameraObjectDirection
        )
    }

    /**
     * B"H
     * refreshCameraAspect - Adjusts the visual lens to the dimensions of the vessel.
     */
    refreshCameraAspect() {
        if(!this.activeCamera) {
            if(this.ayin) {
                this.ayin.setSize(this.width, this.height);
            }
        } else {
            this.activeCamera.aspect = this.width / this.height;
            this.activeCamera.updateProjectionMatrix();
        }
    }

    /**
     * B"H
     * startShlichusHandler - Ignites the mission system.
     */
    startShlichusHandler() {
        this.shlichusHandler = new ShlichusHandler(this); 
    }

    /**
     * B"H
     * go - Directs data to its intended destination.
     */
    go(ob, id=this.official) {
        if(!Array.isArray(ob)) {
            return ob;
        }
        var f = ob.find(w=>(w?w[id]:null))
        if(f) delete f[id]
        return f
    }

    /**
     * B"H
     * fetchGetSize - Measures the magnitude of an external resource.
     * Silent dummy for rapid manifestation.
     */
    async fetchGetSize(url) {
        return 1024;
    }

    /**
     * B"H
     * fetchWithProgress - Fetches with awareness of the journey.
     */
    async fetchWithProgress(url, options = {}, otherOptions) {
        var {onProgress} = otherOptions;
        var headers = options?.headers || {};
        if(!options) options = {};
        options.headers = { ...headers };
        
        const response = await fetch(url, { ...options });
    
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
    
        const contentLength = response.headers.get('Content-Length');
        const total = contentLength ? parseInt(contentLength, 10) : null;
        let loaded = 0;
    
        const reader = response.body.getReader();
        let chunks = [];
        let result = await reader.read();
    
        while (!result.done) {
            loaded += result.value.length;
            chunks.push(result.value);
    
            if (onProgress && total !== null) {
                await onProgress(loaded / total);
            }
            result = await reader.read();
        }
        
        return {
            ...response,
            ok: true,
            blob() {
                const arrayBuffer = new Uint8Array(chunks.reduce((acc, chunk) => acc.concat(Array.from(chunk)), [])).buffer;
                const blob = new Blob([arrayBuffer], { type: response.headers.get('Content-Type') });
                return blob;
            },
            text() {
                const decoder = new TextDecoder();
                const arrayBuffer = new Uint8Array(chunks.reduce((acc, chunk) => acc.concat(Array.from(chunk)), []));
                return decoder.decode(arrayBuffer);
            }
        };
    }
    
    /**
     * B"H
     * callMethods - Invokes the powers of a vessel dynamically.
     */
    callMethods(baseObj, methods) {
        if(!baseObj || !methods) return null;
        if(typeof(methods) != "object") return null;
        
        var k = Object.keys(methods);
        for(var key of k) {
            var args = [];
            if(Array.isArray(methods[key])) {
                args = methods[key];
            } else {
                args.push(methods[key]);
            }
            baseObj?.[key]?.(...args);
        }
    }

    /**
     * B"H
     * getIconFromType - Extracts the visual symbol of a class.
     */
    async getIconFromType(type) {
        try {
            if(type && typeof(type) == "string") {
                const itemData = ITEM_REGISTRY[type];
                if(itemData && itemData.icon) {
                     // Check if it's a data URI or SVG string
                     if (itemData.icon.startsWith("data:") || itemData.icon.startsWith("<svg")) {
                         return itemData.icon;
                     }
                     // If it's a path to a module (legacy), try to load default export
                     if (itemData.icon.endsWith(".js")) {
                         const mod = await import(itemData.icon);
                         return mod.default;
                     }
                     return itemData.icon;
                }
            }
            return null;
        } catch(e) {
            console.error("B\"H Error loading icon type:", e);
            return null;
        }
    }
}
