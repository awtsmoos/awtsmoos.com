
// B"H
/**
 * @file console.js
 * @brief The Omniscient Eye of the DevTools Console.
 */

export const ConsoleInterceptor = `
    const origConsole = {
        log: console.log.bind(console), error: console.error.bind(console),
        warn: console.warn.bind(console), info: console.info.bind(console),
        clear: console.clear.bind(console)
    };

    let lastEvalResult = undefined;

    function safeSerialize(data, depth=0, visited=new WeakSet()) {
        if (depth > 4) return { type: 'string', value: '[Max Depth]' };
        if (data === null) return { type: 'null', value: 'null' };
        
        const t = typeof data;
        if (t !== 'object' && t !== 'function') return { type: t, value: String(data) };
        if (visited.has(data)) return { type: 'string', value: '[Circular]' };
        visited.add(data);

        if (t === 'function') return { type: 'function', name: data.name || 'anonymous' };
        
        if (Array.isArray(data)) {
            return { type: 'array', length: data.length, value: data.map(i => safeSerialize(i, depth+1, visited)) };
        }
        if (data instanceof Error) return { type: 'error', name: data.name, message: data.message, stack: data.stack };
        if (data instanceof Element) return { type: 'dom', value: data.tagName.toLowerCase() + (data.id ? '#'+data.id : '') };

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
                source: 'html-preview-bridge',
                type: 'console-log',
                previewTabId: window._AWTSMOOS_TAB_ID,
                payload: { level: method, args: args.map(a => safeSerialize(a)) }
            }, '*');
        };
    });

    window.addEventListener('error', e => console.error(e.error || e.message));
    window.addEventListener('unhandledrejection', e => console.error(e.reason));

    window.addEventListener('message', e => {
        const d = e.data;
        if (d && d.source === 'devtools-bridge' && d.type === 'eval-request') {
            window.$_ = lastEvalResult;
            try {
                // B"H - Execute the will of the user
                const res = window.eval(d.code);
                lastEvalResult = res;
                
                // B"H - Transmit the result back across the bridge
                window.parent.postMessage({
                    source: 'html-preview-bridge', 
                    type: 'eval-response',
                    previewTabId: window._AWTSMOOS_TAB_ID, // CRITICAL: Identify the source tab
                    payload: { id: d.id, result: safeSerialize(res), isError: false }
                }, '*');
            } catch(err) {
                window.parent.postMessage({
                    source: 'html-preview-bridge', 
                    type: 'eval-response',
                    previewTabId: window._AWTSMOOS_TAB_ID,
                    payload: { id: d.id, result: safeSerialize(err), isError: true }
                }, '*');
            }
        }
    });
`;
