// B"H
// Sprite batching groups many glimmers into one ordered river.
export function createSpriteBatch() {
  const items = [];
  function add(img, x, y, w, h, alpha = 1, mode = "lighter") { if (img) items.push({ img, x, y, w, h, alpha, mode }); }
  function flush(ctx) {
    for (let i = 0; i < items.length; i++) { const s = items[i]; ctx.save(); ctx.globalAlpha = s.alpha; ctx.globalCompositeOperation = s.mode; ctx.drawImage(s.img, s.x, s.y, s.w, s.h); ctx.restore(); }
    items.length = 0;
  }
  return { add, flush, clear: () => { items.length = 0; }, size: () => items.length };
}
