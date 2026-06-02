// B"H
/**
 * @file canvasPainter.js
 * @description
 * The canvas painter is the visible mouth of Merkava's hidden canvases. It
 * recursively replays DOM canvas, OffscreenCanvas, worker-created canvas
 * textures, Path2D curves, drawImageTexture, gradients, ImageData markers, and
 * WebGL witnesses. WebGL is still a truthful software witness, not a full GPU:
 * it now distinguishes clear/draw/texture/program activity in pixels so a
 * screenshot can prove more than "a triangle was noticed".
 */
import { cssColor } from "./framebuffer.js";

export function paintCanvasTexture(fb, texture, box, allTextures = []) {
  if (!texture) return;
  const inner = inset(box, 10);
  fb.fillRect(box.x, box.y, box.w, box.h, texture.kind === "canvas-webgl" ? [26, 16, 68, 255] : [9, 48, 50, 255]);
  fb.strokeRect(box.x, box.y, box.w, box.h, [74, 210, 240, 255], 2);
  if (texture.kind === "canvas-webgl") paintWebgl(fb, texture, inner);
  else paint2d(fb, texture, inner, allTextures, new Set([texture.id]));
}

function paint2d(fb, texture, box, allTextures, seen) {
  const sourceW = Math.max(1, Number(texture.width || 300));
  const sourceH = Math.max(1, Number(texture.height || 150));
  const sx = box.w / sourceW;
  const sy = box.h / sourceH;
  for (const cmd of texture.commands || []) {
    const color = paintColor(cmd.fillStyle || cmd.strokeStyle || cmd.state?.fillStyle || cmd.state?.strokeStyle, [230, 230, 230, 255]);
    if (cmd.op === "fillRect") drawClampedRect(fb, box, box.x + n(cmd.x) * sx, box.y + n(cmd.y) * sy, n(cmd.width) * sx, n(cmd.height) * sy, color, true, cmd.fillStyle || cmd.state?.fillStyle);
    if (cmd.op === "strokeRect") drawClampedRect(fb, box, box.x + n(cmd.x) * sx, box.y + n(cmd.y) * sy, n(cmd.width) * sx, n(cmd.height) * sy, color, false);
    if (cmd.op === "clearRect") drawClampedRect(fb, box, box.x + n(cmd.x) * sx, box.y + n(cmd.y) * sy, n(cmd.width) * sx, n(cmd.height) * sy, [0, 0, 0, 0], true);
    if (cmd.op === "drawImageTexture") drawImageTexture(fb, box, cmd, sx, sy, allTextures, seen);
    if (cmd.op === "putImageData") paintImageDataMarker(fb, box, cmd, sx, sy);
    if (["fillText", "strokeText", "fillTextPlaceholder", "strokeTextPlaceholder"].includes(cmd.op)) paintCanvasText(fb, box, cmd, sx, sy, color);
    if (cmd.op === "fillPath" || cmd.op === "strokePath") paintPath(fb, cmd.path || [], box, sx, sy, color, cmd.op === "fillPath");
    if (cmd.op === "clip") paintClipHint(fb, cmd.path || [], box, sx, sy);
  }
}

function drawImageTexture(fb, box, cmd, sx, sy, allTextures, seen) {
  const x = box.x + n(cmd.x) * sx;
  const y = box.y + n(cmd.y) * sy;
  const w = Math.max(1, n(cmd.width || cmd.imageWidth) * sx);
  const h = Math.max(1, n(cmd.height || cmd.imageHeight) * sy);
  const target = { x: clamp(x, box.x, box.x + box.w), y: clamp(y, box.y, box.y + box.h), w: Math.min(w, box.w), h: Math.min(h, box.h) };
  const source = allTextures.find(t => t.id === cmd.sourceTexture);
  if (!source || seen.has(source.id)) return paintMissingImage(fb, target);
  seen.add(source.id);
  fb.strokeRect(target.x, target.y, target.w, target.h, [135, 160, 255, 255], 2);
  if (source.kind === "canvas-webgl") paintWebgl(fb, source, inset(target, 6));
  else paint2d(fb, source, inset(target, 6), allTextures, seen);
}

function paintMissingImage(fb, target) {
  fb.fillRect(target.x, target.y, target.w, target.h, [45, 60, 95, 255]);
  fb.strokeRect(target.x, target.y, target.w, target.h, [135, 160, 255, 255], 2);
  fb.drawText("image", target.x + 8, target.y + 8, [245, 245, 255, 255], 2, Math.max(20, target.w - 16));
}

