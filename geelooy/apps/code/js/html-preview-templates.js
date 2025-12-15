
// B"H
// FILE: js/html-preview-templates.js

export const SHIM_SCRIPT = /*js*/`
    (function() {
        // B"H - Double Buffering Shim (Recursion Fixed)
        const _getContext = HTMLCanvasElement.prototype.getContext;
        const _rAF = window.requestAnimationFrame;
        const canvasMap = new WeakMap();

        HTMLCanvasElement.prototype.getContext = function(type, options) {
            if (type !== '2d') return _getContext.call(this, type, options);
            
            // 1. Get the Real Context
            const realCtx = _getContext.call(this, type, options);
            
            // 2. Create Offscreen Canvas
            const offscreen = document.createElement('canvas');
            offscreen.width = this.width; 
            offscreen.height = this.height;
            
            // 3. Get Offscreen Context (CRITICAL: Use _getContext.call to bypass recursion)
            const offCtx = _getContext.call(offscreen, '2d');
            
            canvasMap.set(this, { offscreen, offCtx, realCtx });
            
            // 4. Return Proxy to intercept draws
            return new Proxy(offCtx, {
                get(t, p) { 
                    if (p === 'canvas') return realCtx.canvas;
                    const val = t[p];
                    if (typeof val === 'function') {
                        // Bind methods to the offscreen context to prevent Illegal Invocation
                        return val.bind(t);
                    }
                    return val;
                },
                set(t, p, v) { 
                    if (p === 'width' || p === 'height') {
                        offscreen[p] = v;
                        realCtx.canvas[p] = v; // Sync real canvas size too
                    }
                    t[p] = v; 
                    return true; 
                }
            });
        };

        window.requestAnimationFrame = function(cb) {
            // Blit phase: Copy offscreen buffers to real canvases
            const canvases = document.getElementsByTagName('canvas');
            for(let cvs of canvases) {
                const data = canvasMap.get(cvs);
                if(data && cvs.width > 0 && cvs.height > 0) {
                    const { offscreen, realCtx } = data;
                    
                    // Sync dimensions if they drifted
                    if(offscreen.width !== cvs.width) offscreen.width = cvs.width;
                    if(offscreen.height !== cvs.height) offscreen.height = cvs.height;
                    
                    // Clear and Draw
                    realCtx.clearRect(0, 0, cvs.width, cvs.height);
                    realCtx.drawImage(offscreen, 0, 0);
                }
            }
            return _rAF(cb);
        };
    })();
`;

export const getBootstrapScript = (absoluteBase, SDK_PATH, userScripts, workspaceId) => /*js*/`
    (function() {
        const initMerkava = async function() {
            // B"H - Merkava Bootstrap
            // FORCE BASE PATH for module loading
            window.MERKAVA_OVERRIDE_BASE_PATH = "${absoluteBase}";
            const WORKSPACE_ID = "${workspaceId}"; 
            
            const SDK_URL = "${SDK_PATH}";
            
            // 1. Load SDK
            const sdkBlob = await fetch(SDK_URL).then(r => r.blob());
            const sdkUrl = URL.createObjectURL(sdkBlob);
            await new Promise((resolve, reject) => {
                const s = document.createElement('script');
                s.src = sdkUrl;
                s.onload = resolve;
                s.onerror = reject;
                document.head.appendChild(s);
            });

            if (!window.Merkava) {
                console.error("Merkava SDK failed to load.");
                return;
            }

            await window.Merkava.init();

            const scripts = ${JSON.stringify(userScripts)};

            // 2. Execute User Scripts
            for (const script of scripts) {
                try {
                    // Console Bridge
                    const hostAPI = {
                        0: (...args) => {
                            console.log(...args);
                            // Send to parent console tab
                            window.parent.postMessage({
                                source: 'html-preview-console', 
                                type: 'log', 
                                payload: { level: 'log', args: args }
                            }, '*');
                        }
                    };

                    // B"H - Import Resolver Bridge
                    const importResolver = async (specifier) => {
                        // Debug log for imports
                        // if (hostAPI[0]) hostAPI[0]("[VM] Resolving Import: " + specifier);
                        return new Promise((resolve, reject) => {
                            const id = Math.random().toString(36).slice(2);
                            const handler = (e) => {
                                if (e.data.type === 'import-response' && e.data.id === id) {
                                    window.removeEventListener('message', handler);
                                    if (e.data.error) reject(new Error(e.data.error));
                                    else resolve(e.data.content);
                                }
                            };
                            window.addEventListener('message', handler);
                            
                            window.parent.postMessage({
                                source: 'html-preview-bridge',
                                type: 'import-request',
                                specifier: specifier,
                                referrer: script.path,
                                workspaceId: WORKSPACE_ID,
                                id: id
                            }, '*');
                        });
                    };

                    await window.Merkava.run(script.content, {
                        context: window,
                        hostAPI: hostAPI,
                        importResolver: importResolver
                    });
                } catch(e) {
                    console.error("Runtime Error:", e);
                    const errDiv = document.createElement('div');
                    errDiv.style.cssText = "position:fixed; top:0; left:0; right:0; background:rgba(50,0,0,0.9); color:#ffaaaa; padding:10px; border-bottom:2px solid red; font-family:monospace; z-index:99999;";
                    errDiv.innerText = "Runtime Error: " + e.message;
                    document.body.appendChild(errDiv);
                }
            }
        };

        // B"H - Wait for external scripts (CDN libs) to load before igniting the VM
        if (document.readyState === 'complete') {
            initMerkava();
        } else {
            window.addEventListener('load', initMerkava);
        }
    })();
`;
