// B"H
import { contentHeight, metrics, surfaceScroller } from './iconMetrics.js';
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
  if (!node || !point) return;
  node.style.left = `${point.x}px`;
  node.style.top = `${point.y}px`;
}

export function snap(point, surface) {
  const m = metrics(surface), col = Math.round((point.x - m.inset.left) / m.cellW), row = Math.round((point.y - m.inset.top) / m.cellH);
  return clamp({ x:m.inset.left + bounded(col, 0, m.cols - 1) * m.cellW, y:m.inset.top + Math.max(0, row) * m.cellH }, surface, m);
}

export function autoArrange(items, surface) { return defaultPositions(items, surface); }
export function rectsIntersect(a, b) { return !(a.right < b.left || a.left > b.right || a.bottom < b.top || a.top > b.bottom); }

export function avoidCollisions(items, positions, surface) {
  const m = metrics(surface), used = new Set(), mode = getDesktopMode();
  for (const item of items) {
    let point = positions[item.id] || pointForIndex(used.size, m, mode), guard = 0;
    while (used.has(slot(point, m)) && guard++ < 300) point = { ...point, y:point.y + m.cellH };
    positions[item.id] = clamp(point, surface, m);
    used.add(slot(positions[item.id], m));
  }
  return positions;
}

export function sizeSurfaceForItems(surface, items, positions = {}) {
  const m = metrics(surface);
  const bottom = Math.max(contentHeight(items.length, surface), ...Object.values(positions).map(p => (p?.y || 0) + m.iconH + 28));
  Object.assign(surface.style, { minHeight:`${bottom}px`, height:`${bottom}px`, pointerEvents:'auto' });
  const scroller = surfaceScroller(surface);
  if (scroller) Object.assign(scroller.style, { overflowY:'auto', overflowX:'hidden', touchAction:'pan-y', webkitOverflowScrolling:'touch' });
  return bottom;
}

function storedPoint(item, stored, defaults, surface, m, mode) {
  if (m.mobile) return defaults[item.id];
  if (mode === 'free' && stored[item.id]) return clamp(stored[item.id], surface, m);
  if (mode === 'grid' && stored[item.id]) return snap(stored[item.id], surface);
  return defaults[item.id];
}

function pointForIndex(i, m, mode) {
  const cols = m.mobile ? 1 : (mode === 'office' ? 4 : m.cols), col = i % cols, row = Math.floor(i / cols);
  const mobileCenter = m.mobile ? Math.max(0, (m.cellW - m.iconW) / 2) : 0;
  return { x:m.inset.left + mobileCenter + col * m.cellW, y:m.inset.top + row * m.cellH };
}

function clamp(point, surface, m = metrics(surface)) {
  const maxX = Math.max(m.inset.left, (surface?.clientWidth || innerWidth) - m.iconW - m.inset.right);
  return { x:bounded(point.x, m.inset.left, maxX), y:Math.max(m.inset.top, point.y) };
}

function slot(point, m) { return `${Math.round((point.x - m.inset.left) / m.cellW)}:${Math.round((point.y - m.inset.top) / m.cellH)}`; }
function bounded(value, min, max) { return Math.min(max, Math.max(min, value)); }

/** B"H: every icon now receives a scrollable chamber rather than falling off reality. */
