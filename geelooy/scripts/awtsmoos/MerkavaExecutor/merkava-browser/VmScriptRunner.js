// B"H
// Boruch Hashem
/**
 * @module VmScriptRunner
 * @description Runs event-driven guest scripts through the real Merkava
 * pipeline (MerkavaASTParser -> JSON IR -> bytecode -> Merkava VM), then
 * lets the host dispatch events to registered listeners later.
 *
 * Architecture note (honest): the pipeline is hybrid. Control flow and
 * expressions run as VM bytecode; function *values* that cross into host
 * code arrive as Merkava interpreter vessels ({__kind:'function'}) bridged
 * to host-callable functions via DefaultMerkavaHost.callMethod. Calling
 * the bridged function as fn(...args) executes the guest body through
 * Merkava's own interpreter machinery — V8 only runs Merkava itself,
 * never the guest source directly.
 */
(function(root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else { root.Merkava = root.Merkava || {}; root.Merkava.VmScriptRunner = factory().VmScriptRunner; }
})(typeof self !== 'undefined' ? self : this, function() {
  function nodeRequire(name) {
    try {
      if (typeof require === 'function') return require(name);
      if (typeof module !== 'undefined' && module.createRequire) return module.createRequire(__filename)(name);
    } catch (e) {}
    return null;
  }
  function nodePath() { return nodeRequire('path'); }

  const BROWSER_DIR = (function() {
    try {
      const p = nodePath();
      if (p) return __dirname;
    } catch (e) {}
    return '.';
  })();

  let _loaded = null;
  // B"H 2026-10-09: browser seam — the page bundle injects the already-
  // bundled pipeline modules so loadPipeline() never touches require().
  let _pipelineOverride = null;
  function setPipelineLoaders(loaders) { _pipelineOverride = loaders || null; }
  function loadPipeline() {
    if (_pipelineOverride) return _pipelineOverride;
    if (_loaded) return _loaded;
    const p = nodePath();
    const B = p ? p.join(BROWSER_DIR, '..', 'merkava-binary') : '../merkava-binary';
    const { loadMerkavaVm } = require(p.join(B, 'MerkavaVmLoader.js'));
    const { compileJsToCode } = require(p.join(B, 'MerkavaJsCompiler.js'));
    const { createDefaultHost } = require(p.join(B, 'DefaultMerkavaHost.js'));
    const { decodeSangArtifact } = require(p.join(B, 'SangCodec.js'));
    loadMerkavaVm();
    _loaded = { compileJsToCode, createDefaultHost, decodeSangArtifact };
    return _loaded;
  }

  function installNatives(g) {
    g.Promise = g.Promise || {
      resolve(v) {
        return {
          __kind: 'syncPromise', value: v,
          then(fn) { return g.Promise.resolve(typeof fn === 'function' ? fn(v) : v); },
          catch() { return this; }
        };
      },
      reject(r) { throw r; }
    };
    g.Map = g.Map || Map;
    g.Set = g.Set || Set;
    g.JSON = g.JSON || JSON;
    g.Object = g.Object || Object;
    g.Array = g.Array || Array;
    g.Error = g.Error || Error;
    g.TypeError = g.TypeError || TypeError;
  }

  /**
   * Run guest source once through the Merkava VM.
   * @param {string} source guest JS
   * @param {object} opts { globals, hostAPI, context, cycles, label }
   * @returns {Promise<{status, error, vm, globals, memory}>}
   */
  async function runVmScript(source, opts = {}) {
    const { compileJsToCode, createDefaultHost, decodeSangArtifact } = loadPipeline();
    const artifact = await compileJsToCode(String(source || ''), { file: opts.label || '<guest>' });
    const hasBuffer = typeof Buffer !== 'undefined' && Buffer.isBuffer;
    const decoded = (hasBuffer && Buffer.isBuffer(artifact)) ? decodeSangArtifact(artifact) : artifact;
    const seed = Object.assign({}, opts.globals || {});
    const memory = {
      globals: seed,
      getGlobal(n) { return this.globals[n]; },
      setGlobal(n, v) { this.globals[n] = v; }
    };
    installNatives(memory.globals);
    const hostAPI = Object.assign({}, createDefaultHost(memory.globals), opts.hostAPI || {});
    const vmInst = new globalThis.MerkavaVM(memory, hostAPI, opts.context || {});
    const thread = vmInst.spawn({ bytecode: decoded.bytecode, constants: decoded.constants });
    thread.status = 'RUNNING';
    let cycles = opts.cycles || 50000;
    while (cycles-- > 0 && thread.status === 'RUNNING') {
      thread.step();
      if (thread.environment) Object.assign(memory.globals, thread.environment);
    }
    return {
      status: thread.status,
      error: thread.status === 'CRASHED' ? (thread.lastError && thread.lastError.message) || 'crashed' : null,
      trace: thread.status === 'CRASHED' ? (thread.lastError && thread.lastError.trace) || [] : [],
      vm: vmInst,
      thread,
      globals: memory.globals,
      memory
    };
  }

  /**
   * Build a listener registry wired to a `self`-style global.
   * Returns { self, listeners, on(type) }.
   */
  function createListenerRegistry() {
    const listeners = {};
    const self = {
      addEventListener(type, fn) {
        type = String(type);
        (listeners[type] = listeners[type] || []).push(fn);
      },
      removeEventListener(type, fn) {
        const l = listeners[String(type)];
        if (l) listeners[String(type)] = l.filter(x => x !== fn);
      }
    };
    return { self, listeners };
  }

  /**
   * Dispatch an event object to every listener registered for `type`.
   * Each listener is a bridged host-callable: invoke as fn(event).
   * Returns array of { ok, error } per listener.
   */
  function dispatchListeners(listeners, type, event) {
    const out = [];
    for (const fn of (listeners[String(type)] || []).slice()) {
      try {
        if (typeof fn === 'function') fn(event);
        else if (fn && typeof fn.call === 'function') fn.call([event]);
        out.push({ ok: true });
      } catch (e) {
        out.push({ ok: false, error: e && e.message });
      }
    }
    return out;
  }

  return { VmScriptRunner: { runVmScript, createListenerRegistry, dispatchListeners, loadPipeline, setPipelineLoaders } };
});
