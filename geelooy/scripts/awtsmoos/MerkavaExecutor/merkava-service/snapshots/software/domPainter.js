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

/** Scale the alpha channel of a surface (raw Framebuffer or ScaledFramebuffer). */
function scaleSurfaceAlpha(surf, k) {
  const base = surf && surf.base ? surf.base : surf;
  if (!base || !base.data) return;
  const d = base.data;
  for (let i = 3; i < d.length; i += 4) d[i] = Math.round(d[i] * k);
}

/** Full-size transparent group surface in page coords, honoring fb's scale. */
function makeGroupSurface(fb) {
  const scale = (fb && fb.scale) || 1;
  const cw = Math.max(1, fb.width || 1), ch = Math.max(1, fb.height || 1);
  const base = new Framebuffer(Math.round(cw * scale), Math.round(ch * scale), [0, 0, 0, 0]);
  return new ScaledFramebuffer(base, scale, cw, ch);
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
  function paintGroupSurface(root) {
    const surf = makeGroupSurface(fb);
    const lskip = new Set();
    for (const m of ordered) {
      if (m !== root && !isInSubtree(m, root)) continue;
      if (lskip.has(m)) continue;
      if (m !== root && isGroupRoot(m)) {
        const inner = paintGroupSurface(m);
        surf.blitFrom(inner.base, 0, 0);
        for (const d of ordered) if (d !== m && isInSubtree(d, m)) lskip.add(d);
      } else {
        paintOne(surf, m, m === root ? 1 : undefined);
      }
    }
    const op = opacityOf(root.style);
    if (op < 1) scaleSurfaceAlpha(surf, op);
    return surf;
  }

  const skipped = new Set();
  for (const item of ordered) {
    if (skipped.has(item)) continue;
    // B"H 2026-10-09 (viewport culling): context-only ancestors provide
    // clip/transform/opacity lookups but never paint themselves.
    if (paintSet && !paintSet.has(item)) continue;
    if (isGroupRoot(item)) {
      const gs = paintGroupSurface(item);
      fb.blitFrom(gs.base, 0, 0);
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
