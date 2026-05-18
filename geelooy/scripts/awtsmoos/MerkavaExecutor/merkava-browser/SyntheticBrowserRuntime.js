// B"H
(function(root, factory) {
    if (typeof module === 'object' && module.exports) module.exports = factory(require('./VirtualWindow.js'));
    else { root.Merkava = root.Merkava || {}; root.Merkava.SyntheticBrowserRuntime = factory(root.Merkava).SyntheticBrowserRuntime; }
})(typeof self !== 'undefined' ? self : this, function(winMod) {
    const VirtualWindow = winMod.VirtualWindow;
    class SyntheticBrowserRuntime {
        constructor(options = {}) { this.options = options; this.window = new VirtualWindow(options); this.errors = []; }
        globals() {
            const w = this.window;
            return { window: w, self: w, document: w.document, console: w.console, localStorage: w.localStorage, sessionStorage: w.sessionStorage,
                navigator: w.navigator, location: w.location, history: w.history, fetch: w.fetch, Event: w.Event, CustomEvent: w.CustomEvent,
                KeyboardEvent: w.KeyboardEvent, MouseEvent: w.MouseEvent, InputEvent: w.InputEvent, Blob: w.Blob, File: w.File, FormData: w.FormData,
                URL: w.URL, URLSearchParams: w.URLSearchParams, MutationObserver: w.MutationObserver, ResizeObserver: w.ResizeObserver,
                IntersectionObserver: w.IntersectionObserver, Worker: w.Worker, crypto: w.crypto, page: w.interactions, mouse: w.mouse, keyboard: w.keyboard,
                probe: w.probe, setTimeout: w.setTimeout.bind(w), clearTimeout: w.clearTimeout.bind(w), setInterval: w.setInterval.bind(w),
                clearInterval: w.clearInterval.bind(w), requestAnimationFrame: w.requestAnimationFrame, cancelAnimationFrame: w.cancelAnimationFrame,
                showDirectoryPicker: w.showDirectoryPicker, showOpenFilePicker: w.showOpenFilePicker };
        }
        async executeFunction(fn) { try { const result = await fn(this.globals(), this.window); return { ok: true, result, snapshot: this.snapshot() }; } catch (error) { this.errors.push({ message: error.message, stack: error.stack }); return { ok: false, error: error.message, stack: error.stack, snapshot: this.snapshot() }; } }
        snapshot() { return { kind: 'browser', errors: this.errors, window: this.window.snapshot() }; }
    }
    return { SyntheticBrowserRuntime };
});
