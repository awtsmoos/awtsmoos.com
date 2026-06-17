// B"H
import { defaultUniverseManifestStore } from "./UniverseManifestStore.js";
export function installUniverseManifestWindowBridge(win = globalThis) { if (!win) return null; win.__AWTSMOOS_UNIVERSE_MANIFESTS__ = defaultUniverseManifestStore; win.awtsmoosLatestUniverseManifest = () => defaultUniverseManifestStore.latest(); return { installed:true }; }
if (typeof window !== "undefined") installUniverseManifestWindowBridge(window);
