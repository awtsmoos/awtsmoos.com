// B"H
(function(root, factory) {
    if (typeof module === 'object' && module.exports) module.exports = factory(require('./VirtualDocument.js'), require('./VirtualStorage.js'), require('./VirtualConsole.js'), require('./VirtualFetch.js'), require('./VirtualEvents.js'), require('./VirtualMouse.js'), require('./VirtualKeyboard.js'), require('./VirtualInteractions.js'), require('./RuntimeProbe.js'), require('./VirtualWebGLBoxRenderer.js'));
    else { root.Merkava = root.Merkava || {}; root.Merkava.VirtualWindow = factory(root.Merkava, root.Merkava, root.Merkava, root.Merkava, root.Merkava, root.Merkava, root.Merkava, root.Merkava, root.Merkava, root.Merkava).VirtualWindow; }
})(typeof self !== 'undefined' ? self : this, function(docMod, storageMod, consoleMod, fetchMod, events, mouseMod, keyboardMod, interactionMod, probeMod, boxRendererMod) {
    const VirtualDocument = docMod.VirtualDocument;
    const VirtualStorage = storageMod.VirtualStorage;
    const VirtualConsole = consoleMod.VirtualConsole;
    const VirtualFetch = fetchMod.VirtualFetch;
    const VirtualWebGLBoxRenderer = boxRendererMod.VirtualWebGLBoxRenderer;

    class VirtualWindow {
        constructor({ files = {}, graph = null, url = 'http://127.0.0.1:8080/' } = {}) {
            this.graph = graph;
            this.document = new VirtualDocument();
            this.console = new VirtualConsole(graph);
            this.localStorage = new VirtualStorage();
            this.sessionStorage = new VirtualStorage();
            this.location = new URL(url);
            this.navigator = { userAgent: 'MerkavaSyntheticChrome/1.0', onLine: true, language: 'en-US' };
            this.history = { stack: [url], pushState: (_s, _t, next) => { this.location = new URL(next, this.location.href); this.history.stack.push(this.location.href); } };
            this.performance = { now: () => Date.now() };
            this.__timers = new Map();
            this.__network = new VirtualFetch({ files, graph });
            this.fetch = this.__network.fetch.bind(this.__network);

            this.Event = events.VirtualEvent;
            this.CustomEvent = events.VirtualCustomEvent;
            this.KeyboardEvent = events.VirtualKeyboardEvent;
            this.MouseEvent = events.VirtualMouseEvent;
            this.InputEvent = events.VirtualInputEvent;
            this.Blob = typeof Blob !== 'undefined' ? Blob : class Blob { constructor(parts = []) { this.parts = parts; } };
            this.File = class File extends this.Blob { constructor(parts, name) { super(parts); this.name = name; } };
            this.FormData = class FormData { constructor() { this.items = []; } append(k, v) { this.items.push([k, v]); } };
            this.URL = URL;
            this.URLSearchParams = URLSearchParams;
            this.crypto = { getRandomValues: arr => { for (let i = 0; i < arr.length; i++) arr[i] = Math.floor(Math.random() * 256); return arr; } };
            this.MutationObserver = class { observe(){} disconnect(){} takeRecords(){ return []; } };
            this.ResizeObserver = this.MutationObserver;
            this.IntersectionObserver = this.MutationObserver;
            this.Worker = class { postMessage(){} terminate(){} };

            this.mouse = new mouseMod.VirtualMouse(this);
            this.keyboard = new keyboardMod.VirtualKeyboard(this);
            this.interactions = new interactionMod.VirtualInteractions(this);
            this.probe = new probeMod.RuntimeProbe();
            this.webglRenderer = new VirtualWebGLBoxRenderer(this.document.textureArena);
            this.renderWebGLDom = () => { this.webglRenderer.paintElement(this.document.body, 0, 0, 760); return this.document.textureArena.snapshot(); };

            this.requestAnimationFrame = cb => this.setTimeout(() => cb(this.performance.now()), 16);
            this.cancelAnimationFrame = id => this.clearTimeout(id);
            this.showDirectoryPicker = async () => ({ kind: 'directory', name: 'virtual-root', values: async function*(){} });
            this.showOpenFilePicker = async () => [];
            this.getComputedStyle = element => {
                const computed = this.document.cssEngine.compute(element);
                return { ...computed, getPropertyValue: name => computed[String(name).replace(/[A-Z]/g, c => '-' + c.toLowerCase())] || '' };
            };
            this.addStyleSheet = cssText => this.document.cssEngine.parseStyleSheet(cssText);
        }

        setTimeout(fn, ms = 0, ...args) { const id = setTimeout(fn, ms, ...args); this.__timers.set(id, { kind: 'timeout', ms }); return id; }
        clearTimeout(id) { this.__timers.delete(id); clearTimeout(id); }
        setInterval(fn, ms = 0, ...args) { const id = setInterval(fn, ms, ...args); this.__timers.set(id, { kind: 'interval', ms }); return id; }
        clearInterval(id) { this.__timers.delete(id); clearInterval(id); }
        addEventListener(type, handler) { this.document.addEventListener(type, handler); }
        dispatchEvent(event) { return this.document.dispatchEvent(event); }

        snapshot() {
            return {
                location: this.location.href,
                navigator: this.navigator,
                document: this.document.toJSON(),
                localStorage: this.localStorage.toJSON(),
                network: this.__network.toJSON(),
                console: this.console.toJSON(),
                timers: Array.from(this.__timers.values()),
                mouse: this.mouse.toJSON(),
                keyboard: this.keyboard.toJSON(),
                probes: this.probe.toJSON()
            };
        }
    }
    return { VirtualWindow };
});