function paintCanvasText(fb, box, cmd, sx, sy, color) {
  const tx = clamp(box.x + n(cmd.x) * sx, box.x + 6, box.x + box.w - 20);
  const ty = clamp(box.y + n(cmd.y) * sy - 12, box.y + 6, box.y + box.h - 30);
  const size = fontSize(cmd.font || cmd.state?.font || "16px sans-serif");
  const scale = Math.max(1, Math.min(3, Math.round(size / 10)));
  fb.drawText(cmd.text || "", tx, ty, color, scale, Math.max(20, box.x + box.w - tx - 10));
}

function paintImageDataMarker(fb, box, cmd, sx, sy) {
  const x = clamp(box.x + n(cmd.dx) * sx, box.x, box.x + box.w - 12);
  const y = clamp(box.y + n(cmd.dy) * sy, box.y, box.y + box.h - 12);
  fb.fillRect(x, y, 12, 12, [255, 255, 255, 255]);
  fb.strokeRect(x, y, 12, 12, [0, 0, 0, 255], 1);
}

function paintWebgl(fb, texture, box) {
  const commands = texture.commands || [];
  const clear = webglClear(commands);
  fb.fillRect(box.x, box.y, box.w, box.h, clear);
  paintWebglGrid(fb, box);
  const draws = commands.filter(cmd => String(cmd.op || "").includes("draw"));
  const hasTexture = commands.some(cmd => /texImage|bindTexture|activeTexture|texParameteri|generateMipmap/i.test(cmd.op || ""));
  const hasProgram = commands.some(cmd => /shader|program|uniform|attrib|buffer/i.test(cmd.op || ""));
  draws.forEach((_, index) => paintWebglTriangle(fb, box, index, hasTexture));
  if (!draws.length) fb.drawText("WebGL", box.x + 14, box.y + 14, [255, 255, 255, 255], 2, Math.max(80, box.w - 20));
  if (hasTexture) paintWebglTextureSwatches(fb, box);
  if (hasProgram) paintProgramBadge(fb, box);
  fb.drawText("WEBGL", box.x + 14, box.y + 14, [255, 255, 255, 255], 2, Math.max(80, box.w - 20));
}

function webglClear(commands) {
  let clear = [54, 28, 145, 255];
  for (const cmd of commands) if (cmd.op === "webgl.clearColor" && Array.isArray(cmd.value)) clear = cmd.value.slice(0, 3).map(v => Math.round(Number(v) * 255)).concat(255);
  return clear;
}

function paintWebglGrid(fb, box) {
  for (let x = box.x + 18; x < box.x + box.w; x += 34) fb.drawLine(x, box.y, x, box.y + box.h, [120, 85, 200, 55], 1);
  for (let y = box.y + 18; y < box.y + box.h; y += 34) fb.drawLine(box.x, y, box.x + box.w, y, [120, 85, 200, 55], 1);
}

function paintWebglTriangle(fb, box, drawIndex, hasTexture) {
  const x = box.x + 24 + drawIndex * 14;
  const y = box.y + 38 + drawIndex * 8;
  const maxW = Math.max(90, box.w - 70);
  const maxH = Math.max(70, box.h - 86);
  const tri = [[x, y + maxH], [x + maxW * 0.5, y], [x + maxW, y + maxH]];
  fillPolygonGradientApprox(fb, tri, box, hasTexture);
  fb.drawLine(x, y + maxH, x + maxW * 0.5, y, [245, 190, 78, 255], 4);
  fb.drawLine(x + maxW * 0.5, y, x + maxW, y + maxH, [245, 190, 78, 255], 4);
  fb.drawLine(x + maxW, y + maxH, x, y + maxH, [245, 190, 78, 255], 4);
}

function paintWebglTextureSwatches(fb, box) {
  const size = Math.max(18, Math.min(34, Math.floor(box.w / 12)));
  const y = box.y + box.h - size - 12;
  const colors = [[255, 0, 0, 255], [255, 230, 0, 255], [0, 255, 90, 255], [0, 210, 255, 255], [70, 80, 255, 255], [255, 0, 255, 255]];
  colors.forEach((color, i) => fb.fillRect(box.x + 12 + i * (size + 4), y, size, size, color));
  fb.strokeRect(box.x + 10, y - 2, colors.length * (size + 4) + 2, size + 4, [255, 255, 255, 180], 1);
  fb.drawText("TEX", box.x + 14, Math.max(box.y + 32, y - 18), [255, 255, 255, 255], 1, 80);
}

