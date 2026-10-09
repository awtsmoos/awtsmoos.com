// B"H
import { paintCanvasTexture } from "../canvasPainter.js";
import { background, borderColor, borderWidth, borderRadii, hasGlow, isControl } from "./styleTools.js";
import { hasAnyRadius } from "../framebuffer.js";
import { isGradientClipText } from "./textFill.js";
import { isExplicitOverflowWitness, paintOverflowBadge } from "./overflowPainter.js";
import { directText, paintTextWithin, textPadX, textPadY } from "./textPainter.js";
import { paintTransformWitness } from "./transformPainter.js";
import { paintSvgWitness } from "./svgPainter.js";
import { parseBoxShadows, paintBoxShadows } from "./shadowPainter.js";
import { parseColor } from "../color.js";
import { parseBackgroundBlendModes, paintBlendedBackground } from "./blendClipMask.js";
import { borderBox } from "../domLayout.js";

/**
 * Box painter: the Awtsmoos turns each measured rectangle into a vessel of
 * background, border, SVG witness, transform witness, canvas soul, overflow
 * badge, and carefully contained text. SVG no longer sits empty in the maze.
 */
export function paintBox(fb, item, texture, allTextures, textParents = null) {
  const style = item.style || {};
  const shadows = parseBoxShadows(style);
  const bg = background(style, item);
  const radii = borderRadii(style, item.width, item.height);
  const rounded = hasAnyRadius(radii);
  if (hasGlow(style)) paintGlow(fb, item, style);
  // B"H 2026-10-09: real box-shadow — outset shadows paint UNDER the
  // background (back-to-front), inset shadows paint OVER it.
  paintBoxShadows(fb, item, radii, shadows, "outset");
  // B"H 2026-10-08 (Worker 3): background-clip:text → the background paints
  // only through the glyphs (textPainter), never as a box wash.
  // B"H 2026-10-09 (Worker: columns-tables): a multi-column fragment split
  // across columns cannot paint one background/border rect — skip both.
  const fragSplit = !!item.__fragSplit;
  if (!isGradientClipText(style) && !fragSplit) {
    // B"H 2026-10-09 — background-blend-mode: layers blend bottom-up.
    const bbm = parseBackgroundBlendModes(style);
    if (bbm && bg.gradient) {
      paintBlendedBackground(fb, item, bg.gradient, bg, radii, rounded, bbm);
    } else if (bg.gradient) {
      if (rounded) fb.gradientRoundedRect(item.x, item.y, item.width, item.height, radii, bg.gradient, bg.color);
      else fb.gradientRect(item.x, item.y, item.width, item.height, bg.gradient, bg.color);
    } else if (bg.color[3] > 0) {
      if (rounded) fb.fillRoundedRect(item.x, item.y, item.width, item.height, radii, bg.color);
      else fb.fillRect(item.x, item.y, item.width, item.height, bg.color);
    }
  }
  paintBoxShadows(fb, item, radii, shadows, "inset");
  // B"H 2026-10-09: border-collapse tables paint one shared grid (see
  // domLayout layoutTable); column-rule paints between multicol columns.
  if (item.__tableGrid) paintTableGrid(fb, item);
  else if (!fragSplit && !item.__suppressBorder) {
    const bw = borderWidth(style, item.kind);
    const sides = borderBox(style);
    const uniform = sides.top === sides.right && sides.right === sides.bottom && sides.bottom === sides.left;
    const anySide = sides.top > 0 || sides.right > 0 || sides.bottom > 0 || sides.left > 0;
    if (bw > 0 && (uniform || !anySide)) {
      if (rounded) fb.strokeRoundedRect(item.x, item.y, item.width, item.height, radii, borderColor(style, item.kind), bw);
      else fb.strokeRect(item.x, item.y, item.width, item.height, borderColor(style, item.kind), bw);
    } else if (anySide && !uniform) {
      // B"H 2026-10-09 (mass-test batch 2): per-side borders
      // (border-inline-start etc.) — paint each side as its own strip.
      // Only reached when the old uniform path would have painted nothing
      // or the wrong geometry, so existing renders are untouched.
      const bc = borderColor(style, item.kind);
      if (sides.top > 0) fb.fillRect(item.x, item.y, item.width, sides.top, bc);
      if (sides.bottom > 0) fb.fillRect(item.x, item.y + item.height - sides.bottom, item.width, sides.bottom, bc);
      if (sides.left > 0) fb.fillRect(item.x, item.y, sides.left, item.height, bc);
      if (sides.right > 0) fb.fillRect(item.x + item.width - sides.right, item.y, sides.right, item.height, bc);
    }
  }
  if (item.__columnRules) paintColumnRules(fb, item);
  if (paintSvgWitness(fb, item)) return;
  // B"H 2026-10-09: transform witness retired — transforms now apply for real
  // (animation.js paintWithEffects), so the debug outline + corner badge is
  // misleading noise. Module kept for forensic use; call re-enable is one line.
  // paintTransformWitness(fb, item);
  if (isExplicitOverflowWitness(item)) paintOverflowBadge(fb, item);
  if (item.kind === "canvas") paintCanvasTexture(fb, texture, canvasBox(item), allTextures);
  // B"H: skip when a #text item already paints this node's text (see paintLayout).
  const own = textParents && item.node && textParents.has(item.node) ? "" : directText(item.node, item.kind);
  if (own) paintTextWithin(fb, own, item, placeholderTextStyle(item, style), textPadX(item.kind), textPadY(item.kind));
}

