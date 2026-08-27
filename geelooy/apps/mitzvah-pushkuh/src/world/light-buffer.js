// B"H
// A tiny lake of light, stretched huge: revelation by scaling, not toil.
export function createLightBuffer(w, h) {
  const scale = .25, lw = Math.max(80, Math.floor(w * scale)), lh = Math.max(80, Math.floor(h * scale));
  const canvas = make(lw, lh), ctx = canvas.getContext("2d", { alpha: true });
  function clear() { ctx.clearRect(0, 0, lw, lh); }
  function spark(x, y, c, r = 10) { ctx.fillStyle = c; ctx.globalAlpha = .35; ctx.fillRect(x * scale - r / 2, y * scale - r / 2, r, r); ctx.globalAlpha = 1; }
  function beam(x, y, w2, h2, c) { ctx.fillStyle = c; ctx.globalAlpha = .22; ctx.fillRect(x * scale, y * scale, w2 * scale, h2 * scale); ctx.globalAlpha = 1; }
  function flush(target, w2, h2) { target.save(); target.globalCompositeOperation = "lighter"; target.imageSmoothingEnabled = true; target.drawImage(canvas, 0, 0, w2, h2); target.restore(); }
  return { clear, spark, beam, flush };
}
function make(w, h) {
  if (typeof OffscreenCanvas !== "undefined") return new OffscreenCanvas(w, h);
  const c = document.createElement("canvas"); c.width = w; c.height = h; return c;
}