function paintProgramBadge(fb, box) {
  const w = Math.min(86, Math.max(52, box.w / 4));
  fb.fillRect(box.x + box.w - w - 10, box.y + 12, w, 22, [35, 50, 95, 230]);
  fb.strokeRect(box.x + box.w - w - 10, box.y + 12, w, 22, [126, 220, 255, 255], 1);
  fb.drawText("GPU", box.x + box.w - w - 4, box.y + 17, [255, 255, 255, 255], 1, w - 8);
}

function paintPath(fb, path, box, sx, sy, color, fill) {
  const points = pathToPoints(path, box, sx, sy);
  for (let i = 1; i < points.length; i++) fb.drawLine(points[i - 1][0], points[i - 1][1], points[i][0], points[i][1], color, fill ? 2 : 3);
  if (fill && points.length >= 3) fillPolygonApprox(fb, points, color, box);
}

function paintClipHint(fb, path, box, sx, sy) {
  const points = pathToPoints(path, box, sx, sy);
  for (let i = 1; i < points.length; i++) fb.drawLine(points[i - 1][0], points[i - 1][1], points[i][0], points[i][1], [120, 240, 255, 160], 1);
}

function pathToPoints(path, box, sx, sy) {
  const points = [];
  let current = null;
  for (const step of path) {
    const op = step[0];
    if (op === "moveTo") { current = pointInBox(box, step[1], step[2], sx, sy); points.push(current); }
    if (op === "lineTo" && current) { current = pointInBox(box, step[1], step[2], sx, sy); points.push(current); }
    if (op === "rect" || op === "roundRect") rectPoints(box, step, sx, sy).forEach(p => points.push(p));
    if (op === "quadraticCurveTo" && current) current = curvePoints(current, pointInBox(box, step[1], step[2], sx, sy), pointInBox(box, step[3], step[4], sx, sy), null, points);
    if (op === "bezierCurveTo" && current) current = curvePoints(current, pointInBox(box, step[1], step[2], sx, sy), pointInBox(box, step[3], step[4], sx, sy), pointInBox(box, step[5], step[6], sx, sy), points);
    if (op === "arc" || op === "ellipse") arcPoints(box, step, sx, sy).forEach(p => { current = p; points.push(p); });
    if (op === "closePath" && points[0]) points.push(points[0]);
  }
  return points;
}

function curvePoints(start, c1, c2, endOrNull, out) {
  const cubic = Boolean(endOrNull);
  const end = cubic ? endOrNull : c2;
  for (let i = 1; i <= 18; i++) {
    const t = i / 18, mt = 1 - t;
    const x = cubic ? mt ** 3 * start[0] + 3 * mt ** 2 * t * c1[0] + 3 * mt * t ** 2 * c2[0] + t ** 3 * end[0] : mt ** 2 * start[0] + 2 * mt * t * c1[0] + t ** 2 * end[0];
    const y = cubic ? mt ** 3 * start[1] + 3 * mt ** 2 * t * c1[1] + 3 * mt * t ** 2 * c2[1] + t ** 3 * end[1] : mt ** 2 * start[1] + 2 * mt * t * c1[1] + t ** 2 * end[1];
    out.push([x, y]);
  }
  return end;
}

function rectPoints(box, step, sx, sy) {
  const x = n(step[1]), y = n(step[2]), w = n(step[3]), h = n(step[4]);
  return [pointInBox(box, x, y, sx, sy), pointInBox(box, x + w, y, sx, sy), pointInBox(box, x + w, y + h, sx, sy), pointInBox(box, x, y + h, sx, sy), pointInBox(box, x, y, sx, sy)];
}

function arcPoints(box, step, sx, sy) {
  const points = [];
  const ellipse = step[0] === "ellipse";
  const cx = n(step[1]), cy = n(step[2]);
  const rx = n(step[3]);
  const ry = ellipse ? n(step[4]) : rx;
  const start = ellipse ? n(step[6]) : n(step[4]);
  const end = ellipse ? n(step[7]) : n(step[5]);
  for (let i = 0; i <= 32; i++) points.push(pointInBox(box, cx + Math.cos(start + (end - start) * i / 32) * rx, cy + Math.sin(start + (end - start) * i / 32) * ry, sx, sy));
  return points;
}

