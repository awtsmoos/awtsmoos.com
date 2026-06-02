// B"H
(function(root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory(require('./VirtualDocument.js'), require('./VirtualStorage.js'), require('./VirtualConsole.js'), require('./VirtualFetch.js'), require('./VirtualEvents.js'), require('./VirtualMouse.js'), require('./VirtualKeyboard.js'), require('./VirtualInteractions.js'), require('./RuntimeProbe.js'), require('./VirtualWebGLBoxRenderer.js'), require('./BrowserRenderPipeline.js'), require('./VirtualOffscreenCanvas.js'), require('./VirtualWorker.js'), require('./VirtualPath2D.js'));
  } else {
    root.Merkava = root.Merkava || {};
    root.Merkava.VirtualWindow = factory(root.Merkava, root.Merkava, root.Merkava, root.Merkava, root.Merkava, root.Merkava, root.Merkava, root.Merkava, root.Merkava, root.Merkava, root.Merkava, root.Merkava, root.Merkava, root.Merkava).VirtualWindow;
  }
})(typeof self !== 'undefined' ? self : this, function(docMod, storageMod, consoleMod, fetchMod, events, mouseMod, keyboardMod, interactionMod, probeMod, boxRendererMod, pipelineMod, offscreenMod, workerMod, pathMod) {
  const VirtualDocument = docMod.VirtualDocument;
  const VirtualStorage = storageMod.VirtualStorage;
  const VirtualConsole = consoleMod.VirtualConsole;
  const VirtualFetch = fetchMod.VirtualFetch;
  const VirtualWebGLBoxRenderer = boxRendererMod.VirtualWebGLBoxRenderer;
  const BrowserRenderPipeline = pipelineMod.BrowserRenderPipeline || class { constructor(window) { this.window = window; } render() { return this.window.document.textureArena.snapshot(); } };
  const VirtualOffscreenCanvas = offscreenMod.VirtualOffscreenCanvas;
  const VirtualImageData = offscreenMod.VirtualImageData;
  const VirtualImageBitmap = offscreenMod.VirtualImageBitmap || class VirtualImageBitmap {};
  const VirtualWorker = workerMod.VirtualWorker;
  const VirtualPath2D = pathMod.VirtualPath2D;

  /**
   * B"H
   * The window is the browser sky. Canvas, OffscreenCanvas, Worker, Path2D,
   * ImageData, WebGL, timers, fetch, storage, and DOM breathe in one local
   * deterministic universe, where every surface joins the Merkava arena.
   */
  class VirtualWindow {
    constructor({ files = {}, graph = null, url = 'http://127.0.0.1:8080/' } = {}) {
      this.graph = graph;
      this.files = files;
      this.document = new VirtualDocument();
      this.document.defaultView = this;
      this.console = new VirtualConsole(graph);
      this.localStorage = new VirtualStorage();
      this.sessionStorage = new VirtualStorage();
      this.location = new URL(url);
      this.innerWidth = 1024;
      this.innerHeight = 768;
      this.devicePixelRatio = 1;
      this.navigator = { userAgent: 'MerkavaSyntheticChrome/1.0', onLine: true, language: 'en-US', platform: 'Merkava' };
      this.history = makeHistory(this);
      this.performance = { now: () => Date.now() };
      this.__timers = new Map();
      this.__timerBudget = { callbacks: 0, maxCallbacks: 250, frozen: false };
      this.__network = new VirtualFetch({ files, graph, baseUrl: this.location.href });
      this.fetch = this.__network.fetch.bind(this.__network);
      this.Event = events.VirtualEvent;
      this.CustomEvent = events.VirtualCustomEvent;
      this.KeyboardEvent = events.VirtualKeyboardEvent;
      this.MouseEvent = events.VirtualMouseEvent;
      this.InputEvent = events.VirtualInputEvent;
      this.Blob = typeof Blob !== 'undefined' ? Blob : class Blob { constructor(parts = [], init = {}) { this.parts = parts; this.type = init.type || ''; this.size = parts.join('').length; } };
      this.File = class File extends this.Blob { constructor(parts, name, init = {}) { super(parts, init); this.name = name; } };
      this.FormData = class FormData { constructor() { this.items = []; } append(k, v) { this.items.push([k, v]); } };
      this.Image = makeImageClass(this);
      this.ImageData = VirtualImageData;
      this.ImageBitmap = VirtualImageBitmap;
      this.OffscreenCanvas = makeOffscreenCanvasClass(this);
      this.Path2D = VirtualPath2D;
      this.Worker = makeWorkerClass(this);
      this.AudioContext = makeAudioContextClass();
      this.webkitAudioContext = this.AudioContext;
      this.Audio = class Audio { constructor(src = '') { this.src = src; this.currentTime = 0; this.paused = true; } play() { this.paused = false; return Promise.resolve(); } pause() { this.paused = true; } load() {} };
      this.URL = URL;
      this.URLSearchParams = URLSearchParams;
      this.structuredClone = value => JSON.parse(JSON.stringify(value));
      this.queueMicrotask = fn => Promise.resolve().then(fn);
      this.crypto = makeCrypto();
      this.MutationObserver = makeMutationObserver(this.document);
      this.ResizeObserver = this.MutationObserver;
      this.IntersectionObserver = this.MutationObserver;
      this.mouse = new mouseMod.VirtualMouse(this);
      this.keyboard = new keyboardMod.VirtualKeyboard(this);
      this.interactions = new interactionMod.VirtualInteractions(this);
      this.probe = new probeMod.RuntimeProbe();
      this.webglRenderer = new VirtualWebGLBoxRenderer(this.document.textureArena);
      this.renderPipeline = new BrowserRenderPipeline(this, { renderer: this.webglRenderer, viewport: { width: 760, height: 560 } });
      this.renderWebGLDom = () => this.renderPipeline.render();
      this.requestAnimationFrame = cb => this.setTimeout(() => cb(this.performance.now()), 16);
      this.cancelAnimationFrame = id => this.clearTimeout(id);
      this.showDirectoryPicker = async () => ({ kind: 'directory', name: 'virtual-root', values: async function*(){} });
      this.showOpenFilePicker = async () => [];
      this.getComputedStyle = element => { const computed = this.document.cssEngine.compute(element); return { ...computed, getPropertyValue: name => computed[String(name).replace(/[A-Z]/g, c => '-' + c.toLowerCase())] || '' }; };
      this.addStyleSheet = cssText => this.document.cssEngine.parseStyleSheet(cssText);
    }

    setTimeout(fn, ms = 0, ...args) { if (this.__timerBudget.frozen) return 0; const id = setTimeout(() => { this.__timers.delete(id); budgetedCall(fn, args, this); }, Math.max(0, Number(ms) || 0)); id?.unref?.(); this.__timers.set(id, { kind: 'timeout', ms }); return id; }
    clearTimeout(id) { this.__timers.delete(id); clearTimeout(id); }
    setInterval(fn, ms = 0, ...args) { if (this.__timerBudget.frozen) return 0; const id = setInterval(() => budgetedCall(fn, args, this), Math.max(0, Number(ms) || 0)); id?.unref?.(); this.__timers.set(id, { kind: 'interval', ms }); return id; }
    clearInterval(id) { this.__timers.delete(id); clearInterval(id); }
    freezeTimers() { this.__timerBudget.frozen = true; this.clearAllTimers(); }
    clearAllTimers() { for (const id of Array.from(this.__timers.keys())) { clearTimeout(id); clearInterval(id); this.__timers.delete(id); } }
    addEventListener(type, handler, options) { this.document.addEventListener(type, handler, options); }
    removeEventListener(type, handler, options) { this.document.removeEventListener(type, handler, options); }
    dispatchEvent(event) { return this.document.dispatchEvent(event); }

    snapshot() {
      return {
        location: this.location.href,
        navigator: this.navigator,
        document: this.document.toJSON(),
        localStorage: this.localStorage.toJSON(),
        sessionStorage: this.sessionStorage.toJSON(),
        network: this.__network.toJSON(),
        console: this.console?.toJSON?.() || [],
        timers: Array.from(this.__timers.values()),
        mouse: this.mouse.toJSON(),
        keyboard: this.keyboard.toJSON(),
        probes: this.probe.toJSON(),
        fontAtlas: this.document.fontAtlas.snapshot(),
        canvasArena: this.document.textureArena.snapshot()
      };
    }
  }

  function makeOffscreenCanvasClass(win) { return class OffscreenCanvas extends VirtualOffscreenCanvas { constructor(width, height) { super(width, height, win.document, win.document.textureArena); } }; }
  function makeOffscreenCanvasClass(win) { return class OffscreenCanvas extends VirtualOffscreenCanvas { constructor(width, height) { super(width, height, win.document, win.document.textureArena); } }; }
  function makeWorkerClass(win) { return class Worker extends VirtualWorker { constructor(scriptURL, options = {}) { super(scriptURL, options, workerHost(win)); } }; }
  function makeOffscreenCanvasClass(win) { return class OffscreenCanvas extends VirtualOffscreenCanvas { constructor(width, height) { super(width, height, win.document, win.document.textureArena); } }; }
  function makeOffscreenCanvasClass(win) { return class OffscreenCanvas extends VirtualOffscreenCanvas { constructor(width, height) { super(width, height, win.document, win.document.textureArena); } }; }
  function makeWorkerClass(win) { return class Worker extends VirtualWorker { constructor(scriptURL, options = {}) { super(scriptURL, options, workerHost(win)); } }; }
  function workerHost(win) {
    return { files: win.files, navigator: win.navigator, console: win.console, fetch: win.fetch, setTimeout: win.setTimeout.bind(win), clearTimeout: win.clearTimeout.bind(win), setInterval: win.setInterval.bind(win), clearInterval: win.clearInterval.bind(win), OffscreenCanvas: win.OffscreenCanvas, ImageData: win.ImageData, Path2D: win.Path2D, Blob: win.Blob, URL: win.URL };
  }
  function makeHistory(win) { return { stack: [win.location.href], pushState: (_s, _t, next) => { win.location = new URL(next, win.location.href); win.history.stack.push(win.location.href); }, replaceState: (_s, _t, next) => { win.location = new URL(next, win.location.href); win.history.stack[win.history.stack.length - 1] = win.location.href; } }; }
  function budgetedCall(fn, args, win) { if (win.__timerBudget.frozen) return; win.__timerBudget.callbacks++; if (win.__timerBudget.callbacks > win.__timerBudget.maxCallbacks) { win.freezeTimers(); return; } safeCall(fn, args, win); }
  function safeCall(fn, args, win) { try { if (typeof fn === 'function') fn(...args); } catch (error) { win.__AWTSMOOS_CAPTURED_ERRORS__ = win.__AWTSMOOS_CAPTURED_ERRORS__ || []; win.__AWTSMOOS_CAPTURED_ERRORS__.push({ message: error.message, stack: error.stack, phase: 'timer' }); } }

  function makeImageClass(win) { return class Image { constructor(width = 0, height = 0) { this.width = width || 0; this.height = height || 0; this.complete = false; this.onload = null; this.onerror = null; this.__src = ''; } set src(value) { this.__src = String(value || ''); this.complete = true; win.setTimeout(() => this.onload && this.onload(new win.Event('load')), 0); } get src() { return this.__src; } decode() { return Promise.resolve(); } addEventListener(type, handler) { if (type === 'load') this.onload = handler; if (type === 'error') this.onerror = handler; } removeEventListener() {} }; }
  function makeAudioContextClass() { return class AudioContext { constructor() { this.currentTime = 0; this.state = 'running'; this.destination = {}; this.sampleRate = 44100; } createOscillator() { return audioNode({ start(){}, stop(){}, frequency: { value: 440 } }); } createGain() { return audioNode({ gain: { value: 1 } }); } createBuffer() { return {}; } createBufferSource() { return audioNode({ buffer: null, start(){}, stop(){} }); } resume() { this.state = 'running'; return Promise.resolve(); } suspend() { this.state = 'suspended'; return Promise.resolve(); } close() { this.state = 'closed'; return Promise.resolve(); } decodeAudioData(data) { return Promise.resolve(data || {}); } }; }
  function audioNode(extra = {}) { return { connect(){ return this; }, disconnect(){ return this; }, ...extra }; }
  function makeCrypto() { return { getRandomValues: arr => { for (let i = 0; i < arr.length; i++) arr[i] = Math.floor(Math.random() * 256); return arr; }, randomUUID: () => 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => { const r = Math.random() * 16 | 0; return (c === 'x' ? r : (r & 3) | 8).toString(16); }) }; }
  function makeMutationObserver(document) { return class MutationObserver { constructor(callback) { this.callback = callback; this.records = []; this.options = null; } observe(target, options = {}) { this.target = target; this.options = options; document.__registerMutationObserver(this); } disconnect() { document.__unregisterMutationObserver(this); } takeRecords() { const got = this.records.slice(); this.records.length = 0; return got; } __enqueue(record) { this.records.push(record); if (typeof this.callback === 'function') this.callback([record], this); } }; }
  return { VirtualWindow };
});
