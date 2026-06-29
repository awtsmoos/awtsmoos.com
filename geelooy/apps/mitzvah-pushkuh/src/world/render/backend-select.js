// B"H
/**
 * Backend selection keeps the fallback faithful while passing future options.
 * The caller may ask for WebGL quality or atlas behavior, but Canvas remains
 * the trusted river when the GPU vessel is not ready.
 */
import { createCanvasBackend } from "./canvas-backend.js";
import { createWebGLBackend } from "./webgl-backend.js";

export function createBackend(canvas, prefer = "canvas", opts = {}) {
  if (prefer === "webgl") {
    const webgl = createWebGLBackend(canvas, opts);
    if (webgl) return webgl;
  }
  return createCanvasBackend(canvas);
}