function fillPolygonGradientApprox(fb, points, box, hasTexture) {
  const minY = Math.floor(clamp(Math.min(...points.map(p => p[1])), box.y, box.y + box.h));
  const maxY = Math.ceil(clamp(Math.max(...points.map(p => p[1])), box.y, box.y + box.h));
  for (let y = minY; y <= maxY; y++) {
    const xs = polygonIntersections(points, y).sort((a, b) => a - b);
    for (let i = 0; i < xs.length; i += 2) if (xs[i + 1] != null) {
      const t = (y - minY) / Math.max(1, maxY - minY);
      const color = hasTexture ? [Math.round(100 + 120 * t), Math.round(30 + 180 * (1 - t)), Math.round(170 + 60 * t), 230] : [88, 24, 170, 220];
      fb.fillRect(clamp(xs[i], box.x, box.x + box.w), y, Math.max(0, clamp(xs[i + 1], box.x, box.x + box.w) - clamp(xs[i], box.x, box.x + box.w)), 1, color);
    }
  }
}

function fillPolygonApprox(fb, points, color, box) {
  const minY = Math.floor(clamp(Math.min(...points.map(p => p[1])), box.y, box.y + box.h));
  const maxY = Math.ceil(clamp(Math.max(...points.map(p => p[1])), box.y, box.y + box.h));
  for (let y = minY; y <= maxY; y++) {
    const xs = polygonIntersections(points, y).sort((a, b) => a - b);
    for (let i = 0; i < xs.length; i += 2) if (xs[i + 1] != null) fb.fillRect(clamp(xs[i], box.x, box.x + box.w), y, Math.max(0, clamp(xs[i + 1], box.x, box.x + box.w) - clamp(xs[i], box.x, box.x + box.w)), 1, color);
  }
}

function polygonIntersections(points, y) {
  const xs = [];
  for (let i = 0; i < points.length; i++) {
    const a = points[i], b = points[(i + 1) % points.length];
    if ((a[1] <= y && b[1] > y) || (b[1] <= y && a[1] > y)) xs.push(a[0] + (y - a[1]) * (b[0] - a[0]) / (b[1] - a[1]));
  }
  return xs;
}

function drawClampedRect(fb, box, x, y, w, h, color, fill, paint) {
  const x0 = clamp(x, box.x, box.x + box.w), y0 = clamp(y, box.y, box.y + box.h);
  const x1 = clamp(x + w, box.x, box.x + box.w), y1 = clamp(y + h, box.y, box.y + box.h);
  if (fill && isGradient(paint)) fb.gradientRect(x0, y0, Math.max(0, x1 - x0), Math.max(0, y1 - y0), gradientCss(paint), color);
  else if (fill) fb.fillRect(x0, y0, Math.max(0, x1 - x0), Math.max(0, y1 - y0), color);
  else fb.strokeRect(x0, y0, Math.max(0, x1 - x0), Math.max(0, y1 - y0), color, 2);
}

function paintColor(value, fallback) {
  if (isGradient(value)) return cssColor(value.stops?.[0]?.color, fallback);
  if (value?.kind === "pattern") return [135, 160, 255, 255];
  return cssColor(value, fallback);
}
function isGradient(value) { return value && typeof value === "object" && Array.isArray(value.stops); }
function gradientCss(value) { return `linear-gradient(90deg,${value.stops.map(s => s.color).join(",") || "#ffffff,#000000"})`; }
function pointInBox(box, x, y, sx, sy) { return [clamp(box.x + n(x) * sx, box.x, box.x + box.w), clamp(box.y + n(y) * sy, box.y, box.y + box.h)]; }
function fontSize(font) { return Number(String(font || "").match(/(\d+(?:\.\d+)?)px/)?.[1] || 16); }
function inset(box, n) { return { x: box.x + n, y: box.y + n, w: Math.max(1, box.w - n * 2), h: Math.max(1, box.h - n * 2) }; }
function clamp(value, min, max) { return Math.max(min, Math.min(max, Number(value) || 0)); }
function n(value) { return Number(value) || 0; }
