
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

        function safeSerialize(data, depth=0, visited=new WeakSet()) {
            if (depth > 6) return { type: 'string', value: '[Max Depth]' };
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
            
            if (data instanceof Map) {
                const entries = Array.from(data.entries()).map(([k, v]) => [safeSerialize(k, depth+1, visited), safeSerialize(v, depth+1, visited)]);
                return { type: 'map', size: data.size, entries };
            }
            
            if (data instanceof Set) {
                const values = Array.from(data.values()).map(v => safeSerialize(v, depth+1, visited));
                return { type: 'set', size: data.size, values };
            }

            const props = [];
            for (let k in data) { 
                try { props.push({ key: k, value: safeSerialize(data[k], depth+1, visited) }); } catch(e){} 
            }
            return { type: 'object', constructorName: data.constructor?.name || 'Object', properties: props };
        }

        Object.keys(origConsole).forEach(method => {
            console[method] = (...args) => {
                origConsole[method](...args);
                window.parent.postMessage({
                    source: 'html-preview-bridge', type: 'console-log',
                    previewTabId: window._AWTSMOOS_TAB_ID,
                    payload: { level: method, args: args.map(a => safeSerialize(a)) }
                }, '*');
            };
        });
        
        window.addEventListener('error', e => {
            console.error('Uncaught Error:', e.error || e.message);
        });

        window.addEventListener('unhandledrejection', e => {
            console.error('Unhandled Promise Rejection:', e.reason);
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
