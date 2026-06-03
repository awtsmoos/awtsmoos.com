// B"H
import { paintCanvasTexture } from "../canvasPainter.js";
import { background, borderColor, borderWidth, hasGlow } from "./styleTools.js";
import { isExplicitOverflowWitness, paintOverflowBadge } from "./overflowPainter.js";
import { directText, paintTextWithin, textPadX, textPadY } from "./textPainter.js";
import { paintTransformWitness } from "./transformPainter.js";
import { paintSvgWitness } from "./svgPainter.js";

/**
 * Box painter: the Awtsmoos turns each measured rectangle into a vessel of
 * background, border, SVG witness, transform witness, canvas soul, overflow
 * badge, and carefully contained text. SVG no longer sits empty in the maze.
 */
export function paintBox(fb, item, texture, allTextures) {
  const style = item.style || {};
  const bg = background(style, item);
  if (hasGlow(style)) paintGlow(fb, item, style);
  if (bg.gradient) fb.gradientRect(item.x, item.y, item.width, item.height, bg.gradient, bg.color);
  else if (bg.color[3] > 0) fb.fillRect(item.x, item.y, item.width, item.height, bg.color);
  const bw = borderWidth(style, item.kind);
  if (bw > 0) fb.strokeRect(item.x, item.y, item.width, item.height, borderColor(style, item.kind), bw);
  if (paintSvgWitness(fb, item)) return;
  paintTransformWitness(fb, item);
  if (isExplicitOverflowWitness(item)) paintOverflowBadge(fb, item);
  if (item.kind === "canvas") paintCanvasTexture(fb, texture, canvasBox(item), allTextures);
  const own = directText(item.node, item.kind);
  if (own) paintTextWithin(fb, own, item, style, textPadX(item.kind), textPadY(item.kind));
}

function canvasBox(item) {
  return { x: item.x + 2, y: item.y + 2, w: Math.max(24, item.width - 4), h: Math.max(24, item.height - 4) };
}

function paintGlow(fb, item, style) {
  const color = borderColor({ border: style["box-shadow"] || style.filter || "cyan" }, item.kind);
  fb.strokeRect(item.x - 3, item.y - 3, item.width + 6, item.height + 6, [color[0], color[1], color[2], 120], 2);
  fb.strokeRect(item.x - 6, item.y - 6, item.width + 12, item.height + 12, [color[0], color[1], color[2], 70], 1);
}
