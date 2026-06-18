// B"H
/**
 * @file MobilePerformanceOverlay.js
 * @description Chapter 442: a tiny witness counts frames without covering the
 * world. Enable with ?perf=1, localStorage.awtsmoosPerfOverlay=1, or window flag.
 */
let raf = 0, frames = 0, last = 0, node = null;
function enabled(win) { try { const q = new URLSearchParams(win.location?.search || ""); return q.has("perf") || win.AWTSMOOS_PERF_OVERLAY === true || win.localStorage?.getItem("awtsmoosPerfOverlay") === "1"; } catch { return false; } }
function readReport(win) { return win.AWTSMOOS_LAST_WORLD_REPORT || win.__AWTSMOOS_WORKER_WORLD_REPORT__ || {}; }
function text(win, fps) { const report = readReport(win), children = report.sceneChildren ?? "?", niv = report.nivrayim ?? report.npcCount ?? "?", trees = report.trees ?? "?"; return `${fps} fps · ${children} nodes · ${niv} niv · ${trees} trees`; }
function tick(win, time) { frames += 1; if (!last) last = time; if (time - last >= 1000) { const fps = Math.round(frames * 1000 / (time - last)); if (node) node.textContent = text(win, fps); frames = 0; last = time; } raf = win.requestAnimationFrame(t => tick(win, t)); }
export function ensureMobilePerformanceOverlay(win = globalThis.window, doc = globalThis.document) { if (!win || !doc || !enabled(win)) return null; if (!node) { node = doc.createElement("div"); node.className = "awtsmoos-perf-chip"; node.textContent = "perf…"; doc.body.appendChild(node); } if (!raf) raf = win.requestAnimationFrame(t => tick(win, t)); return node; }
export default ensureMobilePerformanceOverlay;
