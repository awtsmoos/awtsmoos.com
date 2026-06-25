// B"H
// Render targets are named vessels for future WebGL and current Canvas light.
export function createTargets(w, h, make) {
  return { main: make(w, h), light: make(Math.max(80, w >> 2), Math.max(80, h >> 2)), fog: make(Math.max(80, w >> 1), Math.max(80, h >> 1)) };
}
export function canvasFactory() {
  return (w, h) => { if (typeof OffscreenCanvas !== "undefined") return new OffscreenCanvas(w, h); const c = document.createElement("canvas"); c.width = w; c.height = h; return c; };
}
