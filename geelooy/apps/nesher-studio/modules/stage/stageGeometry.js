/* B"H
 * Stage geometry: pointers, handles, crop boxes, and guide lines.
 * The editor touches coordinates; the Awtsmoos turns them into intent.
 */
export function stagePoint(event, canvas) {
  const r = canvas.getBoundingClientRect();
  return { x:(event.clientX - r.left) * canvas.width / r.width, y:(event.clientY - r.top) * canvas.height / r.height };
}
export function insideSource(s, p) { return p.x >= s.x && p.y >= s.y && p.x <= s.x + s.w && p.y <= s.y + s.h; }
export function resizeHandleAt(s, p) { return p.x > s.x + s.w - 26 && p.y > s.y + s.h - 26 ? 'se' : ''; }

export function cropBox(source) {
  const c = normalizeCrop(source.crop || {}), x = source.x + source.w * c.left / 100, y = source.y + source.h * c.top / 100;
  return { x, y, w:source.w * (100 - c.left - c.right) / 100, h:source.h * (100 - c.top - c.bottom) / 100 };
}

export function cropHandleAt(source, p) {
  const b = cropBox(source), h = cropHandles(b);
  for (const [name, point] of Object.entries(h.corners)) if (dist(point, p) <= 14) return name;
  if (near(p.x, b.x) && between(p.y, b.y, b.y + b.h)) return 'w';
  if (near(p.x, b.x + b.w) && between(p.y, b.y, b.y + b.h)) return 'e';
  if (near(p.y, b.y) && between(p.x, b.x, b.x + b.w)) return 'n';
  if (near(p.y, b.y + b.h) && between(p.x, b.x, b.x + b.w)) return 's';
  return insideBox(b, p) ? 'move' : '';
}

export function cropHandles(b) {
  return { corners:{ nw:{ x:b.x, y:b.y }, ne:{ x:b.x + b.w, y:b.y }, sw:{ x:b.x, y:b.y + b.h }, se:{ x:b.x + b.w, y:b.y + b.h } } };
}

export function cropGuideLines(source) {
  const b = cropBox(source);
  return [b.x + b.w / 3, b.x + b.w * 2 / 3].map(x => ({ x, y:b.y, h:b.h })).concat([b.y + b.h / 3, b.y + b.h * 2 / 3].map(y => ({ x:b.x, y, w:b.w })));
}

export function cropFromBox(source, box) {
  const b = clampBoxInside(source, box);
  return normalizeCrop({ left:(b.x - source.x) / source.w * 100, top:(b.y - source.y) / source.h * 100, right:(source.x + source.w - b.x - b.w) / source.w * 100, bottom:(source.y + source.h - b.y - b.h) / source.h * 100 });
}

export function resizedSourceBox(source, p, keepAspect = true) {
  const min = 40, aspect = source.w / Math.max(1, source.h); let w = Math.max(min, p.x - source.x), h = Math.max(min, p.y - source.y);
  if (keepAspect) h = Math.max(min, w / Math.max(.01, aspect)); return { w, h };
}

export function normalizeCrop(crop = {}) {
  const c = { left:clamp(crop.left), top:clamp(crop.top), right:clamp(crop.right), bottom:clamp(crop.bottom) };
  if (c.left + c.right > 95) c.right = Math.max(0, 95 - c.left);
  if (c.top + c.bottom > 95) c.bottom = Math.max(0, 95 - c.top); return c;
}

export function clampBoxInside(s, box) {
  const w = Math.max(8, Math.min(box.w, s.w)), h = Math.max(8, Math.min(box.h, s.h));
  const x = Math.max(s.x, Math.min(box.x, s.x + s.w - w)), y = Math.max(s.y, Math.min(box.y, s.y + s.h - h)); return { x, y, w, h };
}
function insideBox(b, p) { return p.x >= b.x && p.y >= b.y && p.x <= b.x + b.w && p.y <= b.y + b.h; }
function between(v, a, b) { return v >= a && v <= b; }
function near(a, b) { return Math.abs(a - b) <= 10; }
function dist(a, b) { return Math.hypot(a.x - b.x, a.y - b.y); }
function clamp(value) { const n = Number(value || 0); return Math.max(0, Math.min(90, Number.isFinite(n) ? Math.round(n) : 0)); }