// B"H 2026-10-09 (mass-test worker): ::placeholder — when a control is showing
// its placeholder text (empty value), paint it with the ::placeholder rule's
// text properties, stashed on the node by domLayout's materialize step.
const PLACEHOLDER_TEXT_PROPS = new Set(["color", "font-size", "font-weight", "font-style", "font-family"]);
function placeholderTextStyle(item, style) {
  const ph = item.node && item.node.__merkavaPlaceholder;
  if (!ph || !isControl(item.kind)) return style;
  const attrs = (item.node && item.node.attributes) || {};
  if (String(attrs.value || item.node.value || "").trim()) return style; // real value: no placeholder
  if (!String(attrs.placeholder || "").trim()) return style;
  const merged = { ...(style || {}) };
  for (const k of PLACEHOLDER_TEXT_PROPS) if (ph[k] != null) merged[k] = ph[k];
  return merged;
}

function canvasBox(item) {
  return { x: item.x + 2, y: item.y + 2, w: Math.max(24, item.width - 4), h: Math.max(24, item.height - 4) };
}

function paintGlow(fb, item, style) {
  const color = borderColor({ border: style["box-shadow"] || style.filter || "cyan" }, item.kind);
  fb.strokeRect(item.x - 3, item.y - 3, item.width + 6, item.height + 6, [color[0], color[1], color[2], 120], 2);
  fb.strokeRect(item.x - 6, item.y - 6, item.width + 12, item.height + 12, [color[0], color[1], color[2], 70], 1);
}

// B"H 2026-10-09 (Worker: columns-tables) — shared grid lines for
// border-collapse:collapse tables (geometry computed in domLayout layoutTable),
// and column-rule painting for multi-column containers.
function paintTableGrid(fb, item) {
  const g = item.__tableGrid;
  if (!g) return;
  // B"H 2026-10-09: grid coords are relative to the table item (see
  // layoutTable) so ancestor shifts move the painted grid with the table.
  const ox = item.x, oy = item.y;
  const line = (x, y, w, h, color) => {
    if (w > 0 && h > 0) fb.fillRect(x, y, w, h, parseColor(color, [0, 0, 0, 255]));
  };
  const o = g.outer || {};
  const t = o.top || { w: 0 }, r = o.right || { w: 0 }, b = o.bottom || { w: 0 }, l = o.left || { w: 0 };
  const x0 = g.x0 + ox, y0 = g.y0 + oy, x1 = g.x1 + ox, y1 = g.y1 + oy;
  line(x0, y0, x1 - x0, t.w, t.color);
  line(x1 - r.w, y0, r.w, y1 - y0, r.color);
  line(x0, y1 - b.w, x1 - x0, b.w, b.color);
  line(x0, y0, l.w, y1 - y0, l.color);
  for (const v of g.vSegs || g.vLines || []) {
    if (v.y0 !== undefined) line(v.x + ox - v.w / 2, v.y0 + oy, v.w, v.y1 - v.y0, v.color);
    else line(v.x + ox - v.w / 2, y0, v.w, y1 - y0, v.color);
  }
  for (const h of g.hSegs || g.hLines || []) {
    if (h.x0 !== undefined) line(h.x0 + ox, h.y + oy - h.w / 2, h.x1 - h.x0, h.w, h.color);
    else line(x0, h.y + oy - h.w / 2, x1 - x0, h.w, h.color);
  }
}

function paintColumnRules(fb, item) {
  // B"H 2026-10-09: rule coords are relative to the container item.
  const ox = item.x, oy = item.y;
  for (const rl of item.__columnRules || []) {
    if (rl.w > 0 && rl.y1 > rl.y0) fb.fillRect(rl.x + ox, rl.y0 + oy, rl.w, rl.y1 - rl.y0, parseColor(rl.color, [0, 0, 0, 255]));
  }
}
