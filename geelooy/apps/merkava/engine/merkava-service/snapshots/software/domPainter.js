// B"H
/**
 * @file domPainter.js
 * @description
 * Main DOM painter entry. The old monolith was split into navy submodules:
 * geometry, style, clipping, overflow, text, canvas selection, and box paint.
 * The Awtsmoos now conducts the orchestra instead of hiding every instrument
 * inside one swollen scroll of code.
 *
 * Paint model: every item paints through paintOne -> paintWithEffects
 * (animation.js), which honors the item's transform (translate fast-path;
 * rotate/scale via temp-buffer inverse-map composite) and opacity
 * (temp-buffer alpha scale). 2D transforms accumulate through transformed
 * ancestors (accumulate2D), so children of rotated/scaled parents paint
 * through the parent's transform, each ancestor with its own box as the
 * transform-origin reference.
 *
 * Opacity groups: an element with opacity < 1 and painted descendants paints
 * its whole subtree into a group surface first; the group alpha applies once
 * around everything (per CSS, opacity creates a stacking context), instead
 * of each child painting at full opacity.
 *
 * Overflow: clipFor computes each item's ancestor overflow clip rect and it
 * is pushed as a real pixel clip (Framebuffer.pushClip) around the item's
 * paint, so overflow:hidden/scroll/auto actually seals content.
 */
import { pickCanvasTexture } from "./dom-painter/canvasPicker.js";
import { paintBox } from "./dom-painter/boxPainter.js";
import { visibleInsideAncestors, clipFor } from "./dom-painter/clip.js";
import { shouldShowScrollbar, paintScrollbar } from "./dom-painter/overflowPainter.js";
import { paintTextItem } from "./dom-painter/textPainter.js";
import { paintWithEffects } from "./animation.js";
import { computeScene3D } from "./transform3d.js";
import { parseClipPath } from "./dom-painter/blendClipMask.js";
import { parseBoxShadows, parseTextShadows } from "./dom-painter/shadowPainter.js";
import { parseFilterList, FILTER_FUNCTIONS, filterPadPx } from "./cssFilter.js";
import { parseColor } from "./color.js";
import { borderRadii, borderWidth } from "./dom-painter/styleTools.js";
import { Framebuffer } from "./framebuffer.js";
import { ScaledFramebuffer } from "./supersample.js";
import transformPkg from "../../../merkava-browser/standards/css/CssTransform.js";

const { computeTransformMatrix, multiplyMatrix } = transformPkg;

function hasOwnTransform(style = {}) {
  const t = String(style.transform || "").trim().toLowerCase();
  return Boolean(t && t !== "none");
}

/**
 * Nearest ancestor-or-self layout item carrying its own transform.
 * Walks the DOM parent chain (node.parentNode) and resolves each node
 * through byNode. Returns null when nothing above is transformed.
 * (Kept for rooting the 3D scene of #text items.)
 */
function nearestTransformCtx(item, byNode) {
  let node = item && item.node ? item.node.parentNode : null;
  while (node) {
    const li = byNode.get(node);
    if (li && li.style && hasOwnTransform(li.style)) return li;
    node = node.parentNode;
  }
  return null;
}

/**
 * B"H 2026-10-09 — ancestor clip-path chain for one layout item.
 * Each entry: { clip: parsed shape, box: {x, y} } with the shape resolved
 * against the ancestor's own box and positioned in page space.
 */
function clipChainFor(item, byNode) {
  const chain = [];
  let node = item && item.node ? item.node.parentNode : null;
  while (node) {
    const li = byNode.get(node);
    if (li && li.style) {
      const v = String(li.style["clip-path"] || "").trim();
      if (v && v.toLowerCase() !== "none") {
        const clip = parseClipPath(v, Number(li.width) || 1, Number(li.height) || 1);
        if (clip) chain.push({ clip, box: { x: Number(li.x) || 0, y: Number(li.y) || 0 } });
      }
    }
    node = node.parentNode;
  }
  return chain;
}

