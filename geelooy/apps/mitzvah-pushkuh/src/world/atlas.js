// B"H
// The atlas pre-forges thunder: color, portal, bloom, and beams wait ready.
export function createAtlas() {
  return { glow: glow(56), burst: glow(26), diamond: diamond(36), portal: portal(54), beams: [beam("#8feaff"), beam("#ff87d7"), beam("#ffe08a")] };
}
function make(w, h) {
  if (typeof OffscreenCanvas !== "undefined") return new OffscreenCanvas(w, h);
  const c = document.createElement("canvas"); c.width = w; c.height = h; return c;
}
function glow(size) {
  const c = make(size, size), ctx = c.getContext("2d"), x = size / 2, g = ctx.createRadialGradient(x, x, 1, x, x, x);
  g.addColorStop(0, "#ffffffe8"); g.addColorStop(.22, "#8feaff9c"); g.addColorStop(.6, "#ff87d742"); g.addColorStop(1, "#0000");
  ctx.fillStyle = g; ctx.fillRect(0, 0, size, size); return c;
}
function diamond(size) {
  const c = make(size, size), ctx = c.getContext("2d"), x = size / 2, r = size * .38;
  ctx.fillStyle = "#fff8"; ctx.beginPath(); ctx.moveTo(x, x - r); ctx.lineTo(x + r, x); ctx.lineTo(x, x + r); ctx.lineTo(x - r, x); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = "#fff"; ctx.stroke(); return c;
}
function portal(size) {
  const c = make(size, size), ctx = c.getContext("2d"), p = size * .18, w = size - p * 2;
  ctx.strokeStyle = "#ffe08acc"; ctx.lineWidth = 3; ctx.strokeRect(p, p, w, w); ctx.strokeStyle = "#8feaff77"; ctx.strokeRect(p + 7, p + 7, w - 14, w - 14); return c;
}
function beam(color) {
  const c = make(192, 26), ctx = c.getContext("2d"), g = ctx.createLinearGradient(0, 0, 192, 0);
  g.addColorStop(0, "#0000"); g.addColorStop(.5, color + "aa"); g.addColorStop(1, "#0000"); ctx.fillStyle = g; ctx.fillRect(0, 0, 192, 26); return c;
}
