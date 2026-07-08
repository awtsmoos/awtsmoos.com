// B"H
import { defaultUniverseManifestStore } from "./UniverseManifestStore.js?compact=true&v=compact-all-visible-npc-never-cull-20260708-bh11";
export function installUniverseManifestWindowBridge(win = globalThis) { if (!win) return null; win.__AWTSMOOS_UNIVERSE_MANIFESTS__ = defaultUniverseManifestStore; win.awtsmoosLatestUniverseManifest = () => defaultUniverseManifestStore.latest(); return { installed:true }; }
if (typeof window !== "undefined") installUniverseManifestWindowBridge(window);
