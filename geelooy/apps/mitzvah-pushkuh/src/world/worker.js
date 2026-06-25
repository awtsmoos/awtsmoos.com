// B"H
// Worker clock: chase 60 with rAF when present, timer when hidden from it.
import { createRenderer } from "./renderer.js";

let renderer, timer = 0, raf = 0;
const frame = now => { renderer?.frame(now || performance.now()); schedule(); };
function schedule() {
  if (!renderer) return;
  if (self.requestAnimationFrame) raf = self.requestAnimationFrame(frame);
  else timer = setTimeout(() => frame(performance.now()), 16);
}
function start(canvas, width, height, dpr, reduced) {
  renderer = createRenderer(canvas, { reduced }); renderer.resize(width, height, dpr); schedule();
}
self.onmessage = ({ data }) => {
  if (!data) return;
  if (data.type === "start") start(data.canvas, data.width, data.height, data.dpr, data.reduced);
  if (!renderer) return;
  if (data.type === "resize") renderer.resize(data.width, data.height, data.dpr);
  if (data.type === "entries") renderer.setEntries(data.entries || []);
  if (data.type === "plant") renderer.plant(data.entry);
  if (data.type === "bless") renderer.bless(data.point, data.power);
  if (data.type === "strike") renderer.strike(data.point);
  if (data.type === "pause") renderer.setPaused(data.value);
  if (data.type === "stop") { clearTimeout(timer); self.cancelAnimationFrame?.(raf); renderer = null; }
};
