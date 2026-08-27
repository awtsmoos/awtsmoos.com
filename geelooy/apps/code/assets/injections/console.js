
(function() {
    const origConsole = {
        log: console.log.bind(console), 
        error: console.error.bind(console),
        warn: console.warn.bind(console), 
        info: console.info.bind(console),
        clear: console.clear.bind(console)
    };

    origConsole.log("%cB\"H - Vision Established. Console Interceptor Active.", "color: #a8ff00; font-weight: bold;");

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
        try {
            return path.reduce((curr, idx) => (curr && curr.childNodes) ? curr.childNodes[idx] : null, document.documentElement);
        } catch(e) { return null; }
    }

    function safeSerialize(data, depth=0, visited=new WeakSet()) {
        if (depth > 8) return { type: "string", value: "[Depth Limit]" };
        if (data === null || data === undefined) return { type: "null", value: String(data) };
        const t = typeof data;
        if (t !== "object" && t !== "function") {
            if (t === "bigint") return { type: "bigint", value: data.toString() + "n" };
            return { type: t, value: String(data) };
        }
        if (visited.has(data)) return { type: "string", value: "[Circular]" };
        visited.add(data);
        if (t === "function") return { type: "function", name: data.name || "anonymous", signature: "ƒ" };
        if (Array.isArray(data)) return { type: "array", length: data.length, value: data.map(i => safeSerialize(i, depth+1, visited)) };
        if (data instanceof Error) return { type: "error", name: data.name, message: data.message, stack: data.stack };
        if (data instanceof Date) return { type: "date", value: data.toISOString() };
        if (data instanceof RegExp) return { type: "regexp", value: String(data) };
        if (data instanceof Element) {
            return { 
                type: "dom", 
                value: data.tagName.toLowerCase() + (data.id ? "#"+data.id : "") + (data.className ? "."+data.className.split(" ").join(".") : ""),
                path: getElementPath(data)
            };
        }
        const props = [];
        for (let k in data) { 
            try { 
                const desc = Object.getOwnPropertyDescriptor(data, k);
                if (desc && (desc.get || desc.set)) {
                     props.push({ key: k, value: { type: "string", value: "[Getter/Setter]" } });
                } else {
                     props.push({ key: k, value: safeSerialize(data[k], depth+1, visited) }); 
                }
            } catch(e){} 
        }
        return { type: "object", constructorName: data.constructor?.name || "Object", properties: props };
    }

    Object.keys(origConsole).forEach(method => {
        console[method] = (...args) => {
            origConsole[method](...args);
            window.parent.postMessage({
                source: "html-preview-bridge", 
                type: "console-log",
                previewTabId: window._AWTSMOOS_TAB_ID,
                payload: { 
                    level: method, 
                    args: args.map(a => safeSerialize(a)), 
                    timestamp: Date.now() 
                }
            }, "*");
        };
    });

    function announceExistence() {
        if (!document.documentElement) return;
        window.parent.postMessage({
            source: "html-preview-bridge",
            type: "dom-update",
            previewTabId: window._AWTSMOOS_TAB_ID,
            payload: { html: document.documentElement.outerHTML }
        }, "*");
    }

    window.addEventListener("message", e => {
        const d = e.data;
        if (!d) return;

        // B"H - LOUD DIAGNOSTICS FOR THE SANDBOX EAR
        if (d.type === "eval-request") {
            origConsole.log(`%cB"H [Sandbox] Received Eval Request [${d.id}]: ${d.code}`, "color: #ff00ff; font-weight: bold;");
        }

        if (d.type === "request-dom") {
            announceExistence();
        } else if (d.type === "set-selected-path") {
            selectedPath = d.path;
        } else if (d.source === "devtools-bridge" && d.type === "eval-request") {
            // Set up special REPL variables
            window.$_ = lastEvalResult;
            window.$0 = resolvePath(selectedPath); 
            
            try {
                // Execute the word
                const res = window.eval(d.code);
                lastEvalResult = res;

                origConsole.log(`%cB"H [Sandbox] Eval Success. Result:`, "color: #a8ff00;", res);

                window.parent.postMessage({
                    source: "html-preview-bridge", 
                    type: "eval-response",
                    previewTabId: window._AWTSMOOS_TAB_ID,
                    payload: { id: d.id, result: safeSerialize(res), isError: false }
                }, "*");
            } catch(err) {
                origConsole.error(`%cB"H [Sandbox] Eval Shattered:`, "color: #f75d65;", err);

                window.parent.postMessage({
                    source: "html-preview-bridge", 
                    type: "eval-response",
                    previewTabId: window._AWTSMOOS_TAB_ID,
                    payload: { id: d.id, result: safeSerialize(err), isError: true }
                }, "*");
            }
        }
    });

    if (document.readyState === "complete" || document.readyState === "interactive") {
        announceExistence();
    } else {
        document.addEventListener("DOMContentLoaded", announceExistence);
    }
})();
