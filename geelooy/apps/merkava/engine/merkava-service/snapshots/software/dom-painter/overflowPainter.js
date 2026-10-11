// B"H
import { cssColor } from "../framebuffer.js";
import { classText, overflowValue } from "./styleTools.js";

/**
 * Overflow painter: four little rivers reveal whether content is sealed,
 * vertically scrolled, horizontally scrolled, or auto-bearing both rails.
 */
export function clipsOverflow(item) {
  const ov = overflowValue(item.style || {});
  return ["hidden", "scroll", "auto"].includes(ov.x) || ["hidden", "scroll", "auto"].includes(ov.y);
}

export function isExplicitOverflowWitness(item) {
  return classText(item).includes("overflowCase") || hasScrollWitness(item);
}

export function shouldShowScrollbar(item) {
  const ov = overflowValue(item.style || {});
  return isExplicitOverflowWitness(item) && (["scroll", "auto"].includes(ov.x) || ["scroll", "auto"].includes(ov.y) || hasScrollWitness(item));
}

export function paintOverflowBadge(fb, item) {
  const label = overflowLabel(item);
  fb.fillRect(item.x + 5, item.y + 5, Math.min(70, item.width - 14), 15, [4, 12, 26, 235]);
  fb.drawText(label, item.x + 8, item.y + 9, [255, 255, 255, 255], 1, Math.max(24, item.width - 18));
}

export function paintScrollbar(fb, item) {
  const style = item.style || {};
  const ov = overflowValue(style);
  const accent = cssColor(style["scrollbar-color"]?.split(/\s+/)[0] || style["--scroll-thumb"] || "#00e5ff", [0, 229, 255, 255]);
  const track = cssColor(style["--scroll-track"] || "#06101f", [6, 16, 31, 255]);
  if (["scroll", "auto"].includes(ov.y) || style["--scroll-y"]) paintVertical(fb, item, accent, track);
  if (["scroll", "auto"].includes(ov.x) || style["--scroll-x"]) paintHorizontal(fb, item, accent, track);
}

function paintVertical(fb, item, accent, track) {
  const right = item.x + item.width - 10;
  const top = item.y + 22;
  const h = Math.max(20, item.height - 30);
  const thumbH = Math.max(14, Math.min(h - 4, h * scrollRatio(item, "y")));
  const thumbY = top + 2 + Math.max(0, h - thumbH - 4) * scrollAmount(item, "y");
  fb.fillRect(right, top, 6, h, track);
  fb.fillRect(right + 1, thumbY, 4, thumbH, accent);
}

function paintHorizontal(fb, item, accent, track) {
  const left = item.x + 6;
  const bottom = item.y + item.height - 10;
  const w = Math.max(22, item.width - 18);
  const thumbW = Math.max(14, Math.min(w - 4, w * scrollRatio(item, "x")));
  const thumbX = left + 2 + Math.max(0, w - thumbW - 4) * scrollAmount(item, "x");
  fb.fillRect(left, bottom, w, 6, track);
  fb.fillRect(thumbX, bottom + 1, thumbW, 4, accent);
}

function overflowLabel(item) {
  const cls = classText(item);
  if (cls.includes("hiddenCase")) return "HIDDEN";
  if (cls.includes("xScrollCase")) return "SCROLL X";
  if (cls.includes("scrollCase")) return "SCROLL Y";
  if (cls.includes("autoCase")) return "AUTO";
  const ov = overflowValue(item.style || {});
  return ov.x === ov.y ? ov.x.toUpperCase() : `${ov.x}/${ov.y}`.toUpperCase();
}

function hasScrollWitness(item) {
  return String(item.style?.["--scroll-y"] || item.style?.["--scroll-x"] || "") !== "";
}

function scrollAmount(item, axis) {
  return Math.max(0, Math.min(1, Number(item.style?.[`--scroll-${axis}`] || item.node?.attributes?.[`data-scroll-${axis}`] || 0)));
}

function scrollRatio(item, axis) {
  return Math.max(0.12, Math.min(0.85, Number(item.style?.[`--scroll-${axis}-ratio`] || item.node?.attributes?.[`data-scroll-${axis}-ratio`] || 0.38)));
}
