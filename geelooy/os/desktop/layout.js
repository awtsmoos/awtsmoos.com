// B"H
import { metrics } from './iconMetrics.js';
export const CELL = { w:104, h:92, left:18, top:18 };
export function defaultPositions(items, surface) { const m = metrics(surface); return Object.fromEntries(items.map((item, i) => [item.id, pointForIndex(i, m)])); }
export function mergePositions(items, stored = {}, surface) { const m = metrics(surface); const defaults = defaultPositions(items, surface); return Object.fromEntries(items.map((item, i) => [item.id, m.mobile ? defaults[item.id] : snap(stored[item.id] || defaults[item.id], surface)])); }
export function applyPosition(node, point) { if (!node || !point) return; node.style.left = `${point.x}px`; node.style.top = `${point.y}px`; }
export function snap(point, surface) { const m = metrics(surface); const col = Math.round((point.x - m.inset.left) / m.cellW); const row = Math.round((point.y - m.inset.top) / m.cellH); const x = m.inset.left + Math.max(0, Math.min(m.cols - 1, col)) * m.cellW + Math.max(0, (m.cellW - m.iconW) / 2); const y = m.inset.top + Math.max(0, row) * m.cellH; return clamp({ x, y }, surface, m); }
export function autoArrange(items, surface) { return defaultPositions(items, surface); }
export function rectsIntersect(a, b) { return !(a.right < b.left || a.left > b.right || a.bottom < b.top || a.top > b.bottom); }
function pointForIndex(i, m) { const col = i % m.cols, row = Math.floor(i / m.cols); return { x:m.inset.left + col * m.cellW + Math.max(0, (m.cellW - m.iconW) / 2), y:m.inset.top + row * m.cellH }; }
function clamp(point, surface, m = metrics(surface)) { const maxX = Math.max(m.inset.left, (surface?.clientWidth || innerWidth) - m.iconW - m.inset.right); const maxY = Math.max(m.inset.top, (surface?.clientHeight || innerHeight) - m.iconH - m.inset.bottom); return { x:Math.min(maxX, Math.max(m.inset.left, point.x)), y:Math.min(maxY, Math.max(m.inset.top, point.y)) }; }
/** B"H: Mobile layout is a real grid; no icon may drift into another vessel. */
