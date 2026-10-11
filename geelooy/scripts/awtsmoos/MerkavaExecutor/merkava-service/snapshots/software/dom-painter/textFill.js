// B"H
/**
 * @file textFill.js
 * @description Text fill fidelity (Worker 3, 2026-10-08).
 *
 * Resolves the true glyph fill on top of the cascade output:
 * - `-webkit-text-fill-color` wins over `color` (CSS spec), and is inherited.
 * - `currentColor` resolves against the nearest inherited specified color.
 * - `color` inherits from ancestors when the element does not specify it.
 * - A missing color falls back to a contrast-safe default measured against
 *   the resolved background — never a blind near-white.
 * - `background-clip: text` (+ gradient) renders the gradient clipped to the
 *   glyphs like a real browser; an unparseable gradient falls back to solid.
 */
import { parseColor } from "../color.js";
import { INITIAL_COLOR_MARKER } from "../cascade.js";

const CURRENT_COLOR_RE = /^currentcolor$/i;

function parseStyleAttrText(t) {
  const out = {};
  for (const p of String(t || "").split(";")) {
    const at = p.indexOf(":");
    if (at > -1) out[p.slice(0, at).trim()] = p.slice(at + 1).trim();
  }
  return out;
}

function mergedNodeStyle(node) {
  if (!node) return {};
  return { ...(node.computedStyle || {}), ...(node.style || {}), ...parseStyleAttrText(node.attributes?.style || "") };
}

// Walk ancestors for an inherited property value (raw string, or "").
function inheritedRaw(item, prop) {
  let node = item?.node?.parentNode;
  const seen = new Set();
  let depth = 0;
  while (node && depth < 64 && !seen.has(node)) {
    seen.add(node);
    depth++;
    const st = mergedNodeStyle(node);
    const v = st[prop];
    if (v != null && String(v).trim() !== "") return String(v).trim();
    node = node.parentNode;
  }
  return "";
}

function tryParseColor(value) {
  const t = String(value ?? "").trim();
  if (!t) return null;
  if (CURRENT_COLOR_RE.test(t)) return "currentcolor";
  return parseColor(t, null); // null when unparseable
}

function relativeLuminance([r, g, b]) {
  return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
}

// First opaque background walking up from the item (element's own wins).
function opaqueBackground(item) {
  let node = item?.node;
  const seen = new Set();
  let depth = 0;
  while (node && depth < 64 && !seen.has(node)) {
    seen.add(node);
    depth++;
    const st = mergedNodeStyle(node);
    const bgc = st["background-color"];
    if (bgc) {
      const c = parseColor(String(bgc), null);
      if (c && c[3] > 0) return c;
    }
    const bg = st["background-image"] || st.background || "";
    if (bg && !/gradient\(/i.test(bg) && !/\burl\(/i.test(bg)) {
      const first = String(bg).trim().split(/\s+/)[0];
      const c = parseColor(first, null);
      if (c && c[3] > 0) return c;
    }
    node = node.parentNode;
  }
  return [8, 9, 14, 255]; // renderer surface default
}

function contrastSafeDefault(item) {
  return relativeLuminance(opaqueBackground(item)) > 0.5 ? [17, 24, 39, 255] : [246, 246, 250, 255];
}

// currentColor → nearest inherited specified color, else null (caller falls back).
function resolveCurrentColor(item) {
  const inh = inheritedRaw(item, "color");
  if (inh && !CURRENT_COLOR_RE.test(inh)) {
    const c = tryParseColor(inh);
    if (c && c !== "currentcolor") return c;
  }
  return null;
}

function resolveCore(kind, style, item, useFillColor) {
  const own = (p) => {
    const v = style[p];
    return v == null ? "" : String(v).trim();
  };
  // 1. -webkit-text-fill-color (spec: overrides color for the glyph fill; inherited)
  if (useFillColor) {
    const fill = own("-webkit-text-fill-color") || (item ? inheritedRaw(item, "-webkit-text-fill-color") : "");
    if (fill) {
      if (CURRENT_COLOR_RE.test(fill)) {
        const cc = resolveCurrentColor(item);
        if (cc) return cc;
      } else {
        const c = tryParseColor(fill);
        if (c === "currentcolor") {
          const cc = resolveCurrentColor(item);
          if (cc) return cc;
        } else if (c) return c;
      }
    }
  }
  // 2. own color
  const color = own("color");
  if (color) {
    // B"H 2026-10-09 (mass-test batch 2): `color: initial` arrives as the
    // cascade's explicit initial marker — use the contrast-safe initial
    // (the UA default) instead of the paint-time ancestor walk below, which
    // would wrongly re-inherit the parent's color.
    if (String(color).trim().toLowerCase() === INITIAL_COLOR_MARKER) return contrastSafeDefault(item);
    if (CURRENT_COLOR_RE.test(color)) {
      const cc = resolveCurrentColor(item);
      if (cc) return cc;
    } else {
      const c = tryParseColor(color);
      if (c === "currentcolor") {
        const cc = resolveCurrentColor(item);
        if (cc) return cc;
      } else if (c) return c;
    }
  }
  // 3. inherited color
  if (item) {
    const inh = inheritedRaw(item, "color");
    if (inh && !CURRENT_COLOR_RE.test(inh)) {
      const c = tryParseColor(inh);
      if (c && c !== "currentcolor") return c;
    }
  }
  // 4. contrast-safe default vs resolved background
  return contrastSafeDefault(item);
}

export function resolveSolidTextColor(kind, style = {}, item = null) {
  return resolveCore(kind, style || {}, item, true);
}

export function isGradientClipText(style = {}) {
  const clip = String(style["background-clip"] || style["-webkit-background-clip"] || "").trim().toLowerCase();
  if (clip !== "text") return false;
  const bg = style["background-image"] || style.background || "";
  return /gradient\(/i.test(bg);
}

export function gradientTextSource(style = {}) {
  return style["background-image"] || style.background || "";
}

export function resolveTextFill(kind, style = {}, item = null) {
  const st = style || {};
  if (isGradientClipText(st)) {
    let fallback = resolveCore(kind, st, item, false);
    if (!fallback || fallback[3] === 0) fallback = contrastSafeDefault(item);
    return { mode: "gradient-text", gradient: gradientTextSource(st), fallback };
  }
  return { mode: "solid", color: resolveCore(kind, st, item, true) };
}
