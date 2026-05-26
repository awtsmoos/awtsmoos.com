//B"H

/**
 * Syncs the visible automation settings into the extension service worker.
 * The worker then owns future ticks even after this page closes.
 */
export async function syncBackgroundAutomation({ settings, graph, conversationId, report = () => {} } = {}) {
  const bridge = window.awtsmoosFetch || window.mFetch;
  if (!bridge?.startBackgroundAutomation) {
    report("background automation bridge not available yet");
    return null;
  }
  if (!settings?.enabled) {
    const stopped = await bridge.stopBackgroundAutomation?.("page-disabled");
    report("background automation stopped");
    return stopped;
  }
  if (!conversationId) {
    report("background automation waiting for conversation id");
    return null;
  }
  const state = await bridge.startBackgroundAutomation({ settings, graph, conversationId });
  report(`background automation armed: ${state?.status || "ready"}`);
  return state;
}

export async function getBackgroundAutomationStatus() {
  return await (window.awtsmoosFetch || window.mFetch)?.backgroundAutomationStatus?.();
}
