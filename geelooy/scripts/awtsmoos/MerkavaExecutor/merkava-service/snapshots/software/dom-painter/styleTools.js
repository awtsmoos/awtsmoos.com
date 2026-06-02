// B"H
import { cssColor } from "../framebuffer.js";

/**
 * The Awtsmoos turns raw CSS whispers into useful paint decisions. This module
 * is the small lamp: colors, borders, text sizes, and overflow names are pulled
 * from the measured style without letting the main painter become a jungle.
 */
export function background(style, item) {
  const bg = style["background-image"] || style.background || "";
  const color = cssColor(style["background-color"] || style.background, fallbackFor(item.kind));
  return /gradient\(/i.test(bg) ? { gradient: bg, color } : { color };
}

export function overflowValue(style) {
  const both = String(style.overflow || "visible").trim().toLowerCase();
  return {
    x: String(style["overflow-x"] || both).trim().toLowerCase(),
    y: String(style["overflow-y"] || both).trim().toLowerCase()
  };
}

export function borderColor(style, kind) {
  return cssColor(style["border-color"] || style.border || (isControl(kind) ? "#7edcff" : "#000000"), isControl(kind) ? [126, 220, 255, 255] : [0, 0, 0, 255]);
}

export function borderWidth(style, kind) {
  return parsePx(style["border-width"] || String(style.border || "").match(/\d+(?:\.\d+)?px/)?.[0]) || (isControl(kind) ? 2 : 0);
}

export function textColor(kind, style) {
  return cssColor(style.color, isControl(kind) ? [240, 248, 255, 255] : [245, 245, 245, 255]);
}

export function textScale(kind, style) {
  const size = parsePx(style["font-size"]) || (kind === "h1" ? 24 : kind === "h2" ? 20 : isControl(kind) ? 14 : 14);
  return kind === "button" || isControl(kind) ? 1 : Math.max(1, Math.min(3, Math.round(size / 10)));
}

export function fallbackFor(kind) {
  if (kind === "body") return [8, 9, 14, 255];
  if (["main", "section", "article", "div", "form", "fieldset"].includes(kind)) return [18, 26, 42, 255];
  if (kind === "button") return [69, 90, 210, 255];
  if (["input", "select", "textarea"].includes(kind)) return [24, 38, 59, 255];
  if (["h1", "h2", "h3", "p", "span", "strong", "label", "li", "ul"].includes(kind)) return [0, 0, 0, 0];
  return [0, 0, 0, 0];
}

export function isControl(kind) {
  return ["button", "input", "select", "textarea"].includes(kind);
}

export function hasGlow(style) {
  return /shadow|glow|blur/i.test(String(style["box-shadow"] || style.filter || ""));
}

export function classText(item) {
  return String(item.node?.className || item.node?.attributes?.class || "");
}

export function parsePx(value) {
  const match = String(value || "").match(/-?\d+(?:\.\d+)?/);
  return match ? Number(match[0]) : 0;
}
