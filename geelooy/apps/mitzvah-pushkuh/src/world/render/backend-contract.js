// B"H
/**
 * The backend contract is shaped like tomorrow.
 * Canvas, WebGL, and WebGPU may wear different garments, but each must answer
 * the same small covenant before the render graph can trust it.
 */
export const BACKEND_FEATURES = Object.freeze({
  canvas2d: "canvas2d", webgl: "webgl", webgpu: "webgpu", sprites: "sprites", rects: "rects", atlas: "atlas", timing: "timing"
});

export function normalizeBackend(backend, extra = {}) {
  const features = new Set(extra.features || []);
  if (backend.kind === "canvas") features.add(BACKEND_FEATURES.canvas2d);
  if (backend.kind === "webgl") features.add(BACKEND_FEATURES.webgl);
  return Object.assign(backend, { contract: { version: 1, features, commandStream: true, renderGraphBridge: !!extra.renderGraphBridge } });
}

export function hasFeature(backend, feature) {
  return !!backend?.contract?.features?.has?.(feature);
}
