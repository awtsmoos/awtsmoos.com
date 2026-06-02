// B"H
/**
 * @file canvasPainter.js
 * @description
 * Split canvas painter: 2D command replay stays here while WebGL witness state
 * moved into canvas-painter/webglWitness.js. The Awtsmoos demands each hidden
 * canvas become a readable screenshot witness without duplicated fake labels.
 */
import { cssColor } from './framebuffer.js';
import { paintWebgl } from './canvas-painter/webglWitness.js';

export function paintCanvasTexture(fb, texture, box, allTextures = []) {
  if (!texture || !box) return;
  const webgl = texture.kind === 'canvas-webgl';
  fb.fillRect(box.x, box.y, box.w, box.h, webgl ? [19, 14, 55, 255] : [8, 38, 46, 255]);
  fb.strokeRect(box.x, box.y, box.w, box.h, [74, 220, 255, 255], 2);
  const inner = inset(box, 8);
  if (webgl) paintWebgl(fb, texture, inner);
  else paint2d(fb, texture, inner, allTextures, new Set([texture.id]));
}

function paint2d(fb, texture, box, allTextures, seen) {
  const sx = box.w / Math.max(1, Number(texture.width || 300));
  const sy = box.h / Math.max(1, Number(texture.height || 150));
  for (const cmd of texture.commands || []) paintCommand(fb, box, cmd, sx, sy, allTextures, seen);
}

function paintCommand(fb, box, cmd, sx, sy, allTextures, seen) {
  const color = paintColor(cmd.fillStyle || cmd.strokeStyle || cmd.state?.fillStyle || cmd.state?.strokeStyle, [235, 235, 245, 255]);
  if (cmd.op === 'fillRect') rect(fb, box, cmd, sx, sy, color, true);
  else if (cmd.op === 'strokeRect') rect(fb, box, cmd, sx, sy, color, false);
  else if (cmd.op === 'clearRect') rect(fb, box, cmd, sx, sy, [0, 0, 0, 0], true);
  else if (cmd.op === 'drawImageTexture') image(fb, box, cmd, sx, sy, allTextures, seen);
  else if (cmd.op === 'putImageData') imageData(fb, box, cmd, sx, sy);
  else if (['fillText', 'strokeText', 'fillTextPlaceholder', 'strokeTextPlaceholder'].includes(cmd.op)) text(fb, box, cmd, sx, sy, color);
  else if (cmd.op === 'fillPath' || cmd.op === 'strokePath') path(fb, box, cmd.path || [], sx, sy, color, cmd.op === 'fillPath');
  else if (cmd.op === 'clip') path(fb, box, cmd.path || [], sx, sy, [120, 240, 255, 155], false);
}

function rect(fb, box, cmd, sx, sy, color, fill) {
  const r = clipRect(box, box.x + n(cmd.x) * sx, box.y + n(cmd.y) * sy, n(cmd.width) * sx, n(cmd.height) * sy);
  if (fill && isGradient(cmd.fillStyle || cmd.state?.fillStyle)) fb.gradientRect(r.x, r.y, r.w, r.h, gradientCss(cmd.fillStyle || cmd.state?.fillStyle), color);
  else if (fill) fb.fillRect(r.x, r.y, r.w, r.h, color);
  else fb.strokeRect(r.x, r.y, r.w, r.h, color, 2);
}

function image(fb, box, cmd, sx, sy, allTextures, seen) {
  const r = clipRect(box, box.x + n(cmd.x) * sx, box.y + n(cmd.y) * sy, n(cmd.width || cmd.imageWidth) * sx, n(cmd.height || cmd.imageHeight) * sy);
  const src = allTextures.find(t => t.id === cmd.sourceTexture);
  if (!src || seen.has(src.id)) return missing(fb, r);
  seen.add(src.id);
  fb.strokeRect(r.x, r.y, r.w, r.h, [135, 160, 255, 255], 2);
  if (src.kind === 'canvas-webgl') paintWebgl(fb, src, inset(r, 5));
  else paint2d(fb, src, inset(r, 5), allTextures, seen);
}

function missing(fb, r) {
  fb.fillRect(r.x, r.y, r.w, r.h, [45, 60, 95, 255]);
  fb.strokeRect(r.x, r.y, r.w, r.h, [135, 160, 255, 255], 2);
  fb.drawText('image', r.x + 6, r.y + 6, [245, 245, 255, 255], 1, Math.max(20, r.w - 12));
}

function text(fb, box, cmd, sx, sy, color) {
  const tx = clamp(box.x + n(cmd.x) * sx, box.x + 4, box.x + box.w - 18);
  const ty = clamp(box.y + n(cmd.y) * sy - 10, box.y + 4, box.y + box.h - 18);
  fb.drawText(String(cmd.text || ''), tx, ty, color, 1, Math.max(22, box.x + box.w - tx - 6));
}

