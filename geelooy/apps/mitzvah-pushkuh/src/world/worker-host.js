// B"H
// Main thread host: sparse messages, stats whispers, no pointer flood.
import { qualityFor } from "./quality.js";

export function canUseWorker(canvas) {
  return !!(canvas.transferControlToOffscreen && window.OffscreenCanvas && window.Worker);
}
export function createWorkerWorld(canvas, reduced, debug = false) {
  const worker = new Worker(new URL("./worker.js", import.meta.url), { type: "module" });
  const offscreen = canvas.transferControlToOffscreen();
  let rect = canvas.getBoundingClientRect(), q = qualityFor(rect.width, rect.height, reduced), last = 0;
  function send(type, extra = {}, transfer) { worker.postMessage({ type, ...extra }, transfer || []); }
  function resize() { rect = canvas.getBoundingClientRect(); q = qualityFor(rect.width, rect.height, reduced); send("resize", { width: rect.width, height: rect.height, dpr: q.dpr }); }
  function point(x, y) { return { x: x - rect.left, y: y - rect.top }; }
  worker.onmessage = e => { if (e.data?.type === "stats") canvas.dispatchEvent(new CustomEvent("worldstats", { detail: e.data.stats })); };
  const ro = new ResizeObserver(resize); ro.observe(canvas);
  send("start", { canvas: offscreen, width: rect.width, height: rect.height, dpr: q.dpr, reduced, debug }, [offscreen]);
  document.addEventListener("visibilitychange", () => send("pause", { value: document.hidden })); addEventListener("resize", resize);
  return {
    setEntries: entries => send("entries", { entries }), plant: entry => send("plant", { entry }), setDebug: value => send("debug", { value }),
    bless: (x, y, power = 1) => { const now = performance.now(); if (now - last < 80) return; last = now; send("bless", { point: point(x, y), power }); },
    strike: (x, y) => send("strike", { point: point(x, y) }),
    destroy: () => { ro.disconnect(); send("stop"); worker.terminate(); }
  };
}
