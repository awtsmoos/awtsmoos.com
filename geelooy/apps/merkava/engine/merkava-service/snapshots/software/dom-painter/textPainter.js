// B"H
import { isControl, textScale, resolveFontWeight } from "./styleTools.js";
import { resolveTextFill } from "./textFill.js";
import { gradientColor, parseGradient, gradientColorAt } from "../color.js";
import { textWidth, Framebuffer, boxBlurRegion } from "../framebuffer.js";
import { parseColor } from "../color.js";
import { parseTextShadows } from "./shadowPainter.js";

/**
 * Text painter: the Awtsmoos gives letters a small vessel and prevents them
 * from flooding every neighbor. Controls are terse; decorative panels are calm.
 *
 * B"H 2026-10-09: real-font engine — style is passed through to the
 * framebuffer so per-character font fallback (Hebrew etc.) works, and the
 * gradient-text path measures with real glyph advances instead of a fixed
 * 6*scale cell.
 */
export function paintTextItem(fb, item) {
  // B"H: #text items are precisely-positioned word fragments from layout —
  // they need no box padding. Padding here clips text (was 12,7).
  // B"H 2026-10-09 (css-worker-2): paint the item's own background-color
  // behind the glyphs. ::first-line{background} is applied post-layout by
  // stashing background-color on the first-line #text items — without this
  // the color was computed but never painted.
  const st = item.style || {};
  const bg = parseColor(st["background-color"], null);
  if (bg && bg[3] > 0 && item.width > 0 && item.height > 0) {
    fb.fillRect(item.x, item.y, item.width, item.height, bg);
  }
  paintTextWithin(fb, item.text || "", item, st, 0, 0);
}

export function paintTextWithin(fb, text, item, style, padX, padY) {
  // B"H 2026-10-09: text-shadow — each shadow paints the same text into a
  // temp buffer, blurred, composited at its offset, back-to-front, before
  // the main glyphs. Solid shadow color (gradient-text keeps its fallback).
  const shadows = parseTextShadows(style);
  for (let i = shadows.length - 1; i >= 0; i--) {
    paintTextShadowLayer(fb, text, item, style, padX, padY, shadows[i]);
  }
  const maxWidth = Math.max(8, item.width - padX * 2);
  const maxHeight = Math.max(8, item.height - padY * 2);
  // B"H: code-point-safe truncation (never split a surrogate pair).
  const safe = [...String(text || "")].slice(0, 240).join("");
  const scale = textScale(item.kind, style);
  const weight = resolveFontWeight(style);
  const fill = resolveTextFill(item.kind, style, item);
  if (fill.mode === "gradient-text") {
    paintGradientWrappedText(fb, safe, item.x + padX, item.y + padY, maxWidth, maxHeight, item, fill.gradient, fill.fallback, scale, weight, style);
  } else {
    fb.drawWrappedText(safe, item.x + padX, item.y + padY, maxWidth, maxHeight, fill.color, scale, weight, style);
  }
  // B"H 2026-10-09 (css-worker-2): text-decoration lines. underline sits
  // near the line-box bottom, overline near the top, line-through mid-box —
  // positions verified against the type-13/14/15/42 probe geometry (40px
  // font, 45px line: underline y=36, overline y=4, strike y=22).
  paintTextDecorations(fb, item, style, padX, padY, fill);
}

/** Parse text-decoration line keywords from the shorthand or -line longhand. */
function decorationLines(style = {}) {
  const raw = String(style["text-decoration-line"] || style["text-decoration"] || "").toLowerCase();
  if (!raw || /\bnone\b/.test(raw)) return [];
  const out = [];
  if (/\bunderline\b/.test(raw)) out.push("underline");
  if (/\boverline\b/.test(raw)) out.push("overline");
  if (/\bline-through\b/.test(raw)) out.push("line-through");
  return out;
}

function paintTextDecorations(fb, item, style, padX, padY, fill) {
  const lines = decorationLines(style);
  if (!lines.length) return;
  const w = Math.max(1, item.width - padX * 2);
  if (w < 2) return;
  const x0 = item.x + padX;
  const color = parseColor(style["text-decoration-color"], null) || (fill && fill.color) || [0, 0, 0, 255];
  if (color[3] === 0) return;
  const h = Math.max(1, item.height - padY * 2);
  const scale = textScale(item.kind, style);
  const t = Math.max(1, Math.round(scale * 0.9));
  const y0 = item.y + padY;
  for (const ln of lines) {
    let yy;
    if (ln === "overline") yy = y0 + 2;
    else if (ln === "line-through") yy = y0 + h / 2 - t / 2;
    else yy = y0 + h - Math.max(2, Math.round(h * 0.2)) - t + 1;
    fb.fillRect(x0, yy, w, t, color);
  }
}

