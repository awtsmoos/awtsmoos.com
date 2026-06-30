// B"H
export const CELL = { w:104, h:92, left:18, top:18 };
export function defaultPositions(items, surface) {
  const rows = Math.max(1, Math.floor((surface.clientHeight - CELL.top) / CELL.h));
  return Object.fromEntries(items.map((item, i) => [item.id, snap({ x:CELL.left + Math.floor(i / rows) * CELL.w, y:CELL.top + (i % rows) * CELL.h }, surface)]));
}
export function mergePositions(items, stored, surface) { const defaults = defaultPositions(items, surface); return Object.fromEntries(items.map(item => [item.id, snap(stored[item.id] || defaults[item.id], surface)])); }
export function applyPosition(node, point) { if (!node || !point) return; node.style.left = `${point.x}px`; node.style.top = `${point.y}px`; }
export function snap(point, surface) { const maxX = Math.max(CELL.left, surface.clientWidth - CELL.w); const maxY = Math.max(CELL.top, surface.clientHeight - CELL.h - 8); return { x:Math.min(maxX, Math.max(CELL.left, Math.round(point.x / 8) * 8)), y:Math.min(maxY, Math.max(CELL.top, Math.round(point.y / 8) * 8)) }; }
export function autoArrange(items, surface) { return defaultPositions(items, surface); }
export function rectsIntersect(a, b) { return !(a.right < b.left || a.left > b.right || a.bottom < b.top || a.top > b.bottom); }
/** B"H: The grid is a niggun of pixels; every icon lands clear of the taskbar. */
