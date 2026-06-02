// B"H
(function(root, factory) {
    if (typeof module === 'object' && module.exports) module.exports = factory(require('./VirtualWindow.js'));
    else { root.Merkava = root.Merkava || {}; root.Merkava.SyntheticBrowserRuntime = factory(root.Merkava).SyntheticBrowserRuntime; }
})(typeof self !== 'undefined' ? self : this, function(winMod) {
    const VirtualWindow = winMod.VirtualWindow;

    /**
     * B"H
     * Chapter 42: The Unreturned Promise Was Caught By Its Shadow.
     *
     * Browser event handlers may start async work without returning the promise.
     * Node calls that an unhandled rejection and would kill the test harness.
     * The synthetic palace now catches those shadows during each runtime call,
     * records them as page errors, and returns a real red result instead of
     * breaking the matrix procession.
     */
    class SyntheticBrowserRuntime {
        constructor(options = {}) {
            this.options = options;
            this.window = new VirtualWindow(options);
            this.errors = [];
            ensureVisualViewport(this.window);
            ensureAwtsHelpers(this.window);
        }

        globals() {
            const w = this.window;
            ensureVisualViewport(w);
            ensureAwtsHelpers(w);
            const Element = w.document.createElement('div').constructor;
            installElementCompat(Element, w);
            const Document = w.document.constructor;
            const DOMParser = class DOMParser { parseFromString(markup = '') { const doc = new Document(); doc.body.innerHTML = String(markup || ''); return doc; } };
            const base = browserBaseGlobals(w, Element, Document, DOMParser);
            return makeGlobalProxy(base, w);
        }

        async executeFunction(fn) {
            const detach = attachProcessRejectionCapture(this);
            try {
                const globals = this.__merkavaGlobals || this.globals();
                const result = await guardedRuntimeCall(() => fn(globals, this.window), this.options?.functionTimeoutMs || 4000);
                await flushMicrotasks();
                captureTimerErrors(this);
                detach();
                return { ok: !this.errors.length, result, snapshot: this.snapshot() };
            } catch (error) {
                this.errors.push({ message: error.message, stack: error.stack, code: error.code || null });
                detach();
                return { ok: false, error: error.message, stack: error.stack, code: error.code || null, snapshot: this.snapshot() };
            }
        }

        snapshot() { captureTimerErrors(this); return { kind: 'browser', errors: this.errors, window: this.window.snapshot() }; }
    }

    function browserBaseGlobals(w, Element, Document, DOMParser) {
        return {
            window: w, self: w, document: w.document, console: w.console,
            localStorage: w.localStorage, sessionStorage: w.sessionStorage,
            DOMParser, Element, HTMLElement: Element, Document, Node: Element,
            Image: w.Image, Audio: w.Audio, AudioContext: w.AudioContext, webkitAudioContext: w.webkitAudioContext,
            navigator: w.navigator, location: w.location, history: w.history, fetch: w.fetch,
            innerWidth: w.innerWidth, innerHeight: w.innerHeight, devicePixelRatio: w.devicePixelRatio,
            visualViewport: w.visualViewport, $a: w.$a,
            registerFont: w.document.fontAtlas.registerFont.bind(w.document.fontAtlas),
            setTextMeasureHook: w.document.fontAtlas.setMeasureHook.bind(w.document.fontAtlas),
            Event: w.Event, CustomEvent: w.CustomEvent, KeyboardEvent: w.KeyboardEvent,
            MouseEvent: w.MouseEvent, InputEvent: w.InputEvent, Blob: w.Blob, File: w.File,
            FormData: w.FormData, Request: makeRequestShim(w), Headers: makeHeadersShim(), URL: w.URL, URLSearchParams: w.URLSearchParams,
            MutationObserver: w.MutationObserver, ResizeObserver: w.ResizeObserver,
            IntersectionObserver: w.IntersectionObserver, Worker: w.Worker, crypto: w.crypto,
            getComputedStyle: w.getComputedStyle, addStyleSheet: w.addStyleSheet,
            renderWebGLDom: w.renderWebGLDom, page: w.interactions, mouse: w.mouse, keyboard: w.keyboard,
            probe: w.probe, setTimeout: w.setTimeout.bind(w), clearTimeout: w.clearTimeout.bind(w),
            setInterval: w.setInterval.bind(w), clearInterval: w.clearInterval.bind(w),
            requestAnimationFrame: w.requestAnimationFrame, cancelAnimationFrame: w.cancelAnimationFrame,
            showDirectoryPicker: w.showDirectoryPicker, showOpenFilePicker: w.showOpenFilePicker,
            pdfjsLib: makePdfJsShim(), PDFJS: makePdfJsShim()
        };
    }

    function attachProcessRejectionCapture(runtime) {
        if (typeof process === 'undefined' || !process.on) return () => {};
        const seen = new Set();
        const record = error => {
            if (seen.has(error)) return;
            seen.add(error);
            runtime.errors.push({ message: error?.message || String(error), stack: error?.stack || '', phase: 'unhandledRejection' });
        };
        process.on('unhandledRejection', record);
        process.on('uncaughtException', record);
        return () => { process.off?.('unhandledRejection', record); process.off?.('uncaughtException', record); };
    }

    function guardedRuntimeCall(factory, ms) {
        let timer;
        return Promise.race([
            Promise.resolve().then(factory),
            new Promise((_, reject) => {
                timer = setTimeout(() => { const e = new Error('Merkava runtime function timed out after ' + ms + 'ms'); e.code = 'MERKAVA_RUNTIME_FUNCTION_TIMEOUT'; reject(e); }, Math.max(1, Number(ms || 4000)));
                if (timer && typeof timer.unref === 'function') timer.unref();
            })
        ]).finally(() => timer && clearTimeout(timer));
    }

    function flushMicrotasks() { return new Promise(resolve => setTimeout(resolve, 0)); }
    function makeRequestShim(w) {
        return class Request {
            constructor(input, options = {}) {
                const raw = typeof input === 'object' && input && 'url' in input ? input.url : input;
                const text = String(raw || '');
                this.url = text.startsWith('//') ? new URL('https:' + text).href : new URL(text, w.location?.href || 'https://awtsmoos.com/').href;
                this.method = options.method || input?.method || 'GET';
                this.headers = options.headers || input?.headers || {};
                this.signal = options.signal || input?.signal || null;
                this.credentials = options.credentials || input?.credentials || 'same-origin';
            }
            clone() { return new this.constructor(this, { method: this.method, headers: this.headers, signal: this.signal, credentials: this.credentials }); }
            toString() { return this.url; }
        };
    }

    function makeHeadersShim() {
        return class Headers {
            constructor(init = {}) { this.map = new Map(Object.entries(init || {}).map(([k, v]) => [String(k).toLowerCase(), String(v)])); }
            get(name) { return this.map.get(String(name).toLowerCase()) || null; }
            set(name, value) { this.map.set(String(name).toLowerCase(), String(value)); }
            append(name, value) { this.set(name, value); }
            has(name) { return this.map.has(String(name).toLowerCase()); }
        };
    }

    function makePdfJsShim() { const page = { getViewport: ({ scale = 1 } = {}) => ({ width: 612 * scale, height: 792 * scale }), render: () => ({ promise: Promise.resolve() }) }; return { GlobalWorkerOptions: {}, getDocument: () => ({ promise: Promise.resolve({ numPages: 1, getPage: async () => page }) }) }; }
    function ensureAwtsHelpers(w) { if (typeof w.$a === 'function') return; w.__awtsIncludes = []; w.$a = spec => { w.__awtsIncludes.push(String(spec || '')); return ''; }; }

    function ensureVisualViewport(w) {
        if (w.visualViewport) return;
        const listeners = {};
        w.visualViewport = { width: w.innerWidth || 1024, height: w.innerHeight || 768, scale: 1, offsetLeft: 0, offsetTop: 0, pageLeft: 0, pageTop: 0,
            addEventListener(type, handler) { if (handler) (listeners[type] = listeners[type] || []).push(handler); },
            removeEventListener(type, handler) { listeners[type] = (listeners[type] || []).filter(x => x !== handler); },
            dispatchEvent(event) { for (const fn of (listeners[event.type] || []).slice()) try { fn.call(this, event); } catch (_) {} return true; }
        };
    }

    function makeGlobalProxy(base, win) {
        const proxy = new Proxy(base, {
            has(target, prop) { return prop in target || prop in win || (typeof prop === 'string' && !!win.document.getElementById(prop)); },
            get(target, prop, receiver) { if (prop === Symbol.unscopables) return undefined; if (prop in target) return Reflect.get(target, prop, receiver); if (prop in win) return win[prop]; if (typeof prop === 'string') { const el = win.document.getElementById(prop); if (el) return el; } return undefined; },
            set(target, prop, value) { target[prop] = value; if (typeof prop === 'string') win[prop] = value; return true; }
        });
        base.window = proxy; base.self = proxy; return proxy;
    }

    function installElementCompat(Element, win) {
        if (!Element.prototype.getBoundingClientRect) Element.prototype.getBoundingClientRect = function() { const width = Number(this.width || this.clientWidth || parsePx(this.style?.width) || (this.localName === 'canvas' ? 300 : 0)); const height = Number(this.height || this.clientHeight || parsePx(this.style?.height) || (this.localName === 'canvas' ? 150 : 0)); return { x: 0, y: 0, top: 0, left: 0, right: width, bottom: height, width, height, toJSON() { return this; } }; };
        defineSize(Element.prototype, 'clientWidth', node => node.width || parsePx(node.style?.width) || win.innerWidth || 0);
        defineSize(Element.prototype, 'clientHeight', node => node.height || parsePx(node.style?.height) || win.innerHeight || 0);
        defineSize(Element.prototype, 'offsetWidth', node => node.clientWidth || 0);
        defineSize(Element.prototype, 'offsetHeight', node => node.clientHeight || 0);
    }

    function defineSize(proto, name, getter) { const desc = Object.getOwnPropertyDescriptor(proto, name); if (desc && desc.get) return; Object.defineProperty(proto, name, { configurable: true, get() { return Number(getter(this)) || 0; } }); }
    function parsePx(value) { const got = String(value || '').match(/-?\d+(?:\.\d+)?/); return got ? Number(got[0]) : 0; }
    function captureTimerErrors(runtime) { const rows = runtime.window.__AWTSMOOS_CAPTURED_ERRORS__ || []; while (rows.length) runtime.errors.push(rows.shift()); }
    return { SyntheticBrowserRuntime };
});
