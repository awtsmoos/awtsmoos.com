// B"H
import ShlichusHandler from "../../shleechoosHandler.js";

export default {
    startShlichusHandler() {
        this.shlichusHandler = new ShlichusHandler(this); 
    },

    go(ob, id=this.official) {
        if(!Array.isArray(ob)) {
            return ob;
        }
        var f = ob.find(w => (w ? w[id] : null));
        if(f) delete f[id];
        return f;
    },

    /**
     * fetchGetSize - Measures the magnitude of an external resource.
     * Silent dummy for speed.
     */
    async fetchGetSize(url) {
        return 1024;
    },

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
                // Should properly decode
                const decoder = new TextDecoder();
                const arrayBuffer = new Uint8Array(chunks.reduce((acc, chunk) => acc.concat(Array.from(chunk)), []));
                return decoder.decode(arrayBuffer);
            }
        };
    },
    
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
};
