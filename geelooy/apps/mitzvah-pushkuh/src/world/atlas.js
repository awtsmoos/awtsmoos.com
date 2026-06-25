// B"H
// Light is pre-forged here, so frames receive lightning without labor.
export function createAtlas() {
  return { glow: glow(48), burst: glow(24), diamond: diamond(34), beam: beam(160, 24) };
}
function make(w, h) {
  if (typeof OffscreenCanvas !== "undefined") return new OffscreenCanvas(w, h);
  const c = document.createElement("canvas"); c.width = w; c.height = h; return c;
}
function glow(size) {
  const c = make(size, size), x = size / 2, g = c.getContext("2d").createRadialGradient(x, x, 1, x, x, x);
  const ctx = c.getContext("2d"); g.addColorStop(0, "#ffffffdd"); g.addColorStop(.24, "#8feaff88"); g.addColorStop(.62, "#ff87d733"); g.addColorStop(1, "#0000");
  ctx.fillStyle = g; ctx.fillRect(0, 0, size, size); return c;
}
function diamond(size) {
  const c = make(size, size), ctx = c.getContext("2d"), x = size / 2, r = size * .38;
  ctx.fillStyle = "#fff7"; ctx.beginPath(); ctx.moveTo(x, x - r); ctx.lineTo(x + r, x); ctx.lineTo(x, x + r); ctx.lineTo(x - r, x); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = "#fff"; ctx.stroke(); return c;
}
function beam(w, h) {
  const c = make(w, h), ctx = c.getContext("2d"), g = ctx.createLinearGradient(0, 0, w, 0);
  g.addColorStop(0, "#0000"); g.addColorStop(.5, "#8feaff88"); g.addColorStop(1, "#0000"); ctx.fillStyle = g; ctx.fillRect(0, 0, w, h); return c;
}
