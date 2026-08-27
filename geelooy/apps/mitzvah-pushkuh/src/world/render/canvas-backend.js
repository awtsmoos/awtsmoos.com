// B"H
// Canvas backend remains the faithful fallback vessel, now command-aware.
import { executeCanvasCommands } from "./canvas-commands.js";
export function createCanvasBackend(canvas) {
  const ctx = canvas.getContext("2d", { alpha: false, desynchronized: true });
  function resize(w, h) { canvas.width = w; canvas.height = h; }
  function begin() { ctx.imageSmoothingEnabled = true; return ctx; }
  function execute(buffer) { executeCanvasCommands(ctx, buffer); }
  function end() {}
  return { kind: "canvas", ctx, resize, begin, execute, end };
}
