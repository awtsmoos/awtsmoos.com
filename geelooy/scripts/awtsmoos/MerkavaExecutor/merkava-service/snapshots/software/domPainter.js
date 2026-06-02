// B"H
/**
 * @file domPainter.js
 * @description
 * Paints measured DOM layout into pixels. Text nodes receive safe insets so
 * glyphs do not clip at the left/top edge, and canvas textures are matched by
 * kind/id instead of a fragile shared index.
 */
import { cssColor } from "./framebuffer.js";
import { paintCanvasTexture } from "./canvasPainter.js";

export function paintLayout(fb, layout, canvas = {}) {
  const textures = [...(canvas.textures || [])];
  const used = new Set();
  for (const item of layout) {
    if (item.kind === "#text") paintTextItem(fb, item);
    else paintBox(fb, item, pickCanvasTexture(item, textures, used));
  }
}

function pickCanvasTexture(item, textures, used) {
  if (item.kind !== "canvas") return null;
  const wantedKind = textures.some(t => t.kind === "canvas-2d" && !used.has(t.id)) ? "canvas-2d" : "canvas-webgl";
  const chosen = textures.find(t => !used.has(t.id) && t.kind === wantedKind) || textures.find(t => !used.has(t.id));
  if (chosen) used.add(chosen.id);
  return chosen || null;
}

function paintBox(fb, item, texture) {
  const style = item.style || {};
  const bg = background(style, item);
  if (bg.gradient) fb.gradientRect(item.x, item.y, item.width, item.height, bg.gradient, bg.color);
  else if (bg.color[3] > 0) fb.fillRect(item.x, item.y, item.width, item.height, bg.color);
  const border = borderColor(style);
  const borderWidth = parsePx(style["border-width"] || borderWidthFromShorthand(style.border));
  if (borderWidth > 0) fb.strokeRect(item.x, item.y, item.width, item.height, border, borderWidth);
  if (item.kind === "canvas") paintCanvasTexture(fb, texture, { x: item.x + 2, y: item.y + 2, w: Math.max(24, item.width - 4), h: Math.max(24, item.height - 4) });
  const ownText = directText(item.node);
  if (ownText) paintTextWithin(fb, ownText, item, style, 10, 10);
}

function paintTextItem(fb, item) { paintTextWithin(fb, item.text || "", item, item.style || {}, 12, 7); }

function paintTextWithin(fb, text, item, style, padX, padY) {
  const size = parsePx(style["font-size"]) || fontSizeFor(item.kind);
  const scale = item.kind === "button" ? 1 : Math.max(1, Math.min(3, Math.round(size / 10)));
  const x = item.x + padX;
  const y = item.y + padY;
  const maxWidth = Math.max(8, item.width - padX * 2);
  const maxHeight = Math.max(8, item.height - padY * 2);
  fb.drawWrappedText(String(text || "").slice(0, 400), x, y, maxWidth, maxHeight, cssColor(style.color, [245, 245, 245, 255]), scale);
}

function background(style, item) {
  const bg = style["background-image"] || style.background || "";
  const color = cssColor(style["background-color"] || style.background, fallbackFor(item.kind));
  return /gradient\(/i.test(bg) ? { gradient: bg, color } : { color };
}
function borderColor(style) { return cssColor(style["border-color"] || style.border || "#000000", [0, 0, 0, 255]); }
function borderWidthFromShorthand(value = "") { return String(value || "").match(/\d+(?:\.\d+)?px/)?.[0] || 0; }
function directText(node = {}) { return node.textContent && !(node.children || []).length ? String(node.textContent || "").trim() : ""; }
function fallbackFor(kind) {
  if (kind === "body") return [8, 9, 14, 255];
  if (["main", "section", "article", "div"].includes(kind)) return [26, 28, 38, 255];
  if (kind === "button") return [80, 97, 255, 255];
  if (["h1", "h2", "h3", "p", "span", "strong", "li", "ul"].includes(kind)) return [0, 0, 0, 0];
  return [0, 0, 0, 0];
}
function fontSizeFor(kind) { return kind === "h1" ? 24 : kind === "h2" ? 20 : kind === "button" ? 16 : 14; }
function parsePx(value) { const match = String(value || "").match(/-?\d+(?:\.\d+)?/); return match ? Number(match[0]) : 0; }