// Shadow layer: same wrapping box as the main text so glyphs line up.
function paintTextShadowLayer(fb, text, item, style, padX, padY, sh) {
  const maxWidth = Math.max(8, item.width - padX * 2);
  const maxHeight = Math.max(8, item.height - padY * 2);
  const safe = [...String(text || "")].slice(0, 240).join("");
  if (!safe.trim()) return;
  const scale = textScale(item.kind, style);
  const weight = resolveFontWeight(style);
  const blur = Math.max(0, sh.blur || 0);
  const pad = Math.ceil(blur * 2) + 4;
  const tw = Math.max(1, Math.ceil(maxWidth + pad * 2));
  const th = Math.max(1, Math.ceil(maxHeight + pad * 2));
  const tmp = new Framebuffer(tw, th, [0, 0, 0, 0]);
  tmp.drawWrappedText(safe, pad, pad, maxWidth, maxHeight, sh.color, scale, weight, style);
  if (blur > 0) boxBlurRegion(tmp.data, tw, th, Math.max(1, Math.round(blur / 2)));
  fb.blitFrom(tmp, Math.round(item.x + padX + sh.dx - pad), Math.round(item.y + padY + sh.dy - pad));
}

// B"H 2026-10-08 — background-clip:text (Worker 3): the gradient lives only
// inside the glyphs, like a real browser. Sampled per character across the
// element box; an unparseable gradient falls back to the resolved solid color.
const COMBINING_MARK_RE = /\p{M}/u;

function paintGradientWrappedText(fb, text, x, y, maxWidth, maxHeight, item, gradient, fallback, scale, weight, style) {
  const words = String(text || "").replace(/\s+/g, " ").trim().split(" ").filter(Boolean);
  const px = Math.max(4, Math.round(10 * (Number(scale) || 1)));
  const lineH = Math.ceil(px * 1.25);
  const maxLines = Math.max(1, Math.floor(maxHeight / lineH));
  const visible = (s) => [...s].filter((ch) => !COMBINING_MARK_RE.test(ch)).join("");
  // B"H 2026-10-09 (speed): parse the gradient ONCE per text run, not per
  // character. Falls back to per-char gradientColor when unparseable.
  const g = parseGradient(gradient);
  const gradAt = g
    ? (cx, ly) => gradientColorAt(g, cx - item.x, ly - item.y, item.width, item.height, fallback)
    : (cx, ly) => gradientColor(gradient, cx - item.x, ly - item.y, item.width, item.height, fallback);
  let yy = y, used = 0, line = "";
  const flush = (ln, ly) => {
    let cx = x;
    for (const ch of ln) {
      if (COMBINING_MARK_RE.test(ch)) continue; // zero-width mark: no advance
      const w = textWidth(ch, scale, weight, style);
      if (cx + w > x + maxWidth) break;
      const c = gradAt(cx, ly);
      const drawn = fb.drawText(ch, cx, ly, c || fallback, scale, x + maxWidth - cx, weight, style);
      cx += drawn > 0 ? drawn : w;
    }
  };
  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (textWidth(visible(next), scale, weight, style) <= maxWidth) { line = next; continue; }
    flush(line, yy);
    used++;
    if (used >= maxLines) return used;
    yy += lineH;
    line = word;
  }
  if (line && used < maxLines) { flush(line, yy); used++; }
  return used;
}

export function directText(node, kind = "") {
  // B"H 2026-10-09 (torture): node can be null for synthetic layout items
  // (e.g. broken tables) — never crash on it.
  node = node || {};
  // B"H 2026-10-09 (merkava-mass-tests lists-forms): a <select> paints its
  // shown <option> as a real laid-out child — never fall back to the tag
  // name (that printed a stray "select" label and double-painted).
  if (kind === "select") return "";
  if (isControl(kind)) {
    // B"H 2026-10-09 (merkava-mass-tests lists-forms): checkbox/radio and
    // other non-text inputs render as empty boxes — never paint the "input"
    // tag-name fallback inside them (it leaked as a text sliver).
    if (kind === "input") {
      const type = String(node.attributes?.type || node.type || "text").toLowerCase();
      if (!["text", "email", "password", "search", "url", "tel", "number", "submit"].includes(type)) return "";
    }
    return String(node.attributes?.value || node.value || node.attributes?.placeholder || node.textContent || "").trim();
  }
  return node.textContent && !(node.children || []).length ? String(node.textContent || "").trim() : "";
}

export function textPadX(kind) {
  return isControl(kind) ? 10 : 10;
}

export function textPadY(kind) {
  return isControl(kind) ? 9 : 10;
}
