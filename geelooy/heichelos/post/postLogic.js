// B"H
/**
 * @file postLogic.js
 * @description
 * Chapter 352: The two reader gates are nailed into visible air.
 * The Awtsmoos does not let inherited transforms drag A beyond the left edge;
 * every refresh places A and I together, inside the viewport, above the words.
 */

import { ignite } from "./logic/initialization/bootstrap.js";
import { repairReaderScrollVessel } from "./logic/scroll/ReaderScrollRepair.js";
import { bindReaderWheelBridge } from "./logic/scroll/ReaderWheelBridge.js";
import { runReaderVisualDiagnostics } from "./logic/visual/index.js";
import { runReaderBeauty } from "./logic/beauty/index.js";
import { runReaderLegend } from "./logic/legend/index.js";
import { resetScrollBlockerCache } from "./logic/visual/scrollBlockerDetector.js";

const CONTROL_CSS_ID = "awtsmoos-mobile-visible-reader-controls";

function ensureControlStyle() {
    if (document.getElementById(CONTROL_CSS_ID)) return;
    const style = document.createElement("style");
    style.id = CONTROL_CSS_ID;
    style.textContent = `
@media (max-width: 900px) {
  .post-reader-localized-context .awtsmoos-floating-controls {
    position: fixed !important;
    top: calc(env(safe-area-inset-top, 0px) + 74px) !important;
    left: max(12px, env(safe-area-inset-left, 0px)) !important;
    right: auto !important;
    bottom: auto !important;
    transform: none !important;
    translate: none !important;
    width: auto !important;
    min-width: 0 !important;
    max-width: calc(100vw - 24px) !important;
    height: auto !important;
    display: flex !important;
    flex-direction: row !important;
    align-items: center !important;
    justify-content: flex-start !important;
    gap: 8px !important;
    padding: 6px !important;
    overflow: visible !important;
    pointer-events: auto !important;
    z-index: 2147483000 !important;
  }
  .post-reader-localized-context .awtsmoos-floating-controls button {
    position: static !important;
    transform: none !important;
    translate: none !important;
    display: inline-grid !important;
    place-items: center !important;
    flex: 0 0 44px !important;
    width: 44px !important;
    min-width: 44px !important;
    max-width: 44px !important;
    height: 44px !important;
    min-height: 44px !important;
    max-height: 44px !important;
    margin: 0 !important;
    opacity: 1 !important;
    visibility: visible !important;
    pointer-events: auto !important;
  }
}`;
    document.head.appendChild(style);
}

function placeReaderControls() {
    ensureControlStyle();
    const controls = document.querySelector(".awtsmoos-floating-controls");
    if (!controls) return;
    const important = (name, value) => controls.style.setProperty(name, value, "important");
    important("position", "fixed");
    important("top", "calc(env(safe-area-inset-top, 0px) + 74px)");
    important("left", "max(12px, env(safe-area-inset-left, 0px))");
    important("right", "auto");
    important("bottom", "auto");
    important("transform", "none");
    important("translate", "none");
    important("display", "flex");
    important("flex-direction", "row");
    important("gap", "8px");
    important("overflow", "visible");
    important("z-index", "2147483000");
    controls.querySelectorAll("button").forEach(button => {
        const set = (name, value) => button.style.setProperty(name, value, "important");
        set("display", "inline-grid");
        set("place-items", "center");
        set("flex", "0 0 44px");
        set("width", "44px");
        set("min-width", "44px");
        set("height", "44px");
        set("min-height", "44px");
        set("transform", "none");
        set("translate", "none");
        set("opacity", "1");
        set("visibility", "visible");
    });
}

function repairSoon() {
    repairReaderScrollVessel();
    bindReaderWheelBridge();
    placeReaderControls();
}

function runSafe(label, fn) {
    try {
        return fn();
    } catch (error) {
        console.warn(`B"H ${label} failed safely`, error);
        return null;
    }
}

function refreshBeautyAndLegend() {
    runSafe("reader beauty", runReaderBeauty);
    runSafe("reader legend", runReaderLegend);
}

function refreshDiagnostics({ forceBlockerScan = false } = {}) {
    if (forceBlockerScan) resetScrollBlockerCache();
    runSafe("reader visual diagnostics", runReaderVisualDiagnostics);
}

async function begin() {
    repairSoon();
    await ignite();
    repairSoon();
    refreshBeautyAndLegend();
    refreshDiagnostics({ forceBlockerScan: true });
    [40, 80, 180, 350, 700, 1200, 2400].forEach(delay => {
        setTimeout(repairSoon, delay);
        setTimeout(refreshBeautyAndLegend, delay + 40);
    });
    setTimeout(() => refreshDiagnostics({ forceBlockerScan: true }), 2600);
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", begin, { once: true });
} else {
    begin();
}