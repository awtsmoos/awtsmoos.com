// B"H
const { createRegistry } = require('./worker-registry.js');
const { createProcessSupervisor } = require('./worker-processes.js');

/**
 * B"H
 * The worker supervisor is now a doorway, not a warehouse.
 * Registry memory, helper process supervision, and public snapshots live in
 * smaller vessels so no file becomes a sealed block of confusion.
 */
function createSupervisor(options = {}) {
  const registry = getGlobalRegistry(options);
  const processes = createProcessSupervisor(options);

  function status() {
    return { ...registry.snapshot(), supervisors: processes.snapshot() };
  }

  return {
    define: processes.define,
    start: processes.start,
    stop: processes.stop,
    status,
    registerWorker: registry.registerWorker,
    updateWorker: registry.updateWorker,
    finishWorker: registry.finishWorker,
    cancelWorker: registry.cancelWorker,
    snapshot: registry.snapshot
  };
}

function getGlobalRegistry(options = {}) {
  if (!global.__AWTSMOOS_WORKER_REGISTRY__) {
    global.__AWTSMOOS_WORKER_REGISTRY__ = createRegistry(options);
  }
  return global.__AWTSMOOS_WORKER_REGISTRY__;
}

module.exports = { createSupervisor, createRegistry, getGlobalRegistry };