/**
 * B"H 2026-10-09 — 2D transform accumulation through ancestors.
 * Returns { M } or null when nothing in the chain carries a 2D transform.
 * M is the page-space matrix mapping the item's untransformed page coords to
 * final page coords. Each transformed element contributes
 *   P_E = T(Ex,Ey) * m_E * T(-Ex,-Ey)
 * with its own box as the transform-origin reference; the outermost ancestor
 * applies last. (3D transforms are handled by computeScene3D instead.)
 */
function accumulate2D(item, byNode) {
  const frames = [];
  let li = item, guard = 0;
  const seen = new Set();
  while (li && !seen.has(li) && guard++ < 64) {
    seen.add(li);
    const st = li.style || {};
    const t = String(st.transform || "").trim();
    if (t && t.toLowerCase() !== "none") frames.push(li);
    const node = li.node ? li.node.parentNode : null;
    li = node ? byNode.get(node) : null;
  }
  if (!frames.length) return null;
  let M = [1, 0, 0, 1, 0, 0];
  for (let i = frames.length - 1; i >= 0; i--) {
    const E = frames[i];
    const mE = computeTransformMatrix(E.style, {
      width: Number(E.width) || 0,
      height: Number(E.height) || 0,
      fontSize: 16,
    });
    const ex = Number(E.x) || 0, ey = Number(E.y) || 0;
    // P_E = T(ex,ey) * mE * T(-ex,-ey)
    const PE = [
      mE[0], mE[1], mE[2], mE[3],
      mE[4] + ex * (1 - mE[0]) - ey * mE[2],
      mE[5] + ey * (1 - mE[3]) - ex * mE[1],
    ];
    // B"H: column-vector convention — the outermost ancestor's page-space
    // matrix applies LAST, so it stands LEFTMOST: M = PE_outer * ... * PE_item.
    // (A previous revision had multiplyMatrix(PE, M), which applied ancestors
    // first — invisible for commuting transforms but wrong for nested
    // rotations/scales about different origins.)
    M = multiplyMatrix(M, PE);
  }
  return { M };
}

function opacityOf(style = {}) {
  if (!style || !("opacity" in style)) return 1;
  const n = parseFloat(style.opacity);
  if (!Number.isFinite(n)) return 1;
  return Math.min(1, Math.max(0, n));
}

/** Scale the alpha channel of a surface (raw Framebuffer or ScaledFramebuffer).
 * B"H (compositor): legacy helper — superseded by blitFrom's alphaScale
 * option, which folds the multiply into the composite pass. Kept for
 * compatibility; new code should pass { alphaScale } to blitFrom. */
function scaleSurfaceAlpha(surf, k) {
  const base = surf && surf.base ? surf.base : surf;
  if (!base || !base.data) return;
  const d = base.data;
  for (let i = 3; i < d.length; i += 4) d[i] = Math.round(d[i] * k);
}

/**
 * B"H (compositor): pooled group surfaces. The old code allocated a
 * full-size transparent Framebuffer per opacity group per frame (2.4MB at
 * 960x640) — pure GC churn. The pool reuses a few full-size surfaces
 * across groups and frames; acquire clears via the uniform-color .fill()
 * fast path. Nested groups hold one surface per nesting level; the pool
 * grows to the max depth seen (capped).
 */
const groupSurfacePool = [];
function acquireGroupSurface(fb) {
  const scale = (fb && fb.scale) || 1;
  const cw = Math.max(1, fb.width || 1), ch = Math.max(1, fb.height || 1);
  for (let i = 0; i < groupSurfacePool.length; i++) {
    const e = groupSurfacePool[i];
    if (e.cw === cw && e.ch === ch && e.scale === scale) {
      groupSurfacePool.splice(i, 1);
      e.surf.base.clear([0, 0, 0, 0]);
      return e.surf;
    }
  }
  const base = new Framebuffer(Math.round(cw * scale), Math.round(ch * scale), [0, 0, 0, 0]);
  return new ScaledFramebuffer(base, scale, cw, ch);
}
function releaseGroupSurface(surf) {
  if (!surf) return;
  if (groupSurfacePool.length < 4) {
    groupSurfacePool.push({ cw: surf.width, ch: surf.height, scale: surf.scale, surf });
  }
}

