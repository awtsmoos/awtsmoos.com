// B"H
/**
 * @file postLogic.js
 * @description The reader boots, repairs its scroll vessel, then resolves any
 * exact comment deep link only after the real post and comment anchors exist.
 */
import { ignite } from "./logic/initialization/bootstrap.js";
import { revealDeepLinkedComment } from "./logic/initialization/deepLinkComment.js";
import { repairReaderScrollVessel } from "./logic/scroll/ReaderScrollRepair.js";
import { bindReaderWheelBridge } from "./logic/scroll/ReaderWheelBridge.js";
import { runReaderVisualDiagnostics } from "./logic/visual/index.js";
import { runReaderBeauty } from "./logic/beauty/index.js";
import { runReaderLegend } from "./logic/legend/index.js";
import { resetScrollBlockerCache } from "./logic/visual/scrollBlockerDetector.js";
function repairSoon() {
    repairReaderScrollVessel();
    bindReaderWheelBridge();
}
function runSafe(label, fn) {
    try { return fn(); }
    catch (error) { console.warn(`B"H ${label} failed safely`, error); return null; }
}
function refreshBeautyAndLegend() {
    runSafe("reader beauty", runReaderBeauty);
    runSafe("reader legend", runReaderLegend);
}
function refreshDiagnostics({ forceBlockerScan = false } = {}) {
    if (forceBlockerScan) resetScrollBlockerCache();
    runSafe("reader visual diagnostics", runReaderVisualDiagnostics);
}
async function revealRequestedComment() {
    try { await revealDeepLinkedComment(); }
    catch (error) {
        console.warn('B"H exact comment deep link could not be revealed', error);
        document.body.dataset.deepLinkedCommentError = error.message;
    }
}
async function begin() {
    repairSoon();
    await ignite();
    repairSoon();
    await revealRequestedComment();
    refreshBeautyAndLegend();
    refreshDiagnostics({ forceBlockerScan: true });
    [80, 350, 1200, 2400].forEach(delay => {
        setTimeout(repairSoon, delay);
        setTimeout(refreshBeautyAndLegend, delay + 40);
    });
    setTimeout(() => refreshDiagnostics({ forceBlockerScan: true }), 2600);
}
if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", begin, { once: true });
else begin();
