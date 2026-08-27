// B"H
// The same point becomes seed, leaf, fruit, stone: form obeys inner state.
export function round(ctx, x, y, w, h, r) {
  ctx.beginPath();
  if (ctx.roundRect) ctx.roundRect(x, y, w, h, r); else ctx.rect(x, y, w, h);
}
export function star(ctx, x, y, r) {
  for (let i = 0; i < 10; i++) {
    const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * .42 : r;
    const px = x + Math.cos(a) * rr, py = y + Math.sin(a) * rr;
    i ? ctx.lineTo(px, py) : ctx.moveTo(px, py);
  }
}
export function leaf(ctx, x, y, r) {
  ctx.moveTo(x, y - r * 1.8);
  ctx.bezierCurveTo(x + r * 1.55, y - r * .35, x + r, y + r * 1.7, x, y + r * 1.55);
  ctx.bezierCurveTo(x - r, y + r * 1.7, x - r * 1.55, y - r * .35, x, y - r * 1.8);
}
export function sparkShape(ctx, kind, r) {
  if (kind === "fruit") return star(ctx, 0, 0, r * 1.6);
  if (kind === "leaf") return leaf(ctx, 0, 0, r);
  if (kind === "sprout") return ctx.ellipse(0, 0, r * .72, r * 1.9, 0, 0, 7);
  if (kind === "stone") return round(ctx, -r, -r * .7, r * 2, r * 1.4, 8);
  ctx.arc(0, 0, r, 0, 7);
}
