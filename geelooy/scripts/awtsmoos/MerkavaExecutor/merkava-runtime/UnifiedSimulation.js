// B"H
const { RuntimeAssembler } = require('./RuntimeAssembler.js');

/**
 * UnifiedSimulation exposes the older full-JS simulation vessel through a
 * small API. This lane can execute complex native JavaScript in isolated
 * browser/node-like contexts, but it is not the custom bytecode VM lane.
 */
async function simulateFiles({ files = {}, entry = 'index.js', runtime = 'browser', globals = {}, env = {}, origin, url, module } = {}) {
  const normalizedFiles = normalizeFiles(files);
  const assembler = new RuntimeAssembler({
    files: normalizedFiles,
    entry,
    runtime,
    env,
    origin: origin || 'http://merkava.local/',
    url: url || origin || 'http://merkava.local/',
    module,
    runtimeGlobals: globals
  });
  return assembler.run(entry);
}

function normalizeFiles(files = {}) {
  const out = { ...files };
  for (const [key, value] of Object.entries(files)) {
    const bare = key.replace(/^\.\//, '').replace(/^\//, '');
    if (!out[bare]) out[bare] = value;
    if (!out['/' + bare]) out['/' + bare] = value;
    if (!out['./' + bare]) out['./' + bare] = value;
  }
  return out;
}

async function simulateBrowser(files, entry = 'index.html', options = {}) {
  return simulateFiles({ ...options, files, entry, runtime: 'browser' });
}

async function simulateNode(files, entry = 'index.js', options = {}) {
  return simulateFiles({ ...options, files, entry, runtime: 'node' });
}

async function simulateWorker(files, entry = 'worker.js', options = {}) {
  const workerGlobals = {
    postMessage(value) { workerGlobals.__messages.push(value); },
    addEventListener(type, handler) { workerGlobals.__listeners[type] = handler; },
    dispatchMessage(data) {
      const handler = workerGlobals.__listeners.message;
      if (handler) handler({ data });
    },
    __messages: [],
    __listeners: {},
    ...(options.globals || {})
  };
  const run = await simulateFiles({ ...options, files, entry, runtime: 'browser', globals: workerGlobals });
  run.worker = workerGlobals;
  return run;
}

module.exports = { simulateFiles, simulateBrowser, simulateNode, simulateWorker, normalizeFiles };