/** Full-size transparent group surface in page coords, honoring fb's scale.
 * B"H (compositor): prefer acquireGroupSurface/releaseGroupSurface (pooled).
 * Kept for compatibility. */
function makeGroupSurface(fb) {
  return acquireGroupSurface(fb);
}

/** True when m's DOM node descends from root's DOM node. */
function isInSubtree(m, root) {
  if (!m || !root || !m.node || !root.node) return false;
  let n = m.node.parentNode, g = 0;
  while (n && g++ < 64) {
    if (n === root.node) return true;
    n = n.parentNode;
  }
  return false;
}

/**
 * B"H (compositor): occlusion culling. Paint order is back-to-front, so a
 * front-to-back pre-pass marks items fully covered by opaque items in front
 * of them; the main loop then skips them entirely.
 *
 * Conservative by design:
 * - Only axis-aligned, untransformed, unclipped boxes with a fully opaque
 *   background-color, no border, no border-radius, no blend mode, no
 *   clip-path/mask, and opacity 1 qualify as OCCLUDERS.
 * - Only items whose paint is contained in their layout box (no outset
 *   shadow, no filter, no text-shadow, no transform) can be SKIPPED.
 * - Opacity-group members and group roots are excluded: they composite
 *   through group surfaces, not the main framebuffer.
 * Returns a Set of items to skip (empty when nothing is occluded).
 */
function computeOccludedSet(ordered, paintSet, isGroupRoot, ancestorInfo) {
  const occluded = new Set();
  const inGroup = new Set();
  for (const item of ordered) {
    if (isGroupRoot(item)) {
      for (const d of ordered) if (d !== item && isInSubtree(d, item)) inGroup.add(d);
    }
  }
  const occluders = [];
  const isCovered = (x0, y0, x1, y1) => {
    for (const o of occluders) {
      if (o.x0 <= x0 && o.y0 <= y0 && o.x1 >= x1 && o.y1 >= y1) return true;
    }
    return false;
  };
  for (let i = ordered.length - 1; i >= 0; i--) {
    const item = ordered[i];
    if (paintSet && !paintSet.has(item)) continue;
    if (inGroup.has(item) || isGroupRoot(item)) continue;
    const st = item.style || {};
    const vis = String(st.visibility || "visible").trim().toLowerCase();
    if (vis === "hidden" || vis === "collapse") continue;
    const ix = Number(item.x) || 0, iy = Number(item.y) || 0;
    const iw = Number(item.width) || 0, ih = Number(item.height) || 0;
    if (iw <= 0 || ih <= 0) continue;
    const info = ancestorInfo(item);
    // Transforms move paint outside the box: neither role allowed.
    if (info.accum2d || info.boxScene) continue;
    // Paint-spreading effects: the item's paint is not box-contained.
    let spread = false;
    try {
      spread = parseBoxShadows(st).some(s => !s.inset);
      if (!spread && item.kind === "#text") spread = parseTextShadows(st).length > 0;
      if (!spread) {
        const fl = parseFilterList(st.filter);
        spread = fl.length > 0 && fl.every(f => FILTER_FUNCTIONS.has(f.name));
      }
    } catch (_) { spread = true; }
    if (!spread && isCovered(ix, iy, ix + iw, iy + ih)) {
      occluded.add(item);
      continue;
    }
    // Occluder candidacy: strict opaque box.
    if (spread) continue;
    if (opacityOf(st) < 1) continue;
    if (String(st["mix-blend-mode"] || "normal").trim().toLowerCase() !== "normal") continue;
    if (st["clip-path"] || st.clipPath || st["mask-image"] || st.maskImage) continue;
    if (borderWidth(st, item.kind) !== 0) continue;
    const bg = parseColor(st["background-color"], null);
    if (!bg || bg[3] < 255) continue;
    const radii = borderRadii(st, iw, ih);
    if (radii.tl[0] > 0 || radii.tl[1] > 0 || radii.tr[0] > 0 || radii.tr[1] > 0 ||
        radii.br[0] > 0 || radii.br[1] > 0 || radii.bl[0] > 0 || radii.bl[1] > 0) continue;
    if (info.clipChain && info.clipChain.length) continue;
    const clip = info.oclip;
    if (clip && (ix < clip.x0 || iy < clip.y0 || ix + iw > clip.x1 || iy + ih > clip.y1)) continue;
    occluders.push({ x0: ix, y0: iy, x1: ix + iw, y1: iy + ih });
    if (occluders.length > 256) occluders.shift();
  }
  return occluded;
}

