// B"H
/** Browser window bridge for pasted universe JSON. */
import { buildUniverseFromPaste } from "./UniversePasteBridge.js?compact=true&v=compact-all-visible-npc-never-cull-20260708-bh11";
import { defaultUniverseRuntimeRegistry } from "./UniverseRuntimeRegistry.js?compact=true&v=compact-all-visible-npc-never-cull-20260708-bh11";
export function installUniverseJsonWindowBridge(win = globalThis) {
  if (!win) return null;
  win.__AWTSMOOS_UNIVERSE_JSON__ = win.__AWTSMOOS_UNIVERSE_JSON__ || null;
  win.__AWTSMOOS_UNIVERSE_RUNTIME_REGISTRY__ = defaultUniverseRuntimeRegistry;
  win.awtsmoosPasteUniverseJson = input => { const built = buildUniverseFromPaste(input); return defaultUniverseRuntimeRegistry.add({ id:built.imported.summary.world.id, built }); };
  return { installed:true, registry:defaultUniverseRuntimeRegistry.snapshot() };
}
if (typeof window !== "undefined") installUniverseJsonWindowBridge(window);
