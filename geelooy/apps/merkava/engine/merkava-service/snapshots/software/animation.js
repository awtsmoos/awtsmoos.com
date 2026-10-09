// B"H
/**
 * @file animation.js
 * @description
 * CSS animations + transitions for Merkava's software renderer.
 *
 * Built on the executor-owned standards in merkava-browser/standards/css:
 *  - CssTransition: parseTime, parseTimingFunction, timingProgress,
 *    interpolateValue, parseTransition, transitionForProperty
 *  - CssTransform: parseTransform, computeTransformMatrix, transformRect,
 *    parseTransformOrigin, angleToRad, identityMatrix
 *  - CssSelectorMatcher: matchesCssSelector (transition state-change targeting)
 *
 * Screenshot model: renderVirtualSnapshotPng accepts `time` (ms, default 0).
 * @keyframes animations evaluate at that timestamp; `stateChanges` describe
 * transition triggers as [{ selector, at, props }] — a declarative stand-in
 * for :hover/class flips, evaluated at the same timestamp.
 *
 * Paint model: paintWithEffects(fb, item, paintFn, transformCtx) applies the
 * item's transform (translate fast-path; rotate/scale via temp-buffer
 * inverse-map composite) and opacity (temp-buffer alpha scale). Temp buffers
 * are item-sized (+padding), never full-canvas — RAM stays flat.
 */
import transitionPkg from "../../../merkava-browser/standards/css/CssTransition.js";
import transformPkg from "../../../merkava-browser/standards/css/CssTransform.js";
import matcherPkg from "../../../merkava-browser/standards/css/CssSelectorMatcher.js";
import { parseColor } from "./color.js";
import { Framebuffer } from "./framebuffer.js";
import { ScaledFramebuffer } from "./supersample.js";
import { parseFilterList, FILTER_FUNCTIONS, filterPadPx, applyCssFilters } from "./cssFilter.js";
import { blitProjective } from "./transform3d.js";
import {
  parseMixBlendMode,
  parseClipPath,
  parseMask,
  applyClipMaskToTemp,
  blitMatrixBlend,
} from "./dom-painter/blendClipMask.js";

const {
  parseTime,
  parseTimingFunction,
  timingProgress,
  interpolateValue,
  parseTransition,
  transitionForProperty,
} = transitionPkg;
const {
  parseTransform,
  transformRect,
  angleToRad,
  identityMatrix,
  multiplyMatrix,
} = transformPkg;
const { matchesCssSelector } = matcherPkg;

/* ------------------------------------------------------------------ */
/* @keyframes parsing                                                  */
/* ------------------------------------------------------------------ */

