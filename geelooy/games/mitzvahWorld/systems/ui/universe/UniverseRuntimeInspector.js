// B"H
import { installUniverseManifestWindowBridge } from "../../universe/UniverseManifestWindowBridge.js";
import { UNIVERSE_INSPECTOR_STYLE } from "./UniverseInspectorStyles.js";
export function installUniverseRuntimeInspector(win = window, doc = document) { installUniverseManifestWindowBridge(win); if (doc.getElementById("awtsmoos-universe-runtime-inspector")) return { installed:false }; const el = doc.createElement("pre"); el.id = "awtsmoos-universe-runtime-inspector"; el.style.cssText = UNIVERSE_INSPECTOR_STYLE; el.textContent = JSON.stringify(win.awtsmoosLatestUniverseManifest?.() || { ready:false }, null, 2); doc.body.appendChild(el); return { installed:true }; }
if (typeof window !== "undefined" && window.location.search.includes("awtsmoosUniverseInspect=1")) installUniverseRuntimeInspector(window, document);
