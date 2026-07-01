// B"H
import { metrics } from './iconMetrics.js';
import { getDesktopMode } from './modes.js';
export const CELL = { w:104, h:92, left:18, top:18 };
export function defaultPositions(items, surface) {
  const m = metrics(surface), mode = getDesktopMode();
  return Object.fromEntries(items.map((item, i) => [item.id, pointForIndex(i, m, mode)]));
}
export function mergePositions(items, stored = {}, surface) {
  const m = metrics(surface), mode = getDesktopMode(), defaults = defaultPositions(items, surface);
  const next = Object.fromEntries(items.map(item => [item.id, storedPoint(item, stored, defaults, surface, m, mode)]));
  return avoidCollisions(items, next, surface);
}
export function applyPosition(node, point) {
  if (!node || !point) return; node.style.left = `${point.x}px`; node.style.top = `${point.y}px`;
}
export function snap(point, surface) {
  const m = metrics(surface), col = Math.round((point.x - m.inset.left) / m.cellW), row = Math.round((point.y - m.inset.top) / m.cellH);
  const x = m.inset.left + Math.max(0, Math.min(m.cols - 1, col)) * m.cellW + Math.max(0, (m.cellW - m.iconW) / 2);
  return clamp({ x, y:m.inset.top + Math.max(0, row) * m.cellH }, surface, m);
}
export function autoArrange(items, surface) { return defaultPositions(items, surface); }
export function rectsIntersect(a, b) { return !(a.right < b.left || a.left > b.right || a.bottom < b.top || a.top > b.bottom); }
export function avoidCollisions(items, positions, surface) {
  const m = metrics(surface), used = new Set(), mode = getDesktopMode();
  for (const item of items) {
    let point = positions[item.id] || pointForIndex(used.size, m, mode), guard = 0;
    while (used.has(slot(point, m)) && guard++ < 200) point = { ...point, y:point.y + m.cellH };
    positions[item.id] = clamp(point, surface, m); used.add(slot(positions[item.id], m));
  }
  return positions;
}
function storedPoint(item, stored, defaults, surface, m, mode) {
  if (m.mobile) return defaults[item.id];
  if (mode === 'free' && stored[item.id]) return clamp(stored[item.id], surface, m);
  if (mode === 'grid' && stored[item.id]) return snap(stored[item.id], surface);
  return defaults[item.id];
}
function pointForIndex(i, m, mode) {
  const cols = m.mobile ? 1 : (mode === 'office' ? 4 : m.cols), col = i % cols, row = Math.floor(i / cols);
  const stagger = !m.mobile && mode === 'free' ? (row % 2) * 18 : 0;
  return { x:m.inset.left + col * m.cellW + Math.max(0, (m.cellW - m.iconW) / 2) + stagger, y:m.inset.top + row * m.cellH };
}
function clamp(point, surface, m = metrics(surface)) {
  const maxX = Math.max(m.inset.left, (surface?.clientWidth || innerWidth) - m.iconW - m.inset.right);
  return { x:Math.min(maxX, Math.max(m.inset.left, point.x)), y:Math.max(m.inset.top, point.y) };
}
function slot(point, m) { return `${Math.round((point.x - m.inset.left) / m.cellW)}:${Math.round((point.y - m.inset.top) / m.cellH)}`; }
/** B"H: on phones every desktop mode becomes one ordered ladder, never an overlapping swarm. */
