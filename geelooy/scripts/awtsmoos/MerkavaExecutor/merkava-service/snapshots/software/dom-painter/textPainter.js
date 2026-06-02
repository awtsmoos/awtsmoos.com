// B"H
import { isControl, textColor, textScale } from "./styleTools.js";

/**
 * Text painter: the Awtsmoos gives letters a small vessel and prevents them
 * from flooding every neighbor. Controls are terse; decorative panels are calm.
 */
export function paintTextItem(fb, item) {
  paintTextWithin(fb, item.text || "", item, item.style || {}, 12, 7);
}

export function paintTextWithin(fb, text, item, style, padX, padY) {
  const maxWidth = Math.max(8, item.width - padX * 2);
  const maxHeight = Math.max(8, item.height - padY * 2);
  fb.drawWrappedText(String(text || "").slice(0, 240), item.x + padX, item.y + padY, maxWidth, maxHeight, textColor(item.kind, style), textScale(item.kind, style));
}

export function directText(node = {}, kind = "") {
  if (isControl(kind)) return String(node.attributes?.value || node.value || node.attributes?.placeholder || node.textContent || kind).trim();
  return node.textContent && !(node.children || []).length ? String(node.textContent || "").trim() : "";
}

export function textPadX(kind) {
  return isControl(kind) ? 10 : 10;
}

export function textPadY(kind) {
  return isControl(kind) ? 9 : 10;
}
