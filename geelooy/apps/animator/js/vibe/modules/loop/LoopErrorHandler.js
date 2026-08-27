// B"H
/** Error bridge for legacy Vibe loop failures. */
export const LoopErrorHandler = {
  handle(error, path, taskId, context = null, change = null) {
    const detail = { error, path, taskId, context, change };
    console.error('B"H Vibe loop error', detail);
    if (globalThis.document && globalThis.CustomEvent) {
      if (globalThis.document && globalThis.CustomEvent) {
      document.dispatchEvent(new CustomEvent('awtsmoos:vibe:error', { detail }));
    }
    }
    return detail;
  }
};
