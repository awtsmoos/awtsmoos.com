// B"H
// Canvas translates render speech into immediate painted action.
export function executeCanvasCommands(ctx, buffer) {
  const list = buffer?.items || [];
  for (let i = 0; i < list.length; i++) draw(ctx, list[i]);
  buffer?.clear?.();
}
function draw(ctx, c) {
  ctx.save(); ctx.globalAlpha = c.alpha ?? 1; ctx.globalCompositeOperation = c.mode || "source-over";
  if (c.op === "sprite") ctx.drawImage(c.img, c.x, c.y, c.w, c.h);
  if (c.op === "rect") { ctx.fillStyle = c.fill; ctx.fillRect(c.x, c.y, c.w, c.h); }
  if (c.op === "strokeRect") { ctx.strokeStyle = c.stroke; ctx.strokeRect(c.x, c.y, c.w, c.h); }
  ctx.restore();
}