export function paintLayout(fb, layout, canvas = {}, options = {}) {
  const textures = [...(canvas.textures || [])];
  const used = new Set();
  const vp = options.viewport;
  // B"H 2026-10-09 (viewport culling): when a viewport is provided, reduce
  // the working set to visible items + their ancestor chains BEFORE the
  // expensive loops below. Ancestors are kept for clip/transform/opacity
  // context but marked non-painting. For a 100k page with 2k visible, the
  // hasKid O(n*depth) walk and paint loop operate on 2% of the data.
  //
  // B"H 2026-10-09 (spatial index): options.spatialIndex is a persistent
  // SpatialIndex across frames. Index build is O(n log n) once; per-frame
  // queries are O(log n + k). Without it, falls back to O(n) scan.
  let paintSet = null;
  let workList = layout;
  let byNode;
  if (vp && options.spatialIndex) {
    const si = options.spatialIndex.ensure(layout, options.layoutGeneration ?? 0);
    byNode = si.byNode;
    const { visible, paintSet: ps } = si.queryVisible(vp, options.viewportMargin || 0);
    paintSet = ps;
    const context = si.ancestorContext(visible, paintSet);
    workList = [...visible, ...context];
  } else {
    byNode = new Map(layout.map(item => [item.node, item]));
    if (vp) {
      paintSet = new Set();
      const vx0 = vp.x || 0, vy0 = vp.y || 0;
      const vx1 = vx0 + (vp.width || 800), vy1 = vy0 + (vp.height || 600);
      const margin = options.viewportMargin || 0;
      const visible = [];
      for (const item of layout) {
        const st = item.style || {};
        const pos = String(st.position || "static").toLowerCase();
        const t = String(st.transform || "").trim().toLowerCase();
        // Fixed/sticky/transformed items are conservatively kept.
        if (pos === "fixed" || pos === "sticky" || (t && t !== "none")) {
          visible.push(item); paintSet.add(item); continue;
        }
        const ix = Number(item.x) || 0, iy = Number(item.y) || 0;
        const iw = Number(item.width) || 0, ih = Number(item.height) || 0;
        if (ix < vx1 + margin && ix + iw > vx0 - margin &&
            iy < vy1 + margin && iy + ih > vy0 - margin) {
          visible.push(item); paintSet.add(item);
        }
      }
      // Keep ancestor chains for context (clip/transform/opacity lookups).
      const context = new Set();
      for (const item of visible) {
        let n = item.node ? item.node.parentNode : null, g = 0;
        while (n && g++ < 64) {
          const anc = byNode.get(n);
          if (anc && !paintSet.has(anc)) context.add(anc);
          n = n.parentNode;
        }
      }
      workList = [...visible, ...context];
    }
  }
  // B"H 2026-10-09 (scroll compositor): a caller-supplied paintSet wins.
  // The compositor pre-culls via the spatial index in page space, translates
  // items to strip space, and passes only context ancestors for lookup —
  // they must never paint themselves.
  if (options.paintSet instanceof Set) paintSet = options.paintSet;
  // B"H: a node's own textContent is laid out as a #text item (synthesized by
  // inlineKids when the node has no element children). paintBox must not paint
  // it a second time via directText — that double-paints every text run.
  // B"H 2026-10-09 (viewport culling): operate on the culled workList.
  const textParents = new Set();
  for (const item of workList) {
    if (item.kind === "#text" && item.node && item.node.parentNode) textParents.add(item.node.parentNode);
  }
  // B"H 2026-10-09: which items have painted descendants (opacity groups).
  // B"H 2026-10-09 (viewport culling): operate on the culled workList.
  const hasKid = new Set();
  for (const it of workList) {
    let n = it.node ? it.node.parentNode : null, g = 0;
    while (n && g++ < 64) {
      const anc = byNode.get(n);
      if (anc && anc !== it) hasKid.add(anc);
      n = n.parentNode;
    }
  }
  const isGroupRoot = (it) => opacityOf(it.style) < 1 && hasKid.has(it);
  const ordered = paintOrder(workList);

  // B"H 2026-10-09 (viewport culling): per-frame ancestor info cache.
  // paintOne does 4 separate ancestor walks per item (accumulate2D,
  // clipChainFor, clipFor, computeScene3D/nearestTransformCtx). The DOM
  // doesn't change during a paint, so cache the combined results per item.
  const ancCache = new Map();
  function ancestorInfo(item) {
    let info = ancCache.get(item);
    if (info) return info;
    const transformCtx = nearestTransformCtx(item, byNode);
    // B"H: boxScene must run when the item OR any ancestor has a transform
    // (computeScene3D walks ancestors for 3D). transformCtx is non-null when
    // a transformed ancestor exists.
    const mayHave3D = transformCtx || hasOwnTransform(item.style);
    info = {
      accum2d: accumulate2D(item, byNode),
      clipChain: clipChainFor(item, byNode),
      oclip: clipFor(item, byNode),
      transformCtx,
      // B"H 2026-10-09: computeScene3D is expensive; skip when no transform
      // in play. Text roots the scene at the transformed ancestor; boxes use
      // the item itself (computeScene3D walks ancestors internally).
      textScene: mayHave3D ? computeScene3D(transformCtx || item, byNode) : null,
      boxScene: mayHave3D ? computeScene3D(item, byNode) : null,
    };
    ancCache.set(item, info);
    return info;
  }

  // Paint one item: visibility, clip-path chain, overflow clip, effects.
  function paintOne(destFb, item, forceOpacity) {
    // B"H 2026-10-09: visibility:hidden/collapse keeps layout space but
    // skips paint. Descendants with visibility:visible are separate items
    // and still paint (their own computed visibility wins).
    const vis = String(item.style?.visibility || "visible").trim().toLowerCase();
    if (vis === "hidden" || vis === "collapse") return;
    // B"H 2026-10-09 (scroll perf): simple-paint fast lane. When the caller
    // guarantees no transforms, clip-paths, masks, filters, blend modes,
    // opacity<1, or overflow clips in the layout (compositor verifies per
    // generation), skip ancestorInfo's 4 walks + paintWithEffects entirely.
    // This was ~0.3ms per item; the fast lane is ~0.05ms.
    if (options.simplePaint) {
      if (item.kind === "#text") {
        paintTextItem(destFb, item);
      } else {
        paintBox(destFb, item, pickCanvasTexture(item, textures, used), textures, textParents);
      }
      return;
    }
    const info = ancestorInfo(item);
    const accum2d = info.accum2d;
    // B"H 2026-10-09: the untransformed-box cull is only valid without
    // transforms; a transformed item may paint inside the clip while its
    // untransformed box sits outside. The pixel clip below still seals it.
    if (!accum2d && !visibleInsideAncestors(item, byNode)) return;
    const fx = { clipChain: info.clipChain, accum2d, forceOpacity };
    const oclip = info.oclip;
    if (oclip && typeof destFb.pushClip === "function") destFb.pushClip(oclip);
    try {
      if (item.kind === "#text") {
        // B"H 2026-10-09 — 3D scene is rooted at the transformed ancestor.
        paintWithEffects(destFb, item, (f, it) => paintTextItem(f, it), info.transformCtx, fx, info.textScene);
      } else {
        // B"H 2026-10-09 — 3D transforms project with true perspective.
        paintWithEffects(
          destFb,
          item,
          (f, it) => paintBox(f, it, pickCanvasTexture(it, textures, used), textures, textParents),
          null,
          fx,
          info.boxScene
        );
      }
    } finally {
      if (oclip && typeof destFb.popClip === "function") destFb.popClip();
    }
  }

  // Paint root's whole subtree into a group surface (nested opacity groups
  // recurse), applying the root's own opacity once around everything.
  //
  // B"H (compositor): pooled surface (no per-frame alloc), bounds-limited
  // final composite (only the painted region is blitted, not the whole
  // surface), and the group opacity folded into the blit via alphaScale
  // (replaces the old separate full-surface scaleSurfaceAlpha pass).
  function paintGroupSurface(root) {
    const surf = acquireGroupSurface(fb);
    const scale = surf.scale || 1;
    // Union bounds (CSS px, page coords) of everything painted into the
    // surface. Items with 2D/3D transforms can paint anywhere -> full blit.
    let bx0 = Infinity, by0 = Infinity, bx1 = -Infinity, by1 = -Infinity;
    let fullBlit = false;
    const trackBounds = (m) => {
      const ix = Number(m.x) || 0, iy = Number(m.y) || 0;
      const iw = Number(m.width) || 0, ih = Number(m.height) || 0;
      let pad = 0;
      const st = m.style || {};
      // Outset box-shadows / text-shadows / filters extend past the box.
      try {
        for (const sh of parseBoxShadows(st)) {
          if (sh.inset) continue;
          const e = Math.abs(sh.dx || 0) + Math.abs(sh.dy || 0) + (sh.spread || 0) + (sh.blur || 0) * 2 + 8;
          if (e > pad) pad = e;
        }
        if (m.kind === "#text") {
          for (const sh of parseTextShadows(st)) {
            const e = Math.abs(sh.dx || 0) + Math.abs(sh.dy || 0) + (sh.blur || 0) * 2 + 8;
            if (e > pad) pad = e;
          }
        }
        const fl = parseFilterList(st.filter);
        if (fl.length && fl.every(f => FILTER_FUNCTIONS.has(f.name))) pad += filterPadPx(fl) + 8;
      } catch (_) { /* conservative: pad stays */ }
      const info = ancestorInfo(m);
      if (info.accum2d || info.boxScene) fullBlit = true;
      if (ix - pad < bx0) bx0 = ix - pad;
      if (iy - pad < by0) by0 = iy - pad;
      if (ix + iw + pad > bx1) bx1 = ix + iw + pad;
      if (iy + ih + pad > by1) by1 = iy + ih + pad;
    };
    const lskip = new Set();
    for (const m of ordered) {
      if (m !== root && !isInSubtree(m, root)) continue;
      if (lskip.has(m)) continue;
      if (m !== root && isGroupRoot(m)) {
        const inner = paintGroupSurface(m);
        try {
          const ib = inner.__bounds;
          const op = opacityOf(m.style);
          if (ib) {
            surf.blitFrom(inner.base, 0, 0, {
              srcRect: {
                x0: Math.max(0, Math.floor(ib.x0 * scale)),
                y0: Math.max(0, Math.floor(ib.y0 * scale)),
                x1: Math.min(inner.base.width, Math.ceil(ib.x1 * scale)),
                y1: Math.min(inner.base.height, Math.ceil(ib.y1 * scale)),
              },
              alphaScale: op,
            });
            // Union the inner group's bounds into ours.
            if (ib.x0 < bx0) bx0 = ib.x0;
            if (ib.y0 < by0) by0 = ib.y0;
            if (ib.x1 > bx1) bx1 = ib.x1;
            if (ib.y1 > by1) by1 = ib.y1;
            if (ib.full) fullBlit = true;
          } else {
            surf.blitFrom(inner.base, 0, 0, { alphaScale: op });
            fullBlit = true;
          }
        } finally {
          releaseGroupSurface(inner);
        }
        for (const d of ordered) if (d !== m && isInSubtree(d, m)) lskip.add(d);
      } else {
        trackBounds(m);
        paintOne(surf, m, m === root ? 1 : undefined);
      }
    }
    if (!fullBlit && bx1 > bx0 && by1 > by0) {
      surf.__bounds = { x0: bx0, y0: by0, x1: bx1, y1: by1, full: false };
    } else {
      surf.__bounds = null;
    }
    return surf;
  }

  // B"H (compositor): occlusion culling — front-to-back pre-pass marks items
  // fully covered by opaque items in front of them. Default on; pass
  // { occlusion: false } to disable.
  const occluded = options.occlusion === false
    ? new Set()
    : computeOccludedSet(ordered, paintSet, isGroupRoot, ancestorInfo);

  const skipped = new Set();
  for (const item of ordered) {
    if (skipped.has(item)) continue;
    // B"H 2026-10-09 (viewport culling): context-only ancestors provide
    // clip/transform/opacity lookups but never paint themselves.
    if (paintSet && !paintSet.has(item)) continue;
    if (occluded.has(item)) continue;
    if (isGroupRoot(item)) {
      const gs = paintGroupSurface(item);
      try {
        // B"H (compositor): bounds-limited composite + folded group alpha.
        // The surface is pooled and released back after the blit.
        const b = gs.__bounds;
        const gscale = gs.scale || 1;
        const op = opacityOf(item.style);
        if (b) {
          fb.blitFrom(gs.base, 0, 0, {
            srcRect: {
              x0: Math.max(0, Math.floor(b.x0 * gscale)),
              y0: Math.max(0, Math.floor(b.y0 * gscale)),
              x1: Math.min(gs.base.width, Math.ceil(b.x1 * gscale)),
              y1: Math.min(gs.base.height, Math.ceil(b.y1 * gscale)),
            },
            alphaScale: op,
          });
        } else {
          fb.blitFrom(gs.base, 0, 0, { alphaScale: op });
        }
      } finally {
        releaseGroupSurface(gs);
      }
      for (const d of ordered) if (d !== item && isInSubtree(d, item)) skipped.add(d);
      continue;
    }
    paintOne(fb, item);
  }
  for (const item of workList) {
    if (paintSet && !paintSet.has(item)) continue;
    if (shouldShowScrollbar(item)) paintScrollbar(fb, item);
  }
}

