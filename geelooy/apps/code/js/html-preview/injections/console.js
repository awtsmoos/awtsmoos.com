₪₪₪_בס\"ד_תחילת_הקוד_₪₪₪
// B"H
/**
 * @file console.js
 * @brief The Omniscient Eye with deep object insight and absolute syntax safety.
 */

export const ConsoleInterceptor = `
    (function() {
        const origConsole = {
            log: console.log.bind(console), error: console.error.bind(console),
            warn: console.warn.bind(console), info: console.info.bind(console),
            clear: console.clear.bind(console)
        };

        console.log("%cB\"H - Console Interceptor Active.", "color: #00f6ff; font-weight: bold;");

        let lastEvalResult = undefined;
        let selectedPath = null;

        function getElementPath(el) {
            const path = [];
            while (el && el !== document.documentElement) {
                const parent = el.parentNode;
                if (!parent) break;
                const index = Array.prototype.indexOf.call(parent.childNodes, el);
                path.unshift(index);
                el = parent;
            }
            return path;
        }

        function resolvePath(path) {
            if (!path || !Array.isArray(path)) return null;
            return path.reduce((curr, idx) => (curr && curr.childNodes) ? curr.childNodes[idx] : null, document.documentElement);
        }

        /**
         * B"H - Safe Serializer for the Void
         * Converts complex, non-serializable objects into JSON blueprints for the UI.
         */
        function safeSerialize(data, depth=0, visited=new WeakSet()) {
            if (depth > 8) return { type: 'string', value: '[Depth Limit]' };
            if (data === null) return { type: 'null', value: 'null' };
            const t = typeof data;
            
            if (t !== 'object' && t !== 'function') {
                if (t === 'bigint') return { type: 'bigint', value: data.toString() + 'n' };
                return { type: t, value: String(data) };
            }
            
            if (visited.has(data)) return { type: 'string', value: '[Circular]' };
            visited.add(data);
            
            if (t === 'function') {
                return { type: 'function', name: data.name || 'anonymous', signature: 'ƒ' };
            }
            
            if (Array.isArray(data)) return { type: 'array', length: data.length, value: data.map(i => safeSerialize(i, depth+1, visited)) };
            if (data instanceof Error) return { type: 'error', name: data.name, message: data.message, stack: data.stack };
            if (data instanceof Date) return { type: 'date', value: data.toISOString() };
            if (data instanceof RegExp) return { type: 'regexp', value: String(data) };
            if (data instanceof Promise) return { type: 'promise', value: 'Promise' };
            
            if (data instanceof Element) {
                return { 
                    type: 'dom', 
                    value: data.tagName.toLowerCase() + (data.id ? '#'+data.id : '') + (data.className ? '.'+data.className.split(' ').join('.') : ''),
                    path: getElementPath(data)
                };
            }

            const props = [];
            for (let k in data) { 
                try { props.push({ key: k, value: safeSerialize(data[k], depth+1, visited) }); } catch(e){} 
            }
            return { type: 'object', constructorName: data.constructor?.name || 'Object', properties: props };
        }

        // Bridge every console call back to the Editor's DevTools
        Object.keys(origConsole).forEach(method => {
            console[method] = (...args) => {
                origConsole[method](...args);
                window.parent.postMessage({
                    source: 'html-preview-bridge', type: 'console-log',
                    previewTabId: window._AWTSMOOS_TAB_ID,
                    payload: { level: method, args: args.map(a => safeSerialize(a)), timestamp: Date.now() }
                }, '*');
            };
        });
        
        // CATCH-ALL FOR ERRORS: Let the HTML render, but warn the heavens.
        window.addEventListener('error', e => {
            const err = e.error || { message: e.message, stack: "" };
            console.error(\`[B"H Runtime Error] \${err.message}\`, err);
        });

        window.addEventListener('unhandledrejection', e => {
            console.error('[B"H Promise Rejection]', e.reason);
        });

        window.addEventListener('message', e => {
            const d = e.data;
            if (!d) return;
            if (d.type === 'set-selected-path') {
                selectedPath = d.path;
            } else if (d.source === 'devtools-bridge' && d.type === 'eval-request') {
                window.$_ = lastEvalResult;
                window.$0 = resolvePath(selectedPath); 
                try {
                    const res = window.eval(d.code);
                    lastEvalResult = res;
                    window.parent.postMessage({
                        source: 'html-preview-bridge', type: 'eval-response',
                        previewTabId: window._AWTSMOOS_TAB_ID,
                        payload: { id: d.id, result: safeSerialize(res), isError: false }
                    }, '*');
                } catch(err) {
                    window.parent.postMessage({
                        source: 'html-preview-bridge', type: 'eval-response',
                        previewTabId: window._AWTSMOOS_TAB_ID,
                        payload: { id: d.id, result: safeSerialize(err), isError: true }
                    }, '*');
                }
            }
        });
    })();
`;
₪₪₪_בס\"ד_סוף_הקוד_₪₪₪