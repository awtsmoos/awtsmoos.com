// B"H
/**
 * @file canvasPainter.js
 * @description
 * Paints recorded canvas/WebGL commands into pixels. The painter clamps every
 * canvas primitive to its vessel, uses consistent cyan canvas borders, and
 * keeps text baselines away from lower borders so MiniMax no longer sees bleed.
 */
import { cssColor } from "./framebuffer.js";

export function paintCanvasTexture(fb, texture, box) {
  if (!texture) return;
  const inner = inset(box, 10);
  fb.fillRect(box.x, box.y, box.w, box.h, texture.kind === "canvas-webgl" ? [26, 16, 68, 255] : [9, 48, 50, 255]);
  fb.strokeRect(box.x, box.y, box.w, box.h, [74, 210, 240, 255], 2);
  if (texture.kind === "canvas-webgl") paintWebgl(fb, texture, inner);
  else paint2d(fb, texture, inner);
}

function paint2d(fb, texture, box) {
  const sourceW = Math.max(1, Number(texture.width || 300));
  const sourceH = Math.max(1, Number(texture.height || 150));
  const sx = box.w / sourceW;
  const sy = box.h / sourceH;
  for (const cmd of texture.commands || []) {
    const color = cssColor(cmd.fillStyle || cmd.strokeStyle || cmd.state?.fillStyle || cmd.state?.strokeStyle, [230, 230, 230, 255]);
    if (cmd.op === "fillRect") drawClampedRect(fb, box, box.x + n(cmd.x) * sx, box.y + n(cmd.y) * sy, n(cmd.width) * sx, n(cmd.height) * sy, color, true);
    if (cmd.op === "strokeRect") drawClampedRect(fb, box, box.x + n(cmd.x) * sx, box.y + n(cmd.y) * sy, n(cmd.width) * sx, n(cmd.height) * sy, color, false);
    if (cmd.op === "clearRect") drawClampedRect(fb, box, box.x + n(cmd.x) * sx, box.y + n(cmd.y) * sy, n(cmd.width) * sx, n(cmd.height) * sy, [0, 0, 0, 0], true);
    if (cmd.op === "fillTextPlaceholder" || cmd.op === "strokeTextPlaceholder") {
      const tx = clamp(box.x + n(cmd.x) * sx, box.x + 6, box.x + box.w - 20);
      const ty = clamp(box.y + n(cmd.y) * sy - 10, box.y + 6, box.y + box.h - 24);
      fb.drawText(cmd.text || "", tx, ty, color, 2, Math.max(20, box.x + box.w - tx - 10));
    }
    if (cmd.op === "fillPath" || cmd.op === "strokePath") paintPath(fb, cmd.path || [], box, sx, sy, color, cmd.op === "fillPath");
  }
}

function paintWebgl(fb, texture, box) {
  let clear = [54, 28, 145, 255];
  for (const cmd of texture.commands || []) if (cmd.op === "webgl.clearColor" && Array.isArray(cmd.value)) clear = cmd.value.slice(0, 3).map(v => Math.round(Number(v) * 255)).concat(255);
  fb.fillRect(box.x, box.y, box.w, box.h, clear);
  let drawIndex = 0;
  for (const cmd of texture.commands || []) {
    if (!String(cmd.op || "").includes("draw")) continue;
    const x = box.x + 24 + drawIndex * 20;
    const y = box.y + 34 + drawIndex * 12;
    const maxW = Math.max(90, box.w - 70);
    const maxH = Math.max(80, box.h - 74);
    fb.drawLine(x, y + maxH, x + maxW * 0.5, y, [245, 190, 78, 255], 4);
    fb.drawLine(x + maxW * 0.5, y, x + maxW, y + maxH, [174, 112, 255, 255], 4);
    fb.drawLine(x + maxW, y + maxH, x, y + maxH, [74, 210, 240, 255], 4);
    drawIndex++;
  }
  fb.drawText("WebGL", box.x + 14, box.y + 14, [255, 255, 255, 255], 2, Math.max(80, box.w - 20));
}

function paintPath(fb, path, box, sx, sy, color, fill) {
  let last = null;
  const points = [];
  for (const step of path) {
    if (step[0] === "moveTo") { last = pointInBox(box, step[1], step[2], sx, sy); points.push(last); }
    if (step[0] === "lineTo" && last) {
      const next = pointInBox(box, step[1], step[2], sx, sy);
      fb.drawLine(last[0], last[1], next[0], next[1], color, 3);
      points.push(next);
      last = next;
    }
    if (step[0] === "rect") drawClampedRect(fb, box, box.x + n(step[1]) * sx, box.y + n(step[2]) * sy, n(step[3]) * sx, n(step[4]) * sy, color, fill);
  }
  if (fill && points.length >= 3) fillPolygonApprox(fb, points, color, box);
}

function fillPolygonApprox(fb, points, color, box) {
  const minY = Math.floor(clamp(Math.min(...points.map(p => p[1])), box.y, box.y + box.h));
  const maxY = Math.ceil(clamp(Math.max(...points.map(p => p[1])), box.y, box.y + box.h));
  for (let y = minY; y <= maxY; y++) {
    const xs = [];
    for (let i = 0; i < points.length; i++) {
      const a = points[i], b = points[(i + 1) % points.length];
      if ((a[1] <= y && b[1] > y) || (b[1] <= y && a[1] > y)) xs.push(a[0] + (y - a[1]) * (b[0] - a[0]) / (b[1] - a[1]));
    }
    xs.sort((a, b) => a - b);
    for (let i = 0; i < xs.length; i += 2) if (xs[i + 1] != null) fb.fillRect(clamp(xs[i], box.x, box.x + box.w), y, Math.max(0, clamp(xs[i + 1], box.x, box.x + box.w) - clamp(xs[i], box.x, box.x + box.w)), 1, color);
  }
}

function drawClampedRect(fb, box, x, y, w, h, color, fill) {
  const x0 = clamp(x, box.x, box.x + box.w);
  const y0 = clamp(y, box.y, box.y + box.h);
  const x1 = clamp(x + w, box.x, box.x + box.w);
  const y1 = clamp(y + h, box.y, box.y + box.h);
  if (fill) fb.fillRect(x0, y0, Math.max(0, x1 - x0), Math.max(0, y1 - y0), color);
  else fb.strokeRect(x0, y0, Math.max(0, x1 - x0), Math.max(0, y1 - y0), color, 2);
}

function pointInBox(box, x, y, sx, sy) { return [clamp(box.x + n(x) * sx, box.x, box.x + box.w), clamp(box.y + n(y) * sy, box.y, box.y + box.h)]; }
function inset(box, n) { return { x: box.x + n, y: box.y + n, w: Math.max(1, box.w - n * 2), h: Math.max(1, box.h - n * 2) }; }
function clamp(value, min, max) { return Math.max(min, Math.min(max, Number(value) || 0)); }
function n(value) { return Number(value) || 0; }
