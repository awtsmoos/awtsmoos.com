// B"H
const { decodeSangArtifact } = require('./SangCodec.js');
const { loadMerkavaVm } = require('./MerkavaVmLoader.js');
const { createDefaultHost } = require('./DefaultMerkavaHost.js');

class TinyMemory {
  constructor(seed = {}) { this.globals = { ...seed }; }
  getGlobal(name) { return this.globals[name]; }
  setGlobal(name, value) { this.globals[name] = value; }
}

function installRuntimeNatives(memory) {
  const g = memory.globals;
  g.Promise = g.Promise || {
    resolve(value) {
      return {
        __kind: 'syncPromise',
        value,
        then(fn) { return g.Promise.resolve(typeof fn === 'function' ? fn(value) : value); },
        catch() { return this; }
      };
    },
    reject(reason) { throw reason; }
  };
  g.Map = g.Map || Map;
  g.Set = g.Set || Set;
  g.JSON = g.JSON || JSON;
  // B"H 2026-10-09: standard JS globals. The bytecode VM's readGlobal falls
  // back to memory.globals, so populating here makes Math/Array/Object/etc.
  // visible to `load` (0x22) without a host-syscall round trip.
  g.Math = g.Math || Math;
  g.Array = g.Array || Array;
  g.Object = g.Object || Object;
  g.String = g.String || String;
  g.Number = g.Number || Number;
  g.Boolean = g.Boolean || Boolean;
  g.RegExp = g.RegExp || RegExp;
  g.Error = g.Error || Error;
  g.TypeError = g.TypeError || TypeError;
  g.RangeError = g.RangeError || RangeError;
  g.SyntaxError = g.SyntaxError || SyntaxError;
  g.Date = g.Date || Date;
  if (!('NaN' in g)) g.NaN = NaN;
  if (!('Infinity' in g)) g.Infinity = Infinity;
  if (!('undefined' in g)) g.undefined = undefined;
  g.parseInt = g.parseInt || parseInt;
  g.parseFloat = g.parseFloat || parseFloat;
  g.isNaN = g.isNaN || isNaN;
  g.isFinite = g.isFinite || isFinite;
  g.encodeURI = g.encodeURI || encodeURI;
  g.decodeURI = g.decodeURI || decodeURI;
  g.encodeURIComponent = g.encodeURIComponent || encodeURIComponent;
  g.decodeURIComponent = g.decodeURIComponent || decodeURIComponent;
}

/**
 * B"H
 * Chapter 105: the bytecode no longer hides the scream.
 *
 * SANG remains the executable body, but when its thread crashes the returned
 * object now carries the stored crash soul: message, IP, bytecode length, trace,
 * stack summary, and the raw VM stack. Higher layers can decompile from this
 * metadata instead of flattening everything into "module failed".
 *
 * B"H 2026-10-09: thread.environment is unified with memory.globals (when no
 * explicit context is given). Previously they were separate objects with a
 * one-way sync (env -> globals) after each step, which wiped host-syscall
 * writes to globals (e.g. closure variable updates via the host interpreter).
 * Unification makes the VM's store/load and the host's read/write operate on
 * the same object — no sync needed, no clobbering.
 */
function runSang(buffer, options = {}) {
  loadMerkavaVm();
  const artifact = Buffer.isBuffer(buffer) ? decodeSangArtifact(buffer) : buffer;
  const memory = new TinyMemory(options.globals || {});
  const hostAPI = { ...createDefaultHost(memory.globals), ...(options.hostAPI || {}) };
  installRuntimeNatives(memory);
  // Unify: thread.environment === memory.globals so bytecode and host share
  // a single source of truth for globals. An explicit options.context still
  // overrides (advanced embedding use).
  const context = options.context || memory.globals;
  const vm = new globalThis.MerkavaVM(memory, hostAPI, context);
  const thread = vm.spawn({ bytecode: artifact.bytecode, constants: artifact.constants });
  // Belt and suspenders: ensure the spawned thread uses the unified object
  // even if the VM constructor path changes.
  if (thread && thread.environment !== memory.globals && !options.context) {
    thread.environment = memory.globals;
  }
  thread.status = 'RUNNING';
  let cycles = options.cycles || 10000;
  // B"H (2026-10-09): use thread.run() batch runner (was: per-instruction step() calls)
  if (typeof thread.run === 'function') {
    thread.run(cycles);
  } else {
    while (cycles-- > 0 && thread.status === 'RUNNING') {
      thread.step();
    }
  }
  // No sync needed when unified; keep the guarded copy for the explicit-
  // context case where environment is a different object.
  if (thread.environment && thread.environment !== memory.globals) {
    Object.assign(memory.globals, thread.environment);
  }
  const crash = thread.status === 'CRASHED'
    ? (thread.lastError || { message: 'Merkava thread crashed without stored error', trace: thread.getDivineTrace?.() || [] })
    : null;
  return {
    ok: thread.status === 'COMPLETED',
    status: thread.status,
    result: thread._sp > 0 ? thread.stack[thread._sp - 1] : undefined,
    stack: thread.stack.slice(0, thread._sp || 0),
    globals: { ...memory.globals, ...(thread.environment && thread.environment !== memory.globals ? thread.environment : {}) },
    environment: thread.environment || {},
    artifact,
    crash,
    error: crash ? crash.message : null,
    trace: crash ? crash.trace : null
  };
}

module.exports = { TinyMemory, runSang, installRuntimeNatives };
