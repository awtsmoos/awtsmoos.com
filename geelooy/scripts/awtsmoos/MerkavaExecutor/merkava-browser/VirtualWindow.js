// B"H
(function(root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory(require('./VirtualDocument.js'), require('./VirtualStorage.js'), require('./VirtualConsole.js'), require('./VirtualFetch.js'), require('./VirtualEvents.js'), require('./VirtualMouse.js'), require('./VirtualKeyboard.js'), require('./VirtualInteractions.js'), require('./RuntimeProbe.js'), require('./VirtualWebGLBoxRenderer.js'), require('./BrowserRenderPipeline.js'));
  } else {
    root.Merkava = root.Merkava || {};
    root.Merkava.VirtualWindow = factory(root.Merkava, root.Merkava, root.Merkava, root.Merkava, root.Merkava, root.Merkava, root.Merkava, root.Merkava, root.Merkava, root.Merkava, root.Merkava).VirtualWindow;
  }
})(typeof self !== 'undefined' ? self : this, function(docMod, storageMod, consoleMod, fetchMod, events, mouseMod, keyboardMod, interactionMod, probeMod, boxRendererMod, pipelineMod) {
  const VirtualDocument = docMod.VirtualDocument;
  const VirtualStorage = storageMod.VirtualStorage;
  const VirtualConsole = consoleMod.VirtualConsole;
  const VirtualFetch = fetchMod.VirtualFetch;
  const VirtualWebGLBoxRenderer = boxRendererMod.VirtualWebGLBoxRenderer;
  const BrowserRenderPipeline = pipelineMod.BrowserRenderPipeline || class { constructor(window) { this.window = window; } render() { return this.window.document.textureArena.snapshot(); } };

  /**
   * B"H
   * Chapter 32: The virtual window learned more of Chrome's household names.
   * Images load as soft synthetic boxes, AudioContext breathes harmlessly, and
   * the page keeps enough living APIs for games to begin without source edits.
   */
  class VirtualWindow {
    constructor({ files = {}, graph = null, url = 'http://127.0.0.1:8080/' } = {}) {
      this.graph = graph;
      this.document = new VirtualDocument();
      this.console = new VirtualConsole(graph);
      this.localStorage = new VirtualStorage();
      this.sessionStorage = new VirtualStorage();
      this.location = new URL(url);
      this.innerWidth = 1024;
      this.innerHeight = 768;
      this.devicePixelRatio = 1;
      this.navigator = { userAgent: 'MerkavaSyntheticChrome/1.0', onLine: true, language: 'en-US', platform: 'Merkava' };
      this.history = { stack: [this.location.href], pushState: (_s, _t, next) => { this.location = new URL(next, this.location.href); this.history.stack.push(this.location.href); }, replaceState: (_s, _t, next) => { this.location = new URL(next, this.location.href); this.history.stack[this.history.stack.length - 1] = this.location.href; } };
      this.performance = { now: () => Date.now() };
      this.__timers = new Map();
      this.__network = new VirtualFetch({ files, graph, baseUrl: this.location.href });
      this.fetch = this.__network.fetch.bind(this.__network);
      this.Event = events.VirtualEvent;
      this.CustomEvent = events.VirtualCustomEvent;
      this.KeyboardEvent = events.VirtualKeyboardEvent;
      this.MouseEvent = events.VirtualMouseEvent;
      this.InputEvent = events.VirtualInputEvent;
      this.Blob = typeof Blob !== 'undefined' ? Blob : class Blob { constructor(parts = []) { this.parts = parts; } };
      this.File = class File extends this.Blob { constructor(parts, name) { super(parts); this.name = name; } };
      this.FormData = class FormData { constructor() { this.items = []; } append(k, v) { this.items.push([k, v]); } };
      this.Image = makeImageClass(this);
      this.AudioContext = makeAudioContextClass(this);
      this.webkitAudioContext = this.AudioContext;
      this.Audio = class Audio { constructor(src = '') { this.src = src; this.currentTime = 0; this.paused = true; } play() { this.paused = false; return Promise.resolve(); } pause() { this.paused = true; } load() {} };
      this.URL = URL;
      this.URLSearchParams = URLSearchParams;
      this.structuredClone = value => JSON.parse(JSON.stringify(value));
      this.queueMicrotask = fn => Promise.resolve().then(fn);
      this.crypto = { getRandomValues: arr => { for (let i = 0; i < arr.length; i++) arr[i] = Math.floor(Math.random() * 256); return arr; }, randomUUID: () => 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => { const r = Math.random() * 16 | 0; return (c === 'x' ? r : (r & 3) | 8).toString(16); }) };
      this.MutationObserver = makeMutationObserver(this.document);
      this.ResizeObserver = this.MutationObserver;
      this.IntersectionObserver = this.MutationObserver;
      this.Worker = class { constructor() { this.onmessage = null; } postMessage(){} terminate(){} addEventListener(){} removeEventListener(){} };
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

    setTimeout(fn, ms = 0, ...args) { const id = setTimeout(() => safeCall(fn, args, this), ms); this.__timers.set(id, { kind: 'timeout', ms }); return id; }
    clearTimeout(id) { this.__timers.delete(id); clearTimeout(id); }
    setInterval(fn, ms = 0, ...args) { const id = setInterval(() => safeCall(fn, args, this), ms); this.__timers.set(id, { kind: 'interval', ms }); return id; }
    clearInterval(id) { this.__timers.delete(id); clearInterval(id); }
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
        console: this.console.toJSON(),
        timers: Array.from(this.__timers.values()),
        mouse: this.mouse.toJSON(),
        keyboard: this.keyboard.toJSON(),
        probes: this.probe.toJSON()
      };
    }
  }

  function safeCall(fn, args, win) { try { if (typeof fn === 'function') fn(...args); } catch (error) { win.__AWTSMOOS_CAPTURED_ERRORS__ = win.__AWTSMOOS_CAPTURED_ERRORS__ || []; win.__AWTSMOOS_CAPTURED_ERRORS__.push({ message: error.message, stack: error.stack, phase: 'timer' }); } }

  function makeImageClass(win) {
    return class Image {
      constructor(width = 0, height = 0) { this.width = width || 0; this.height = height || 0; this.complete = false; this.onload = null; this.onerror = null; this.__src = ''; }
      set src(value) { this.__src = String(value || ''); this.complete = true; win.setTimeout(() => this.onload && this.onload(new win.Event('load')), 0); }
      get src() { return this.__src; }
      decode() { return Promise.resolve(); }
      addEventListener(type, handler) { if (type === 'load') this.onload = handler; if (type === 'error') this.onerror = handler; }
      removeEventListener() {}
    };
  }

  function makeAudioContextClass(win) {
    return class AudioContext {
      constructor() { this.currentTime = 0; this.state = 'running'; this.destination = {}; this.sampleRate = 44100; }
      createOscillator() { return audioNode({ start(){}, stop(){}, frequency: { value: 440 } }); }
      createGain() { return audioNode({ gain: { value: 1 } }); }
      createBuffer() { return {}; }
      createBufferSource() { return audioNode({ buffer: null, start(){}, stop(){} }); }
      resume() { this.state = 'running'; return Promise.resolve(); }
      suspend() { this.state = 'suspended'; return Promise.resolve(); }
      close() { this.state = 'closed'; return Promise.resolve(); }
      decodeAudioData(data) { return Promise.resolve(data || {}); }
    };
  }

  function audioNode(extra = {}) { return { connect(){ return this; }, disconnect(){ return this; }, ...extra }; }

  function makeMutationObserver(document) {
    return class MutationObserver {
      constructor(callback) { this.callback = callback; this.records = []; this.options = null; }
      observe(target, options = {}) { this.target = target; this.options = options; document.__registerMutationObserver(this); }
      disconnect() { document.__unregisterMutationObserver(this); }
      takeRecords() { const got = this.records.slice(); this.records.length = 0; return got; }
      __enqueue(record) { this.records.push(record); if (typeof this.callback === 'function') this.callback([record], this); else if (this.callback && typeof this.callback.call === 'function') this.callback.call([[record], this]); }
    };
  }

  return { VirtualWindow };
});
