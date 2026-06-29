// B"H

export function routeInput(os, event) {
  os.graph?.emit?.("input.routed", event) || os.graph?.events?.push?.("input.routed", event);
  const active = os.windowHandler?.windows?.at?.(-1);
  return { ok:true, targetWindow:active?.id || active?.ID || "desktop", event };
}

/**
 * B"H
 * Input enters through the graph event gate, so watchers and future replicas
 * hear the same click, key, and remote hand that the desktop receives.
 */
