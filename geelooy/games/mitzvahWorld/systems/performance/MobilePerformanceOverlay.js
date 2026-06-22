// B"H
/**
 * @file MobilePerformanceOverlay.js
 * @description Chapter 442: a tiny witness counts frames without covering the
 * world. Enable with ?perf=1, localStorage.awtsmoosPerfOverlay=1, or window flag.
 */
let raf = 0, frames = 0, last = 0, node = null;
function enabled(win) { try { const q = new URLSearchParams(win.location?.search || ""); return q.has("perf") || win.AWTSMOOS_PERF_OVERLAY === true || win.localStorage?.getItem("awtsmoosPerfOverlay") === "1"; } catch { return false; } }
function readReport(win) { return win.AWTSMOOS_LAST_WORLD_REPORT || win.__AWTSMOOS_WORKER_WORLD_REPORT__ || {}; }
function workerFps(win) { const payload = win.__AWTSMOOS_WORKER_GAMEPLAY_FPS__ || win.AWTSMOOS_GAMEPLAY_FPS; return Number.isFinite(Number(payload?.fps)) ? payload : null; }
function hotStage(worker) { const stages = worker?.stages || {}; let best = null, value = 0; for (const [key, raw] of Object.entries(stages)) { if (key === "total" || key === "render") continue; const n = Number(raw) || 0; if (n > value) { best = key; value = n; } } return best ? ` · hot ${best} ${Math.round(value * 10) / 10} ms` : ""; }
function renderInfo(worker) { const info = worker?.renderInfo || {}, calls = Number(info.calls || 0), tris = Number(info.triangles || 0); return calls || tris ? ` · calls ${calls} · tris ${Math.round(tris / 100) / 10}k` : ""; }
function topLayer(worker) { const layer = Array.isArray(worker?.layerStats) ? worker.layerStats[0] : null; if (!layer) return ""; const name = String(layer.name || "layer").replace(/^living_region_|^region_/i, "").slice(0, 18); return ` · top ${name} ${layer.meshes || 0}m`; }
function text(win, fps) { const report = readReport(win), children = report.sceneChildren ?? "?", niv = report.nivrayim ?? report.npcCount ?? "?", trees = report.trees ?? "?", worker = workerFps(win); const game = worker ? `game ${worker.fps} fps` : "game ..."; const avg = worker?.avgWallFrameMs ? ` · ${worker.avgWallFrameMs} ms` : worker?.avgFrameMs ? ` · ${worker.avgFrameMs} ms` : ""; const render = worker?.renderCostMs ? ` · render ${worker.renderCostMs} ms` : ""; const update = worker?.updateCostMs ? ` · upd ${worker.updateCostMs} ms` : ""; const scale = worker?.pixelRatio ? ` · px ${worker.pixelRatio}` : ""; return `${game}${avg}${render}${update}${hotStage(worker)}${renderInfo(worker)}${topLayer(worker)}${scale} · main ${fps} fps · ${children} nodes · ${niv} niv · ${trees} trees`; }
function tick(win, time) { frames += 1; if (!last) last = time; if (time - last >= 1000) { const fps = Math.round(frames * 1000 / (time - last)); if (node) node.textContent = text(win, fps); frames = 0; last = time; } raf = win.requestAnimationFrame(t => tick(win, t)); }
export function ensureMobilePerformanceOverlay(win = globalThis.window, doc = globalThis.document) { if (!win || !doc || !enabled(win)) return null; if (!node) { node = doc.createElement("div"); node.className = "awtsmoos-perf-chip"; node.textContent = "perf…"; doc.body.appendChild(node); } if (!raf) raf = win.requestAnimationFrame(t => tick(win, t)); return node; }
export default ensureMobilePerformanceOverlay;
