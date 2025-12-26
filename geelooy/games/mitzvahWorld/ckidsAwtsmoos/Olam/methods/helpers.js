
// B"H
import * as THREE from '/games/scripts/build/three.module.js';
import Utils from '../../utils.js'
import { GLTFLoader } from '/games/scripts/jsm/loaders/GLTFLoader.js';
import ShlichusHandler from "../../shleechoosHandler.js";

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
        var icon;
        try {
            // B"H: Dynamic import removes the initialization bottleneck
            const AWTSMOOS = await import('../../awtsmoosCkidsGames.js');
            
            if(type && typeof(type) == "string") {
                var collectableItem = AWTSMOOS[type];
                if(collectableItem) {
                    var ty = collectableItem.iconId;
                    if(ty) {
                        icon = ty;
                    }
                }
            }
            var iconData = null;
            if(typeof(icon) == "string") {
                try {
                    var iconic = await import("../../../icons/items/"+ icon+".js")
                    if(iconic && iconic.default) {
                        iconData = iconic.default
                    }
                } catch(e){
                    return null;
                }
            }
            return iconData
        } catch(e) {
            console.error("B\"H Error loading icon type:", e);
            return null;
        }
    }
}
