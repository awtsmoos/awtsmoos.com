// B"H
import { cssColor } from '../framebuffer.js';

/**
 * Tiny SVG witness painter. The Awtsmoos fills the SVG box with separated
 * shapes: a smaller circle, a centered arch, and readable SVG text. The arch
 * stays safely inside the vessel.
 */
export function paintSvgWitness(fb, item) {
  if (item.kind !== 'svg') return false;
  const box = { x: item.x + 2, y: item.y + 2, w: Math.max(20, item.width - 4), h: Math.max(20, item.height - 4) };
  fb.fillRect(box.x, box.y, box.w, box.h, [8, 22, 42, 255]);
  fb.strokeRect(box.x, box.y, box.w, box.h, [0, 217, 255, 255], 2);
  for (const child of item.node?.children || []) paintSvgNode(fb, child, box);
  fb.drawText('SVG OK', box.x + box.w - 70, box.y + box.h - 18, [255, 255, 255, 255], 1, 64);
  return true;
}

function paintSvgNode(fb, node, box) {
  const kind = String(node.localName || node.tagName || '').toLowerCase();
  const attrs = node.attributes || {};
  if (kind === 'rect') paintRect(fb, attrs, box);
  else if (kind === 'circle') paintCircle(fb, attrs, box);
  else if (kind === 'path') paintPath(fb, attrs, box);
  else if (kind === 'text') paintText(fb, node, attrs, box);
}

function paintRect(fb, attrs, box) {
  const x = box.x + scaleX(num(attrs.x), box);
  const y = box.y + scaleY(num(attrs.y), box);
  const w = scaleX(num(attrs.width), box);
  const h = scaleY(num(attrs.height), box);
  fb.fillRect(x, y, w, h, cssColor(attrs.fill, [8, 22, 42, 255]));
  fb.strokeRect(x, y, w, h, cssColor(attrs.stroke, [0, 217, 255, 255]), num(attrs['stroke-width']) || 2);
}

function paintCircle(fb, attrs, box) {
  const cx = box.x + scaleX(num(attrs.cx), box);
  const cy = box.y + scaleY(num(attrs.cy), box);
  const r = Math.max(4, scaleX(num(attrs.r), box));
  const color = cssColor(attrs.fill, [255, 0, 255, 220]);
  for (let y = -r; y <= r; y++) {
    const span = Math.sqrt(Math.max(0, r * r - y * y));
    fb.fillRect(cx - span, cy + y, span * 2, 1, color);
  }
}

function paintPath(fb, attrs, box) {
  const points = bezierArch(box);
  const color = cssColor(attrs.stroke, [255, 230, 0, 255]);
  for (let i = 1; i < points.length; i++) fb.drawLine(points[i - 1][0], points[i - 1][1], points[i][0], points[i][1], color, num(attrs['stroke-width']) || 5);
}

function paintText(fb, node, attrs, box) {
  const x = box.x + scaleX(num(attrs.x), box);
  const y = box.y + scaleY(num(attrs.y), box);
  fb.drawText(String(node.textContent || 'SVG'), x, y, cssColor(attrs.fill, [255, 255, 255, 255]), 1, Math.max(30, box.w - (x - box.x) - 6));
}

function bezierArch(box) {
  const pts = [];
  for (let i = 0; i <= 36; i++) {
    const t = i / 36;
    const x = box.x + box.w * (0.40 + 0.24 * t);
    const y = box.y + box.h * (0.78 - Math.sin(t * Math.PI) * 0.54);
    pts.push([x, y]);
  }
  return pts;
}

function scaleX(v, box) { return box.w * v / 240; }
function scaleY(v, box) { return box.h * v / 100; }
function num(v) { const n = Number(v); return Number.isFinite(n) ? n : 0; }
