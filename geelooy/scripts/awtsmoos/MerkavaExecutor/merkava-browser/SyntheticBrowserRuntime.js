// B"H
(function(root, factory) {
    if (typeof module === 'object' && module.exports) module.exports = factory(require('./VirtualWindow.js'));
    else { root.Merkava = root.Merkava || {}; root.Merkava.SyntheticBrowserRuntime = factory(root.Merkava).SyntheticBrowserRuntime; }
})(typeof self !== 'undefined' ? self : this, function(winMod) {
    const VirtualWindow = winMod.VirtualWindow;

    /**
     * B"H
     * Chapter 39: The Awtsmoos page helper entered the synthetic palace.
     * Static pages may call `$a(...)` while the real site assembler is absent;
     * Merkava records the include request and returns an empty safe vessel.
     */
    class SyntheticBrowserRuntime {
        constructor(options = {}) { this.options = options; this.window = new VirtualWindow(options); this.errors = []; ensureVisualViewport(this.window); ensureAwtsHelpers(this.window); }

        globals() {
            const w = this.window;
            ensureVisualViewport(w);
            ensureAwtsHelpers(w);
            const Element = w.document.createElement('div').constructor;
            installElementCompat(Element, w);
            const Document = w.document.constructor;
            const DOMParser = class DOMParser { parseFromString(markup = '', type = 'text/html') { const doc = new Document(); doc.body.innerHTML = String(markup || ''); return doc; } };
            const base = {
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
                FormData: w.FormData, URL: w.URL, URLSearchParams: w.URLSearchParams,
                MutationObserver: w.MutationObserver, ResizeObserver: w.ResizeObserver,
                IntersectionObserver: w.IntersectionObserver, Worker: w.Worker, crypto: w.crypto,
                getComputedStyle: w.getComputedStyle, addStyleSheet: w.addStyleSheet,
                renderWebGLDom: w.renderWebGLDom, page: w.interactions, mouse: w.mouse, keyboard: w.keyboard,
                probe: w.probe, setTimeout: w.setTimeout.bind(w), clearTimeout: w.clearTimeout.bind(w),
                setInterval: w.setInterval.bind(w), clearInterval: w.clearInterval.bind(w),
                requestAnimationFrame: w.requestAnimationFrame, cancelAnimationFrame: w.cancelAnimationFrame,
                showDirectoryPicker: w.showDirectoryPicker, showOpenFilePicker: w.showOpenFilePicker
            };
            return makeGlobalProxy(base, w);
        }

        async executeFunction(fn) {
            try { const globals = this.__merkavaGlobals || this.globals(); const result = await fn(globals, this.window); captureTimerErrors(this); return { ok: true, result, snapshot: this.snapshot() }; }
            catch (error) { this.errors.push({ message: error.message, stack: error.stack }); return { ok: false, error: error.message, stack: error.stack, snapshot: this.snapshot() }; }
        }

        snapshot() { captureTimerErrors(this); return { kind: 'browser', errors: this.errors, window: this.window.snapshot() }; }
    }

    function ensureAwtsHelpers(w) {
        if (typeof w.$a === 'function') return;
        w.__awtsIncludes = [];
        w.$a = spec => { w.__awtsIncludes.push(String(spec || '')); return ''; };
    }

    function ensureVisualViewport(w) {
        if (w.visualViewport) return;
        const listeners = {};
        w.visualViewport = { width: w.innerWidth || 1024, height: w.innerHeight || 768, scale: 1, offsetLeft: 0, offsetTop: 0, pageLeft: 0, pageTop: 0,
            addEventListener(type, handler) { if (handler) (listeners[type] = listeners[type] || []).push(handler); },
            removeEventListener(type, handler) { listeners[type] = (listeners[type] || []).filter(x => x !== handler); },
            dispatchEvent(event) { for (const fn of (listeners[event.type] || []).slice()) fn.call(this, event); return true; }
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
