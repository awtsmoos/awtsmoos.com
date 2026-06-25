// B"H
// Cached heaven eats detail once, then the frame runs like lightning.
export function createLayers(w, h, q) {
  const bg = make(w, h); paint(bg.getContext("2d"), w, h, q); return { bg };
}
function make(w, h) {
  if (typeof OffscreenCanvas !== "undefined") return new OffscreenCanvas(w, h);
  const c = document.createElement("canvas"); c.width = w; c.height = h; return c;
}
function paint(ctx, w, h, q) {
  sky(ctx, w, h); starLanes(ctx, w, h, q.stars); hills(ctx, w, h); lake(ctx, w, h); frame(ctx, w, h); glyphs(ctx, w, h);
}
function sky(ctx, w, h) {
  const g = ctx.createLinearGradient(0, 0, 0, h); g.addColorStop(0, "#04000f"); g.addColorStop(.35, "#1d0a46"); g.addColorStop(.72, "#05283d"); g.addColorStop(1, "#020006");
  ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
}
function starLanes(ctx, w, h, n) {
  ctx.save(); ctx.globalCompositeOperation = "lighter";
  for (let i = 0; i < n; i++) { const x = (i * 97) % w, y = (i * 53) % (h * .63), s = 1 + (i % 4); ctx.globalAlpha = .18 + (i % 9) * .045; ctx.fillStyle = i % 5 ? "#fff" : "#ffe08a"; ctx.fillRect(x, y, s, s); }
  for (let i = 0; i < 9; i++) { ctx.globalAlpha = .08; ctx.fillStyle = ["#8feaff", "#ff87d7", "#ffe08a"][i % 3]; ctx.fillRect(0, h * (.16 + i * .045), w, 2); }
  ctx.restore();
}
function hills(ctx, w, h) { ridge(ctx, w, h, .48, "#1d1248"); ridge(ctx, w, h, .59, "#071a35"); ridge(ctx, w, h, .68, "#030715"); }
function ridge(ctx, w, h, base, fill) { ctx.fillStyle = fill; ctx.beginPath(); ctx.moveTo(0, h); for (let x = 0; x <= w; x += w / 9) ctx.lineTo(x, h * base + ((x / w - .5) ** 2) * h * .13); ctx.lineTo(w, h); ctx.fill(); }
function lake(ctx, w, h) { ctx.fillStyle = "#06101f"; ctx.fillRect(0, h * .66, w, h * .34); ctx.fillStyle = "#8feaff22"; ctx.fillRect(0, h * .66, w, h * .05); ctx.fillStyle = "#ffe08a12"; ctx.fillRect(0, h * .72, w, h * .02); }
function frame(ctx, w, h) { const x = w * .045, y = h * .11, W = w * .91, H = h * .79; ctx.strokeStyle = "#ffe08acc"; ctx.lineWidth = 3; ctx.strokeRect(x, y, W, H); ctx.strokeStyle = "#8feaff44"; ctx.strokeRect(x + 8, y + 8, W - 16, H - 16); }
function glyphs(ctx, w, h) { ctx.save(); ctx.globalCompositeOperation = "lighter"; ctx.strokeStyle = "#fff2"; for (let i = 0; i < 12; i++) { const x = w * (.08 + (i % 6) * .16), y = h * (.18 + Math.floor(i / 6) * .55); ctx.strokeRect(x, y, 18, 18); } ctx.restore(); }
