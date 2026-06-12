/**
 * B"H
 * Worker/offscreen capability gate.
 *
 * Chapter 250: some browsers open the worker-gate, some punish it. This module
 * detects the doorway without forcing the whole game through it. The main
 * thread keeps the safe backbuffer path unless a future flag deliberately
 * enables worker rendering.
 */
export function workerSupport(canvas) {
  const worker = typeof Worker !== 'undefined';
  const offscreen = typeof OffscreenCanvas !== 'undefined';
  const transfer = !!canvas && typeof canvas.transferControlToOffscreen === 'function';
  const moduleWorker = worker && supportsModuleWorkerProbe();
  return {
    worker,
    offscreen,
    transfer,
    moduleWorker,
    canRenderWorker: worker && transfer && moduleWorker,
    canSimWorker: worker && moduleWorker
  };
}

export function workerRenderingEnabled(canvas) {
  try {
    return localStorage.getItem('sefiraWorkerRender') === '1' && workerSupport(canvas).canRenderWorker;
  } catch {
    return false;
  }
}

function supportsModuleWorkerProbe() {
  try {
    const blob = new Blob(['export default 1'], { type: 'text/javascript' });
    const url = URL.createObjectURL(blob);
    const w = new Worker(url, { type: 'module' });
    w.terminate();
    URL.revokeObjectURL(url);
    return true;
  } catch {
    return false;
  }
}