/** Extract @keyframes (and @-webkit-keyframes) from raw CSS text. */
/** Returns { name: [{ offset: 0..1, declarations: {prop: value} }] } sorted. */
export function parseKeyframes(cssText) {
  const clean = String(cssText || "").replace(/\/\*[\s\S]*?\*\//g, "");
  const map = {};
  const re = /@(?:-webkit-)?keyframes\s+([a-zA-Z0-9_-]+)\s*\{/gi;
  let m;
  while ((m = re.exec(clean))) {
    const name = m[1];
    const openAt = m.index + m[0].length - 1;
    const closeAt = balancedBraceEnd(clean, openAt);
    if (closeAt < 0) continue;
    const frames = parseKeyframeBody(clean.slice(openAt + 1, closeAt));
    if (frames.length) map[name] = frames;
    re.lastIndex = closeAt + 1;
  }
  return map;
}

function balancedBraceEnd(text, openAt) {
  let depth = 0;
  for (let i = openAt; i < text.length; i++) {
    if (text[i] === "{") depth++;
    else if (text[i] === "}") {
      depth--;
      if (depth === 0) return i;
    }
  }
  return -1;
}

function parseKeyframeBody(body) {
  const frames = [];
  const re = /((?:from|to|\d+(?:\.\d+)?%)(?:\s*,\s*(?:from|to|\d+(?:\.\d+)?%))*)\s*\{([^}]*)\}/gi;
  let m;
  while ((m = re.exec(body))) {
    const declarations = parseDeclarations(m[2]);
    for (const sel of m[1].split(",")) {
      const s = sel.trim().toLowerCase();
      const offset = s === "from" ? 0 : s === "to" ? 1 : Math.min(1, Math.max(0, parseFloat(s) / 100));
      frames.push({ offset, declarations });
    }
  }
  frames.sort((a, b) => a.offset - b.offset);
  return frames;
}

function parseDeclarations(text) {
  const out = {};
  for (const part of String(text || "").split(";")) {
    const colon = part.indexOf(":");
    if (colon < 0) continue;
    const prop = part.slice(0, colon).trim().toLowerCase();
    const value = part.slice(colon + 1).trim();
    if (prop && value) out[prop] = value;
  }
  return out;
}

/** Split a comma list respecting paren depth (for animation/transition lists). */
export function splitCommaTop(text) {
  const parts = [];
  let start = 0, depth = 0;
  const s = String(text || "");
  for (let i = 0; i <= s.length; i++) {
    const ch = s[i];
    if (ch === "(") depth++;
    else if (ch === ")") depth = Math.max(0, depth - 1);
    if (i === s.length || (ch === "," && depth === 0)) {
      const part = s.slice(start, i).trim();
      if (part) parts.push(part);
      start = i + 1;
    }
  }
  return parts;
}

/* ------------------------------------------------------------------ */
/* animation shorthand + longhands                                     */
/* ------------------------------------------------------------------ */

const TIMING_RE = /^(linear|ease|ease-in|ease-out|ease-in-out|step-start|step-end|cubic-bezier\(|steps\()/i;

function isTimingToken(t) {
  return TIMING_RE.test(t);
}

function defaultAnimation() {
  return {
    name: null,
    duration: 0,
    timing: parseTimingFunction("ease"),
    delay: 0,
    iterationCount: 1,
    direction: "normal",
    fillMode: "none",
    playState: "running",
  };
}

function parseOneAnimation(item) {
  const d = defaultAnimation();
  let sawTime = 0;
  for (const tok of String(item).trim().split(/\s+/).filter(Boolean)) {
    const t = tok.toLowerCase();
    if (isTimingToken(t)) { d.timing = parseTimingFunction(tok); continue; }
    if (/^[\d.]+m?s$/i.test(t)) {
      const ms = parseTime(tok);
      if (!sawTime) { d.duration = ms; sawTime = 1; } else d.delay = ms;
      continue;
    }
    if (t === "infinite") { d.iterationCount = Infinity; continue; }
    if (/^\d+(\.\d+)?$/.test(t)) { d.iterationCount = parseFloat(t); continue; }
    if (t === "normal" || t === "reverse" || t === "alternate" || t === "alternate-reverse") { d.direction = t; continue; }
    if (t === "none" || t === "forwards" || t === "backwards" || t === "both") { d.fillMode = t; continue; }
    if (t === "running" || t === "paused") { d.playState = t; continue; }
    if (d.name == null) d.name = tok;
  }
  return d;
}

const ANIM_LONGHANDS = [
  "animation-name", "animation-duration", "animation-timing-function",
  "animation-delay", "animation-iteration-count", "animation-direction",
  "animation-fill-mode", "animation-play-state",
];

/**
 * Parse the `animation` shorthand merged with any animation-* longhands.
 * Later list items win per-property at evaluation time (handled by caller).
 */
export function parseAnimationList(style = {}) {
  const shRaw = String(style["animation"] || "").trim();
  const sh = shRaw && shRaw.toLowerCase() !== "none" ? splitCommaTop(shRaw).map(parseOneAnimation) : [];
  const lh = {};
  for (const k of ANIM_LONGHANDS) {
    const v = style[k];
    lh[k] = v == null || String(v).trim() === "" ? null : splitCommaTop(String(v));
  }
  const count = Math.max(sh.length, ...Object.values(lh).map((v) => (v ? v.length : 0)));
  if (count === 0) return [];
  const out = [];
  for (let i = 0; i < count; i++) {
    const d = sh.length ? { ...sh[i % sh.length] } : defaultAnimation();
    if (lh["animation-name"]) d.name = lh["animation-name"][i % lh["animation-name"].length].trim() || "none";
    if (lh["animation-duration"]) d.duration = parseTime(lh["animation-duration"][i % lh["animation-duration"].length]);
    if (lh["animation-timing-function"]) d.timing = parseTimingFunction(lh["animation-timing-function"][i % lh["animation-timing-function"].length]);
    if (lh["animation-delay"]) d.delay = parseTime(lh["animation-delay"][i % lh["animation-delay"].length]);
    if (lh["animation-iteration-count"]) {
      const t = lh["animation-iteration-count"][i % lh["animation-iteration-count"].length].trim().toLowerCase();
      d.iterationCount = t === "infinite" ? Infinity : parseFloat(t) || 0;
    }
    if (lh["animation-direction"]) d.direction = lh["animation-direction"][i % lh["animation-direction"].length].trim().toLowerCase();
    if (lh["animation-fill-mode"]) d.fillMode = lh["animation-fill-mode"][i % lh["animation-fill-mode"].length].trim().toLowerCase();
    if (lh["animation-play-state"]) d.playState = lh["animation-play-state"][i % lh["animation-play-state"].length].trim().toLowerCase();
    if (d.name && d.name.toLowerCase() !== "none") out.push(d);
  }
  return out;
}

/* ------------------------------------------------------------------ */
/* keyframe sampling + animation evaluation                            */
/* ------------------------------------------------------------------ */

const round4 = (v) => Math.round(v * 10000) / 10000;

/** Named-color resolver for interpolateValue (uses the renderer's color table). */
function namedColorResolver(name) {
  const c = parseColor(name, null);
  if (!c) return null;
  return `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${round4(c[3] / 255)})`;
}

/**
 * Interpolate two transform strings. When both lists have the same function
 * names in order, args interpolate per-function (angles in deg, lengths when
 * units match, unitless numbers). Otherwise discrete flip at 50%.
 */
export function interpolateTransform(from, to, t) {
  const f = String(from ?? "").trim();
  const tt = String(to ?? "").trim();
  if (!f || !tt) return t < 0.5 ? f || tt : tt || f;
  if (f === tt) return tt;
  const fl = parseTransform(f);
  const tl = parseTransform(tt);
  if (!fl.length || !tl.length || fl.length !== tl.length) return t < 0.5 ? f : tt;
  for (let i = 0; i < fl.length; i++) if (fl[i].name !== tl[i].name) return t < 0.5 ? f : tt;
  return fl
    .map((fn, i) => `${fn.name}(${interpTransformArgs(fn.name, fn.args, tl[i].args, t).join(", ")})`)
    .join(" ");
}

function interpTransformArgs(name, fa, ta, t) {
  const n = Math.max(fa.length, ta.length);
  const out = [];
  for (let i = 0; i < n; i++) out.push(interpTransformArg(name, fa[i] ?? ta[i] ?? "0", ta[i] ?? fa[i] ?? "0", t));
  return out;
}

function interpTransformArg(name, a, b, t) {
  const lname = String(name).toLowerCase();
  if (lname.startsWith("rotate") || lname.startsWith("skew")) {
    const ad = (angleToRad(a) * 180) / Math.PI;
    const bd = (angleToRad(b) * 180) / Math.PI;
    if (!Number.isFinite(ad) || !Number.isFinite(bd)) return t < 0.5 ? a : b;
    return `${round4(ad + (bd - ad) * t)}deg`;
  }
  const ma = String(a).match(/^([+-]?(?:\d+\.?\d*|\.\d+)(?:[eE][+-]?\d+)?)([a-z%]*)$/i);
  const mb = String(b).match(/^([+-]?(?:\d+\.?\d*|\.\d+)(?:[eE][+-]?\d+)?)([a-z%]*)$/i);
  if (!ma || !mb) return t < 0.5 ? a : b;
  let na = parseFloat(ma[1]);
  let nb = parseFloat(mb[1]);
  let ua = ma[2].toLowerCase();
  const ub = mb[2].toLowerCase();
  if (ua !== ub) {
    if (na === 0) ua = ub;
    else if (nb === 0) { nb = na; }
    else return t < 0.5 ? a : b;
  }
  return `${round4(na + (nb - na) * t)}${ua || ub}`;
}

/** Sample one animation's keyframes at an eased progress in [0,1]. */
function sampleKeyframes(frames, eased, underlying) {
  let a = frames[0];
  let b = frames[frames.length - 1];
  for (const f of frames) if (f.offset <= eased) a = f;
  for (const f of frames) {
    if (f.offset >= eased) { b = f; break; }
  }
  if (a === b || a.offset === b.offset) return { ...a.declarations };
  const localP = (eased - a.offset) / (b.offset - a.offset);
  const out = {};
  const props = new Set([...Object.keys(a.declarations), ...Object.keys(b.declarations)]);
  for (const p of props) {
    const av = a.declarations[p] !== undefined ? a.declarations[p] : underlying ? underlying[p] : undefined;
    const bv = b.declarations[p] !== undefined ? b.declarations[p] : av;
    out[p] = p === "transform"
      ? interpolateTransform(av, bv, localP)
      : interpolateValue(av ?? "", bv ?? "", localP, namedColorResolver);
  }
  return out;
}

function keyframeDecls(frame) {
  return frame ? { ...frame.declarations } : null;
}

/**
 * Evaluate one animation descriptor at timeMs against its keyframes.
 * Returns override declarations, or null when the animation contributes
 * nothing at this timestamp (e.g. delay not elapsed, fill mode none).
 */
export function sampleAnimation(frames, anim, timeMs, underlying) {
  const { duration, delay, iterationCount, direction, fillMode } = anim;
  // B"H 2026-10-09: animation-play-state:paused freezes the animation at its
  // current time — with no timeline progression it never advances past 0.
  const local = (anim.playState === "paused" ? 0 : timeMs) - delay;
  if (local < 0) {
    return fillMode === "backwards" || fillMode === "both" ? keyframeDecls(frames[0]) : null;
  }
  if (iterationCount === 0) return null;
  if (duration <= 0) {
    return fillMode === "forwards" || fillMode === "both"
      ? keyframeDecls(frames[frames.length - 1])
      : keyframeDecls(frames[0]);
  }
  const total = duration * iterationCount;
  let iterIndex, iterT;
  if (local >= total) {
    if (fillMode !== "forwards" && fillMode !== "both") return null;
    iterIndex = Math.max(0, Math.ceil(iterationCount) - 1);
    iterT = 1;
  } else {
    iterIndex = Math.floor(local / duration);
    iterT = (local - iterIndex * duration) / duration;
  }
  const odd = iterIndex % 2 === 1;
  if (direction === "reverse" || (direction === "alternate" && odd) || (direction === "alternate-reverse" && !odd)) {
    iterT = 1 - iterT;
  }
  const eased = timingProgress(anim.timing, iterT);
  return sampleKeyframes(frames, eased, underlying);
}

/**
 * Evaluate all animations on a computed style at timeMs.
 * Returns an overrides object (later animations win per property), or null.
 */
export function evaluateAnimations(computed, keyframesMap, timeMs) {
  const list = parseAnimationList(computed);
  if (!list.length) return null;
  let overrides = null;
  for (const anim of list) {
    const frames = keyframesMap[anim.name];
    if (!frames || !frames.length) continue;
    const decls = sampleAnimation(frames, anim, timeMs, computed);
    if (!decls) continue;
    if (!overrides) overrides = {};
    Object.assign(overrides, decls);
  }
  return overrides;
}

/* ------------------------------------------------------------------ */
/* transitions: declarative state changes evaluated at a timestamp     */
/* ------------------------------------------------------------------ */

/**
 * stateChanges: [{ selector, at, props }] — at render time `timeMs`, every
 * element matching `selector` whose `at <= timeMs` transitions each property
 * in `props` from its base computed value to the target, using the timing
 * described by its own `transition` declaration. Before `at`, base values.
 * After at+delay+duration, target values. This is the screenshot-engine
 * equivalent of a :hover / class flip triggered at `at`.
 */
export function evaluateStateChanges(node, computed, stateChanges, timeMs) {
  if (!stateChanges || !stateChanges.length) return null;
  let overrides = null;
  for (const spec of stateChanges) {
    if (!spec || spec.at == null || !spec.props) continue;
    if (timeMs < spec.at) continue;
    let matches = false;
    try {
      matches = matchesCssSelector(node, spec.selector);
    } catch { matches = false; }
    if (!matches) continue;
    const descs = parseTransition(computed["transition"] || "");
    for (const prop of Object.keys(spec.props)) {
      const from = computed[prop];
      const to = spec.props[prop];
      if (from === to) continue;
      const d = transitionForProperty(descs, prop) || { duration: 0, delay: 0, timing: parseTimingFunction("ease") };
      const elapsed = timeMs - spec.at - (d.delay || 0);
      let value;
      if (elapsed < 0) value = from;
      else if (elapsed >= (d.duration || 0) || (d.duration || 0) <= 0) value = to;
      else value = interpolateValue(from ?? "", to ?? "", timingProgress(d.timing, elapsed / d.duration), namedColorResolver);
      if (!overrides) overrides = {};
      overrides[prop] = value;
    }
  }
  return overrides;
}

/**
 * Single entry applied per element after the cascade: keyframe animations
 * first, then transition state-changes (transitions win ties — they model
 * user interaction overriding idle animation).
 */
export function applyAnimationState(node, computed, anim) {
  if (!anim) return computed;
  const timeMs = Math.max(0, Number(anim.time) || 0);
  let out = computed;
  const a = evaluateAnimations(computed, anim.keyframes || {}, timeMs);
  if (a) out = { ...out, ...a };
  const t = evaluateStateChanges(node, out, anim.stateChanges || [], timeMs);
  if (t) out = { ...out, ...t };
  return out;
}

/* ------------------------------------------------------------------ */
/* paint-time effects: transform + opacity                             */
/* ------------------------------------------------------------------ */

const clamp01 = (v) => {
  const n = Number(v);
  if (!Number.isFinite(n)) return 1;
  return Math.min(1, Math.max(0, n));
};

function isTranslateOnly(m) {
  return m[0] === 1 && m[1] === 0 && m[2] === 0 && m[3] === 1;
}

function isIdentity(m) {
  return isTranslateOnly(m) && m[4] === 0 && m[5] === 0;
}

/**
 * B"H 2026-10-09 — destination loop bounds from the temp rect forward-mapped
 * through the 2D matrix, in tsrc-local coords (blitMatrix adds the tsrc page
 * offset itself). The temp is bigger than the item when a filter spreads
 * (blur/drop-shadow); looping only the item bounds would clip it.
 */
function tempForwardBounds2D(m, ox, oy, cw, ch) {
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  const corners = [[0, 0], [cw, 0], [0, ch], [cw, ch]];
  for (const [qx, qy] of corners) {
    const lx = qx - ox, ly = qy - oy;
    const X = m[0] * lx + m[2] * ly + m[4];
    const Y = m[1] * lx + m[3] * ly + m[5];
    if (X < x0) x0 = X;
    if (X > x1) x1 = X;
    if (Y < y0) y0 = Y;
    if (Y > y1) y1 = Y;
  }
  return { x: x0, y: y0, width: x1 - x0, height: y1 - y0 };
}

/**
 * B"H 2026-10-09 — express a page-space matrix in the item's local frame:
 * m = T(-ix,-iy) * M * T(ix,iy). The temp buffer holds the item painted at
 * (pad,pad), so the tsrc-frame blitMatrix works unchanged with
 * tx=ix, ty=iy, ox=oy=pad.
 */
function toItemFrame(M, ix, iy) {
  return multiplyMatrix([1, 0, 0, 1, -ix, -iy], multiplyMatrix(M, [1, 0, 0, 1, ix, iy]));
}

/**
 * Paint one layout item honoring its transform, filter, and opacity.
 *
 * - No transform/filter + full opacity: direct paint (zero overhead).
 * - Translate-only: shifted item copy (zero raster cost).
 * - Rotate/scale/skew, opacity < 1, or filter: rasterize the item into an
 *   item-sized temp buffer, apply filter, scale the alpha channel by opacity,
 *   then inverse-map composite onto the destination. transformCtx (default:
 *   the item itself) supplies the transform + reference box — #text items
 *   pass their parent box so text stays glued to its container under rotation.
 * - 3D scene (scene3d, computed by domPainter): the temp buffer is warped by
 *   the exact projective inverse instead of the affine one; backface-culled
 *   elements paint nothing.
 *
 * B"H 2026-10-09 — the temp buffer covers the UNTRANSFORMED item (+ filter
 * spread), not the transformed bounds: sizing it from the transformed bounds
 * dropped the item off-canvas whenever the transform carried a translation
 * (e.g. translateX(50px) scale(2) rendered as a sliver).
 */
export function paintWithEffects(fb, item, paintFn, transformCtx = null, extra = null, scene3d = null) {
  const style = item.style || {};
  // B"H 2026-10-09 — opacity groups (domPainter): the group root's own
  // opacity is forced to 1 here; the group alpha applies once around the
  // whole painted subtree instead.
  const forcedOp = extra ? extra.forceOpacity : undefined;
  const opacity = forcedOp !== undefined && forcedOp !== null
    ? clamp01(forcedOp)
    : ("opacity" in style ? clamp01(parseFloat(style.opacity)) : 1);
  // B"H 2026-10-09 — 2D transforms accumulate through transformed ancestors:
  // domPainter passes the page-space matrix as extra.accum2d (each ancestor
  // contributing with its own box as the transform-origin reference), so
  // children of rotated/scaled parents paint through the parent's transform.
  // transformCtx is legacy, kept only for the 3D scene path's tsrc frame.
  const accum = extra ? extra.accum2d : null;
  const hasT = Boolean(accum);
  const w = Math.max(1, Number(item.width) || 1);
  const h = Math.max(1, Number(item.height) || 1);
  // B"H 2026-10-09 — blend / clip / mask ride the temp-buffer path with
  // opacity+transform. extra.clipChain (from domPainter) carries ancestor
  // clip-paths in page space.
  const blendMode = parseMixBlendMode(style);
  const ownClip = parseClipPath(style["clip-path"], w, h);
  const mask = parseMask(style);
  const clipChain = (extra && extra.clipChain) || [];
  const fx = Boolean(blendMode || ownClip || mask || clipChain.length);
  // B"H 2026-10-09 — real CSS filters: a list with any unknown function is
  // treated as invalid (no filter), matching browser behavior.
  const filterList = parseFilterList(style.filter);
  const hasF = filterList.length > 0 && filterList.every(f => FILTER_FUNCTIONS.has(f.name));
  if (scene3d && scene3d.backfaceHidden) return; // culled: paint nothing
  if (!hasT && opacity >= 1 && !fx && !hasF && !scene3d) {
    paintFn(fb, item);
    return;
  }
  const ix = Number(item.x) || 0, iy = Number(item.y) || 0;
  // Item-frame matrix for the tsrc-frame blit below: the temp holds the item
  // at (pad,pad), so the blit runs with tx=ix, ty=iy, ox=oy=pad.
  const m = hasT && !scene3d ? toItemFrame(accum.M, ix, iy) : identityMatrix();
  if (!scene3d && isTranslateOnly(m) && opacity >= 1 && !fx && !hasF) {
    paintFn(fb, { ...item, x: ix + m[4], y: iy + m[5] });
    return;
  }
  if (!scene3d && isIdentity(m) && opacity >= 1 && !fx && !hasF) {
    paintFn(fb, item);
    return;
  }
  const scale = (fb && fb.scale) || 1;
  const pad = 3 + (hasF ? filterPadPx(filterList) : 0);
  // 3D scene path keeps the legacy tsrc frame (transformCtx or the item).
  const tsrc = transformCtx || item;
  const tw = Math.max(1, Number(tsrc.width) || 1);
  const th = Math.max(1, Number(tsrc.height) || 1);
  const ox3 = pad - (ix - (Number(tsrc.x) || 0));
  const oy3 = pad - (iy - (Number(tsrc.y) || 0));
  const ox = pad, oy = pad;
  const cw = Math.max(1, Math.ceil(w + pad * 2));
  const ch = Math.max(1, Math.ceil(h + pad * 2));
  // RAM guard: absurd transforms degrade to an untransformed paint, never OOM.
  if (cw * ch > 16e6) {
    paintFn(fb, item);
    return;
  }
  const base = new Framebuffer(cw * scale, ch * scale, [0, 0, 0, 0]);
  const tmp = new ScaledFramebuffer(base, scale, cw, ch);
  paintFn(tmp, { ...item, x: pad, y: pad });
  // CSS order: filter first, then opacity, then the transform composite.
  if (hasF) applyCssFilters(base.data, base.width, base.height, filterList, scale);
  if (opacity < 1) {
    const d = base.data;
    for (let i = 3; i < d.length; i += 4) d[i] = (d[i] * opacity) | 0;
  }
  // B"H 2026-10-09 — clip-path (own + ancestors) and mask-image apply to the
  // temp buffer in the element's local space, before any transform composite.
  if (ownClip || clipChain.length || mask) {
    applyClipMaskToTemp(base, scale, pad, pad, item, ownClip, clipChain, mask);
  }
  if (scene3d) {
    // blend-mode + 3D is out of scope: plain source-over for 3D scenes.
    blitProjective(fb, base, scene3d, tw, th, ox3, oy3, scale);
    return;
  }
  // Temp coords of an item-local untransformed point (ux,uy):
  // painted at (pad,pad), so temp = (ux + pad, uy + pad).
  // B"H 2026-10-09 — the dest loop covers the whole temp rect (forward-mapped),
  // not just the item bounds: filter spread (blur/drop-shadow) extends past it.
  const tb = tempForwardBounds2D(m, ox, oy, cw, ch);
  // B"H 2026-10-09 — mix-blend-mode composites the temp with the blend
  // formula instead of plain source-over.
  if (blendMode) blitMatrixBlend(fb, base, m, ix, iy, ox, oy, tb, scale, blendMode);
  else blitMatrix(fb, base, m, ix, iy, ox, oy, tb, scale);
}

/**
 * Inverse-map composite: for each destination CSS pixel inside the
 * transformed bounds, unproject through the inverse matrix into temp space
 * and alpha-composite the sampled texel.
 */
function blitMatrix(destFb, srcBase, m, tx, ty, ox, oy, tb, scale) {
  const det = m[0] * m[3] - m[1] * m[2];
  if (!det || !Number.isFinite(det)) return;
  // B"H (compositor): hoist inverse-matrix components to locals — the old
  // code indexed inv[] six times per destination pixel.
  const i0 = m[3] / det, i1 = -m[1] / det;
  const i2 = -m[2] / det, i3 = m[0] / det;
  const i4 = (m[2] * m[5] - m[3] * m[4]) / det + ox;
  const i5 = (m[1] * m[4] - m[0] * m[5]) / det + oy;
  const txv = tx || 0, tyv = ty || 0;
  const bx = (Number(tb.x) || 0) + txv;
  const by = (Number(tb.y) || 0) + tyv;
  const bw = Number(tb.width) || 0;
  const bh = Number(tb.height) || 0;
  const x0 = Math.floor(bx);
  const y0 = Math.floor(by);
  const x1 = Math.ceil(bx + bw);
  const y1 = Math.ceil(by + bh);
  // Write into the underlying device buffer (handles ScaledFramebuffer).
  const destBase = destFb && destFb.base ? destFb.base : destFb;
  const ds = (destFb && destFb.scale) || 1;
  if (!destBase || !destBase.data) return;
  const sw = srcBase.width;
  const sh = srcBase.height;
  const sdata = srcBase.data;
  const ddata = destBase.data;
  const dw = destBase.width;
  const dh = destBase.height;
  // B"H (compositor): ds==1 fast path — the old code ran the yy/xx device
  // loops even for a 1x surface. Split the loop once, outside.
  if (ds === 1) {
    for (let cy = y0; cy < y1; cy++) {
      if (cy < 0 || cy >= dh) continue;
      const ly = cy - tyv;
      const drow = cy * dw * 4;
      for (let cx = x0; cx < x1; cx++) {
        if (cx < 0 || cx >= dw) continue;
        const lx = cx - txv;
        const px = Math.round((i0 * lx + i2 * ly + i4) * scale);
        const py = Math.round((i1 * lx + i3 * ly + i5) * scale);
        if (px < 0 || py < 0 || px >= sw || py >= sh) continue;
        const si = (py * sw + px) * 4;
        const a = sdata[si + 3];
        if (a <= 4) continue;
        const di = drow + cx * 4;
        if (a >= 255) {
          // Opaque: direct copy (blend math is identity at a=255).
          ddata[di] = sdata[si]; ddata[di + 1] = sdata[si + 1];
          ddata[di + 2] = sdata[si + 2]; ddata[di + 3] = 255;
        } else {
          const alpha = a / 255, ia = 1 - alpha;
          ddata[di] = Math.round(sdata[si] * alpha + ddata[di] * ia);
          ddata[di + 1] = Math.round(sdata[si + 1] * alpha + ddata[di + 1] * ia);
          ddata[di + 2] = Math.round(sdata[si + 2] * alpha + ddata[di + 2] * ia);
          ddata[di + 3] = 255;
        }
      }
    }
    return;
  }
  for (let cy = y0; cy < y1; cy++) {
    const ly = cy - tyv;
    for (let cx = x0; cx < x1; cx++) {
      const lx = cx - txv;
      const px = Math.round((i0 * lx + i2 * ly + i4) * scale);
      const py = Math.round((i1 * lx + i3 * ly + i5) * scale);
      if (px < 0 || py < 0 || px >= sw || py >= sh) continue;
      const si = (py * sw + px) * 4;
      const a = sdata[si + 3];
      if (a <= 4) continue;
      // Device-space destination block for this CSS pixel.
      const dx0 = Math.round(cx * ds);
      const dy0 = Math.round(cy * ds);
      if (a >= 255) {
        // Opaque: direct copy, no blend math.
        const sr = sdata[si], sg = sdata[si + 1], sb = sdata[si + 2];
        for (let yy = 0; yy < ds; yy++) {
          const dy = dy0 + yy;
          if (dy < 0 || dy >= dh) continue;
          const drow = dy * dw * 4;
          for (let xx = 0; xx < ds; xx++) {
            const dx = dx0 + xx;
            if (dx < 0 || dx >= dw) continue;
            const di = drow + dx * 4;
            ddata[di] = sr; ddata[di + 1] = sg; ddata[di + 2] = sb; ddata[di + 3] = 255;
          }
        }
      } else {
        const alpha = a / 255;
        const ia = 1 - alpha;
        const sr = sdata[si], sg = sdata[si + 1], sb = sdata[si + 2];
        for (let yy = 0; yy < ds; yy++) {
          const dy = dy0 + yy;
          if (dy < 0 || dy >= dh) continue;
          const drow = dy * dw * 4;
          for (let xx = 0; xx < ds; xx++) {
            const dx = dx0 + xx;
            if (dx < 0 || dx >= dw) continue;
            const di = drow + dx * 4;
            ddata[di] = Math.round(sr * alpha + ddata[di] * ia);
            ddata[di + 1] = Math.round(sg * alpha + ddata[di + 1] * ia);
            ddata[di + 2] = Math.round(sb * alpha + ddata[di + 2] * ia);
            ddata[di + 3] = 255;
          }
        }
      }
    }
  }
}