/**
 * B"H 2026-10-09: z-index paint order. When no item carries a non-auto
 * z-index the original layout order is returned untouched (zero behavior
 * change for existing content). Otherwise siblings paint in CSS order:
 * negative z-index, then non-positioned, then positioned z-auto, then
 * positive z-index — stable within each tier.
 */
function zTierOf(style = {}) {
  const positioned = String(style.position || "static").trim().toLowerCase() !== "static";
  const raw = String(style["z-index"] ?? "auto").trim().toLowerCase();
  if (!positioned || raw === "auto" || raw === "") return null;
  const n = parseInt(raw, 10);
  return Number.isFinite(n) ? n : null;
}

function paintOrder(layout) {
  if (!layout || !layout.length) return layout;
  let need = false;
  for (const it of layout) if (zTierOf(it.style) !== null) { need = true; break; }
  if (!need) return layout;
  const seen = new Set(), ordered = [];
  const key = (it) => {
    const z = zTierOf(it.style);
    const positioned = String(it.style?.position || "static").trim().toLowerCase() !== "static";
    return [z === null ? 0 : z, positioned ? 1 : 0];
  };
  const visit = (it) => {
    if (!it || seen.has(it)) return;
    seen.add(it); ordered.push(it);
    const kids = (it.children || [])
      .map((k, i) => [k, i])
      .sort((a, b) => {
        const ka = key(a[0]), kb = key(b[0]);
        return ka[0] - kb[0] || ka[1] - kb[1] || a[1] - b[1];
      });
    for (const [k] of kids) visit(k);
  };
  visit(layout[0]);
  for (const it of layout) if (!seen.has(it)) { seen.add(it); ordered.push(it); }
  return ordered;
}
