// B"H
/**
 * @file domPainter.js
 * @description
 * Paints measured DOM layout into pixels. Forms and controls now render as
 * dark glass controls by default, avoiding blown-out white rectangles in the
 * complex witness. The painter still matches WebGL and Canvas2D textures by
 * DOM intent so the correct canvas soul enters each visible vessel.
 */
import { cssColor } from "./framebuffer.js";
import { paintCanvasTexture } from "./canvasPainter.js";

export function paintLayout(fb, layout, canvas = {}) {
  const textures = [...(canvas.textures || [])];
  const usedDomTextures = new Set();
  for (const item of layout) {
    if (item.kind === "#text") paintTextItem(fb, item);
    else paintBox(fb, item, pickDomCanvasTexture(item, textures, usedDomTextures), textures);
  }
}

function pickDomCanvasTexture(item, textures, used) {
  if (item.kind !== "canvas") return null;
  const unused = textures.filter(texture => !used.has(texture.id));
  const hint = canvasHint(item.node);
  const attrW = Number(item.node?.attributes?.width || item.node?.width || 0);
  const attrH = Number(item.node?.attributes?.height || item.node?.height || 0);
  const kind = hint.includes("gl") || hint.includes("webgl") ? "canvas-webgl" : "canvas-2d";
  const chosen = unused.find(texture => texture.kind === kind && near(texture.width, attrW) && near(texture.height, attrH)) || unused.find(texture => texture.kind === kind) || unused.find(texture => near(texture.width, attrW) && near(texture.height, attrH)) || unused[0];
  if (chosen) used.add(chosen.id);
  return chosen || null;
}

function paintBox(fb, item, texture, allTextures) {
  const style = item.style || {};
  const bg = background(style, item);
  if (hasGlow(style)) paintGlow(fb, item, style);
  if (bg.gradient) fb.gradientRect(item.x, item.y, item.width, item.height, bg.gradient, bg.color);
  else if (bg.color[3] > 0) fb.fillRect(item.x, item.y, item.width, item.height, bg.color);
  const border = borderColor(style, item.kind);
  const borderWidth = parsePx(style["border-width"] || borderWidthFromShorthand(style.border)) || defaultBorderWidth(item.kind);
  if (borderWidth > 0) fb.strokeRect(item.x, item.y, item.width, item.height, border, borderWidth);
  if (item.kind === "canvas") paintCanvasTexture(fb, texture, { x: item.x + 2, y: item.y + 2, w: Math.max(24, item.width - 4), h: Math.max(24, item.height - 4) }, allTextures);
  const ownText = directText(item.node, item.kind);
  if (ownText) paintTextWithin(fb, ownText, item, style, textPadX(item.kind), textPadY(item.kind));
}

function paintGlow(fb, item, style) {
  const color = cssColor(style["box-shadow"] || style.filter || "cyan", [74, 210, 240, 255]);
  fb.strokeRect(item.x - 3, item.y - 3, item.width + 6, item.height + 6, [color[0], color[1], color[2], 120], 2);
  fb.strokeRect(item.x - 6, item.y - 6, item.width + 12, item.height + 12, [color[0], color[1], color[2], 70], 1);
}

function paintTextItem(fb, item) { paintTextWithin(fb, item.text || "", item, item.style || {}, 12, 7); }

function paintTextWithin(fb, text, item, style, padX, padY) {
  const size = parsePx(style["font-size"]) || fontSizeFor(item.kind);
  const scale = item.kind === "button" || isControl(item.kind) ? 1 : Math.max(1, Math.min(3, Math.round(size / 10)));
  const x = item.x + padX;
  const y = item.y + padY;
  const maxWidth = Math.max(8, item.width - padX * 2);
  const maxHeight = Math.max(8, item.height - padY * 2);
  fb.drawWrappedText(String(text || "").slice(0, 400), x, y, maxWidth, maxHeight, cssColor(style.color, textColorFor(item.kind)), scale);
}

function directText(node = {}, kind = "") {
  if (isControl(kind)) return String(node.attributes?.value || node.value || node.attributes?.placeholder || node.textContent || kind).trim();
  const text = node.textContent && !(node.children || []).length ? String(node.textContent || "").trim() : "";
  return text;
}

function background(style, item) {
  const bg = style["background-image"] || style.background || "";
  const color = cssColor(style["background-color"] || style.background, fallbackFor(item.kind));
  return /gradient\(/i.test(bg) ? { gradient: bg, color } : { color };
}

function fallbackFor(kind) {
  if (kind === "body") return [8, 9, 14, 255];
  if (["main", "section", "article", "div", "form", "fieldset"].includes(kind)) return [18, 26, 42, 255];
  if (kind === "button") return [69, 90, 210, 255];
  if (["input", "select", "textarea"].includes(kind)) return [24, 38, 59, 255];
  if (["h1", "h2", "h3", "p", "span", "strong", "label", "li", "ul"].includes(kind)) return [0, 0, 0, 0];
  return [0, 0, 0, 0];
}

function borderColor(style, kind) { return cssColor(style["border-color"] || style.border || (isControl(kind) ? "#7edcff" : "#000000"), isControl(kind) ? [126, 220, 255, 255] : [0, 0, 0, 255]); }
function defaultBorderWidth(kind) { return isControl(kind) ? 2 : 0; }
function textColorFor(kind) { return isControl(kind) ? [240, 248, 255, 255] : [245, 245, 245, 255]; }
function textPadX(kind) { return isControl(kind) ? 10 : 10; }
function textPadY(kind) { return isControl(kind) ? 9 : 10; }
function isControl(kind) { return ["button", "input", "select", "textarea"].includes(kind); }
function hasGlow(style) { return /shadow|glow|blur/i.test(String(style["box-shadow"] || style.filter || "")); }
function canvasHint(node = {}) { return String([node.id, node.name, node.className, node.attributes?.id, node.attributes?.name, node.attributes?.class].filter(Boolean).join(" ")).toLowerCase(); }
function near(a, b) { return !b || Math.abs(Number(a || 0) - Number(b || 0)) <= 2; }
function borderWidthFromShorthand(value = "") { return String(value || "").match(/\d+(?:\.\d+)?px/)?.[0] || 0; }
function fontSizeFor(kind) { return kind === "h1" ? 24 : kind === "h2" ? 20 : isControl(kind) ? 14 : 14; }
function parsePx(value) { const match = String(value || "").match(/-?\d+(?:\.\d+)?/); return match ? Number(match[0]) : 0; }
