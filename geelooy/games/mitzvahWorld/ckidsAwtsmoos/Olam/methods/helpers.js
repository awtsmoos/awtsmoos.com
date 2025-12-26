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
     * Hardened to work within workers and handle missing entity contexts.
     */
    loadTexture({ nivra, url, shouldRepeat = false, repeatX = 1, repeatY = 1 }) {
        return new Promise((resolve) => {
            if (!url) return resolve(null);

            let loader;
            // B"H: Attempt to leverage an existing GLTF parser's loader if available
            if (nivra && nivra.asset && nivra.asset.parser && nivra.asset.parser.textureLoader) {
                loader = nivra.asset.parser.textureLoader;
            } else {
                // B"H: Fallback to a universal TextureLoader (works in workers via ImageBitmapLoader)
                loader = new THREE.TextureLoader();
            }

            loader.load(
                url,
                (texture) => {
                    if (shouldRepeat) {
                        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
                        texture.repeat.set(repeatX, repeatY);
                    }
                    texture.needsUpdate = true;
                    resolve(texture);
                },
                undefined,
                (err) => {
                    console.warn('B"H: Error loading texture:', url, err);
                    resolve(null);
                }
            );
        });
    }

    serialize() {
        super.serialize();
        this.serialized = {
            ...this.serialized,
            nivrayim: this.nivrayim.map(q=>q.serialize())
        };
        return this.serialized;
    }

    getForwardVector() {
        return Utils.getForwardVector(
            this.ayin.camera,
            this.cameraObjectDirection
        )
    }

    getSideVector() {
        return Utils.getSideVector(
            this.ayin.cameraFollower,
            this.cameraObjectDirection
        )
    }

    startShlichusHandler() {
        this.shlichusHandler = new ShlichusHandler(this); 
    }

    go(ob, id=this.official) {
        if(!Array.isArray(ob)) {
            return ob;
        }
        var f = ob.find(w=>(w?w[id]:null))
        if(f) delete f[id]
        return f
    }

    async fetchGetSize(url) {
        try {
            const response = await fetch(url, { method: 'HEAD' });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const contentLength = response.headers.get('Content-Length');
            if (!contentLength) {
                throw new Error('Content-Length header not found in response');
            }
            return parseInt(contentLength, 10);
        } catch(e) {
            console.log(e)
            return 0
        }
    }

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