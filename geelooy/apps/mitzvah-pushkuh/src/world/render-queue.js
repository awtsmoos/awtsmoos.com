// B"H
// Render order becomes a quiet procession, sorted once before revelation.
export function createRenderQueue() {
  const items = [];
  function clear() { items.length = 0; }
  function add(kind, y, item) { items.push({ kind, y, item }); }
  function flush(draw) { items.sort((a, b) => a.y - b.y); for (let i = 0; i < items.length; i++) draw(items[i]); clear(); }
  return { add, clear, flush, size: () => items.length };
}
export function visible(rows, w, h, pad = 80) {
  const out = [];
  for (let i = 0; i < rows.length; i++) { const s = rows[i]; if (s.x > -pad && s.x < w + pad && s.y > -pad && s.y < h + pad) out.push(s); }
  return out;
}