function imageData(fb, box, cmd, sx, sy) {
  const x = clamp(box.x + n(cmd.dx) * sx, box.x, box.x + box.w - 12);
  const y = clamp(box.y + n(cmd.dy) * sy, box.y, box.y + box.h - 12);
  fb.fillRect(x, y, 12, 12, [255, 255, 255, 255]);
  fb.strokeRect(x, y, 12, 12, [0, 0, 0, 255], 1);
}

function path(fb, box, steps, sx, sy, color, fill) {
  const pts = pathPoints(box, steps, sx, sy);
  if (fill && pts.length > 2) fillPoly(fb, pts, box, color);
  for (let i = 1; i < pts.length; i++) fb.drawLine(pts[i - 1][0], pts[i - 1][1], pts[i][0], pts[i][1], color, fill ? 2 : 3);
}

function pathPoints(box, steps, sx, sy) {
  const pts = [];
  for (const s of steps || []) {
    if (s[0] === 'moveTo' || s[0] === 'lineTo') pts.push(pt(box, s[1], s[2], sx, sy));
    if (s[0] === 'rect' || s[0] === 'roundRect') rectPts(box, s, sx, sy).forEach(p => pts.push(p));
    if (s[0] === 'arc' || s[0] === 'ellipse') arcPts(box, s, sx, sy).forEach(p => pts.push(p));
    if (s[0] === 'closePath' && pts[0]) pts.push(pts[0]);
  }
  return pts;
}

function rectPts(box, s, sx, sy) {
  const x = n(s[1]), y = n(s[2]), w = n(s[3]), h = n(s[4]);
  return [pt(box, x, y, sx, sy), pt(box, x + w, y, sx, sy), pt(box, x + w, y + h, sx, sy), pt(box, x, y + h, sx, sy), pt(box, x, y, sx, sy)];
}

function arcPts(box, s, sx, sy) {
  const ellipse = s[0] === 'ellipse', cx = n(s[1]), cy = n(s[2]), rx = n(s[3]), ry = ellipse ? n(s[4]) : rx;
  const start = ellipse ? n(s[6]) : n(s[4]), end = ellipse ? n(s[7]) : n(s[5]);
  return Array.from({ length: 33 }, (_, i) => pt(box, cx + Math.cos(start + (end - start) * i / 32) * rx, cy + Math.sin(start + (end - start) * i / 32) * ry, sx, sy));
}

function fillPoly(fb, pts, box, color) {
  if (!pts.length) return;
  const minY = Math.floor(clamp(Math.min(...pts.map(p => p[1])), box.y, box.y + box.h));
  const maxY = Math.ceil(clamp(Math.max(...pts.map(p => p[1])), box.y, box.y + box.h));
  for (let y = minY; y <= maxY; y++) for (const [a, b] of pairs(intersections(pts, y))) fb.fillRect(clamp(a, box.x, box.x + box.w), y, Math.max(0, clamp(b, box.x, box.x + box.w) - clamp(a, box.x, box.x + box.w)), 1, color);
}

function intersections(pts, y) {
  const xs = [];
  for (let i = 0; i < pts.length; i++) {
    const a = pts[i], b = pts[(i + 1) % pts.length];
    if ((a[1] <= y && b[1] > y) || (b[1] <= y && a[1] > y)) xs.push(a[0] + (y - a[1]) * (b[0] - a[0]) / (b[1] - a[1]));
  }
  return xs.sort((a, b) => a - b);
}

function pairs(xs) { const out = []; for (let i = 0; i + 1 < xs.length; i += 2) out.push([xs[i], xs[i + 1]]); return out; }
function paintColor(value, fallback) { return isGradient(value) ? cssColor(value.stops?.[0]?.color, fallback) : value?.kind === 'pattern' ? [135, 160, 255, 255] : cssColor(value, fallback); }
function isGradient(value) { return value && typeof value === 'object' && Array.isArray(value.stops); }
function gradientCss(value) { return `linear-gradient(90deg,${value.stops.map(s => s.color).join(',') || '#fff,#000'})`; }
function pt(box, x, y, sx, sy) { return [clamp(box.x + n(x) * sx, box.x, box.x + box.w), clamp(box.y + n(y) * sy, box.y, box.y + box.h)]; }
function clipRect(box, x, y, w, h) { const x0 = clamp(x, box.x, box.x + box.w), y0 = clamp(y, box.y, box.y + box.h), x1 = clamp(x + w, box.x, box.x + box.w), y1 = clamp(y + h, box.y, box.y + box.h); return { x: x0, y: y0, w: Math.max(0, x1 - x0), h: Math.max(0, y1 - y0) }; }
function inset(box, v) { return { x: box.x + v, y: box.y + v, w: Math.max(1, box.w - v * 2), h: Math.max(1, box.h - v * 2) }; }
function clamp(value, min, max) { return Math.max(min, Math.min(max, Number(value) || 0)); }
function n(value) { return Number(value) || 0; }
