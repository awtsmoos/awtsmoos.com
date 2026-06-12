/**
 * B"H
 * Glyph atlas for impact text.
 *
 * Chapter 112: every Hebrew letter is carved once into a tiny vessel, then
 * thrown through the battle by drawImage instead of reborn through font layout
 * every frame. The Awtsmoos lets letters remain visible while the animation
 * loop stays lightning-fast.
 */
const MAX_GLYPHS = 192;
const SIZE_BUCKETS = [22, 28, 34];
const COMMON_COLORS = ['#ffe28a', '#fff4a8', '#ffef9d', '#ff8a6b', '#9affc5', '#c8fff1', '#f8d66a', '#ffffff'];
const cache = new Map();
let stamp = 0;

export function glyphImage(text, color, size, kind = 'letter') {
  const canvasFactory = getCanvasFactory();
  if (!canvasFactory || !text) return null;
  const bucketSize = bucket(size || 28);
  const bucketColor = bucketColorFor(color || '#ffe28a');
  const key = `${kind}|${text}|${bucketSize}|${bucketColor}`;
  const hit = cache.get(key);
  if (hit) {
    hit.stamp = ++stamp;
    return hit;
  }
  const glyph = createGlyph(canvasFactory, text, bucketColor, bucketSize, kind);
  cache.set(key, glyph);
  evictIfNeeded();
  return glyph;
}

export function glyphAtlasStats() {
  return { size: cache.size, max: MAX_GLYPHS };
}

function createGlyph(canvasFactory, text, color, size, kind) {
  const pad = Math.ceil(size * 0.42);
  const width = Math.max(size + pad * 2, Math.ceil(text.length * size * 0.78) + pad * 2);
  const height = size + pad * 2;
  const canvas = canvasFactory(width, height);
  const ctx = canvas.getContext?.('2d');
  if (!ctx) return null;
  ctx.clearRect(0, 0, width, height);
  ctx.font = fontFor(kind, size);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.lineJoin = 'round';
  ctx.strokeStyle = '#050207';
  ctx.lineWidth = kind === 'callout' ? 5 : 3;
  ctx.strokeText(text, width / 2, height / 2 + size * 0.04);
  ctx.fillStyle = color;
  ctx.fillText(text, width / 2, height / 2 + size * 0.04);
  return { canvas, width, height, stamp: ++stamp };
}

function fontFor(kind, size) {
  const weight = kind === 'callout' ? 950 : 900;
  return `${weight} ${size}px system-ui, Arial, sans-serif`;
}

function bucket(size) {
  let best = SIZE_BUCKETS[0];
  let bestDistance = Infinity;
  for (const value of SIZE_BUCKETS) {
    const distance = Math.abs(value - size);
    if (distance < bestDistance) { best = value; bestDistance = distance; }
  }
  return best;
}

function bucketColorFor(color) {
  if (COMMON_COLORS.includes(color)) return color;
  if (String(color).startsWith('hsl')) return '#ffe28a';
  if (!String(color).startsWith('#')) return '#fff4a8';
  return nearestCommon(hexToRgb(color) || hexToRgb('#fff4a8'));
}

function nearestCommon(rgb) {
  let best = COMMON_COLORS[0];
  let bestDistance = Infinity;
  for (const color of COMMON_COLORS) {
    const c = hexToRgb(color);
    const d = Math.abs(rgb.r - c.r) + Math.abs(rgb.g - c.g) + Math.abs(rgb.b - c.b);
    if (d < bestDistance) { best = color; bestDistance = d; }
  }
  return best;
}

function hexToRgb(color) {
  const hex = String(color).replace('#', '').trim();
  if (![3, 6].includes(hex.length)) return null;
  const full = hex.length === 3 ? hex.split('').map(x => x + x).join('') : hex;
  const value = Number.parseInt(full, 16);
  if (!Number.isFinite(value)) return null;
  return { r: (value >> 16) & 255, g: (value >> 8) & 255, b: value & 255 };
}

function evictIfNeeded() {
  while (cache.size > MAX_GLYPHS) {
    let oldestKey = null;
    let oldestStamp = Infinity;
    for (const [key, value] of cache) {
      if (value.stamp < oldestStamp) { oldestKey = key; oldestStamp = value.stamp; }
    }
    if (!oldestKey) return;
    cache.delete(oldestKey);
  }
}

function getCanvasFactory() {
  if (typeof OffscreenCanvas !== 'undefined') return (w, h) => new OffscreenCanvas(w, h);
  if (typeof document !== 'undefined') return (w, h) => {
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    return canvas;
  };
  return null;
}
