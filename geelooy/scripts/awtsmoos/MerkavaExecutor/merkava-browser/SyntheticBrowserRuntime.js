// B"H
(function(root, factory) {
    if (typeof module === 'object' && module.exports) module.exports = factory(require('./VirtualWindow.js'));
    else { root.Merkava = root.Merkava || {}; root.Merkava.SyntheticBrowserRuntime = factory(root.Merkava).SyntheticBrowserRuntime; }
})(typeof self !== 'undefined' ? self : this, function(winMod) {
    const VirtualWindow = winMod.VirtualWindow;

    /**
     * B"H
     * Chapter 98: the browser vessel receives names Chrome speaks by breath.
     * DOMParser, Element, HTMLElement, Document, and Node are no longer absent
     * shadows; they are living gates backed by Merkava's virtual DOM.
     */
    class SyntheticBrowserRuntime {
        constructor(options = {}) { this.options = options; this.window = new VirtualWindow(options); this.errors = []; }

        globals() {
            const w = this.window;
            const Element = w.document.createElement('div').constructor;
            const Document = w.document.constructor;
            const DOMParser = class DOMParser {
                parseFromString(markup = '', type = 'text/html') {
                    const doc = new Document();
                    doc.body.innerHTML = String(markup || '');
                    return doc;
                }
            };
            return {
                window: w, self: w, document: w.document, console: w.console,
                localStorage: w.localStorage, sessionStorage: w.sessionStorage,
                DOMParser, Element, HTMLElement: Element, Document, Node: Element,
                navigator: w.navigator, location: w.location, history: w.history, fetch: w.fetch,
                registerFont: w.document.fontAtlas.registerFont.bind(w.document.fontAtlas),
                setTextMeasureHook: w.document.fontAtlas.setMeasureHook.bind(w.document.fontAtlas),
                Event: w.Event, CustomEvent: w.CustomEvent, KeyboardEvent: w.KeyboardEvent,
                MouseEvent: w.MouseEvent, InputEvent: w.InputEvent, Blob: w.Blob, File: w.File,
                FormData: w.FormData, URL: w.URL, URLSearchParams: w.URLSearchParams,
                MutationObserver: w.MutationObserver, ResizeObserver: w.ResizeObserver,
                IntersectionObserver: w.IntersectionObserver, Worker: w.Worker, crypto: w.crypto,
                getComputedStyle: w.getComputedStyle, addStyleSheet: w.addStyleSheet,
                renderWebGLDom: w.renderWebGLDom, page: w.interactions, mouse: w.mouse,
                keyboard: w.keyboard, probe: w.probe, setTimeout: w.setTimeout.bind(w),
                clearTimeout: w.clearTimeout.bind(w), setInterval: w.setInterval.bind(w),
                clearInterval: w.clearInterval.bind(w), requestAnimationFrame: w.requestAnimationFrame,
                cancelAnimationFrame: w.cancelAnimationFrame, showDirectoryPicker: w.showDirectoryPicker,
                showOpenFilePicker: w.showOpenFilePicker
            };
        }

        async executeFunction(fn) {
            try {
                const globals = this.__merkavaGlobals || this.globals();
                const result = await fn(globals, this.window);
                return { ok: true, result, snapshot: this.snapshot() };
            } catch (error) {
                this.errors.push({ message: error.message, stack: error.stack });
                return { ok: false, error: error.message, stack: error.stack, snapshot: this.snapshot() };
            }
        }

        snapshot() { return { kind: 'browser', errors: this.errors, window: this.window.snapshot() }; }
    }
    return { SyntheticBrowserRuntime };
});
