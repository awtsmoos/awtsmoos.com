// B"H
/** @file ColliderDebugOverlay.js @description Compact debug payload for visible-sourced colliders, parser-clear. */
function summaryOf(report) { return report && report.summary ? report.summary : {}; }
export function colliderDebugOverlay(report) { const summary = summaryOf(report); return { visible:false, hard:summary.hardColliders || 0, color:0xff00ff, source:"visible-sourced-hard-only" }; }
