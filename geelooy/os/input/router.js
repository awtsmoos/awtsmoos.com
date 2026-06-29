// B"H
export function routeInput(os, event) { os.graph?.events?.push?.("input.routed", event); const active = os.windowHandler?.windows?.at?.(-1); return { ok:true, targetWindow:active?.id || active?.ID || "desktop", event }; }
