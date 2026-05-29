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
  memory.globals.Promise = memory.globals.Promise || {
    resolve(value) {
      return {
        __kind: 'syncPromise',
        value,
        then(fn) { return memory.globals.Promise.resolve(typeof fn === 'function' ? fn(value) : value); },
        catch() { return this; }
      };
    },
    reject(reason) { throw reason; }
  };
  memory.globals.Map = memory.globals.Map || Map;
  memory.globals.Set = memory.globals.Set || Set;
  memory.globals.JSON = memory.globals.JSON || JSON;
}

/**
 * B"H
 * Chapter 105: the bytecode no longer hides the scream.
 *
 * SANG remains the executable body, but when its thread crashes the returned
 * object now carries the stored crash soul: message, IP, bytecode length, trace,
 * stack summary, and the raw VM stack. Higher layers can decompile from this
 * metadata instead of flattening everything into "module failed".
 */
function runSang(buffer, options = {}) {
  loadMerkavaVm();
  const artifact = Buffer.isBuffer(buffer) ? decodeSangArtifact(buffer) : buffer;
  const memory = new TinyMemory(options.globals || {});
  const hostAPI = { ...createDefaultHost(memory.globals), ...(options.hostAPI || {}) };
  installRuntimeNatives(memory);
  const vm = new globalThis.MerkavaVM(memory, hostAPI, options.context || {});
  const thread = vm.spawn({ bytecode: artifact.bytecode, constants: artifact.constants });
  thread.status = 'RUNNING';
  let cycles = options.cycles || 10000;
  while (cycles-- > 0 && thread.status === 'RUNNING') {
    thread.step();
    if (thread.environment) Object.assign(memory.globals, thread.environment);
  }
  const crash = thread.status === 'CRASHED'
    ? (thread.lastError || { message: 'Merkava thread crashed without stored error', trace: thread.getDivineTrace?.() || [] })
    : null;
  return {
    ok: thread.status === 'COMPLETED',
    status: thread.status,
    result: thread.stack[thread.stack.length - 1],
    stack: thread.stack.slice(),
    globals: { ...memory.globals, ...(thread.environment || {}) },
    environment: thread.environment || {},
    artifact,
    crash,
    error: crash ? crash.message : null,
    trace: crash ? crash.trace : null
  };
}

module.exports = { TinyMemory, runSang };
