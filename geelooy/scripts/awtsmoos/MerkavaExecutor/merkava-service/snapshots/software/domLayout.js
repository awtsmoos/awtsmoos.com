// B"H
/**
 * @file domLayout.js
 * @description The Awtsmoos measures a compact DOM world for screenshots:
 * selectors match the node itself before climbing ancestors, grid rows remain
 * rows, flex-wrap creates real lines, and canvases keep their own dimensions.
 *
 * Style resolution uses the correct cascade engine in ./cascade.js, built on
 * the executor-owned standards (merkava-browser/standards/css): proper
 * (ids, classes, types) specificity tuples, !important ranking, source-order
 * tiebreaks, inheritance, var() resolution, and shorthand expansion.
 *
 * B"H 2026-10-09: textWidth now measures with the REAL font engine
 * (framebuffer.js) at the SAME quantized scale the painter uses. The old
 * 0.55em estimate made words narrower than drawn -> overlapping text.
 */
import { compileStylesheet, computeElementStyle, expandDeclarations, resolveVarsInPlace } from "./cascade.js";
import { textWidth as measureTextWidth } from "./framebuffer.js";
import { parseKeyframes, applyAnimationState } from "./animation.js";
import pseudoPkg from "../../../merkava-browser/standards/css/CssPseudoElements.js";
// B"H 2026-10-09 (merkava-mass-tests lists-forms): list markers + CSS counters.
import { applyCounters, markerForLi } from "./listMarkers.js";

/**
 * B"H 2026-10-09: @supports capability callback for the software renderer.
 * The condition evaluator calls environment.supports(prop, value) for a
 * single (prop: value) declaration; without this callback every @supports
 * block was skipped. Claims only what the layout/paint pipeline actually
 * implements (flex/grid/table layout, grid gap parsing); everything else —
 * aspect-ratio, backdrop-filter, unknown properties — returns false so the
 * block is correctly skipped. Additive: no existing rule path changes.
 */
function merkavaSupports(prop, value) {
  const p = String(prop || "").trim().toLowerCase();
  const v = String(value || "").trim().toLowerCase();
  if (p === "display") {
    return ["block", "inline", "inline-block", "flex", "inline-flex", "grid", "inline-grid", "table", "none", "contents", "list-item"].includes(v);
  }
  if (p === "gap" || p === "row-gap" || p === "column-gap") return true;
  if (p === "position") return ["static", "relative", "absolute", "fixed", "sticky"].includes(v);
  return false;
}

export function buildLayoutTree(dom, viewport = { width: 960, height: 640 }, options = {}) {
  const root = wireParents(nodeFrom(dom));
  // B"H 2026-10-09: media environment — mediaType ("screen"/"print"),
  // reducedMotion and forcedColors flags feed @media evaluation, so
  // `@media print`, `(prefers-reduced-motion: reduce)` and
  // `(forced-colors: ...)` can actually match when the embedder asks.
  const environment = {
    width: viewport.width, height: viewport.height,
    type: String(options.mediaType || options.media || "screen").toLowerCase(),
    reducedMotion: !!options.reducedMotion,
    forcedColors: !!options.forcedColors,
    supports: merkavaSupports,
  };
  const fromDom = collectCssRules(root, environment, 0);
  const fromText = compileStylesheet(options.cssText || "", environment, fromDom.nextOrder);
  // B"H: animation context — @keyframes are global by name, so collect them
  // from both embedded <style> elements and the external cssText. `time`
  // (ms, default 0) is the screenshot timestamp animations evaluate at.
  const anim = {
    keyframes: parseKeyframes(`${options.cssText || ""}\n${fromDom.cssText || ""}`),
    time: Math.max(0, Number(options.time) || 0),
    stateChanges: Array.isArray(options.stateChanges) ? options.stateChanges : [],
  };
  const rules = [...fromDom.rules, ...fromText.rules];
  // B"H 2026-10-09: @property registrations merge across stylesheets (later wins).
  const propertyRegs = { ...fromDom.properties, ...fromText.properties };
  // B"H 2026-10-09: @container rules from both stylesheets.
  const containerRules = [...(fromDom.containerRules || []), ...(fromText.containerRules || [])];
  applyCascade(root, rules, viewport, anim, propertyRegs, containerRules);
  // B"H 2026-10-09 (merkava-mass-tests lists-forms): CSS counters are
  // applied inside materializePseudoElements' pre-order walk (see below) —
  // each element's counter-reset/increment lands BEFORE its own ::before
  // content resolves, so "Section N." prefixes count 1, 2, 3 correctly.
  // B"H 2026-10-09 (mass-test worker): ::before/::after/::first-letter/
  // ::first-line/::placeholder — materialize generated content via the
  // executor-owned CssPseudoElements standard. Additive: when no
  // pseudo-element rules match, the tree is left untouched.
  materializePseudoElements(root, rules);
  // B"H 2026-10-09 (css-worker-2): rewrite vw/vh/rem/em to px in every
  // computed style before layout (dim() only resolves px and %).
  resolveRelativeUnits(root, rules, viewport);
  const out = [];
  layoutNode(findBody(root) || root, { x: 0, y: 0, width: viewport.width, height: viewport.height, viewportHeight: viewport.height, root: true, depth: 0, cb: { x: 0, y: 0, width: viewport.width, height: viewport.height }, vpW: viewport.width, vpH: viewport.height }, out);
  applyFirstLineStyles(out);
  return out;
}

// B"H: robustness caps — deep trees and hostile repeat() counts must degrade, never crash.
const MAX_LAYOUT_DEPTH = 1000;
const MAX_GRID_TRACKS = 4096;

function layoutNode(node, ctx, out) {
  if (!node || hidden(node)) return null;
  if (node.nodeType === 3) {
    const parentStyle = node.parentNode && node.parentNode.nodeType === 1 ? styleOf(node.parentNode) : {};
    return layoutText(node, ctx, out, parentStyle);
  }
  const style = styleOf(node);
  // Inline elements become atomic boxes when reached directly (inside inline
  // runs the run-layouter places them); flex/grid items are blockified by
  // their container, which calls layoutBlockBox directly.
  if (displayOf(style, node) === "inline") return layoutInlineBox(node, ctx, out, style);
  return layoutBlockBox(node, ctx, out, style);
}

function layoutBlockBox(node, ctx, out, style) {
  style = style || styleOf(node);
  const depth = ctx.depth || 0;
  const refW = Math.max(1, ctx.width || 0);
  const margin = box(style, "margin", refW), padding = box(style, "padding", refW), border = borderBox(style, refW);
  // B"H 2026-10-09 (merkava-mass-tests lists-forms): UA default — outside
  // list markers hang in the list's padding; reserve room when the author
  // didn't set padding-left (mirrors browser default list indentation).
  if ((node.localName === "ul" || node.localName === "ol") && style["padding-left"] == null &&
      (node.children || []).some((c) => c && c.nodeType === 1 && c.localName === "li" && c.__marker && c.__marker.position !== "inside")) {
    padding.left = Math.max(padding.left, 30);
  }
  if (depth > MAX_LAYOUT_DEPTH) {
    // Graceful leaf: absurdly deep subtrees render as a stub instead of overflowing the call stack.
    const stub = { node, x: ctx.x + margin.left, y: ctx.y + margin.top, width: Math.max(1, refW - margin.left - margin.right), height: defaultHeight(node, style), style, children: [], kind: node.localName || "div", margin, depthCapped: true };
    out.push(stub);
    return stub;
  }
  const width = measuredWidth(node, style, Math.max(1, refW - margin.left - margin.right));
  const fixedH = measuredHeight(node, style, ctx.height || ctx.viewportHeight || 0);
  // B"H 2026-10-09: block-level auto margins (normal flow only — flex/grid
  // items resolve their own auto margins). A definite width + auto
  // left/right margins absorbs free space: both auto => centered.
  let x = ctx.x + margin.left;
  if (ctx.blockFlow) {
    const ew = dim(style.width, refW);
    if (ew > 0) {
      const mlA = isAutoMargin(style, "left"), mrA = isAutoMargin(style, "right");
      if (mlA || mrA) {
        const free = Math.max(0, refW - ew - (mlA ? 0 : margin.left) - (mrA ? 0 : margin.right));
        if (mlA && mrA) x = ctx.x + free / 2;
        else if (mlA) x = ctx.x + free;
      }
    }
  }
  const y = ctx.y + margin.top;
  const pos = positionOf(style);
  const vpW = ctx.vpW || refW, vpH = ctx.vpH || ctx.viewportHeight || 0;
  const item = { node, x, y, width, height: fixedH || 0, style, children: [], kind: node.localName || "div", margin: { ...margin } };
  out.push(item);
  // B"H 2026-10-09: provisional containing block for out-of-flow descendants.
  // Exact when an explicit height is set; best-effort for auto height (the
  // final box refines it in placeOOF below).
  const provCB = pos !== "static"
    ? { x, y, width, height: Math.max(fixedH || 0, dim(style["min-height"], ctx.viewportHeight || 0), 1) }
    : null;
  const content = { x: x + padding.left + border.left, y: y + padding.top + border.top, width: Math.max(1, width - padding.left - padding.right - border.left - border.right), height: Math.max(0, (fixedH || ctx.height || 0) - padding.top - padding.bottom - border.top - border.bottom), viewportHeight: ctx.viewportHeight, depth: depth + 1, inlineStyle: inheritFont(style), root: !!ctx.root, noCollapse: !!ctx.noCollapse || pos === "absolute" || pos === "fixed", cb: provCB || ctx.cb || null, vpW, vpH, subgrid: ctx.subgrid || null };
  // B"H 2026-10-09: content-visibility — `hidden` always skips contents;
  // `auto` skips when the box starts below the viewport (static renderer:
  // no scroll position, so below-fold means y >= viewport height).
  // Skipped boxes size from contain-intrinsic-size (or collapse to 0).
  const cv = String(style["content-visibility"] || "visible").trim().toLowerCase();
  const vpHeight = ctx.viewportHeight || 0;
  const cvSkip = cv === "hidden" || (cv === "auto" && y >= vpHeight && vpHeight > 0);
  let cvIntrinsic = null;
  if (cvSkip) {
    const cis = String(style["contain-intrinsic-size"] || "").trim().split(/\s+/);
    const ph = (s) => { const m = String(s || "").match(/^(\d+(?:\.\d+)?)px$/); return m ? Number(m[1]) : 0; };
    cvIntrinsic = { width: ph(cis[0]), height: ph(cis[cis.length - 1] || cis[0]) };
  }
  const kids = cvSkip ? [] : inlineKids(node);
  const flow = kids.length ? layoutChildren(kids, item, content, out, displayOf(style, node)) : { height: 0, throughTop: 0, throughBottom: 0, oof: [] };
  // B"H 2026-10-09: contain:size (also via strict) — the box's size is
  // computed as if it had no contents: auto height collapses to 0,
  // set heights never grow. Children still lay out (they overflow).
  const containToks = String(style.contain || "").toLowerCase().split(/\s+/);
  const sizeContain = containToks.includes("size") || containToks.includes("strict");
  // B"H 2026-10-09: content-visibility skip — size from intrinsic, not content.
  const contentH = cvSkip ? (cvIntrinsic ? cvIntrinsic.height : 0) : (sizeContain ? 0 : flow.height);
  const naturalH = fixedH || contentH + padding.top + padding.bottom + border.top + border.bottom;
  // B"H: defaultHeight is a last resort for empty auto-height boxes — it must
  // never inflate an explicit height (old code turned height:20px into 22px).
  item.height = Math.max(naturalH, dim(style["min-height"], ctx.viewportHeight || 0), ctx.root ? Number(ctx.height || ctx.viewportHeight || 0) : (naturalH ? 0 : defaultHeight(node, style)));
  // B"H 2026-10-09 (mass-test batch 2): aspect-ratio — definite width + auto
  // height derives height from width/ratio (e.g. 16/9). Content still wins
  // when taller; max-height still clamps.
  const ar = parseAspectRatio(style);
  if (ar > 0 && !fixedH && item.width > 0) {
    let arH = item.width / ar;
    const maxH = dim(style["max-height"], ctx.viewportHeight || 0);
    if (maxH > 0) arH = Math.min(arH, maxH);
    if (arH > item.height) item.height = arH;
  }
  // B"H 2026-10-09: max-height clamp (additive).
  const maxH = dim(style["max-height"], ctx.viewportHeight || 0);
  if (maxH > 0 && item.height > maxH) item.height = maxH;
  // B"H 2026-10-09 (merkava-mass-tests lists-forms): outside list markers.
  // Painted as a text item hanging left of the li's content box, aligned
  // with the first laid-out child. Uses a synthetic node so the layout
  // item map never collides with the li's own box entry.
  paintOutsideMarker(node, item, out, x, padding, border);
  // Margins that collapsed through the parent's padding/border-less edges merge
  // outward into the parent's own margins (CSS margin collapsing).
  // B"H 2026-10-09: when the merged top margin exceeds the parent's own, the
  // parent itself must move down by the difference (the collapsed margin now
  // sits ABOVE the parent). Previously margin.top was updated but y was not,
  // so children collapsed to y=0 instead of pushing the parent down.
  if (!ctx.root) {
    const mergedTop = Math.max(margin.top, flow.throughTop || 0);
    if (mergedTop > margin.top) shiftSubtree(item, mergedTop - margin.top);
    item.margin.top = mergedTop;
    item.margin.bottom = Math.max(margin.bottom, flow.throughBottom || 0);
  }
  // B"H 2026-10-09: relative/sticky visual offset — the box shifts but its
  // flow footprint stays where it was.
  if (pos === "relative" || pos === "sticky") {
    const dx = !isAuto(style.left) ? dim(style.left, refW) : (!isAuto(style.right) ? -dim(style.right, refW) : 0);
    const dy = !isAuto(style.top) ? dim(style.top, vpH) : (!isAuto(style.bottom) ? -dim(style.bottom, vpH) : 0);
    if (dx) shiftSubtreeX(item, dx);
    if (dy) shiftSubtree(item, dy);
  }
  // B"H 2026-10-09: out-of-flow children placed against the final box.
  const oof = flow.oof || [];
  if (oof.length) {
    const myCB = pos !== "static"
      ? { x: item.x, y: item.y, width: item.width, height: item.height }
      : (ctx.cb || { x: 0, y: 0, width: vpW, height: vpH });
    placeOOF(item, oof, myCB, { viewportHeight: ctx.viewportHeight, vpW, vpH, depth }, out);
  }
  return item;
}

// Move an item and its whole laid-out subtree (children are absolute).
function shiftSubtree(item, dy) {
  item.y += dy;
  for (const c of item.children || []) shiftSubtree(c, dy);
}

/**
 * B"H 2026-10-09 (merkava-mass-tests lists-forms): paint the outside list
 * marker for an <li> as a #text item hanging left of the content box,
 * vertically aligned with the first laid-out child. Skipped when the author
 * materialized an explicit ::marker box (it renders as a real child).
 */
function paintOutsideMarker(node, item, out, x, padding, border) {
  const m = node && node.__marker;
  if (!m || m.position === "inside") return;
  if ((node.children || []).some((c) => c && c.nodeType === 1 && String(c.localName || "").startsWith("::marker"))) return;
  const mtext = String(m.text || "");
  if (!mtext) return;
  const mw = Math.max(1, textWidth(mtext, m.style));
  const firstKid = (item.children || [])[0];
  const my = firstKid ? firstKid.y : item.y + (padding.top || 0) + (border.top || 0);
  const mRight = x + (padding.left || 0) + (border.left || 0) - 6;
  // B"H 2026-10-09 (css-worker-2): vertically center the marker glyph in the
  // line box. It was drawn at the very top of the line (y=0..8 of a 20px
  // line), so probes at the line's vertical center missed the bullet.
  const lineH = lineHeightOf(m.style);
  const glyphH = 7 * painterScale(m.style);
  const cy = my + Math.max(0, (lineH - glyphH) / 2);
  const markerNode = { nodeType: 3, textContent: mtext, parentNode: node, localName: "#text", children: [], __textStyle: m.style };
  const mitem = {
    node: minimalTextNode(node), x: mRight - mw, y: cy, width: mw, height: lineHeightOf(m.style),
    style: m.style, children: [], kind: "#text", text: mtext,
  };
  out.push(mitem);
  item.children.push(mitem);
}
function shiftSubtreeX(item, dx) {
  item.x += dx;
  for (const c of item.children || []) shiftSubtreeX(c, dx);
}

// B"H 2026-10-09: CSS positioning support (additive). position:absolute/fixed
// take the element out of flow and place it against its containing block:
// the nearest positioned ancestor's border box (viewport for fixed).
function positionOf(style = {}) { return String(style.position || "static").trim().toLowerCase() || "static"; }
function isOOF(style = {}) { const p = positionOf(style); return p === "absolute" || p === "fixed"; }
function isAuto(v) { const t = String(v ?? "").trim().toLowerCase(); return t === "" || t === "auto"; }

// Place out-of-flow children after the parent's final box is known. Each
// child is measured at (0,0) — its own absolutely-positioned descendants
// resolve against its box there — then the whole subtree shifts to the
// final spot, preserving relative geometry.
function placeOOF(parentItem, oofNodes, cbRect, ctx, out) {
  const vpW = ctx.vpW || 0, vpH = ctx.vpH || ctx.viewportHeight || 0;
  const viewportCB = { x: 0, y: 0, width: vpW, height: vpH };
  for (const node of oofNodes) {
    if (!node || node.nodeType !== 1) continue;
    const style = styleOf(node);
    const cb = positionOf(style) === "fixed" ? viewportCB : (cbRect || viewportCB);
    // B"H: CSS 2.1 §10.3.7/10.6.4 — if width is auto and both left+right are
    // specified, width = CB width - left - right (stretch). Same for height.
    // The `inset` shorthand expands to all four.
    const insetParts = String(style.inset || "").trim().split(/\s+/).filter(Boolean);
    const insetVal = (i) => insetParts[i] ?? insetParts[i - 2] ?? insetParts[0] ?? "";
    const effLeft = !isAuto(style.left) ? style.left : insetVal(3) !== "" ? insetVal(3) : style.left;
    const effRight = !isAuto(style.right) ? style.right : insetVal(1) !== "" ? insetVal(1) : style.right;
    const effTop = !isAuto(style.top) ? style.top : insetVal(0) !== "" ? insetVal(0) : style.top;
    const effBottom = !isAuto(style.bottom) ? style.bottom : insetVal(2) !== "" ? insetVal(2) : style.bottom;
    const leftV = dim(effLeft, cb.width), rightV = dim(effRight, cb.width);
    const topV = dim(effTop, cb.height), bottomV = dim(effBottom, cb.height);
    let w = dim(style.width, cb.width);
    if (!w && !isAuto(effLeft) && !isAuto(effRight)) {
      w = Math.max(1, cb.width - leftV - rightV);
    }
    if (!w) w = Math.max(1, Math.min(cb.width, naturalInlineWidth(node, style, cb.width)));
    // B"H: height stretch for top+bottom.
    let h = dim(style.height, cb.height);
    if (!h && !isAuto(effTop) && !isAuto(effBottom)) {
      h = Math.max(1, cb.height - topV - bottomV);
    }
    // B"H: temp ctx carries the CB height so % heights resolve against it.
    const got = layoutBlockBox(node, { x: 0, y: 0, width: Math.max(1, w), height: cb.height, viewportHeight: ctx.viewportHeight || vpH, depth: (ctx.depth || 0) + 1, vpW, vpH, cb }, out);
    if (!got) continue;
    // B"H: apply stretched height from top+bottom.
    if (h && h > got.height) got.height = h;
    parentItem.children.push(got);
    // B"H 2026-10-09 (mass-test batch 2): logical inset properties —
    // inset-inline-start/end, inset-block-start/end (+ inset-inline /
    // inset-block shorthands), direction-aware. Physical props keep priority.
    const eff = { left: style.left, right: style.right, top: style.top, bottom: style.bottom };
    {
      const rtl = String(style.direction || "").trim().toLowerCase() === "rtl";
      const lStart = rtl ? "right" : "left", lEnd = rtl ? "left" : "right";
      const iis = String(style["inset-inline"] || "").trim().split(/\s+/).filter(Boolean);
      const iib = String(style["inset-block"] || "").trim().split(/\s+/).filter(Boolean);
      const pick = (cur, cands) => {
        if (!isAuto(cur)) return cur;
        for (const c of cands) if (!isAuto(c)) return c;
        return cur;
      };
      eff[lStart] = pick(eff[lStart], [style["inset-inline-start"], iis[0]]);
      eff[lEnd] = pick(eff[lEnd], [style["inset-inline-end"], iis[1] || iis[0]]);
      eff.top = pick(eff.top, [style["inset-block-start"], iib[0]]);
      eff.bottom = pick(eff.bottom, [style["inset-block-end"], iib[1] || iib[0]]);
    }
    let fx = cb.x, fy = cb.y;
    // B"H 2026-10-09: abspos auto margins (CSS 2.1 §10.3.7) — with left,
    // width and right all definite, auto margins absorb free space equally
    // (left:0;right:0;margin:0 auto => centered).
    const mlA = isAutoMargin(style, "left"), mrA = isAutoMargin(style, "right");
    const mtA = isAutoMargin(style, "top"), mbA = isAutoMargin(style, "bottom");
    if (!isAuto(eff.left) && !isAuto(eff.right) && (mlA || mrA)) {
      const free = Math.max(0, cb.width - dim(eff.left, cb.width) - dim(eff.right, cb.width) - got.width);
      if (mlA && mrA) fx = cb.x + dim(eff.left, cb.width) + free / 2;
      else if (mlA) fx = cb.x + dim(eff.left, cb.width) + free;
      else fx = cb.x + dim(eff.left, cb.width);
    }
    else if (!isAuto(eff.left)) fx = cb.x + dim(eff.left, cb.width);
    else if (!isAuto(eff.right)) fx = cb.x + cb.width - dim(eff.right, cb.width) - got.width;
    if (!isAuto(eff.top) && !isAuto(eff.bottom) && (mtA || mbA)) {
      const free = Math.max(0, cb.height - dim(eff.top, cb.height) - dim(eff.bottom, cb.height) - got.height);
      if (mtA && mbA) fy = cb.y + dim(eff.top, cb.height) + free / 2;
      else if (mtA) fy = cb.y + dim(eff.top, cb.height) + free;
      else fy = cb.y + dim(eff.top, cb.height);
    }
    else if (!isAuto(eff.top)) fy = cb.y + dim(eff.top, cb.height);
    else if (!isAuto(eff.bottom)) fy = cb.y + cb.height - dim(eff.bottom, cb.height) - got.height;
    if (fx !== got.x) shiftSubtreeX(got, fx - got.x);
    if (fy !== got.y) shiftSubtree(got, fy - got.y);
  }
}

function layoutChildren(children, parent, ctx, out, mode) {
  // B"H 2026-10-09: out-of-flow (position:absolute/fixed) children are
  // partitioned out of every flow mode and returned for placeOOF.
  const flowKids = [], oofKids = [];
  for (const child of children || []) {
    if (child && child.nodeType === 1 && isOOF(styleOf(child))) oofKids.push(child);
    else flowKids.push(child);
  }
  const withOOF = (r, h) => ({ height: h, throughTop: 0, throughBottom: 0, oof: oofKids.concat((r && r.oof) || []) });
  if (mode === "grid") { const r = layoutGrid(flowKids, parent, ctx, out); return withOOF(r, r.height); }
  if (mode === "flex") { const r = layoutFlex(flowKids, parent, ctx, out); return withOOF(r, r.height); }
  // B"H 2026-10-09: table + multi-column layout (see tableMulticol section below).
  if (mode === "table") return withOOF(null, layoutTable(flowKids, parent, ctx, out));
  const mc = multiColumnSpec(parent.style || {}, ctx.width);
  if (mc && mode !== "table-caption") return withOOF(null, layoutMultiColumn(flowKids, parent, ctx, out, mc));
  const b = layoutBlockFlow(flowKids, parent, ctx, out);
  return { height: b.height, throughTop: b.throughTop, throughBottom: b.throughBottom, oof: oofKids.concat(b.oof || []) };
}

// B"H: block flow with CSS margin collapsing. Adjacent siblings collapse to
// max(prev-bottom, next-top); a first/last child's margin collapses THROUGH a
// parent that has no padding/border on that side and merges outward.
function layoutBlockFlow(children, parent, ctx, out) {
  const pStyle = parent.style || {};
  const refW = Math.max(1, ctx.width || 0);
  const noTopBarrier = !(dim(pStyle["padding-top"], refW) > 0 || borderBox(pStyle, refW).top > 0);
  const noBottomBarrier = !(dim(pStyle["padding-bottom"], refW) > 0 || borderBox(pStyle, refW).bottom > 0);
  // B"H: overflow other than visible establishes a BFC (CSS2.1 §9.4.1),
  // which blocks first/last-child margin collapsing through the parent.
  // Also a speed win: skipping collapse-through avoids the outward margin walk.
  const ov = String(pStyle["overflow"] || pStyle["overflow-y"] || "visible").trim().toLowerCase();
  const isBFC = ov !== "visible";
  const allowThrough = !ctx.root && !ctx.noCollapse && !isBFC;
  const depth = (ctx.depth || 0) + 1;
  let y = ctx.y, total = 0, prevBottom = 0, first = true;
  let throughTop = 0, lastBottom = 0, sawBlock = false;
  let run = [];
  // B"H 2026-10-09: float-row state (see the child loop below).
  let floatRow = null;
  const flushFloatRow = () => {
    if (!floatRow) return;
    const rowBottom = floatRow.y + floatRow.height;
    if (rowBottom > y) { total += rowBottom - y; y = rowBottom; }
    floatRow = null;
  };
  const flushRun = () => {
    if (!run.length) return;
    // B"H 2026-10-09 (merkava-mass-tests lists-forms): a block's
    // margin-bottom separates it from a following inline run too — without
    // this the run overlaps the block's bottom margin (label/input touch).
    y += prevBottom; total += prevBottom; prevBottom = 0;
    // B"H 2026-10-09 (css-worker-2): text-indent applies to the block's first
    // line only — flag the first run.
    const h = layoutInlineRun(run, parent, ctx, out, y, depth, first);
    run = [];
    y += h; total += h;
    prevBottom = 0; first = false; sawBlock = true;
  };
  for (const child of children) {
    if (isInlineLevel(child)) { run.push(child); continue; }
    flushRun();
    const cs = styleOf(child) || {};
    const fside = String(cs.float || "").trim().toLowerCase();
    const isFloat = fside === "left" || fside === "right";
    const clear = String(cs.clear || "").trim().toLowerCase();
    // B"H 2026-10-09: minimal float rows. Consecutive float:left/right
    // children pack horizontally into rows (wrapping when full); a non-float,
    // a clear, or the end of flow flushes the row into the block height.
    // Floats establish a BFC (noCollapse) and never join margin collapsing.
    if (!isFloat) flushFloatRow();
    else if (clear === "both" || clear === "left" || clear === "right") flushFloatRow();
    if (isFloat) {
      if (!floatRow) floatRow = { y, left: ctx.x, right: ctx.x + (ctx.width || 0), height: 0 };
      const got = layoutBlockBox(child, { x: floatRow.left, y: floatRow.y, width: ctx.width, height: ctx.height, viewportHeight: ctx.viewportHeight, depth, noCollapse: true, vpW: ctx.vpW, vpH: ctx.vpH, cb: ctx.cb, blockFlow: true }, out);
      if (!got) continue;
      parent.children.push(got);
      let gx = got.x;
      if (fside === "right") { gx = floatRow.right - got.width; shiftSubtreeX(got, gx - got.x); }
      const rowW = (ctx.width || 0);
      const overflows = gx + got.width > ctx.x + rowW + 1;
      const rowUsed = fside === "left" ? floatRow.left > ctx.x : floatRow.right < ctx.x + rowW;
      if (overflows && rowUsed) {
        // Wrap to a fresh row below.
        floatRow.y += floatRow.height; floatRow.height = 0;
        floatRow.left = ctx.x; floatRow.right = ctx.x + rowW;
        shiftSubtree(got, floatRow.y - got.y);
        gx = fside === "left" ? floatRow.left : floatRow.right - got.width;
        shiftSubtreeX(got, gx - got.x);
      }
      if (fside === "left") floatRow.left = gx + got.width;
      else floatRow.right = gx;
      if (got.height > floatRow.height) floatRow.height = got.height;
      continue;
    }
    // B"H 2026-10-09 (css-worker-2): pass the parent's content height down so
    // % heights resolve against the containing block (was falling back to the
    // viewport height, so height:50% of a 300px parent measured 300px).
    const got = layoutBlockBox(child, { x: ctx.x, y, width: ctx.width, height: ctx.height, viewportHeight: ctx.viewportHeight, depth, vpW: ctx.vpW, vpH: ctx.vpH, cb: ctx.cb, blockFlow: true }, out);
    if (!got) continue;
    parent.children.push(got);
    const m = got.margin;
    if (first && allowThrough && noTopBarrier) {
      // Collapses outward: no space inside, margin merges with parent's.
      throughTop = Math.max(throughTop, m.top);
      shiftSubtree(got, -m.top);
    } else {
      const effTop = first ? m.top : Math.max(prevBottom, m.top);
      shiftSubtree(got, effTop - m.top);
      y += effTop;
      total += effTop;
    }
    y += got.height;
    total += got.height;
    prevBottom = m.bottom; lastBottom = m.bottom;
    first = false; sawBlock = true;
  }
  flushRun();
  flushFloatRow();
  let throughBottom = 0;
  if (sawBlock && allowThrough && noBottomBarrier) {
    throughBottom = lastBottom; // merges outward, not into parent height
  } else if (sawBlock) {
    y += lastBottom; total += lastBottom;
  }
  return { height: total, throughTop, throughBottom, oof: [] };
}

// ---------------------------------------------------------------------------
// inline flow: line boxes, word wrap, atomic inline boxes
// ---------------------------------------------------------------------------
function inheritFont(style) {
  return {
    "font-size": style["font-size"] || "14px",
    color: style.color || "#000",
    "font-weight": style["font-weight"] || "400",
    "font-style": style["font-style"] || "normal",
  };
}
function fontSizeOf(style) { return dim(style["font-size"], 0) || 14; }
// B"H 2026-10-09: the painter quantizes font size to 10px steps
// (textScale: round(size/10), clamped 1..3). Measure at the SAME scale or
// words are narrower than drawn and overlap.
function painterScale(style) {
  const size = parsePx(style["font-size"]) || 14;
  return Math.max(1, Math.min(3, Math.round(size / 10)));
}
function parsePx(v) { const m = String(v || "").match(/-?\d+(?:\.\d+)?/); return m ? Number(m[0]) : 0; }
function textWidth(text, style) {
  const s = String(text || "");
  if (!s) return 0;
  try {
    return measureTextWidth(s, painterScale(style), style["font-weight"] || "400", style);
  } catch {
    return s.length * (fontSizeOf(style) || 14) * 0.55;
  }
}
function lineHeightOf(style) {
  const lh = String(style["line-height"] || "").trim();
  if (lh && lh !== "normal") {
    // B"H 2026-10-09 (columns-tables): unitless line-height is a multiplier
    // of the font size (e.g. font:15px/1.4) — the old code read it as 1.4px.
    if (/^[+-]?(\d+(\.\d+)?|\.\d+)$/.test(lh)) return (fontSizeOf(style) || 14) * Number(lh);
    const v = dim(lh, fontSizeOf(style)); if (v > 0) return v;
  }
  return fontSizeOf(style) + 5;
}

// Children for inline measurement: real children, or a synthetic text node
// when the element carries its text directly in textContent (virtual DOMs
// often do this instead of materializing #text children).
function inlineKids(node) {
  const kids = renderChildren(node);
  // B"H 2026-10-09 (merkava-mass-tests lists-forms): list-style-position:
  // inside markers flow with the item's text as a leading run.
  const markInside = node.__marker && node.__marker.position === "inside" ? [syntheticMarkerText(node)] : [];
  if (kids.length) return [...markInside, ...kids];
  const t = renderOwnText(node);
  if (!t && !markInside.length) return kids;
  const out = [...markInside];
  if (t) out.push({ nodeType: 3, textContent: t, parentNode: node, localName: "#text", children: [] });
  return out;
}

/** Synthetic #text node carrying an explicit text style (list markers). */
function syntheticMarkerText(node) {
  const m = node.__marker;
  return { nodeType: 3, textContent: `${m.text} `, parentNode: node, localName: "#text", children: [], __textStyle: m.style };
}

// Flatten inline content into placeable pieces.
function inlinePieces(children, ctx) {
  const pieces = [];
  // B"H 2026-10-09 (css-worker-2): white-space decides newline handling.
  // pre/pre-wrap/pre-line preserve \n as forced line breaks; other values
  // collapse it to a space (as the old tokenizer did implicitly).
  const ws = String(ctx.whiteSpace || "").toLowerCase();
  const preserveBreaks = ws === "pre" || ws === "pre-wrap" || ws === "pre-line";
  for (const child of children) {
    if (child.nodeType === 3) {
      // B"H 2026-10-09 (merkava-mass-tests lists-forms): synthetic text
      // (list markers) carries its own style instead of the parent's.
      const style = child.__textStyle || ((child.parentNode && child.parentNode.nodeType === 1 ? styleOf(child.parentNode) : ctx.inlineStyle) || {});
      const childWs = String(style["white-space"] || "").toLowerCase() || ws;
      const childBreaks = childWs === "pre" || childWs === "pre-wrap" || childWs === "pre-line";
      // B"H 2026-10-09 (css-worker-2): word-break:break-all and
      // overflow-wrap:break-word allow breaking inside words. Split the word
      // into per-character pieces so the line breaker can wrap mid-word.
      // (break-word only breaks when the word overflows; break-all always may.)
      const wb = String(style["word-break"] || "").toLowerCase();
      const ow = String(style["overflow-wrap"] || style["word-wrap"] || "").toLowerCase();
      const breakAll = wb === "break-all" || ow === "break-all";
      const breakWord = breakAll || ow === "break-word" || ow === "anywhere";
      const tokens = String(child.textContent || "").match(/[^\s\n]+[ \t]*|\n|[ \t]+/g) || [];
      for (const tok of tokens) {
        if (tok === "\n") {
          if (childBreaks) { pieces.push({ kind: "break", w: 0, h: 0, style, node: child }); continue; }
          pieces.push({ kind: "space", w: textWidth(" ", style), h: lineHeightOf(style), style, node: child });
          continue;
        }
        if (!tok.trim()) { pieces.push({ kind: "space", w: textWidth(" ", style), h: lineHeightOf(style), style, node: child }); continue; }
        // B"H 2026-10-09: collapse a trailing whitespace RUN to one space.
        // The painter collapses \s+ anyway (drawWrappedText); measuring the
        // raw run spreads words unnaturally wide ("Multiple   spaces").
        const word = /\s$/.test(tok) ? tok.replace(/\s+$/, " ") : tok;
        if ((breakAll || breakWord) && !/^\s+$/.test(word)) {
          // Split into characters (keep a single trailing space as its own piece).
          const m2 = word.match(/^(\S+?)(\s?)$/);
          const chars = [...(m2 ? m2[1] : word)];
          for (const ch of chars) {
            pieces.push({ kind: "word", text: ch, w: textWidth(ch, style), h: lineHeightOf(style), style, node: child, charBreak: true });
          }
          if (m2 && m2[2]) pieces.push({ kind: "space", w: textWidth(" ", style), h: lineHeightOf(style), style, node: child });
          continue;
        }
        pieces.push({ kind: "word", text: word, w: textWidth(word, style), h: lineHeightOf(style), style, node: child });
      }
    } else {
      const style = styleOf(child);
      if (displayOf(style, child) === "inline") {
        const inner = inlinePieces(inlineKids(child), { ...ctx, inlineStyle: inheritFont(style), whiteSpace: String(style["white-space"] || "").toLowerCase() || ws });
        pieces.push({ kind: "box", node: child, style, w: inner.reduce((n, p) => n + p.w, 0), h: lineHeightOf(style), inner });
      } else {
        pieces.push({ kind: "atomic", node: child, style, w: 0, h: 0 });
      }
    }
  }
  return pieces;
}

function layoutInlineRun(run, parent, ctx, out, y, depth, isFirstRun) {
  const W = Math.max(1, ctx.width);
  const pStyle = parent.style || {};
  const wsValue = String(pStyle["white-space"] || "").trim().toLowerCase();
  const pieces = inlinePieces(run, { ...ctx, whiteSpace: wsValue || ctx.whiteSpace });
  const align = String(pStyle["text-align"] || "left").trim().toLowerCase();
  // B"H 2026-10-09: white-space:nowrap — everything stays on one line.
  // B"H 2026-10-09 (css-worker-2): white-space:pre also never wraps (only
  // pre-wrap / pre-line wrap).
  const nowrap = wsValue === "nowrap" || wsValue === "pre";
  // B"H 2026-10-09: text-overflow:ellipsis needs a clipped single line.
  const ovx = String(pStyle["overflow-x"] || pStyle.overflow || "visible").trim().toLowerCase();
  const ellipsis = String(pStyle["text-overflow"] || "").trim().toLowerCase() === "ellipsis"
    && (nowrap || String(pStyle["white-space"] || "").trim().toLowerCase() === "nowrap")
    && (ovx === "hidden" || ovx === "scroll" || ovx === "auto");
  let x = ctx.x, lineY = y, lineH = 0, totalH = 0;
  let lineItems = [];
  // B"H 2026-10-09 (css-worker-2): text-indent shifts the first line's start
  // rightward (first run of the block only).
  if (isFirstRun) {
    const indentPx = dim(String(pStyle["text-indent"] || ""), W);
    if (indentPx > 0) x += indentPx;
  }
  // B"H 2026-10-09: text-align — shift the whole line when center/right.
  // B"H 2026-10-09 (css-worker-2): direction:rtl defaults the line to
  // right-aligned (text-align:start), so rtl content hugs the right edge.
  const _dir = String(pStyle.direction || "").trim().toLowerCase();
  const effAlign = (align === "left" || align === "" || align === "start") && _dir === "rtl" ? "right" : align;
  const commitLine = () => {
    // B"H 2026-10-09 (css-worker-2): vertical-align for atomic inline boxes.
    // lineH is final here, so bottom/middle/top can shift each item's y.
    // Text runs keep the line top (baseline model); only boxes move.
    for (const it of lineItems) {
      const va = it.va;
      if (!va || it.kind === "#text") continue;
      const ih = Number(it.height) || 0;
      if (va === "bottom") it.y = lineY + lineH - ih;
      else if (va === "middle") it.y = lineY + (lineH - ih) / 2;
      else if (va === "top") it.y = lineY;
    }
    if (lineItems.length && (effAlign === "center" || effAlign === "right")) {
      const used = x - ctx.x;
      const extra = Math.max(0, W - used);
      const dx = effAlign === "center" ? extra / 2 : extra;
      if (dx > 0.5) for (const it of lineItems) shiftSubtreeX(it, dx);
    }
    totalH += lineH; lineY += lineH; lineH = 0; x = ctx.x; lineItems = [];
  };
  const placeWord = (p) => {
    const item = { node: minimalTextNode(p.node && p.node.parentNode), x, y: lineY, width: p.w, height: p.h, style: p.style, children: [], kind: "#text", text: p.text };
    out.push(item); parent.children.push(item); lineItems.push(item);
    x += p.w; lineH = Math.max(lineH, p.h);
  };
  for (const p of pieces) {
    if (p.kind === "space") {
      if (x === ctx.x) continue; // collapse leading space
      if (!nowrap && x + p.w > ctx.x + W + 0.5) { commitLine(); continue; }
      x += p.w; continue;
    }
    if (!nowrap && x > ctx.x && x + p.w > ctx.x + W + 0.5) commitLine();
    if (p.kind === "word") { placeWord(p); continue; }
    if (p.kind === "box") {
      // Atomic inline element: one line, no mid-element wrapping.
      const item = { node: p.node, x, y: lineY, width: Math.max(1, p.w), height: p.h, style: p.style, children: [], kind: p.node.localName || "span", va: String(p.style["vertical-align"] || "").toLowerCase() || null };
      out.push(item); parent.children.push(item); lineItems.push(item);
      let ix = x;
      for (const ip of p.inner) {
        if (ip.kind === "word") {
          const t = { node: minimalTextNode(ip.node && ip.node.parentNode), x: ix, y: lineY, width: ip.w, height: ip.h, style: ip.style, children: [], kind: "#text", text: ip.text };
          out.push(t); item.children.push(t); ix += ip.w;
        } else if (ip.kind === "space") ix += ip.w;
      }
      x += item.width; lineH = Math.max(lineH, p.h);
      continue;
    }
    if (p.kind === "atomic") {
      // B"H 2026-10-09 (merkava-mass-tests lists-forms): natural width is
      // content-box — add padding/border so padded controls (buttons, inputs)
      // don't wrap their text; honor margin-right so following content keeps
      // its gap (checkbox/label spacing).
      const chrome = horizChrome(p.style, W);
      const w = dim(p.style.width, W) || Math.max(1, Math.min(W, naturalInlineWidth(p.node, p.style, W) + chrome));
      // B"H 2026-10-09: layoutBlockBox subtracts the node's own horizontal
      // margins from ctx.width — add them back so the target border-box
      // width survives (a button with margin-right shrank and wrapped).
      const pm = box(p.style, "margin", W);
      const got = layoutBlockBox(p.node, { x, y: lineY, width: w + pm.left + pm.right, viewportHeight: ctx.viewportHeight, depth: (depth || 0) + 1, vpW: ctx.vpW, vpH: ctx.vpH, cb: ctx.cb }, out);
      if (got) { got.va = String(p.style["vertical-align"] || "").toLowerCase() || null; parent.children.push(got); lineItems.push(got); x += got.width + (got.margin ? got.margin.right : 0); lineH = Math.max(lineH, got.height); }
    }
    // B"H 2026-10-09 (css-worker-2): forced line break from white-space:pre
    // (a literal \n in the text). Commits the current line like a wrap.
    if (p.kind === "break") { commitLine(); continue; }
  }
  // Flush the final line so text-align applies to it as well.
  // B"H 2026-10-09 (css-worker-2): the final line needs the same
  // vertical-align pass as committed lines (commitLine does it, but the last
  // line never commits through it).
  if (lineItems.length) {
    for (const it of lineItems) {
      const va = it.va;
      if (!va || it.kind === "#text") continue;
      const ih = Number(it.height) || 0;
      if (va === "bottom") it.y = lineY + lineH - ih;
      else if (va === "middle") it.y = lineY + (lineH - ih) / 2;
      else if (va === "top") it.y = lineY;
    }
  }
  if (lineItems.length && (effAlign === "center" || effAlign === "right")) {
    const used = x - ctx.x;
    const extra = Math.max(0, W - used);
    const dx = effAlign === "center" ? extra / 2 : extra;
    if (dx > 0.5) for (const it of lineItems) shiftSubtreeX(it, dx);
  }
  // B"H 2026-10-09: single-line overflow gets the ellipsis treatment.
  if (nowrap && ellipsis && lineItems.length) applyEllipsis(lineItems, W);
  return totalH + lineH;
}

// B"H 2026-10-09: text-overflow:ellipsis — truncate the line at the last
// text run that fits, appending "…". Later text runs are emptied; later
// atomic boxes shift left to close the gap.
function applyEllipsis(lineItems, availW) {
  let total = 0;
  for (const it of lineItems) total += it.width || 0;
  if (total <= availW + 0.5) return;
  const ref = lineItems.find(it => it.kind === "#text" && it.style) || {};
  const style = ref.style || {};
  const ellW = textWidth("\u2026", style);
  const budget = Math.max(0, availW - ellW);
  let acc = 0, cutAt = -1;
  for (let i = 0; i < lineItems.length; i++) {
    const it = lineItems[i];
    if (it.kind === "#text" && it.text) {
      if (acc + (it.width || 0) <= budget + 0.5) { acc += it.width || 0; continue; }
      cutAt = i; break;
    }
    acc += it.width || 0;
  }
  if (cutAt < 0) return;
  const it = lineItems[cutAt];
  let t = String(it.text || "");
  while (t.length > 1 && textWidth(t, style) > budget - acc + 0.5) t = t.slice(0, -1);
  it.text = t.replace(/\s+$/, "") + "\u2026";
  it.width = textWidth(it.text, style);
  let cursor = it.x + it.width;
  for (let j = cutAt + 1; j < lineItems.length; j++) {
    const jt = lineItems[j];
    const jw = jt.kind === "#text" ? 0 : (jt.width || 0);
    if (jt.kind === "#text") { jt.text = ""; jt.width = 0; }
    if (jt.x !== cursor) shiftSubtreeX(jt, cursor - jt.x);
    cursor += jw;
  }
}

function naturalInlineWidth(node, style, availW) {
  const kids = renderChildren(node);
  // B"H 2026-10-09 (merkava-mass-tests lists-forms): a closed <select>
  // sizes to its widest option even though only one row is displayed.
  if (node.localName === "select") {
    let w = 1;
    for (const k of node.children || []) {
      if (k && k.nodeType === 1 && k.localName === "option") w = Math.max(w, textWidth(optionLabel(k), style));
    }
    return Math.max(1, w);
  }
  if (!kids.length) {
    const t = renderOwnText(node);
    return t ? textWidth(t, style) : defaultHeight(node, style);
  }
  let w = 0;
  for (const k of kids) {
    if (k.nodeType === 3) w += textWidth(k.textContent, inheritFont(style));
    else w += naturalInlineWidth(k, styleOf(k), availW);
  }
  return Math.max(1, w);
}

// Inline element reached directly: atomic box with its words on one line.
function layoutInlineBox(node, ctx, out, style) {
  const pieces = inlinePieces(inlineKids(node), { ...ctx, inlineStyle: inheritFont(style) });
  const w = Math.max(1, Math.min(Math.max(1, ctx.width), pieces.reduce((n, p) => n + p.w, 0) || 1));
  const h = lineHeightOf(style);
  const item = { node, x: ctx.x, y: ctx.y, width: w, height: h, style, children: [], kind: node.localName || "span" };
  out.push(item);
  let ix = ctx.x;
  for (const p of pieces) {
    if (p.kind === "word") {
      const t = { node: minimalTextNode(p.node && p.node.parentNode), x: ix, y: ctx.y, width: p.w, height: p.h, style: p.style, children: [], kind: "#text", text: p.text };
      out.push(t); item.children.push(t); ix += p.w;
    } else if (p.kind === "space") ix += p.w;
  }
  return item;
}

// B"H 2026-10-09: masonry layout — items pack into the shortest track.
// rowMasonry: fixed columns, items go to the shortest column (by height).
// colMasonry: fixed rows, items go to the shortest row (by width).
// Each item keeps its natural size; tracks grow independently.
function layoutMasonry(children, parent, ctx, out, rowMasonry) {
  const s = parent.style || {};
  const gaps = parseGridGap(s);
  const gap = gaps.col, rowGap = gaps.row;
  const items = children.filter(c => !hidden(c) && c.nodeType !== 3);
  const depth = (ctx.depth || 0) + 1;
  // parent IS the layout item (like layoutGrid); position children into it.
  parent.x = ctx.x; parent.y = ctx.y;

  if (rowMasonry) {
    // Fixed columns from the template; rows are masonry.
    const colText = String(s["grid-template-columns"] || "").trim();
    const cols = colText ? tracks(colText, ctx.width, gap, items.length) : [ctx.width];
    const C = Math.max(1, cols.length);
    const colX = [0];
    for (let i = 0; i < C; i++) colX.push(colX[i] + (cols[i] || 100) + gap);
    const colH = new Array(C).fill(0);
    for (const child of items) {
      // Find the shortest column.
      let c = 0;
      for (let i = 1; i < C; i++) if (colH[i] < colH[c]) c = i;
      const got = layoutBlockBox(child, { x: ctx.x + colX[c], y: ctx.y + colH[c], width: Math.max(1, cols[c] || 100), viewportHeight: ctx.viewportHeight, depth, noCollapse: true, vpW: ctx.vpW, vpH: ctx.vpH, cb: ctx.cb }, out);
      if (!got) continue;
      parent.children.push(got);
      colH[c] += got.height + rowGap;
    }
    parent.height = Math.max(0, Math.max(...colH) - rowGap);
    parent.width = ctx.width;
  } else {
    // Column masonry: items flow left-to-right, each keeping natural size.
    // (True 2D column-masonry with row tracks is rare; this covers the tests.)
    let x = 0, maxH = 0;
    for (const child of items) {
      const got = layoutBlockBox(child, { x: ctx.x + x, y: ctx.y, width: Math.max(1, ctx.width), viewportHeight: ctx.viewportHeight, depth, noCollapse: true, vpW: ctx.vpW, vpH: ctx.vpH, cb: ctx.cb }, out);
      if (!got) continue;
      parent.children.push(got);
      x += got.width + gap;
      maxH = Math.max(maxH, got.height);
    }
    parent.width = Math.max(1, x - gap);
    parent.height = maxH;
  }
  return { height: parent.height, throughTop: 0, throughBottom: 0, oof: [] };
}

function layoutGrid(children, parent, ctx, out) {
  const s = parent.style || {};
  const colText = String(s["grid-template-columns"] || "").trim(), rowText = String(s["grid-template-rows"] || "").trim();
  // B"H 2026-10-09: masonry — grid-template-rows:masonry packs items into
  // the shortest column; grid-template-columns:masonry packs into the
  // shortest row. Each item keeps its natural size (no row stretching).
  const rowMasonry = /\bmasonry\b/i.test(rowText);
  const colMasonry = /\bmasonry\b/i.test(colText);
  if (rowMasonry || colMasonry) {
    return layoutMasonry(children, parent, ctx, out, rowMasonry);
  }
  const gaps = parseGridGap(s);
  let gap = gaps.col, rowGap = gaps.row;
  // B"H 2026-10-09: subgrid — when the parent grid passed track info via
  // ctx.subgrid, use those tracks (and gap) instead of our own template.
  const sg = ctx.subgrid || null;
  const useSubCol = sg && sg.cols && sg.cols.length > 0;
  const useSubRow = sg && sg.rows && sg.rows.length > 0;
  if (useSubCol && sg.gap != null) gap = sg.gap;
  if (useSubRow && sg.rowGap != null) rowGap = sg.rowGap;
  // Grid ignores stray text nodes and hidden children.
  const items = children.filter(c => !hidden(c) && c.nodeType !== 3);
  const areaInfo = parseGridAreas(s["grid-template-areas"]);
  const colLineNames = parseGridLineNames(colText);
  const rowLineNames = parseGridLineNames(rowText);
  const flow = String(s["grid-auto-flow"] || "row").trim().toLowerCase();
  const colFlow = flow.indexOf("column") === 0;
  const dense = flow.indexOf("dense") >= 0;
  // B"H 2026-10-09: track COUNT comes from the expanded list — `200px
  // repeat(2,1fr)` is 3 tracks, not 2 (unexpanded token count was wrong).
  // Subgrid: use the parent-provided tracks directly.
  const cols = useSubCol ? sg.cols.slice() : (colText ? tracks(colText, ctx.width, gap, items.length) : []);
  const explicitCols = cols.slice();
  let C = Math.max(1, cols.length || areaInfo.cols);
  // B"H 2026-10-09: with no template columns, row flow keeps the old
  // single full-width column; column flow grows implicit columns instead
  // (sized by grid-auto-columns via ensureCols).
  if (!cols.length && !colFlow) for (let i = 0; i < C; i++) cols.push(Math.max(1, (ctx.width - gap * (C - 1)) / C));
  const rowTokens = rowText ? expandRepeat(rowText, ctx.height || 0, rowGap, Math.ceil(items.length / C)) : [];
  const explicitRows = rowTokens.length ? tracks(rowText, ctx.height || 0, rowGap, Math.ceil(items.length / C)) : [];
  // B"H 2026-10-09: implicit track sizing from grid-auto-rows/columns.
  // A fixed length sizes implicit tracks exactly; `auto` (default) stays
  // content-sized as before.
  const autoRowFixed = dim(String(s["grid-auto-rows"] || "auto").trim(), ctx.height || 0) || 0;
  const autoColFixed = dim(String(s["grid-auto-columns"] || "auto").trim(), ctx.width) || 0;
  // B"H 2026-10-09: place-items shorthand sets both alignments.
  let justifyItems = gridAlignValue(s["justify-items"], "stretch");
  let alignItems = gridAlignValue(s["align-items"], "stretch");
  const pi = String(s["place-items"] || "").trim().split(/\s+/).filter(Boolean);
  if (pi.length === 1) { const v = gridAlignValue(pi[0], "stretch"); alignItems = v; justifyItems = v; }
  else if (pi.length >= 2) { alignItems = gridAlignValue(pi[0], alignItems); justifyItems = gridAlignValue(pi[1], justifyItems); }
  const depth = (ctx.depth || 0) + 1;
  // B"H 2026-10-09: grid auto-placement — explicit grid-column/grid-row
  // (line numbers, named lines, `span N`), grid-area shorthand, named
  // template areas, `order`-sorted auto-placement, row AND column flow.
  const occ = new Set();
  const key = (r, c) => r + ":" + c;
  const fits = (r, c, cs2, rs2) => {
    for (let rr = r; rr < r + rs2; rr++) for (let cc = c; cc < c + cs2; cc++) if (occ.has(key(rr, cc))) return false;
    return true;
  };
  const occupy = (r, c, cs2, rs2) => { for (let rr = r; rr < r + rs2; rr++) for (let cc = c; cc < c + cs2; cc++) occ.add(key(rr, cc)); };
  // Grow implicit columns (sized by grid-auto-columns, else mean explicit width).
  const ensureCols = (n) => {
    while (cols.length < n) {
      const w = autoColFixed > 0 ? autoColFixed
        : (explicitCols.length ? sum(explicitCols, 0, explicitCols.length) / explicitCols.length : Math.max(1, ctx.width));
      cols.push(Math.max(1, w));
    }
    if (cols.length > C) C = cols.length;
  };
  const resolveLine = (v, isCol) => {
    if (v > 0) return v;
    if (v < 0) { const n = (isCol ? C : Math.max(explicitRows.length, 1)) + 2 + v; return Math.max(1, n); }
    return 0;
  };
  // `order` reorders auto-placement (stable); paint order stays DOM order.
  const domIdx = new Map(items.map((c, i) => [c, i]));
  const placeSeq = items.slice().sort((a, b) => (num(styleOf(a).order, 0) - num(styleOf(b).order, 0)) || (domIdx.get(a) - domIdx.get(b)));
  const R = Math.max(1, explicitRows.length || areaInfo.rows); // explicit row count (column-flow wrap limit)
  let curR = 1, curC = 1;
  const placed = [];
  for (const child of placeSeq) {
    const st = styleOf(child);
    const areaName = String(st["grid-area"] || "").trim();
    let pr = 0, pc = 0, rs = 1, cs = 1;
    const area = areaName && areaInfo.map[areaName];
    if (area) { pr = area.rs; pc = area.cs; rs = area.re - area.rs; cs = area.ce - area.cs; }
    else {
      let gpC = parseLinePlacement(st["grid-column"], colLineNames);
      let gpR = parseLinePlacement(st["grid-row"], rowLineNames);
      const ga = parseGridAreaShorthand(areaName);
      if (ga) {
        gpR = parseLinePlacement(ga.row, rowLineNames);
        gpC = parseLinePlacement(ga.col, colLineNames);
      }
      cs = gpC.span; rs = gpR.span;
      if (gpR.start) pr = resolveLine(gpR.start, false);
      if (gpC.start) pc = resolveLine(gpC.start, true);
    }
    if (pr && pc) { ensureCols(pc + cs - 1); occupy(pr, pc, cs, rs); }
    else if (pr && !pc) {
      let c = 1, r = pr, guard = 0;
      if (colFlow) { while (!fits(r, c, cs, rs) && guard++ < 100000) c++; }
      else { while (!fits(r, c, cs, rs) && guard++ < 100000) { c++; if (c + cs - 1 > C) { c = 1; r++; } } }
      pc = c; pr = r; ensureCols(pc + cs - 1); occupy(pr, pc, cs, rs);
    }
    else if (pc && !pr) {
      let r = 1, guard = 0;
      if (colFlow) { while ((r + rs - 1 > R || !fits(r, pc, cs, rs)) && guard++ < 100000) r++; }
      else { while (!fits(r, pc, cs, rs) && guard++ < 100000) r++; }
      pr = r; ensureCols(pc + cs - 1); occupy(pr, pc, cs, rs);
    }
    else if (colFlow) {
      // B"H 2026-10-09: grid-auto-flow:column — fill down, wrap to a new
      // (implicit) column past the explicit row count.
      let r = dense ? 1 : curR, c = dense ? 1 : curC, guard = 0;
      for (;;) {
        if (r + rs - 1 <= R && fits(r, c, cs, rs)) break;
        r++;
        if (r + rs - 1 > R) { r = 1; c++; }
        if (guard++ > 100000) break;
      }
      pr = r; pc = c; ensureCols(pc + cs - 1); occupy(pr, pc, cs, rs);
      curR = r + rs; curC = c;
      if (curR + rs - 1 > R) { curR = 1; curC = c + 1; }
    }
    else {
      let r = dense ? 1 : curR, c = dense ? 1 : curC, guard = 0;
      while (!fits(r, c, cs, rs) && guard++ < 100000) { c++; if (c + cs - 1 > C) { c = 1; r++; } }
      pr = r; pc = c; ensureCols(pc + cs - 1); occupy(pr, pc, cs, rs);
      curC = c + cs; curR = r;
      if (curC > C) { curC = 1; curR = r + 1; }
    }
    placed.push({ child, st, pr, pc, rs, cs, dom: domIdx.get(child) });
  }
  // Paint order is DOM order even when `order` reshuffled placement.
  placed.sort((a, b) => a.dom - b.dom);
  // B"H 2026-10-09: justify-content / align-content — position the track
  // grid inside the container (start/center/end + space distribution).
  const jc = String(s["justify-content"] || "start").trim().toLowerCase();
  const tracksW = sum(cols, 0, cols.length) + gap * Math.max(0, cols.length - 1);
  const freeW = Math.max(0, ctx.width - tracksW);
  let xLead = 0, xGap = gap;
  if (jc === "center") xLead = freeW / 2;
  else if (jc === "end" || jc === "flex-end" || jc === "right") xLead = freeW;
  else if ((jc === "space-between" || jc === "space-around" || jc === "space-evenly") && cols.length > 0) {
    if (jc === "space-between" && cols.length > 1) xGap = gap + freeW / (cols.length - 1);
    else if (jc === "space-around") { xLead = freeW / (cols.length * 2); xGap = gap + freeW / cols.length; }
    else if (jc === "space-evenly") { xLead = freeW / (cols.length + 1); xGap = gap + xLead; }
  }
  const colX = [xLead];
  for (let i = 0; i < cols.length; i++) colX.push(colX[i] + cols[i] + xGap);
  const rowHeights = [];
  explicitRows.forEach((h, i) => { rowHeights[i] = h; });
  // B"H 2026-10-09: subgrid rows — use the parent's row track heights.
  if (useSubRow) {
    for (let i = 0; i < sg.rows.length; i++) rowHeights[i] = sg.rows[i];
  }
  // Pass 1: lay out each item at its column x (y=0); record natural heights.
  const laid = [];
  for (const p of placed) {
    const cellW = sum(cols, p.pc - 1, p.pc - 1 + p.cs) + xGap * (p.cs - 1);
    const js = gridAlignValue(p.st["justify-self"], justifyItems);
    const as = gridAlignValue(p.st["align-self"], alignItems);
    const explicitW = dim(p.st.width, cellW);
    // B"H 2026-10-09: stretch only sizes auto-width items — a definite
    // width is kept (it was wrongly stretched to the full cell before).
    const itemW = explicitW > 0 ? Math.min(cellW, explicitW) : cellW;
    // B"H 2026-10-09: subgrid — a grid item with grid-template-columns:subgrid
    // (or rows) inherits the parent grid's tracks for the spanned range.
    // Pass the parent's track sizes/positions/gap through ctx.
    const pColText = String(p.st["grid-template-columns"] || "").trim().toLowerCase();
    const pRowText = String(p.st["grid-template-rows"] || "").trim().toLowerCase();
    const isSubCol = pColText === "subgrid" || pColText.split(/\s+/).includes("subgrid");
    const isSubRow = pRowText === "subgrid" || pRowText.split(/\s+/).includes("subgrid");
    let subgridCtx = null;
    if ((isSubCol || isSubRow) && String(p.st.display || "").trim().toLowerCase().includes("grid")) {
      subgridCtx = {
        cols: isSubCol ? cols.slice(p.pc - 1, p.pc - 1 + p.cs) : null,
        colX: isSubCol ? colX.slice(p.pc - 1, p.pc - 1 + p.cs).map(x => x - colX[p.pc - 1]) : null,
        gap: isSubCol ? xGap : null,
        rows: isSubRow ? rowHeights.slice(p.pr - 1, p.pr - 1 + p.rs) : null,
        rowGap: isSubRow ? rowGap : null,
      };
    }
    const got = layoutBlockBox(p.child, { x: ctx.x + colX[p.pc - 1], y: 0, width: Math.max(1, itemW), viewportHeight: ctx.viewportHeight, depth, noCollapse: true, vpW: ctx.vpW, vpH: ctx.vpH, cb: ctx.cb, subgrid: subgridCtx }, out);
    if (!got) continue;
    parent.children.push(got);
    laid.push({ ...p, got, cellW, js, as });
    if (p.rs === 1) {
      const idx = p.pr - 1;
      if (explicitRows[idx] == null) {
        rowHeights[idx] = autoRowFixed > 0 ? autoRowFixed : Math.max(rowHeights[idx] || 0, got.height);
      }
    }
  }
  // Row-spanning items grow the last implicit row they cover when needed.
  for (const l of laid) {
    if (l.rs > 1) {
      let have = rowGap * (l.rs - 1), lastImplicit = -1;
      for (let rr = l.pr; rr < l.pr + l.rs; rr++) {
        have += rowHeights[rr - 1] || 0;
        if (explicitRows[rr - 1] == null && autoRowFixed <= 0) lastImplicit = rr - 1;
      }
      if (lastImplicit >= 0 && l.got.height > have) rowHeights[lastImplicit] += l.got.height - have;
    }
  }
  // B"H 2026-10-09: align-content — offset the row grid inside an
  // explicit-height container (auto height => no free space => no-op).
  const nRows = rowHeights.length;
  const tracksH = sum(rowHeights, 0, nRows) + rowGap * Math.max(0, nRows - 1);
  const alignBoxH = ctx.height > 0 ? ctx.height : tracksH;
  const freeH = Math.max(0, alignBoxH - tracksH);
  const ac = String(s["align-content"] || "start").trim().toLowerCase();
  let yLead = 0, yGap = rowGap;
  if (ac === "center") yLead = freeH / 2;
  else if (ac === "end" || ac === "flex-end") yLead = freeH;
  else if ((ac === "space-between" || ac === "space-around" || ac === "space-evenly") && nRows > 0) {
    if (ac === "space-between" && nRows > 1) yGap = rowGap + freeH / (nRows - 1);
    else if (ac === "space-around") { yLead = freeH / (nRows * 2); yGap = rowGap + freeH / nRows; }
    else if (ac === "space-evenly") { yLead = freeH / (nRows + 1); yGap = rowGap + yLead; }
  }
  // Pass 2: final y positions + justify/align within each cell.
  const rowY = [yLead];
  for (let i = 0; i < nRows; i++) rowY.push(rowY[i] + (rowHeights[i] || 0) + yGap);
  for (const l of laid) {
    const cellH = sum(rowHeights, l.pr - 1, l.pr - 1 + l.rs) + yGap * (l.rs - 1);
    shiftSubtree(l.got, ctx.y + rowY[l.pr - 1] - l.got.y);
    let dx = 0;
    if (l.js === "center") dx = (l.cellW - l.got.width) / 2;
    else if (l.js === "end") dx = l.cellW - l.got.width;
    if (dx) shiftSubtreeX(l.got, dx);
    const explicitH = dim(l.st.height, 0) > 0;
    if (l.as === "stretch" && !explicitH && l.got.height < cellH) l.got.height = cellH;
    else if (l.as === "center" || l.as === "end") {
      const dy = l.as === "center" ? (cellH - l.got.height) / 2 : cellH - l.got.height;
      if (dy > 0) shiftSubtree(l.got, dy);
    }
  }
  return { height: nRows ? rowY[nRows] - yGap - yLead : 0, oof: [] };
}

// B"H 2026-10-09: map [name] line names in a track list to 1-based line
// numbers (`[start]200px [mid] 1fr [end]` => start:1, mid:2, end:3).
function parseGridLineNames(text) {
  const map = {};
  let line = 1;
  for (const tok of splitTrackList(String(text || ""))) {
    const names = [];
    const bare = String(tok).replace(/\[([^\]]*)\]/g, (m, n) => { if (String(n).trim()) names.push(String(n).trim()); return " "; }).trim();
    for (const n of names) { (map[n] = map[n] || []).push(line); }
    if (bare) line++;
  }
  return map;
}

// B"H 2026-10-09: parse the `grid-area: r1/c1/r2/c2` shorthand (2 or 4
// parts) into {row, col} placement strings for parseLinePlacement.
// Returns null for named areas (handled by the template-areas map).
function parseGridAreaShorthand(v) {
  const t = String(v || "").trim();
  if (!t || t.indexOf("/") < 0) return null;
  const parts = t.split("/").map(x => x.trim());
  if (parts.length !== 2 && parts.length !== 4) return null;
  const ok = (p) => /^(auto|span\s+\d+|-?\d+|[a-zA-Z_][\w-]*)$/.test(p);
  if (!parts.every(ok)) return null;
  if (parts.length === 2) return { row: parts[0], col: parts[1] };
  return { row: parts[0] + "/" + parts[2], col: parts[1] + "/" + parts[3] };
}

// B"H 2026-10-09: grid gap parsing — `gap: 16px 32px` is row 16 / column 32;
// row-gap/column-gap longhands override the shorthand.
function parseGridGap(s) {
  let row = 0, col = 0;
  const g = String(s.gap || "").trim();
  if (g) {
    const parts = g.split(/\s+/);
    if (parts.length === 1) row = col = px(parts[0]);
    else { row = px(parts[0]); col = px(parts[1]); }
  }
  if (String(s["row-gap"] || "").trim() !== "") row = px(s["row-gap"]);
  if (String(s["column-gap"] || "").trim() !== "") col = px(s["column-gap"]);
  return { row, col };
}

// B"H 2026-10-09: parse `grid-template-areas: "a a b" "c c c"` into
// name -> {rs, cs, re, ce} 1-based line rectangles.
function parseGridAreas(text) {
  const rows = [];
  // B"H: handle both single and double quotes (HTML style attrs often use single).
  const re = /"([^"]*)"|'([^']*)'/g;
  let m;
  while ((m = re.exec(String(text || "")))) {
    const content = m[1] !== undefined ? m[1] : m[2];
    rows.push(content.trim().split(/\s+/).filter(Boolean));
  }
  const map = {};
  rows.forEach((cells, r) => cells.forEach((name, c) => {
    if (!name || name === ".") return;
    const a = map[name] || (map[name] = { rs: r + 1, cs: c + 1, re: r + 2, ce: c + 2 });
    a.rs = Math.min(a.rs, r + 1); a.cs = Math.min(a.cs, c + 1);
    a.re = Math.max(a.re, r + 2); a.ce = Math.max(a.ce, c + 2);
  }));
  return { map, rows: rows.length, cols: Math.max(0, ...rows.map(r => r.length)) };
}

// B"H 2026-10-09: parse `grid-column`/`grid-row` values like "1/3", "2",
// "span 2", "auto", and named lines ("mid/end" via the line-name map)
// into {start, span}.
function parseLinePlacement(v, lineNames) {
  const t = String(v || "").trim().toLowerCase();
  if (!t || t === "auto") return { start: 0, span: 1 };
  const names = lineNames || {};
  const val = (tok) => {
    if (!tok) return {};
    const spm = String(tok).match(/span\s+(\d+)/i);
    if (spm) return { span: Number(spm[1]) };
    const nm = names[tok];
    if (nm && nm.length) return { start: nm[0] };
    const m = String(tok).match(/^(-?\d+)/);
    if (m) return { start: Number(m[1]) };
    return {};
  };
  const parts = t.split("/").map(x => x.trim());
  const a = val(parts[0]), b = val(parts[1]);
  let start = 0, span = 1;
  if (a.span) span = a.span; else if (a.start) start = a.start;
  if (b.span) span = b.span;
  else if (b.start) { if (start) span = Math.max(1, b.start - start); else start = b.start; }
  return { start, span };
}

function gridAlignValue(v, fallback) {
  const t = String(v || "").trim().toLowerCase();
  if (!t || t === "auto") return fallback;
  if (t === "start" || t === "flex-start" || t === "left") return "start";
  if (t === "end" || t === "flex-end" || t === "right") return "end";
  if (t === "center") return "center";
  return "stretch";
}

function num(v, fallback) { const n = Number(String(v || "").trim()); return Number.isFinite(n) ? n : fallback; }

// B"H: flexbox — row + column, wrap lines, justify-content, align-items,
// flex-grow / flex-shrink / flex-basis. Items are blockified per CSS.
function layoutFlex(children, parent, ctx, out) {
  const s = parent.style || {};
  // B"H 2026-10-09: flex-flow shorthand sets direction + wrap; explicit
  // longhands win over the shorthand's values.
  const ff = String(s["flex-flow"] || "").trim().toLowerCase().split(/\s+/).filter(Boolean);
  let dir = String(s["flex-direction"] || "").trim().toLowerCase();
  let wrap = String(s["flex-wrap"] || "").trim().toLowerCase();
  for (const t of ff) {
    if (t === "row" || t === "row-reverse" || t === "column" || t === "column-reverse") { if (!dir) dir = t; }
    else if (t === "nowrap" || t === "wrap" || t === "wrap-reverse") { if (!wrap) wrap = t; }
  }
  dir = dir || "row"; wrap = wrap || "nowrap";
  const opts = { rev: dir === "row-reverse" || dir === "column-reverse", wrapRev: wrap === "wrap-reverse", wrap: wrap !== "nowrap" };
  if (dir.indexOf("column") === 0) return layoutFlexColumn(children, parent, ctx, out, opts);
  return layoutFlexRow(children, parent, ctx, out, opts);
}

// B"H 2026-10-09: true when the margin on `side` is `auto` (longhand or
// shorthand). `dim()` collapses auto to 0, so this reads the raw value.
function isAutoMargin(style, side) {
  const s = style || {};
  const long = String(s["margin-" + side] || "").trim().toLowerCase();
  if (long) return long === "auto";
  const parts = String(s.margin || "").trim().toLowerCase().split(/\s+/).filter(Boolean);
  let v = "";
  if (parts.length === 1) v = parts[0];
  else if (parts.length === 2) v = (side === "top" || side === "bottom") ? parts[0] : parts[1];
  else if (parts.length === 3) v = side === "top" ? parts[0] : side === "bottom" ? parts[2] : parts[1];
  else if (parts.length >= 4) v = { top: parts[0], right: parts[1], bottom: parts[2], left: parts[3] }[side] || "";
  return v === "auto";
}

function layoutFlexRow(children, parent, ctx, out, opts) {
  const s = parent.style || {};
  const o = opts || {};
  const W = Math.max(1, ctx.width);
  const gap = px(s.gap || s["column-gap"] || 0);
  const rowGap = px(s["row-gap"] || s.gap || 0);
  const justify = String(s["justify-content"] || "flex-start").trim().toLowerCase();
  const align = String(s["align-items"] || "stretch").trim().toLowerCase();
  const wrap = !!o.wrap;
  const items = children.filter(c => !hidden(c)).map(child => {
    const st = styleOf(child);
    return { child, style: st, basis: Math.max(0, Math.min(W, flexBasis(child, st, W))), grow: num(st["flex-grow"], 0), shrink: num(st["flex-shrink"], 1), order: num(st.order, 0) };
  });
  // B"H 2026-10-09: `order` reorders visual placement (stable for ties).
  items.forEach((it, i) => { it.idx = i; });
  items.sort((a, b) => (a.order - b.order) || (a.idx - b.idx));
  const lines = [[]];
  let lineW = 0;
  for (const it of items) {
    const next = lineW ? lineW + gap + it.basis : it.basis;
    if (wrap && lines.at(-1).length && next > W + 0.5) { lines.push([]); lineW = 0; }
    lines.at(-1).push(it);
    lineW = lineW ? lineW + gap + it.basis : it.basis;
  }
  const depth = (ctx.depth || 0) + 1;
  let y = ctx.y, total = 0;
  const lineStarts = [], lineHs = [], lineLaid = [];
  for (const line of lines) {
    if (!line.length) continue;
    // Resolve flexible lengths against free space.
    const baseSum = line.reduce((n, it) => n + it.basis, 0);
    const gaps = gap * Math.max(0, line.length - 1);
    const free0 = W - baseSum - gaps;
    if (free0 > 0) {
      const gSum = line.reduce((n, it) => n + it.grow, 0);
      for (const it of line) it.main = it.basis + (gSum > 0 ? free0 * it.grow / gSum : 0);
    } else if (free0 < 0) {
      const sSum = line.reduce((n, it) => n + it.shrink * it.basis, 0) || 1;
      for (const it of line) it.main = Math.max(1, it.basis + free0 * (it.shrink * it.basis) / sSum);
    } else for (const it of line) it.main = it.basis;
    const used = line.reduce((n, it) => n + it.main, 0) + gaps;
    const extra = Math.max(0, W - used);
    // B"H 2026-10-09: auto main-axis margins absorb free space before
    // justify-content (which is then a no-op for the line).
    let nAutoMain = 0;
    for (const it of line) {
      it.mlAuto = isAutoMargin(it.style, "left");
      it.mrAuto = isAutoMargin(it.style, "right");
      if (it.mlAuto) nAutoMain++;
      if (it.mrAuto) nAutoMain++;
    }
    const autoMain = (nAutoMain > 0 && extra > 0) ? extra / nAutoMain : 0;
    let x = ctx.x, between = gap;
    if (autoMain > 0) { /* auto margins take the free space; no justify */ }
    else if (justify === "center") x = ctx.x + extra / 2;
    else if (justify === "flex-end" || justify === "end" || justify === "right") x = ctx.x + extra;
    else if (justify === "space-between" && line.length > 1) between = gap + extra / (line.length - 1);
    else if (justify === "space-around" && line.length) { x = ctx.x + extra / (line.length * 2); between = gap + extra / line.length; }
    else if (justify === "space-evenly" && line.length) { x = ctx.x + extra / (line.length + 1); between = gap + extra / (line.length + 1); }
    const laid = [];
    for (const it of line) {
      if (autoMain > 0 && it.mlAuto) x += autoMain;
      const got = layoutBlockBox(it.child, { x, y, width: it.main, viewportHeight: ctx.viewportHeight, depth, noCollapse: true, vpW: ctx.vpW, vpH: ctx.vpH, cb: ctx.cb }, out);
      if (got) { parent.children.push(got); laid.push({ it, got }); }
      x += it.main + between;
      if (autoMain > 0 && it.mrAuto) x += autoMain;
    }
    const lineH = laid.reduce((n, l) => Math.max(n, l.got.height), 0);
    // B"H 2026-10-09: align-items:baseline — align first baselines
    // (approximated as 0.8em from the item top for text items).
    const baseAlign = laid.some(l => String(l.it.style["align-self"] || align).trim().toLowerCase() === "baseline");
    let maxBase = 0;
    if (baseAlign) for (const l of laid) maxBase = Math.max(maxBase, flexBaselineOf(l.it));
    for (const { it, got } of laid) {
      const selfAlign = String(it.style["align-self"] || align).trim().toLowerCase();
      let dy = 0;
      if (selfAlign === "baseline") dy = maxBase - flexBaselineOf(it);
      else if (selfAlign === "center") dy = (lineH - got.height) / 2;
      else if (selfAlign === "flex-end" || selfAlign === "end") dy = lineH - got.height;
      else if (selfAlign === "stretch" && !measuredHeight(it.child, it.style, 0) && got.height < lineH) got.height = lineH;
      if (dy) shiftSubtree(got, dy);
    }
    y += lineH + rowGap; total += lineH + rowGap;
    lineStarts.push(lineStarts.length ? y - lineH - rowGap : ctx.y);
    lineHs.push(lineH);
    lineLaid.push(laid);
  }
  const H = Math.max(0, total - rowGap);
  // B"H 2026-10-09: align-content distributes flex lines across the
  // container's cross size (needs an explicit container height).
  const ac = String(s["align-content"] || "stretch").trim().toLowerCase();
  const containerH = Math.max(H, dim(s.height, ctx.viewportHeight || 0) || 0);
  const extra = Math.max(0, containerH - H);
  const n = lineLaid.length;
  let startY = ctx.y, between = rowGap;
  if (extra > 0 && n > 0) {
    if (ac === "stretch") {
      // B"H: align-content:stretch (default) — grow lines to fill the container's
      // cross size, then stretch items within their line per align-items.
      const addPer = extra / n;
      for (let li = 0; li < n; li++) {
        const newLineH = lineHs[li] + addPer;
        for (const l of lineLaid[li]) {
          const selfAlign = String(l.it.style["align-self"] || align).trim().toLowerCase();
          if (selfAlign === "stretch" && !measuredHeight(l.it.child, l.it.style, 0)) {
            l.got.height = newLineH;
          } else if (selfAlign === "center") {
            shiftSubtree(l.got, addPer / 2);
          } else if (selfAlign === "flex-end" || selfAlign === "end") {
            shiftSubtree(l.got, addPer);
          }
        }
        lineHs[li] = newLineH;
      }
    }
    else if (ac === "center") startY = ctx.y + extra / 2;
    else if (ac === "flex-end" || ac === "end") startY = ctx.y + extra;
    else if (ac === "space-between" && n > 1) between = rowGap + extra / (n - 1);
    else if (ac === "space-around") { startY = ctx.y + extra / (2 * n); between = rowGap + extra / n; }
    else if (ac === "space-evenly") { startY = ctx.y + extra / (n + 1); between = rowGap + extra / (n + 1); }
  }
  let ly = startY;
  // B"H 2026-10-09: wrap-reverse mirrors lines about the container's cross
  // extent (first line ends up at the bottom).
  const spanTotal = lineHs.reduce((n, h) => n + h, 0) + between * Math.max(0, n - 1);
  for (let li = 0; li < n; li++) {
    let dy = ly - lineStarts[li];
    if (o.wrapRev) {
      const y0 = lineStarts[li] + dy;
      dy = (2 * startY + spanTotal - y0 - lineHs[li]) - lineStarts[li];
    }
    if (dy) for (const l of lineLaid[li]) shiftSubtree(l.got, dy);
    // B"H 2026-10-09: auto cross-axis margins absorb the line's free space.
    for (const l of lineLaid[li]) {
      const freeC = lineHs[li] - l.got.height;
      if (freeC <= 0) continue;
      const mtA = isAutoMargin(l.it.style, "top"), mbA = isAutoMargin(l.it.style, "bottom");
      if (mtA && mbA) shiftSubtree(l.got, freeC / 2);
      else if (mtA) shiftSubtree(l.got, freeC);
    }
    ly += lineHs[li] + between;
  }
  // B"H 2026-10-09: row-reverse — mirror items about the container's
  // vertical center line (order + justify already resolved above).
  if (o.rev) {
    for (const laid of lineLaid) for (const l of laid) {
      const nx = ctx.x + W - (l.got.x - ctx.x) - l.got.width;
      shiftSubtreeX(l.got, nx - l.got.x);
    }
  }
  return { height: H, oof: [] };
}

// B"H 2026-10-09: first-baseline offset of a flex item from its top,
// approximated as 0.8em of its font size (covers the text-item tests).
function flexBaselineOf(it) {
  const fs = dim((it.style || {})["font-size"], 0) || 14;
  return fs * 0.8;
}

function layoutFlexColumn(children, parent, ctx, out, opts) {
  const s = parent.style || {};
  const o = opts || {};
  const W = Math.max(1, ctx.width);
  const gap = px(s.gap || s["row-gap"] || 0);
  const colGap = px(s["column-gap"] || s.gap || 0);
  const justify = String(s["justify-content"] || "flex-start").trim().toLowerCase();
  const align = String(s["align-items"] || "stretch").trim().toLowerCase();
  const wrap = !!o.wrap;
  const depth = (ctx.depth || 0) + 1;
  const items = children.filter(c => !hidden(c)).map(child => {
    const st = styleOf(child);
    const selfAlign = String(st["align-self"] || align).trim().toLowerCase();
    const w = selfAlign === "stretch" ? W : Math.max(1, Math.min(W, dim(st.width, W) || naturalInlineWidth(child, st, W)));
    return { child, style: st, selfAlign, w, order: num(st.order, 0) };
  });
  // B"H 2026-10-09: `order` reorders visual placement (stable for ties).
  items.forEach((it, i) => { it.idx = i; });
  items.sort((a, b) => (a.order - b.order) || (a.idx - b.idx));
  // Measure pass at y=0, then shift subtrees to final positions.
  const laid = [];
  for (const it of items) {
    const got = layoutBlockBox(it.child, { x: ctx.x, y: 0, width: it.w, viewportHeight: ctx.viewportHeight, depth, noCollapse: true, vpW: ctx.vpW, vpH: ctx.vpH, cb: ctx.cb }, out);
    if (got) { parent.children.push(got); laid.push({ it, got }); }
  }
  // B"H 2026-10-09: column wrap — break into columns against the
  // container's explicit height (no wrap => a single column).
  const explicitH = dim(s.height, ctx.viewportHeight || 0) || 0;
  const maxMain = wrap && explicitH > 0 ? explicitH : Infinity;
  const cols = [[]];
  let colH = 0;
  for (const l of laid) {
    const next = colH ? colH + gap + l.got.height : l.got.height;
    if (cols[cols.length - 1].length && next > maxMain + 0.5) { cols.push([]); colH = 0; }
    cols[cols.length - 1].push(l);
    colH = colH ? colH + gap + l.got.height : l.got.height;
  }
  let x = ctx.x, totalW = 0;
  const colXs = [];
  for (const col of cols) {
    if (!col.length) continue;
    const contentH = col.reduce((n, l) => n + l.got.height, 0) + gap * Math.max(0, col.length - 1);
    const containerH = Math.max(contentH, explicitH);
    const extra = Math.max(0, containerH - contentH);
    let y = ctx.y, between = gap;
    if (justify === "center") y = ctx.y + extra / 2;
    else if (justify === "flex-end" || justify === "end") y = ctx.y + extra;
    else if (justify === "space-between" && col.length > 1) between = gap + extra / (col.length - 1);
    else if (justify === "space-around" && col.length) { y = ctx.y + extra / (col.length * 2); between = gap + extra / col.length; }
    else if (justify === "space-evenly" && col.length) { y = ctx.y + extra / (col.length + 1); between = gap + extra / (col.length + 1); }
    const colW = Math.max(1, col.reduce((n, l) => Math.max(n, l.got.width), 0));
    // B"H: a lone column aligns items within the container width; wrapped
    // columns size to their content like flex lines do.
    const crossW = (!wrap || cols.length <= 1) ? W : colW;
    colXs.push({ x, col, colW, crossW, y0: y, between });
    for (const l of col) {
      const targetY = y + l.got.margin.top;
      shiftSubtree(l.got, targetY - l.got.y);
      let dx = 0;
      if (l.it.selfAlign === "center") dx = x + (crossW - l.got.width) / 2 - l.got.x;
      else if (l.it.selfAlign === "flex-end" || l.it.selfAlign === "end" || l.it.selfAlign === "right") dx = x + crossW - l.got.width - l.got.x;
      else if (l.it.selfAlign === "stretch") dx = x - l.got.x;
      // B"H 2026-10-09: auto cross-axis margins (margin-left/right:auto)
      // absorb the column's free inline space.
      const freeI = crossW - l.got.width;
      if (freeI > 0) {
        const mlA = isAutoMargin(l.it.style, "left"), mrA = isAutoMargin(l.it.style, "right");
        if (mlA && mrA) dx = x + freeI / 2 - l.got.x;
        else if (mlA) dx = x + freeI - l.got.x;
        else if (mrA) dx = x - l.got.x;
      }
      if (dx) shiftSubtreeX(l.got, dx);
      y += l.got.height + between;
    }
    x += colW + colGap;
    totalW += colW + colGap;
  }
  if (cols.length && cols[cols.length - 1].length) totalW -= colGap;
  const retH = Math.max(laid.reduce((n, l) => n + l.got.height, 0) + gap * Math.max(0, laid.length - 1), explicitH);
  // B"H 2026-10-09: column-reverse — mirror items about the container's
  // horizontal center line; wrap-reverse — mirror columns about the
  // container's vertical center line.
  if (o.rev) {
    const boxH = Math.max(explicitH, retH);
    for (const l of laid) {
      const ny = ctx.y + boxH - (l.got.y - ctx.y) - l.got.height;
      shiftSubtree(l.got, ny - l.got.y);
    }
  }
  if (o.wrapRev && colXs.length > 1) {
    // B"H 2026-10-09: wrap-reverse — mirror each column about the
    // container's vertical center line (first column ends up at the right).
    const boxW = Math.max(W, totalW);
    for (const c of colXs) {
      const nx = ctx.x + boxW - (c.x - ctx.x) - c.colW;
      const dx = nx - c.x;
      if (dx) for (const l of c.col) shiftSubtreeX(l.got, dx);
    }
  }
  return { height: retH, oof: [] };
}
// B"H 2026-10-09: explicit widths are honored even past the containing block
// (overflow then clips/paints them); only the auto case fills the container.
function measuredWidth(node, s, avail) {
  const explicit = dim(s.width, avail);
  let w;
  if (explicit) w = explicit;
  else if (node.localName === "canvas") w = dim(node.attributes?.width || node.width, avail) || avail;
  else w = avail;
  // B"H 2026-10-09 (css-worker-2): min-width/max-width clamp the used width
  // (CSS 2.1 §10.4). Previously ignored entirely.
  const minW = dim(s["min-width"], avail);
  const maxW = dim(s["max-width"], avail);
  if (minW > 0) w = Math.max(w, minW);
  if (maxW > 0) w = Math.min(w, maxW);
  return w;
}
function measuredHeight(node, s, parent) { return dim(s.height, parent) || (node.localName === "canvas" ? dim(node.attributes?.height || node.height, parent) : 0); }
function flexBasis(node, style, parent) {
  const s = style || styleOf(node);
  // B"H 2026-10-09: an explicit flex-basis (including 0 / 0%) is authoritative;
  // only `auto`/unset falls through to width, then content.
  const fbRaw = String(s["flex-basis"] || "").trim().toLowerCase();
  if (fbRaw && fbRaw !== "auto") return Math.max(0, dim(fbRaw, parent));
  const w = dim(s.width, parent);
  if (w) return w;
  if (node.localName === "canvas") return Math.max(1, dim(node.attributes?.width || node.width, parent) || 0);
  const own = renderOwnText(node);
  if (own) return Math.max(1, textWidth(own, s));
  // B"H 2026-10-09: a nested flex container's max-content follows ITS flex
  // layout — a row sums children (+gaps), a column takes the widest.
  const disp = String(s.display || "").trim().toLowerCase();
  if (disp === "flex" || disp === "inline-flex") {
    const ff = String(s["flex-flow"] || "").trim().toLowerCase().split(/\s+/).filter(Boolean);
    let ddir = String(s["flex-direction"] || "").trim().toLowerCase();
    for (const t of ff) if (t === "row" || t === "row-reverse" || t === "column" || t === "column-reverse") { if (!ddir) ddir = t; }
    const isRow = ddir.indexOf("column") !== 0;
    const fg = px(s.gap || s["column-gap"] || 0);
    let total = 0, count = 0, widest = 0;
    for (const k of (node.children || [])) {
      if (hidden(k) || !k || k.nodeType !== 1) continue;
      const ks = styleOf(k);
      const pad = box(ks, "padding", parent);
      const kw = dim(ks.width, parent);
      const outer = (kw > 0 ? kw : naturalInlineWidth(k, ks, parent)) + pad.left + pad.right;
      if (isRow) { total += outer; count++; }
      else widest = Math.max(widest, outer);
    }
    return Math.max(1, isRow ? total + fg * Math.max(0, count - 1) : widest);
  }
  // B"H 2026-10-09: content-driven max-content — the widest child (plus its
  // padding), not 1px, so e.g. a nested column flex keeps its intrinsic width.
  // B"H 2026-10-09: an explicit child width IS its max-content contribution
  // (a 200px-wide block child makes the container 200px, not ~22px).
  let widest = 0;
  for (const k of (node.children || [])) {
    if (hidden(k)) continue;
    if (k.nodeType === 3) widest = Math.max(widest, textWidth(k.textContent, inheritFont(s)));
    else {
      const ks = styleOf(k);
      const pad = box(ks, "padding", parent);
      const kw = dim(ks.width, parent);
      widest = Math.max(widest, (kw > 0 ? kw : naturalInlineWidth(k, ks, parent)) + pad.left + pad.right);
    }
  }
  return Math.max(1, widest);
}
function tracks(text, total, gap, hint) {
  // B"H 2026-10-09: expand nested repeat() tokens, then size each track
  // (minmax() supported — the max bound wins for fixed sizes).
  // B"H 2026-10-09: pure [name] line tokens are not tracks — drop them
  // before sizing (`[start]200px [mid] 1fr [end]` = 2 tracks).
  const flat = [];
  for (const p of expandRepeat(text, total, gap, hint)) {
    if (/^repeat\(/i.test(p)) flat.push(...expandRepeat(p, total, gap, hint));
    else flat.push(p);
  }
  const sized = flat.filter(p => !/^\[[^\]]*\]$/.test(String(p).trim()));
  const fixed = sized.map(p => trackSize(p, total).fixed || 0);
  const fr = sized.map(p => trackSize(p, total).fr || 0);
  const free = Math.max(1, (total || sum(fixed, 0, fixed.length) || 1) - gap * Math.max(0, sized.length - 1) - sum(fixed, 0, fixed.length));
  const frSum = sum(fr, 0, fr.length) || 1;
  return sized.length ? sized.map((_, i) => fixed[i] || (fr[i] ? free * fr[i] / frSum : 1)) : Array.from({ length: Math.max(1, hint || 1) }, () => total || 1);
}
function trackSize(token, total) {
  const t = String(token || "").trim();
  const mm = t.match(/^minmax\(\s*([^,]+?)\s*,\s*(.+?)\s*\)$/i);
  if (mm) {
    const maxT = mm[2].trim();
    if (maxT.endsWith("fr")) return { fr: Number(maxT.slice(0, -2)) || 1 };
    return { fixed: dim(maxT, total) || dim(mm[1].trim(), total) || 1 };
  }
  if (t.endsWith("fr")) return { fr: Number(t.slice(0, -2)) || 1 };
  return { fixed: dim(t, total) || 1 };
}
// B"H 2026-10-09: split a track list on whitespace OUTSIDE parens, so
// `minmax(100px, 1fr)` stays one token.
function splitTrackList(text) {
  const parts = [];
  let depth = 0, cur = "", quote = "";
  const push = () => { if (cur) { parts.push(cur); cur = ""; } };
  for (const ch of String(text || "")) {
    if (quote) { cur += ch; if (ch === quote) quote = ""; continue; }
    if (ch === '"' || ch === "'") { quote = ch; cur += ch; continue; }
    if (ch === "(") depth++;
    if (ch === ")") depth = Math.max(0, depth - 1);
    // B"H 2026-10-09: split on bracket boundaries too — `[a]150px[b]`
    // (no spaces) must tokenize as `[a]`, `150px`, `[b]`.
    if (depth === 0 && (ch === "[" || ch === "]")) {
      if (ch === "[") push();
      cur += ch;
      if (ch === "]") push();
      continue;
    }
    if (/\s/.test(ch) && depth === 0) { push(); continue; }
    cur += ch;
  }
  push();
  return parts;
}
// B"H 2026-10-09: repeat() expansion, now paren-aware and supporting
// repeat(auto-fit|auto-fill, minmax(min, max)): the column count is derived
// from the container width and the min width; auto-fit collapses empty tracks.
function expandRepeat(text, total, gap, itemCount) {
  const src = String(text || "").trim();
  const head = src.match(/^repeat\(\s*(auto-fit|auto-fill|\d+)/i);
  if (head) {
    const open = src.indexOf("(");
    let depth = 0, end = -1;
    for (let i = open; i < src.length; i++) {
      if (src[i] === "(") depth++;
      else if (src[i] === ")") { depth--; if (!depth) { end = i; break; } }
    }
    const innerFull = end > 0 ? src.slice(open + 1, end) : "";
    const inner = innerFull.replace(/^(auto-fit|auto-fill|\d+)\s*,/i, "").trim();
    if (/^auto-fit|^auto-fill/i.test(head[1])) {
      let minPx = 0, track = inner || "1fr";
      const mm = inner.match(/^minmax\(\s*([^,]+?)\s*,\s*(.+?)\s*\)$/i);
      if (mm) { minPx = dim(mm[1], total); track = mm[2].trim(); }
      else if (inner) minPx = dim(inner, total);
      const g = gap || 0;
      let count = Math.max(1, Math.floor(((total || 0) + g) / (Math.max(1, minPx) + g)) || 1);
      if (/^auto-fit/i.test(head[1])) count = Math.min(count, Math.max(1, itemCount || 1));
      return Array.from({ length: Math.min(count, MAX_GRID_TRACKS) }, () => track);
    }
    const n = Math.min(Number(head[1]) || 1, MAX_GRID_TRACKS);
    return Array.from({ length: n }, () => inner);
  }
  return splitTrackList(src);
}
function layoutText(node, ctx, out, parentStyle) { const text = String(node.textContent || "").trim(); if (!text) return null; const item = { node, x: ctx.x, y: ctx.y, width: ctx.width, height: textHeight(text, parentStyle || {}, ctx.width), style: parentStyle || {}, kind: "#text", text }; out.push(item); return item; }
export function nodeFrom(raw = {}, depth = 0) { const localName = String(raw.tagName || raw.localName || "div").replace(/^#TEXT$/i, "#text").toLowerCase(); return { ...raw, localName, nodeType: raw.nodeType || (localName === "#text" ? 3 : 1), textContent: raw.textContent || "", style: raw.style || {}, computedStyle: raw.computedStyle || {}, attributes: raw.attributes || {}, children: depth > MAX_LAYOUT_DEPTH ? [] : childArray(raw.children).map(c => nodeFrom(c, depth + 1)) }; }

/* B"H 2026-10-09 (render-bench): batch hidden-prop definition. wireParents
 * ran up to 6 separate Object.defineProperty traps per node (ownerDocument,
 * previousSibling, nextSibling, classList, getAttribute, hasAttribute) —
 * each trap is ~100x a plain store. One defineProperties call per node. */
function defineHiddenProps(obj, props) {
  const desc = {};
  for (const k of Object.keys(props)) desc[k] = { value: props[k], enumerable: false, configurable: true, writable: true };
  Object.defineProperties(obj, desc);
}

function defineProp(obj, key, value) {
  Object.defineProperty(obj, key, { value, enumerable: false, configurable: true, writable: true });
}

/** Normalize a node into the shape the standards selector matcher expects. */
function normalizeNode(node) {
  if (!node || node.nodeType !== 1) return;
  const attrs = node.attributes || {};
  if (node.id == null) node.id = attrs.id != null ? String(attrs.id) : "";
  const classAttr = node.className != null ? String(node.className) : String(attrs.class || "");
  const classes = classAttr.split(/\s+/).filter(Boolean);
  // B"H 2026-10-09 (render-bench): single defineProperties trap for all three
  // helpers instead of three separate defineProperty calls.
  const hidden = {
    classList: { contains: (c) => classes.includes(String(c)) },
  };
  if (typeof node.getAttribute !== "function") {
    hidden.getAttribute = (name) => {
      const v = attrs[String(name)];
      return v == null ? null : String(v);
    };
  }
  if (typeof node.hasAttribute !== "function") {
    hidden.hasAttribute = (name) => Object.prototype.hasOwnProperty.call(attrs, String(name));
  }
  defineHiddenProps(node, hidden);
  // B"H 2026-10-09 (merkava-mass-tests lists-forms): the standards'
  // :disabled/:checked/:required pseudo-classes read JS properties, not
  // attributes — mirror boolean form attributes onto the node.
  if (attrs.disabled != null) node.disabled = true;
  if (attrs.checked != null) node.checked = true;
  if (attrs.selected != null) node.selected = true;
  if (attrs.required != null) node.required = true;
  if (node.value == null && attrs.value != null) node.value = String(attrs.value);
  if (node.type == null && attrs.type != null) node.type = String(attrs.type);
}

function wireParents(node, parent = null, doc = null) {
  if (!node) return node;
  if (!doc) doc = { documentElement: node.nodeType === 1 ? node : null };
  defineHiddenProps(node, { parentNode: parent, ownerDocument: doc });
  normalizeNode(node);
  const kids = node.children || [];
  for (let i = 0; i < kids.length; i++) {
    defineHiddenProps(kids[i], {
      previousSibling: i > 0 ? kids[i - 1] : null,
      nextSibling: i < kids.length - 1 ? kids[i + 1] : null,
    });
  }
  for (const child of kids) wireParents(child, node, doc);
  return node;
}

/**
 * Correct cascade: parents are styled before children (walk is pre-order),
 * so inherited and custom properties flow down through parentComputed.
 */
function applyCascade(root, rules, viewport, anim = null, propertyRegs = {}, containerRules = []) {
  // B"H 2026-10-09: query-container stack — ancestors with container-type,
  // innermost last. Parents-first walk guarantees a container's computed
  // style (hence its queryable size) exists before descendants evaluate.
  // Containers are popped when the walk ascends past their depth.
  const containerStack = [];
  walk(root, (n) => {
    if (!n || n.nodeType !== 1) return;
    const d = depthOf(n);
    while (containerStack.length && containerStack[containerStack.length - 1].depth >= d) containerStack.pop();
    const parent = n.parentNode;
    const parentComputed = parent && parent.nodeType === 1 ? parent.computedStyle || {} : {};
    n.computedStyle = computeElementStyle(n, rules, parentComputed, propertyRegs);
    // B"H 2026-10-09: @container — evaluate against the nearest matching
    // query container; matching inner rules join the cascade for this
    // element (re-run with the augmented rule list for correct specificity).
    if (containerRules.length && containerStack.length) {
      const extra = matchingContainerRules(n, containerStack, containerRules);
      if (extra.length) {
        n.computedStyle = computeElementStyle(n, rules.concat(extra), parentComputed, propertyRegs);
      }
    }
    const ctype = String(n.computedStyle["container-type"] || "").trim().toLowerCase();
    if (ctype && ctype !== "normal" && ctype !== "none") {
      const cname = String(n.computedStyle["container-name"] || "").trim().toLowerCase();
      containerStack.push({ node: n, type: ctype, name: cname, depth: d });
    }
    // B"H 2026-10-09 (mass-test batch 2): the dir attribute drives
    // `direction` for logical-property resolution when no CSS sets it.
    // direction is inherited, so descendants pick it up through the cascade.
    if (n.computedStyle.direction == null || String(n.computedStyle.direction).trim() === "") {
      const d2 = typeof n.getAttribute === "function" ? n.getAttribute("dir") : null;
      if (d2 && /^(rtl|ltr)$/i.test(String(d2).trim())) n.computedStyle.direction = String(d2).trim().toLowerCase();
    }
    // B"H: keyframe animations + transition state-changes evaluate at the
    // screenshot timestamp, before layout — animated width/height reflow.
    if (anim) n.computedStyle = applyAnimationState(n, n.computedStyle, anim);
    // B"H 2026-10-09 (merkava-mass-tests lists-forms): synthesize the default
    // ::marker for <li> (list-style-type, position, start/reversed). An
    // explicit author ::marker { content } box wins — see listMarkers.js.
    if (n.localName === "li") {
      try { n.__marker = markerForLi(n, rules); } catch { n.__marker = null; }
    }
    if (n.localName === "body" && n.computedStyle["min-height"] == null) {
      n.computedStyle["min-height"] = `${viewport.height}px`;
    }
  });
}

// B"H 2026-10-09: depth of a node (root = 0).
function depthOf(n) {
  let d = 0, p = n.parentNode;
  while (p) { d++; p = p.parentNode; }
  return d;
}

// B"H 2026-10-09: find @container inner rules matching this element's
// nearest query container (by name when the query is named).
function matchingContainerRules(node, containerStack, containerRules) {
  const out = [];
  for (const cr of containerRules) {
    // Nearest container with a matching name (or any when unnamed).
    let container = null;
    for (let i = containerStack.length - 1; i >= 0; i--) {
      const c = containerStack[i];
      if (!cr.name || c.name === cr.name || c.name.split(/\s+/).includes(cr.name)) { container = c; break; }
    }
    if (!container) continue;
    if (!evaluateContainerCondition(cr.condition, container)) continue;
    for (const r of cr.rules) out.push(r);
  }
  return out;
}

// B"H 2026-10-09: evaluate a parsed @container condition against a query
// container's computed style. Size queries use the container's resolved px
// width/height; style queries check custom properties.
function evaluateContainerCondition(cond, container) {
  if (!cond) return false;
  // B"H: compound boolean conditions.
  if (cond.kind === "not") return !evaluateContainerCondition(cond.cond, container);
  if (cond.kind === "bool" && Array.isArray(cond.conds)) {
    let result = evaluateContainerCondition(cond.conds[0], container);
    for (let i = 0; i < cond.ops.length; i++) {
      const r = evaluateContainerCondition(cond.conds[i + 1], container);
      result = cond.ops[i] === "and" ? (result && r) : (result || r);
    }
    return !!result;
  }
  const style = (container.node && container.node.computedStyle) || {};
  if (cond.kind === "style") {
    const m = String(cond.query || "").match(/^(--[\w-]+)\s*:\s*([\s\S]*)$/);
    if (!m) return false;
    const actual = String(style[m[1]] || "").trim().toLowerCase();
    return actual === String(m[2]).trim().toLowerCase();
  }
  if (cond.kind === "size") {
    // container-type:inline-size only exposes the inline (width) axis.
    if (cond.prop === "height" && container.type === "inline-size") return false;
    const raw = cond.prop === "width" ? style.width : style.height;
    const px = resolveContainerPx(raw);
    if (px == null) return false;
    const v = cond.value; // px only for now
    if (cond.op === "min-") return px >= v;
    if (cond.op === "max-") return px <= v;
    return px === v;
  }
  return false;
}

// B"H 2026-10-09: resolve a container's computed width/height to px when
// it's an explicit length (the test suite uses explicit px widths).
function resolveContainerPx(raw) {
  const t = String(raw || "").trim().toLowerCase();
  const m = t.match(/^(-?\d+(?:\.\d+)?)px$/);
  return m ? Number(m[1]) : null;
}

// ---------------------------------------------------------------------------
// B"H 2026-10-09 (mass-test worker): pseudo-element materialization.
// Wires the executor-owned CssPseudoElements standard into the software
// renderer: ::before/::after become real (synthetic) boxes in the tree,
// ::first-letter wraps the host's first letter in a styled inline box, and
// ::first-line / ::placeholder styles are stashed for paint time. Everything
// here is additive — when no pseudo-element rules match, the tree is
// untouched.
// ---------------------------------------------------------------------------
const { generatedBoxesFor, matchPseudoRules } = pseudoPkg;

function cmpSpecTuple(a, b) {
  const n = Math.max(a.length, b.length);
  for (let i = 0; i < n; i++) {
    const d = (a[i] || 0) - (b[i] || 0);
    if (d) return d;
  }
  return 0;
}

/** Cascade the declarations of matched pseudo-element rules into one style map. */
function cascadePseudoStyle(element, matched) {
  const decls = [];
  for (const rule of matched || []) {
    for (const d of rule.declarations || []) {
      decls.push({
        name: d.name,
        value: d.value,
        important: !!d.important,
        spec: rule.specificity || [0, 0, 0, 0],
        order: rule.order || 0,
      });
    }
  }
  decls.sort(
    (a, b) => a.important - b.important || cmpSpecTuple(a.spec, b.spec) || a.order - b.order
  );
  const flat = {};
  for (const d of decls) flat[d.name] = d.value;
  // B"H 2026-10-09 (css-worker-2): compileStylesheet already expanded
  // shorthands (border -> border-width/style/color, margin -> margin-top...).
  // Running expandDeclarations again double-expanded border-width into
  // border-width-top/etc., which the painters don't read — so ::before/
  // ::after borders never painted. Copy the flat map directly.
  const out = { ...flat };
  // Pseudo-elements inherit text/font properties from their host element.
  const host = (element && element.computedStyle) || {};
  for (const k of ["font-size", "font-family", "font-weight", "font-style", "color", "line-height"]) {
    if (out[k] == null && host[k] != null) out[k] = host[k];
  }
  resolveVarsInPlace(out, { ...host, ...out });
  return out;
}

/** Give a textContent-only element a real #text child (mirrors inlineKids' fallback). */
function normalizeOwnText(n) {
  if ((n.children || []).length) return;
  const t = String(n.textContent || "");
  if (!t.trim()) return;
  n.children.push({ nodeType: 3, textContent: t, parentNode: n, localName: "#text", children: [] });
}

/** First non-whitespace text node in depth-first order (skips hidden subtrees). */
function firstTextNode(root) {
  const stack = [root];
  while (stack.length) {
    const cur = stack.pop();
    if (!cur || hidden(cur)) continue;
    if (cur.nodeType === 3 && String(cur.textContent || "").trim()) return cur;
    const kids = cur.children || [];
    for (let i = kids.length - 1; i >= 0; i--) stack.push(kids[i]);
  }
  return null;
}

/** ::before / ::after — inject the generated box as first/last child of the host. */
function injectPseudoBox(host, spec) {
  normalizeOwnText(host);
  const display = String(spec.display || "inline").trim().toLowerCase() || "inline";
  const textNode = { nodeType: 3, textContent: spec.content, parentNode: null, localName: "#text", children: [] };
  const box = {
    nodeType: 1,
    localName: `::${spec.pseudo}`,
    attributes: {},
    style: {},
    computedStyle: { ...spec.style, display },
    children: [textNode],
    textContent: "",
    parentNode: host,
  };
  textNode.parentNode = box;
  if (spec.pseudo === "before") host.children.unshift(box);
  else host.children.push(box);
}

/** ::first-letter — wrap the host's first letter in a styled inline box (pre-layout). */
function applyFirstLetter(host, pseudoStyle) {
  normalizeOwnText(host);
  const t = firstTextNode(host);
  if (!t || !t.parentNode) return;
  const text = String(t.textContent || "");
  let idx = 0;
  while (idx < text.length && /\s/.test(text[idx])) idx++;
  if (idx >= text.length) return;
  const letterNode = { nodeType: 3, textContent: text[idx], parentNode: null, localName: "#text", children: [] };
  const span = {
    nodeType: 1,
    localName: "::first-letter",
    attributes: {},
    style: {},
    computedStyle: { ...pseudoStyle, display: "inline" },
    children: [letterNode],
    textContent: "",
    parentNode: t.parentNode,
  };
  letterNode.parentNode = span;
  t.textContent = text.slice(0, idx) + text.slice(idx + 1);
  const kids = t.parentNode.children || [];
  const at = kids.indexOf(t);
  if (at >= 0) kids.splice(at, 0, span);
  else kids.unshift(span);
}

function materializePseudoElements(root, rules) {
  if (!rules || !rules.length) return;
  // B"H 2026-10-09 (merkava-mass-tests lists-forms): counters live here so
  // each element's increment applies BEFORE its own ::before/::after content
  // resolves (pre-order walk). Reset once per document for repeat renders.
  if (root && root.ownerDocument) {
    root.ownerDocument.__merkavaCounters = {};
    root.ownerDocument.__merkavaCountersApplied = true;
  }
  walk(root, (n) => {
    if (!n || n.nodeType !== 1 || hidden(n)) return;
    // B"H 2026-10-09 (merkava-mass-tests lists-forms): counter-reset /
    // counter-increment in document order; the ::before box injected below
    // for THIS element sees its freshly incremented value.
    try { applyCounters(n, n.computedStyle || {}); } catch { /* never break layout */ }
    // ::before / ::after — generated boxes, first/last child of the host.
    for (const spec of generatedBoxesFor(n, rules, cascadePseudoStyle)) injectPseudoBox(n, spec);
    // ::placeholder — stashed on the node; boxPainter applies it when the value is empty.
    if (n.localName === "input" || n.localName === "textarea") {
      const ph = matchPseudoRules(n, "placeholder", rules);
      if (ph.length) n.__merkavaPlaceholder = cascadePseudoStyle(n, ph);
    }
    // ::first-line — stashed; applied to first-line #text items post-layout.
    const fl = matchPseudoRules(n, "first-line", rules);
    if (fl.length) n.__merkavaFirstLine = cascadePseudoStyle(n, fl);
    // ::first-letter — pre-layout wrap of the first letter.
    const flt = matchPseudoRules(n, "first-letter", rules);
    if (flt.length) applyFirstLetter(n, cascadePseudoStyle(n, flt));
  });
}

// Only paint-safe text properties apply post-layout (no reflow happens after layout).
const FIRST_LINE_PROPS = new Set([
  "color", "background-color", "font-weight", "font-style",
  "text-decoration", "text-transform", "letter-spacing", "word-spacing",
]);

/** ::first-line — restyle the #text items sitting on the block's first line. */
function applyFirstLineStyles(out) {
  for (const item of out) {
    const fl = item.node && item.node.__merkavaFirstLine;
    if (!fl || !item.children || !item.children.length) continue;
    const texts = [];
    const stack = [...item.children];
    while (stack.length) {
      const c = stack.pop();
      if (!c) continue;
      if (c.kind === "#text") texts.push(c);
      else if (c.children && c.children.length) stack.push(...c.children);
    }
    const lined = texts.filter((t) => t.text && String(t.text).trim());
    if (!lined.length) continue;
    const minY = Math.min(...lined.map((t) => Number(t.y) || 0));
    const props = {};
    for (const k of FIRST_LINE_PROPS) if (fl[k] != null) props[k] = fl[k];
    if (!Object.keys(props).length) continue;
    for (const t of lined) {
      if (Math.abs((Number(t.y) || 0) - minY) < 1) t.style = { ...(t.style || {}), ...props };
    }
  }
}

// ---------------------------------------------------------------------------
// B"H 2026-10-09 (css-worker-2): relative-unit resolution (vw/vh/vmin/vmax,
// rem, em). The cascade leaves these as strings and layout's dim() only knew
// px and % — so `50vw` measured as 50 and `10rem` as 10. This pre-layout
// pass rewrites relative units to px in every element's computedStyle, so
// all dim() call sites benefit without signature changes. Pre-order walk:
// em resolves against the element's own (already resolved) font-size, rem
// against the root font-size (`html{font-size}` honored, else 16px), vw/vh
// against the viewport. % is left for layout (needs the containing block).
// Runs after the cascade + pseudo-element materialization, before layout.
// ---------------------------------------------------------------------------
const REL_UNIT_RE = /(-?\d*\.?\d+)(cqw|cqh|cqi|cqb|cqmin|cqmax|vmin|vmax|rem|vw|vh|em)\b/gi;
const FONT_SIZE_KEYWORDS = {
  "xx-small": 9, "x-small": 10, small: 13, medium: 16,
  large: 18, "x-large": 24, "xx-large": 32, larger: 19, smaller: 13,
};
// Properties whose values are never lengths (skip the rewrite there).
const REL_UNIT_SKIP_PROPS = new Set([
  "content", "font-family", "quotes", "counter-reset", "counter-increment",
  "list-style-type", "font", "font-variant",
]);

function relUnitToPx(num, unit, emPx, remPx, vwPx, vhPx, cqW = 0, cqH = 0) {
  switch (unit) {
    case "em": return num * emPx;
    case "rem": return num * remPx;
    case "vw": return num * vwPx;
    case "vh": return num * vhPx;
    case "vmin": return num * Math.min(vwPx, vhPx);
    case "vmax": return num * Math.max(vwPx, vhPx);
    // B"H 2026-10-09: container query units — relative to the nearest
    // query container's dimensions (cqw/cqh = 1% of width/height,
    // cqi/cqb = inline/block, cqmin/cqmax = smaller/larger).
    case "cqw": return num * cqW / 100;
    case "cqh": return num * cqH / 100;
    case "cqi": return num * cqW / 100;
    case "cqb": return num * cqH / 100;
    case "cqmin": return num * Math.min(cqW, cqH) / 100;
    case "cqmax": return num * Math.max(cqW, cqH) / 100;
    default: return null;
  }
}

/** Rewrite relative-unit length tokens to px, leaving quoted strings and url(...) alone. */
function rewriteRelUnits(value, emPx, remPx, vwPx, vhPx, cqW = 0, cqH = 0) {
  const parts = String(value).split(/("[^"]*"|'[^']*')/g);
  for (let i = 0; i < parts.length; i += 2) {
    // Protect url(...) payloads inside the unquoted segments.
    const segs = parts[i].split(/(url\([^)]*\))/gi);
    for (let j = 0; j < segs.length; j += 2) {
      REL_UNIT_RE.lastIndex = 0;
      segs[j] = segs[j].replace(REL_UNIT_RE, (m, num, unit) => {
        const px = relUnitToPx(Number(num), unit.toLowerCase(), emPx, remPx, vwPx, vhPx, cqW, cqH);
        return px == null ? m : (Math.round(px * 1000) / 1000) + "px";
      });
    }
    parts[i] = segs.join("");
  }
  return parts.join("");
}

/** Evaluate a px-only calc()/min()/max()/clamp(); null when it needs layout (% left). */
function evaluatePxMathOnly(text) {
  let out = String(text);
  for (let guard = 0; guard < 12; guard++) {
    const m = /(calc|min|max|clamp)\(/i.exec(out);
    if (!m) return out;
    const at = m.index, plen = m[0].length;
    let depth = 0, end = -1;
    for (let i = at + plen; i < out.length; i++) {
      if (out[i] === "(") depth++;
      else if (out[i] === ")") { if (depth === 0) { end = i; break; } depth--; }
    }
    if (end < 0) return out;
    const inner = out.slice(at + plen, end);
    if (/%/.test(inner)) return null;
    const val = evaluatePxMathInner(m[1].toLowerCase(), inner);
    if (val == null) return out;
    out = out.slice(0, at) + (Math.round(val * 1000) / 1000) + "px" + out.slice(end + 1);
  }
  return out;
}

function evaluatePxMathInner(name, inner) {
  // Tokenize numbers with px (or unitless) and operators.
  const toks = [];
  const re = /(-?\d*\.?\d+)(px)?|([+\-*/(),])/gi;
  let m;
  while ((m = re.exec(inner)) !== null) {
    if (m[3]) toks.push(m[3]);
    else if (m[1] !== undefined && m[1] !== "") toks.push(Number(m[1]));
  }
  if (!toks.length) return null;
  try {
    if (name === "calc") return evalPxTokens(toks);
    // min/max/clamp: split on top-level commas.
    const args = [];
    let cur = [], depth = 0;
    for (const t of toks) {
      if (t === "(") depth++;
      if (t === ")") depth--;
      if (t === "," && depth === 0) { args.push(cur); cur = []; continue; }
      cur.push(t);
    }
    args.push(cur);
    const vals = args.map((a) => evalPxTokens(a));
    if (vals.some((v) => v == null || !isFinite(v))) return null;
    if (name === "min") return Math.min(...vals);
    if (name === "max") return Math.max(...vals);
    if (vals.length !== 3) return null;
    return Math.min(Math.max(vals[1], vals[0]), vals[2]);
  } catch { return null; }
}

function evalPxTokens(toks) {
  // Shunting-yard for + - * / with parens, px-space numbers only.
  const out = [], ops = [];
  const prec = { "+": 1, "-": 1, "*": 2, "/": 2 };
  const apply = () => {
    const op = ops.pop(), b = out.pop(), a = out.pop();
    if (typeof a !== "number" || typeof b !== "number") throw new Error("bad");
    out.push(op === "+" ? a + b : op === "-" ? a - b : op === "*" ? a * b : a / b);
  };
  for (const t of toks) {
    if (typeof t === "number") out.push(t);
    else if (t === "(") ops.push(t);
    else if (t === ")") { while (ops.length && ops[ops.length - 1] !== "(") apply(); ops.pop(); }
    else if (prec[t]) { while (ops.length && ops[ops.length - 1] !== "(" && prec[ops[ops.length - 1]] >= prec[t]) apply(); ops.push(t); }
    else throw new Error("bad");
  }
  while (ops.length) apply();
  return out.length === 1 ? out[0] : null;
}

/** Resolve a font-size value to px (em/% against parent, rem against root). */
function resolveFontSizePx(raw, parentPx, remPx, vwPx, vhPx) {
  let s = rewriteRelUnits(String(raw || ""), parentPx, remPx, vwPx, vhPx).trim().toLowerCase();
  if (!s) return null;
  if (/(calc|min|max|clamp)\(/.test(s)) {
    const ev = evaluatePxMathOnly(s);
    if (ev == null) return null;
    s = String(ev).trim().toLowerCase();
  }
  if (s.endsWith("%")) {
    const n = parseFloat(s);
    return isFinite(n) ? parentPx * n / 100 : null;
  }
  if (FONT_SIZE_KEYWORDS[s] != null) return FONT_SIZE_KEYWORDS[s];
  const m = s.match(/^(-?[\d.]+)px$/);
  if (m) return Number(m[1]);
  const n = parseFloat(s);
  return isFinite(n) && /^[\d.\-+e]+$/.test(s) ? n : null;
}

/** Winning `html{font-size}` declaration across rules (the parser drops <html>, so match by hand). */
function htmlRootFontSize(rules) {
  let best = null, bestScore = null;
  const cmp = (a, b) => {
    const n = Math.max(a.length, b.length);
    for (let i = 0; i < n; i++) { const d = (a[i] || 0) - (b[i] || 0); if (d) return d; }
    return 0;
  };
  for (const rule of rules || []) {
    if (String(rule.selector || "").trim().toLowerCase() !== "html") continue;
    for (const d of rule.declarations || []) {
      if (String(d.name || "").toLowerCase() !== "font-size") continue;
      const score = [d.important ? 1 : 0, ...(rule.specificity || [0, 0, 0, 0]), rule.order || 0];
      if (!best || cmp(score, bestScore) >= 0) { best = d.value; bestScore = score; }
    }
  }
  return best;
}

function resolveRelativeUnits(root, rules, viewport) {
  const vwPx = (viewport.width || 0) / 100, vhPx = (viewport.height || 0) / 100;
  let remPx = 16;
  const htmlFs = htmlRootFontSize(rules);
  if (htmlFs != null) {
    const r = resolveFontSizePx(htmlFs, 16, 16, vwPx, vhPx);
    if (r != null && r > 0) remPx = r;
  }
  const visit = (node, parentFontPx, cqW = 0, cqH = 0) => {
    if (!node || node.nodeType !== 1) return;
    const st = node.computedStyle || {};
    // B"H 2026-10-09: if this node is a query container, its dimensions
    // become the container-query units basis for its descendants.
    let myCqW = cqW, myCqH = cqH;
    const ctype = String(st["container-type"] || "").trim().toLowerCase();
    if (ctype && ctype !== "normal" && ctype !== "none") {
      const w = resolveContainerPx(st.width), h = resolveContainerPx(st.height);
      if (w != null) myCqW = w;
      if (h != null) myCqH = h;
    }
    let fontPx = parentFontPx;
    const fsRaw = st["font-size"];
    if (fsRaw != null && String(fsRaw).trim() !== "") {
      const r = resolveFontSizePx(fsRaw, parentFontPx, remPx, vwPx, vhPx);
      if (r != null && r > 0) fontPx = r;
    }
    let changed = false;
    const out = {};
    for (const k of Object.keys(st)) {
      const v = st[k];
      if (k === "font-size") {
        const nv = (Math.round(fontPx * 1000) / 1000) + "px";
        out[k] = nv;
        if (nv !== v) changed = true;
        continue;
      }
      if (typeof v === "string" && !REL_UNIT_SKIP_PROPS.has(k) && !k.startsWith("--")) {
        REL_UNIT_RE.lastIndex = 0;
        if (REL_UNIT_RE.test(v)) {
          let nv = rewriteRelUnits(v, fontPx, remPx, vwPx, vhPx, myCqW, myCqH);
          if (/(calc|min|max|clamp)\(/.test(nv) && !/%/.test(nv)) {
            const ev = evaluatePxMathOnly(nv);
            if (ev != null) nv = ev;
          }
          out[k] = nv;
          if (nv !== v) changed = true;
          continue;
        }
      }
      out[k] = v;
    }
    // Replace (never mutate in place — styleOf() interns shared objects).
    if (changed) node.computedStyle = out;
    for (const c of node.children || []) visit(c, fontPx, myCqW, myCqH);
  };
  visit(root, 16);
}

function collectCssRules(root, environment, orderStart) {
  let order = orderStart;
  let rules = [];
  let properties = {};
  let containerRules = [];
  let cssText = "";
  walk(root, (n) => {
    if (n.localName === "style") {
      const text = n.textContent || "";
      cssText += `\n${text}`;
      const compiled = compileStylesheet(text, environment, order);
      rules = rules.concat(compiled.rules);
      properties = { ...properties, ...compiled.properties };
      containerRules = containerRules.concat(compiled.containerRules || []);
      order = compiled.nextOrder;
    }
  });
  return { rules, properties, containerRules, nextOrder: order, cssText };
}

function childArray(c) { if (!c) return []; if (Array.isArray(c)) return c; if (typeof c === "object") return Object.values(c).filter(v => v && typeof v === "object"); return []; }
function renderChildren(n) {
  const kids = (n.children || []).filter(c => !hidden(c) && (c.nodeType !== 3 || String(c.textContent || "").trim()));
  // B"H 2026-10-09 (merkava-mass-tests lists-forms): a closed <select>
  // (no size/multiple attributes) shows a single row — the selected option,
  // else the first. An open listbox (size/multiple) keeps all options.
  if (n && n.nodeType === 1 && n.localName === "select") return shownSelectOptions(n, kids);
  return kids;
}

/** The option(s) a <select> actually displays. */
function shownSelectOptions(node, kids) {
  const attrs = node.attributes || {};
  if (attrs.size != null || attrs.multiple != null) return kids;
  const opts = kids.filter((c) => c && c.nodeType === 1 && c.localName === "option");
  if (!opts.length) return kids;
  const sel = opts.find((o) => o.selected || (o.attributes && o.attributes.selected != null)) || opts[0];
  // Keep the shown option plus any non-option children (e.g. ::after boxes).
  return kids.filter((c) => c === sel || !(c.nodeType === 1 && c.localName === "option"));
}

/** Visible label of an <option> (textContent or its #text child). */
function optionLabel(k) {
  const t = String((k && k.textContent) || "").trim();
  if (t) return t;
  const c = ((k && k.children) || []).find((x) => x && x.nodeType === 3);
  return c ? String(c.textContent || "").trim() : "";
}
function renderOwnText(n) {
  if (hidden(n) || (n.children || []).length) return "";
  const t = String(n.textContent || "").trim();
  if (t) return t;
  // B"H 2026-10-09 (merkava-mass-tests lists-forms): a void <input> carries
  // its visible label in the value attribute (text-like and submit inputs).
  if (n.localName === "input") {
    const type = String((n.attributes && n.attributes.type) || "text").toLowerCase();
    if (["text", "email", "password", "search", "url", "tel", "number", "submit"].includes(type)) {
      return String((n.attributes && n.attributes.value) ?? n.value ?? "").trim();
    }
  }
  return "";
}
function findBody(n) {
  const stack = [n];
  while (stack.length) {
    const cur = stack.pop();
    if (!cur) continue;
    if (cur.localName === "body") return cur;
    const kids = cur.children || [];
    for (let i = kids.length - 1; i >= 0; i--) stack.push(kids[i]);
  }
  return null;
}
function walk(n, fn) {
  const stack = [n];
  while (stack.length) {
    const cur = stack.pop();
    if (!cur) continue;
    fn(cur);
    const kids = cur.children || [];
    for (let i = kids.length - 1; i >= 0; i--) stack.push(kids[i]);
  }
}
/** Computed style is authoritative; raw inline is kept as a defensive fallback. */
/* B"H 2026-10-09 (bit-opt): style interning. 4000+ layout items typically
 * share <5 distinct styles. Intern by content so identical styles share one
 * reference. Per-node WeakMap avoids re-merging for repeated styleOf calls
 * on the same node. Styles are never mutated after cascade (verified), so
 * sharing is safe. Bounded at 10k entries (~1MB max). */
const STYLE_INTERN_MAP = new Map();
const STYLE_NODE_CACHE = new WeakMap();
const EMPTY_STYLE = Object.freeze({});
function internStyle(obj) {
  if (!obj) return EMPTY_STYLE;
  const keys = Object.keys(obj);
  if (keys.length === 0) return EMPTY_STYLE;
  // Build a canonical key without full JSON.stringify when possible.
  // Single-key styles (the common case) use a fast path.
  let key;
  if (keys.length === 1) {
    key = keys[0] + "\x00" + String(obj[keys[0]]);
  } else {
    keys.sort();
    key = keys.map(k => k + "\x00" + String(obj[k])).join("\x01");
  }
  let hit = STYLE_INTERN_MAP.get(key);
  if (hit) return hit;
  if (STYLE_INTERN_MAP.size < 10000) {
    STYLE_INTERN_MAP.set(key, obj);
    return obj;
  }
  return obj; // cap reached: use unshared (still correct)
}
function styleOf(n) {
  const cached = STYLE_NODE_CACHE.get(n);
  if (cached) return cached;
  const inline = n.style;
  const computed = n.computedStyle;
  const inlineEmpty = !inline || Object.keys(inline).length === 0;
  const computedEmpty = !computed || Object.keys(computed).length === 0;
  let result;
  if (inlineEmpty && computedEmpty) result = EMPTY_STYLE;
  else if (inlineEmpty) result = internStyle(computed);
  else if (computedEmpty) result = internStyle(inline);
  else result = internStyle({ ...inline, ...computed });
  STYLE_NODE_CACHE.set(n, result);
  return result;
}
/* B"H 2026-10-09 (bit-opt): minimal text node. #text layout items only need
 * parentNode (painter uses it for transform/clip chains and textParents).
 * The full synthetic node (textContent, nodeType, localName, children array,
 * __textStyle) wastes ~400 bytes per text run and duplicates item.text. */
function minimalTextNode(parentNode) {
  return { parentNode: parentNode || null };
}
// B"H: per-tag display defaults — spans/links are inline, inputs are
// inline-block. Without this every element stacked vertically as a block.
const INLINE_TAGS = new Set(["span", "a", "em", "strong", "b", "i", "u", "small", "code", "label", "abbr", "cite", "q", "sub", "sup", "time", "mark", "del", "ins", "kbd", "samp", "var", "bdi", "bdo", "s"]);
const INLINE_BLOCK_TAGS = new Set(["img", "input", "button", "select", "textarea", "canvas", "video", "iframe", "svg", "audio", "progress", "meter"]);
// B"H 2026-10-09: UA default displays for table internals (CSS2 §17). Without
// these every table part falls back to "block" and tables stack vertically.
const TABLE_DISPLAY_DEFAULTS = {
  table: "table", caption: "table-caption", colgroup: "table-column-group", col: "table-column",
  thead: "table-row-group", tbody: "table-row-group", tfoot: "table-row-group",
  tr: "table-row", td: "table-cell", th: "table-cell",
};
function defaultDisplay(tag) {
  if (INLINE_TAGS.has(tag)) return "inline";
  if (INLINE_BLOCK_TAGS.has(tag)) return "inline-block";
  if (TABLE_DISPLAY_DEFAULTS[tag]) return TABLE_DISPLAY_DEFAULTS[tag];
  return "block";
}
function displayOf(style, node) {
  const d = String(style.display || "").trim().toLowerCase();
  if (d) return d;
  return defaultDisplay(node && node.localName ? node.localName : "");
}
function display(s) { return displayOf(s, null); }
function isInlineLevel(node) {
  if (node.nodeType === 3) return true;
  const d = displayOf(styleOf(node), node);
  return d === "inline" || d === "inline-block";
}
function hidden(n) { return ["br", "script", "style", "template", "head", "title", "meta", "link"].includes(n.localName) || n.hidden || String(n.style?.display || n.computedStyle?.display || "").toLowerCase() === "none"; }
/* B"H 2026-10-09 (render-bench): dim() string cache. dim() is called
 * hundreds of thousands of times per page with the same handful of strings
 * ("6px", "0", "8px", ...). Cache parent-independent values; % and
 * min()/max()/clamp() depend on the containing block so they skip it. */
const DIM_CACHE = new Map();
function dim(v, parent) {
  const t = String(v || "").trim();
  if (!t || t === "auto") return 0;
  // B"H 2026-10-09: min()/max()/clamp() resolve here so % args use the
  // containing-block reference (the cascade only resolves %-free calls).
  if (/^(min|max|clamp)\(/i.test(t)) {
    const r = evaluateMathFn(t, parent);
    if (r != null) return r;
  }
  if (t.endsWith("%")) return parent * Number(t.slice(0, -1)) / 100;
  let c = DIM_CACHE.get(t);
  if (c === undefined) {
    const m = t.match(/-?\d+(?:\.\d+)?/); c = m ? Number(m[0]) : 0;
    if (DIM_CACHE.size < 4096) DIM_CACHE.set(t, c);
  }
  return c;
}

// B"H 2026-10-09: innermost-first evaluation of min()/max()/clamp() in
// px-space; % args resolve against `parent` via dim(). The (?<![\w-])
// guard keeps minmax()/max-content etc. untouched. Returns null on any
// unsupported shape so callers fall back to the legacy parse.
function evaluateMathFn(text, parent) {
  const re = /(?<![\w-])(min|max|clamp)\(/gi;
  let out = String(text);
  for (let guard = 0; guard < 10; guard++) {
    re.lastIndex = 0;
    let best = null;
    let m;
    while ((m = re.exec(out)) !== null) {
      const at = m.index + m[0].length - m[1].length - 1;
      const end = mathFnEnd(out, at, m[1].length + 1);
      if (end >= 0) best = { at, name: m[1], end };
    }
    if (!best) return guard === 0 ? null : toFiniteNumber(out);
    const inner = out.slice(best.at + best.name.length + 1, best.end);
    const args = splitTopLevelCommas(inner).map((a) => dim(a, parent));
    if (!args.length || args.some((x) => typeof x !== "number" || !isFinite(x))) return null;
    const fn = best.name.toLowerCase();
    let result;
    if (fn === "min") result = Math.min(...args);
    else if (fn === "max") result = Math.max(...args);
    else {
      if (args.length !== 3) return null;
      result = Math.min(Math.max(args[1], args[0]), args[2]);
    }
    out = out.slice(0, best.at) + result + out.slice(best.end + 1);
  }
  return null;
}

function toFiniteNumber(s) {
  const n = Number(String(s).trim());
  return isFinite(n) ? n : null;
}

function mathFnEnd(text, at, plen) {
  let depth = 0;
  for (let i = at + plen; i < text.length; i++) {
    if (text[i] === "(") depth++;
    else if (text[i] === ")") {
      if (depth === 0) return i;
      depth--;
    }
  }
  return -1;
}

function splitTopLevelCommas(text) {
  const parts = [];
  let depth = 0;
  let cur = "";
  for (const ch of String(text)) {
    if (ch === "(") depth++;
    else if (ch === ")") depth = Math.max(0, depth - 1);
    if (ch === "," && depth === 0) {
      parts.push(cur);
      cur = "";
      continue;
    }
    cur += ch;
  }
  parts.push(cur);
  return parts;
}
/**
 * B"H 2026-10-09 (merkava-mass-tests lists-forms): horizontal padding +
 * border — converts a content-box natural width to the border-box width
 * layoutBlockBox expects.
 */
function horizChrome(style, refW = 0) {
  const pad = box(style || {}, "padding", refW), b = borderBox(style || {}, refW);
  return pad.left + pad.right + b.left + b.right;
}
/* B"H 2026-10-09 (render-bench): box() parse/resolve split. box() is called
 * 3-4x per layout node; the string splitting/parsing was pure waste because
 * the containing-block width (refW) varies per node, defeating naive caches.
 * Parse once per (interned style, property) into numeric/percent parts, then
 * resolve against refW with 4 cheap multiplies. Styles are interned, so the
 * WeakMap has a near-perfect hit rate regardless of refW. */
const BOX_PARSED = new WeakMap();
function parseSideValue(v) {
  const t = String(v || "").trim();
  if (!t) return null;
  if (t.endsWith("%")) return { n: Number(t.slice(0, -1)) || 0, pct: true, raw: null };
  // B"H: min()/max()/clamp() may carry % args resolved against refW — keep
  // the raw string and resolve late via dim().
  if (/^(min|max|clamp)\(/i.test(t)) return { n: 0, pct: false, raw: t };
  return { n: dim(t, 0), pct: false, raw: null };
}
function parsedBox(s, p) {
  let m = (s && typeof s === "object") ? BOX_PARSED.get(s) : undefined;
  if (m) { const hit = m.get(p); if (hit) return hit; }
  const sides = ["top", "right", "bottom", "left"];
  const vals = { top: null, right: null, bottom: null, left: null };
  const base = String(s[p] || "").trim();
  if (base) {
    const parts = base.split(/\s+/);
    const ps = parts.length === 1 ? [parts[0], parts[0], parts[0], parts[0]]
      : parts.length === 2 ? [parts[0], parts[1], parts[0], parts[1]]
      : parts.length === 3 ? [parts[0], parts[1], parts[2], parts[1]]
      : [parts[0], parts[1], parts[2], parts[3]];
    sides.forEach((sd, i) => { vals[sd] = parseSideValue(ps[i]); });
  }
  for (const sd of sides) {
    const v = s[`${p}-${sd}`];
    if (v !== undefined && String(v).trim() !== "") vals[sd] = parseSideValue(v);
  }
  applyLogicalParsed(s, vals, p);
  if (s && typeof s === "object") {
    if (!m) { m = new Map(); BOX_PARSED.set(s, m); }
    if (m.size < 16) m.set(p, vals);
  }
  return vals;
}
/* Logical margin/padding/border sides, parsed once (mirrors applyLogicalSides
 * semantics: physical longhands win, shorthands expand 1-2 values). */
function applyLogicalParsed(s, vals, p) {
  const rtl = String((s || {}).direction || "").trim().toLowerCase() === "rtl";
  const physOf = (log) => log === "inline-start" ? (rtl ? "right" : "left")
    : log === "inline-end" ? (rtl ? "left" : "right")
    : log === "block-start" ? "top" : log === "block-end" ? "bottom" : "";
  const set = (log, v) => {
    const t = String(v ?? "").trim();
    if (!t) return;
    const phys = physOf(log);
    if (!phys) return;
    const physKey = `${p}-${phys}`;
    if (s[physKey] !== undefined && String(s[physKey]).trim() !== "") return;
    vals[phys] = parseSideValue(t);
  };
  const inlineParts = String(s[`${p}-inline`] || "").trim().split(/\s+/).filter(Boolean);
  if (inlineParts.length) { set("inline-start", inlineParts[0]); set("inline-end", inlineParts[1] || inlineParts[0]); }
  const blockParts = String(s[`${p}-block`] || "").trim().split(/\s+/).filter(Boolean);
  if (blockParts.length) { set("block-start", blockParts[0]); set("block-end", blockParts[1] || blockParts[0]); }
  for (const log of ["inline-start", "inline-end", "block-start", "block-end"]) set(log, s[`${p}-${log}`]);
}
function resolveBox(parsed, refW) {
  const r = (e) => !e ? 0 : e.pct ? e.n * refW / 100 : (e.raw ? dim(e.raw, refW) : e.n);
  return { top: r(parsed.top), right: r(parsed.right), bottom: r(parsed.bottom), left: r(parsed.left) };
}
function box(s, p, refW = 0) {
  // B"H: correct box model — % resolves against the containing-block width,
  // 1-4 value shorthands expand like CSS, per-side longhands win.
  return resolveBox(parsedBox(s, p), refW);
}
// B"H 2026-10-09 (mass-test batch 2): logical margin/padding support.
// inline-start/end resolve direction-aware; block-start/end are top/bottom.
// Only fills sides the physical longhands didn't set, so existing pages
// that set physical props keep their old geometry.
function logicalSide(style, logical) {
  const rtl = String((style || {}).direction || "").trim().toLowerCase() === "rtl";
  if (logical === "inline-start") return rtl ? "right" : "left";
  if (logical === "inline-end") return rtl ? "left" : "right";
  if (logical === "block-start") return "top";
  if (logical === "block-end") return "bottom";
  return "";
}
function applyLogicalSides(s, out, p, refW) {
  const set = (log, v) => {
    const t = String(v ?? "").trim();
    if (!t) return;
    const phys = logicalSide(s, log);
    if (!phys) return;
    const physKey = `${p}-${phys}`;
    if (s[physKey] !== undefined && String(s[physKey]).trim() !== "") return; // physical wins (old behavior)
    out[phys] = dim(t, refW);
  };
  // Shorthands first (margin-inline / padding-inline: 1-2 values), then the
  // per-side longhands so they override the shorthand, like CSS.
  const inlineParts = String(s[`${p}-inline`] || "").trim().split(/\s+/).filter(Boolean);
  if (inlineParts.length) { set("inline-start", inlineParts[0]); set("inline-end", inlineParts[1] || inlineParts[0]); }
  const blockParts = String(s[`${p}-block`] || "").trim().split(/\s+/).filter(Boolean);
  if (blockParts.length) { set("block-start", blockParts[0]); set("block-end", blockParts[1] || blockParts[0]); }
  for (const log of ["inline-start", "inline-end", "block-start", "block-end"]) set(log, s[`${p}-${log}`]);
}
// B"H: "border: 2px solid red" carries its width in the shorthand; the old
// code passed the whole shorthand string to dim(), which only worked by luck.
/* B"H 2026-10-09 (render-bench): border-shorthand parse cache. borderBox()
 * re-split the `border`/`border-<side>` shorthands on every call; parse once
 * per style into {short, top, right, bottom, left, inlineStart, inlineEnd}. */
const BORDER_PARSED = new WeakMap();
function parsedBorder(style) {
  let hit = (style && typeof style === "object") ? BORDER_PARSED.get(style) : undefined;
  if (hit) return hit;
  const first = (v) => String(v || "").trim().split(/\s+/)[0] || "";
  hit = {
    short: first(style.border),
    top: first(style["border-top"]), right: first(style["border-right"]),
    bottom: first(style["border-bottom"]), left: first(style["border-left"]),
    inlineStart: first(style["border-inline-start"]), inlineEnd: first(style["border-inline-end"]),
  };
  if (style && typeof style === "object") BORDER_PARSED.set(style, hit);
  return hit;
}
export function borderBox(style, refW = 0) {
  const w = box(style, "border-width", refW);
  const bp = parsedBorder(style);
  const fromShort = dim(bp.short, refW);
  const sides = ["top", "right", "bottom", "left"];
  for (let i = 0; i < 4; i++) {
    const sd = sides[i];
    if (!w[sd] && fromShort) w[sd] = fromShort;
    if (!style[`border-${sd}-width`]) {
      const v = dim(bp[sd], refW);
      if (v) w[sd] = v;
    }
  }
  // B"H 2026-10-09 (mass-test batch 2): border-inline-start/end widths are
  // direction-aware; only fill sides that carried no width yet.
  const rtl = String((style || {}).direction || "").trim().toLowerCase() === "rtl";
  const li = [[bp.inlineStart, rtl ? "right" : "left"], [bp.inlineEnd, rtl ? "left" : "right"]];
  for (const [raw, phys] of li) {
    if (phys && !w[phys]) {
      const v = dim(raw, refW);
      if (v) w[phys] = v;
    }
  }
  return w;
}
function textHeight(text, s, width) { const size = dim(s["font-size"], 0) || 14; return Math.max(size + 4, Math.ceil(String(text || "").length / Math.max(1, Math.floor(width / Math.max(6, size * 0.55)))) * (size + 5)); }
function defaultHeight(n, s) { if (["h1", "h2", "h3"].includes(n.localName)) return 36; if (n.localName === "p") return 28; if (["button", "input", "select", "textarea"].includes(n.localName)) return dim(s.height, 0) || 38; if (n.localName === "canvas") return measuredHeight(n, s, 0) || 150; return 22; }
function px(v) { const m = String(v || "").match(/-?\d+(?:\.\d+)?/); return m ? Number(m[0]) : 0; }
// B"H 2026-10-09 (mass-test batch 2): `aspect-ratio: 16/9` -> 16/9;
// "auto"/"none"/unparseable -> 0 (no constraint).
function parseAspectRatio(style) {
  const t = String(style["aspect-ratio"] || "").trim().toLowerCase();
  if (!t || t === "auto" || t === "none") return 0;
  const parts = t.split("/").map(x => x.trim());
  const a = Number(parts[0]);
  const b = parts.length > 1 ? Number(parts[1]) : 1;
  return a > 0 && b > 0 && Number.isFinite(a) && Number.isFinite(b) ? a / b : 0;
}
function sum(list, from, to) { let n = 0; for (let i = from; i < to; i++) n += Number(list[i] || 0); return n; }

// B"H 2026-10-09 — table layout + multi-column layout (additive; the engine
// previously had neither: tables stacked as blocks, column-count was ignored).
// Tables: grid placement with colspan/rowspan, border-collapse (custom painted
// grid lines), border-spacing, table-layout:fixed, caption, row sections.
// Multi-column: fragment a block-flow strip at line granularity across N
// columns (balanced or column-fill:auto), column-gap, column-rule (painted by
// boxPainter), column-span:all.

/* ------------------------------- tables ------------------------------- */

function isTableCellNode(n) {
  if (!n || n.nodeType !== 1) return false;
  const tag = n.localName || "";
  if (tag === "td" || tag === "th") return true;
  return displayOf(styleOf(n), n) === "table-cell";
}

function parseBorderSpacing(v) {
  const parts = String(v || "").trim().split(/\s+/).filter(Boolean);
  const x = parts.length ? px(parts[0]) : 0;
  return { x, y: parts.length > 1 ? px(parts[1]) : x };
}

function cellSpan(node, attr) {
  const raw = node.attributes ? node.attributes[attr] : null;
  const n = parseInt(raw, 10);
  return Number.isFinite(n) && n > 0 ? Math.min(n, 100) : 1;
}

// Per-side border {w, color} for collapse-mode conflict resolution.
// NOTE: this engine's cascade names per-side props `border-color-top`
// (shorthand-first), not the standard `border-top-color` — check both.
function borderSideInfo(style, side) {
  const w = borderBox(style, 0)[side] || 0;
  let color = style[`border-color-${side}`] || style[`border-${side}-color`] || style["border-color"] || "";
  if (!color) {
    // B"H 2026-10-09 (columns-tables): the cascade keeps `border:1px solid
    // #333` partly unexpanded — pull the color straight from the shorthand.
    const src = String(style[`border-${side}`] || style.border || "");
    const hex = src.match(/#(?:[0-9a-f]{3,8})\b|rgba?\([^)]*\)|hsla?\([^)]*\)/gi);
    if (hex && hex.length) color = hex[hex.length - 1];
    else {
      const words = (src.toLowerCase().match(/\b[a-z]+\b/g) || []).filter(
        s => !/^(none|hidden|dotted|dashed|solid|double|groove|ridge|inset|outset|thin|medium|thick)$/.test(s));
      if (words.length) color = words[words.length - 1];
    }
  }
  const st = String(style[`border-style-${side}`] || style[`border-${side}-style`] || style["border-style"] || style.border || "").toLowerCase();
  if (/(^|\s)(none|hidden)(\s|$)/.test(` ${st} `)) return { w: 0, color: color || "#000000" };
  return { w, color: color || "#000000" };
}

// The generic box painter only understands `border-width`/`border-color`/
// `border-style` shorthand keys, but the cascade emits per-side
// `border-width-top` style names. Normalize an item's style so separate-mode
// table borders actually paint.
function normalizeBorderKeys(style) {
  const pairs = [["border-width", "border-width-"], ["border-color", "border-color-"], ["border-style", "border-style-"]];
  for (const [short, prefix] of pairs) {
    if (style[short] == null || String(style[short]).trim() === "") {
      for (const s of ["top", "right", "bottom", "left"]) {
        const v = style[prefix + s];
        if (v != null && String(v).trim() !== "") { style[short] = v; break; }
      }
    }
  }
}

function layoutTable(children, parent, ctx, out) {
  const pStyle = parent.style || {};
  const collapse = String(pStyle["border-collapse"] || "separate").trim().toLowerCase() === "collapse";
  const sp = parseBorderSpacing(pStyle["border-spacing"]);
  const gapX = collapse ? 0 : sp.x, gapY = collapse ? 0 : sp.y;
  const W = Math.max(1, ctx.width);
  const depth = (ctx.depth || 0) + 1;
  parent.__tableRoot = true;

  // --- partition children: captions, column defs, rows ---
  const capTop = [], capBottom = [], colEls = [], rowLists = [];
  const pushRows = (nodes) => {
    let anon = null;
    for (const n of nodes) {
      if (!n || hidden(n)) continue;
      const tag = n.localName || "";
      const d = n.nodeType === 1 ? displayOf(styleOf(n), n) : "";
      if (d === "table-caption" || tag === "caption") {
        const side = String((styleOf(n)["caption-side"] || "top")).trim().toLowerCase();
        (side === "bottom" ? capBottom : capTop).push(n);
        continue;
      }
      if (d === "table-column-group" || tag === "colgroup") {
        for (const c of n.children || []) {
          if ((c.localName || "") === "col" || (c.nodeType === 1 && displayOf(styleOf(c), c) === "table-column")) colEls.push(c);
        }
        continue;
      }
      if (d === "table-column" || tag === "col") { colEls.push(n); continue; }
      if (d === "table-row-group" || tag === "thead" || tag === "tbody" || tag === "tfoot") { pushRows(n.children || []); continue; }
      if (d === "table-row" || tag === "tr") {
        rowLists.push({ node: n, cells: (n.children || []).filter(isTableCellNode) });
        continue;
      }
      if (isTableCellNode(n)) {
        if (!anon) { anon = { node: null, cells: [] }; rowLists.push(anon); }
        anon.cells.push(n);
      }
    }
  };
  pushRows(children);

  // --- top captions ---
  let y = ctx.y;
  for (const c of capTop) {
    const got = layoutBlockBox(c, { x: ctx.x, y, width: W, viewportHeight: ctx.viewportHeight, depth, noCollapse: true, vpW: ctx.vpW, vpH: ctx.vpH, cb: ctx.cb }, out);
    if (got) { parent.children.push(got); y += got.height; }
  }
  const gridTop = y;

  // --- grid placement with colspan/rowspan ---
  const occupied = [], grid = [];
  rowLists.forEach((row, r) => {
    occupied[r] = occupied[r] || []; grid[r] = grid[r] || [];
    let c = 0;
    for (const cellNode of row.cells) {
      while (occupied[r][c]) c++;
      const cs = cellSpan(cellNode, "colspan"), rs = cellSpan(cellNode, "rowspan");
      for (let dr = 0; dr < rs; dr++) {
        occupied[r + dr] = occupied[r + dr] || [];
        for (let dc = 0; dc < cs; dc++) occupied[r + dr][c + dc] = true;
      }
      grid[r][c] = { node: cellNode, c, r, cs, rs };
      c += cs;
    }
  });
  const nRows = occupied.length;
  let nCols = 0;
  for (let r = 0; r < nRows; r++) nCols = Math.max(nCols, (occupied[r] || []).length);
  if (!nRows || !nCols) {
    for (const c of capBottom) {
      const got = layoutBlockBox(c, { x: ctx.x, y, width: W, viewportHeight: ctx.viewportHeight, depth, noCollapse: true, vpW: ctx.vpW, vpH: ctx.vpH, cb: ctx.cb }, out);
      if (got) { parent.children.push(got); y += got.height; }
    }
    return y - ctx.y;
  }

  // --- column widths ---
  const explicit = new Array(nCols).fill(0);
  colEls.forEach((colEl, i) => {
    if (i < nCols) { const w = dim(styleOf(colEl).width, W); if (w > 0) explicit[i] = w; }
  });
  if (grid[0]) for (let c = 0; c < nCols; c++) {
    const cell = grid[0][c];
    if (cell && !explicit[c]) {
      const w = dim(styleOf(cell.node).width, W);
      if (w > 0) explicit[c] = Math.min(w, W) / (cell.cs || 1);
    }
  }
  const colW = new Array(nCols).fill(0);
  const totalExplicit = explicit.reduce((a, b) => a + b, 0);
  const nAuto = explicit.filter(w => w <= 0).length;
  const autoW = nAuto > 0 ? Math.max(8, (W - totalExplicit - gapX * (nCols - 1)) / nAuto) : 0;
  for (let c = 0; c < nCols; c++) colW[c] = explicit[c] > 0 ? explicit[c] : autoW;
  const colX = [];
  let acc = ctx.x;
  for (let c = 0; c < nCols; c++) { colX[c] = acc; acc += colW[c] + gapX; }
  const tableContentW = Math.max(1, acc - gapX - ctx.x);

  // --- measure pass: lay out every cell at its column width (temp y) ---
  const measureOut = [];
  const cellInfos = [];
  for (let r = 0; r < nRows; r++) {
    for (let c = 0; c < nCols; c++) {
      const cell = grid[r] && grid[r][c];
      if (!cell) continue;
      let cw = 0;
      for (let dc = 0; dc < cell.cs; dc++) cw += colW[c + dc] || 0;
      cw += gapX * (cell.cs - 1);
      const got = layoutBlockBox(cell.node, { x: colX[c], y: 0, width: Math.max(1, cw), viewportHeight: ctx.viewportHeight, depth: depth + 1, noCollapse: true, vpW: ctx.vpW, vpH: ctx.vpH, cb: ctx.cb }, measureOut);
      if (got) {
        got.__suppressBorder = collapse; // collapse mode paints one shared grid
        cellInfos.push({ item: got, r, c, cs: cell.cs, rs: cell.rs, node: cell.node, start: measureOut.indexOf(got) });
      }
    }
  }
  // group contiguous out-items per cell (item + descendants)
  const byCell = new Map();
  const ordered = [...cellInfos].sort((a, b) => a.start - b.start);
  ordered.forEach((ci, i) => {
    const end = i + 1 < ordered.length ? ordered[i + 1].start : measureOut.length;
    byCell.set(ci, measureOut.slice(ci.start, end));
  });
  // B"H 2026-10-09: in separate mode cells paint their own borders via the
  // generic painter — normalize the cascade's per-side key names onto the
  // shorthand keys the painter reads.
  if (!collapse) {
    normalizeBorderKeys(pStyle);
    for (const ci of cellInfos) normalizeBorderKeys(ci.item.style);
  }

  // --- row heights (rowspan cells distribute overflow to last spanned row) ---
  const rowH = new Array(nRows).fill(0);
  for (const ci of cellInfos) if (ci.rs === 1) rowH[ci.r] = Math.max(rowH[ci.r], ci.item.height);
  for (const ci of cellInfos) {
    if (ci.rs <= 1) continue;
    let spanH = 0;
    for (let dr = 0; dr < ci.rs; dr++) spanH += rowH[ci.r + dr] || 0;
    spanH += gapY * (ci.rs - 1);
    const need = ci.item.height - spanH;
    if (need > 0) rowH[ci.r + ci.rs - 1] = (rowH[ci.r + ci.rs - 1] || 0) + need;
  }
  const rowY = [];
  let ry = gridTop;
  for (let r = 0; r < nRows; r++) { rowY[r] = ry; ry += rowH[r] + gapY; }
  const gridBottom = nRows ? ry - gapY : gridTop;

  // --- emit in paint order: row item, then its cells (col order) ---
  const rowItems = [];
  for (let r = 0; r < nRows; r++) {
    const rowNode = rowLists[r] ? rowLists[r].node : null;
    const rItem = {
      node: rowNode, x: ctx.x, y: rowY[r], width: tableContentW, height: rowH[r],
      style: rowNode ? styleOf(rowNode) : {}, children: [], kind: "tr",
    };
    out.push(rItem); parent.children.push(rItem); rowItems.push(rItem);
    const inRow = cellInfos.filter(ci => ci.r === r).sort((a, b) => a.c - b.c);
    for (const ci of inRow) {
      let ch = 0;
      for (let dr = 0; dr < ci.rs; dr++) ch += rowH[ci.r + dr] || 0;
      ch += gapY * (ci.rs - 1);
      shiftSubtree(ci.item, rowY[r] - ci.item.y);
      const va = String((ci.item.style || {})["vertical-align"] || "top").trim().toLowerCase();
      const extra = Math.max(0, ch - ci.item.height);
      if (extra > 0) {
        const off = va === "middle" ? extra / 2 : va === "bottom" ? extra : 0;
        if (off > 0) for (const k of ci.item.children || []) shiftSubtree(k, off);
      }
      ci.item.height = Math.max(ci.item.height, ch);
      const group = byCell.get(ci) || [];
      for (const it of group) out.push(it);
      rItem.children.push(ci.item);
    }
  }

  // --- collapse mode: shared grid lines, painted by boxPainter ---
  // A boundary can be interior to a spanning cell in some rows/cols but a
  // real line in others, so lines are per-row/per-column SEGMENTS, merged
  // across consecutive rows/cols with identical width+color.
  if (collapse) {
    parent.__suppressBorder = true;
    const pickWin = (a, b) => (!a || (b && b.w > a.w) ? b : a);
    const winBorders = (list) => list.reduce((a, b) => pickWin(a, b), null) || { w: 0, color: "#000000" };
    // Edge cells whose borders contend for an outer table edge.
    const edgeCells = (edge, side) => {
      const out = [];
      for (let r = 0; r < nRows; r++) for (let c = 0; c < nCols; c++) {
        const cell = grid[r] && grid[r][c];
        if (!cell) continue;
        const onEdge = edge === 0 ? cell.r === 0
          : edge === 1 ? cell.c + cell.cs === nCols
          : edge === 2 ? cell.r + cell.rs === nRows
          : cell.c === 0;
        if (onEdge) out.push(borderSideInfo(styleOf(cell.node), side));
      }
      return out;
    };
    const vSegs = [];
    for (let b = 1; b < nCols; b++) {
      let cur = null;
      const flush = () => { if (cur) { vSegs.push(cur); cur = null; } };
      for (let r = 0; r < nRows; r++) {
        let spec = null, interior = false;
        const left = grid[r] && grid[r][b - 1], right = grid[r] && grid[r][b];
        if (left) {
          if (left.c + left.cs === b) spec = pickWin(spec, borderSideInfo(styleOf(left.node), "right"));
          else if (left.c + left.cs > b) interior = true;
        }
        if (right && right.c === b) spec = pickWin(spec, borderSideInfo(styleOf(right.node), "left"));
        if (!interior && spec && spec.w > 0) {
          const y0 = rowY[r], y1 = rowY[r] + (rowH[r] || 0);
          if (cur && cur.w === spec.w && cur.color === spec.color && Math.abs(cur.y1 - y0) < 0.51) cur.y1 = y1;
          else { flush(); cur = { x: colX[b], y0, y1, w: spec.w, color: spec.color }; }
        } else flush();
      }
      flush();
    }
    const hSegs = [];
    for (let b = 1; b < nRows; b++) {
      let cur = null;
      const flush = () => { if (cur) { hSegs.push(cur); cur = null; } };
      for (let c = 0; c < nCols; c++) {
        let spec = null, interior = false;
        const above = grid[b - 1] && grid[b - 1][c], below = grid[b] && grid[b][c];
        if (above) {
          if (above.r + above.rs === b) spec = pickWin(spec, borderSideInfo(styleOf(above.node), "bottom"));
          else if (above.r + above.rs > b) interior = true;
        }
        if (below && below.r === b) spec = pickWin(spec, borderSideInfo(styleOf(below.node), "top"));
        if (!interior && spec && spec.w > 0) {
          const x0 = colX[c], x1 = colX[c] + (colW[c] || 0);
          if (cur && cur.w === spec.w && cur.color === spec.color && Math.abs(cur.x1 - x0) < 0.51) cur.x1 = x1;
          else { flush(); cur = { y: rowY[b], x0, x1, w: spec.w, color: spec.color }; }
        } else flush();
      }
      flush();
    }
    parent.__tableGrid = {
      x0: ctx.x, y0: gridTop, x1: ctx.x + tableContentW, y1: gridBottom,
      outer: {
        // B"H 2026-10-09: outer edges resolve conflicts between the table's
        // own border and the edge cells' borders (wider wins).
        top: winBorders([borderSideInfo(pStyle, "top"),
          ...edgeCells(0, "top")]),
        right: winBorders([borderSideInfo(pStyle, "right"),
          ...edgeCells(1, "right")]),
        bottom: winBorders([borderSideInfo(pStyle, "bottom"),
          ...edgeCells(2, "bottom")]),
        left: winBorders([borderSideInfo(pStyle, "left"),
          ...edgeCells(3, "left")]),
      },
      vSegs, hSegs,
    };
    // B"H 2026-10-09: store grid coords RELATIVE to the table item — an
    // ancestor (e.g. an outer table cell) may shiftSubtree this whole table
    // after layout, and the painted grid must follow the item.
    const tgx = parent.x, tgy = parent.y, tg = parent.__tableGrid;
    tg.x0 -= tgx; tg.x1 -= tgx; tg.y0 -= tgy; tg.y1 -= tgy;
    for (const s of tg.vSegs) { s.x -= tgx; s.y0 -= tgy; s.y1 -= tgy; }
    for (const s of tg.hSegs) { s.y -= tgy; s.x0 -= tgx; s.x1 -= tgx; }
  }

  // --- bottom captions ---
  y = gridBottom;
  for (const c of capBottom) {
    const got = layoutBlockBox(c, { x: ctx.x, y, width: W, viewportHeight: ctx.viewportHeight, depth, noCollapse: true, vpW: ctx.vpW, vpH: ctx.vpH, cb: ctx.cb }, out);
    if (got) { parent.children.push(got); y += got.height; }
  }
  return y - ctx.y;
}

/* ---------------------------- multi-column ---------------------------- */

function multiColumnSpec(style, availW) {
  const gap = px(style["column-gap"] || style.gap) || (dim(style["font-size"], 0) || 14);
  let n = 0;
  const count = parseInt(style["column-count"], 10);
  if (Number.isFinite(count) && count > 1) n = count;
  else {
    const w = dim(style["column-width"], availW);
    if (w > 0) n = Math.max(1, Math.floor((availW + gap) / (w + gap)));
  }
  if (n <= 1) return null;
  const colW = (availW - gap * (n - 1)) / n;
  if (colW < 8) return null;
  return { n, gap, colW };
}

function parseColumnRule(style) {
  const raw = String(style["column-rule"] || "").trim();
  const wRaw = String(style["column-rule-width"] || "").trim();
  const styleRaw = String(style["column-rule-style"] || "").trim().toLowerCase();
  const colorRaw = String(style["column-rule-color"] || "").trim();
  let w = wRaw ? px(wRaw) : 0, color = colorRaw || "#000000", st = styleRaw || "none";
  if (raw) {
    for (const tok of raw.split(/\s+/)) {
      const low = tok.toLowerCase();
      if (/^(none|hidden|dotted|dashed|solid|double|groove|ridge|inset|outset)$/.test(low)) st = low;
      else if (/^-?\d/.test(tok)) w = px(tok);
      else color = tok;
    }
  }
  if (st === "none" || st === "hidden" || w <= 0) return null;
  return { w, color };
}

function layoutMultiColumn(children, parent, ctx, out, spec) {
  const pStyle = parent.style || {};
  const W = Math.max(1, ctx.width);
  const depth = (ctx.depth || 0) + 1;
  parent.__multicolRoot = true;

  // Partition into runs split by column-span:all elements.
  const segments = [];
  let run = [];
  for (const child of children) {
    if (!child || hidden(child)) continue;
    const st = child.nodeType === 1 ? styleOf(child) : null;
    const d = st ? displayOf(st, child) : "inline";
    const isSpan = st && d !== "inline" && String(st["column-span"] || "").trim().toLowerCase() === "all";
    if (isSpan) {
      if (run.length) { segments.push({ type: "run", kids: run }); run = []; }
      segments.push({ type: "span", node: child });
    } else run.push(child);
  }
  if (run.length) segments.push({ type: "run", kids: run });

  const fill = String(pStyle["column-fill"] || "balance").trim().toLowerCase();
  const fixedH = dim(pStyle.height, ctx.height || ctx.viewportHeight || 0);
  const contentH = fixedH > 0 ? Math.max(0, ctx.height || 0) : 0;
  const rule = parseColumnRule(pStyle);
  const rules = [];
  let y = ctx.y;
  for (const seg of segments) {
    if (seg.type === "span") {
      const got = layoutBlockBox(seg.node, { x: ctx.x, y, width: W, viewportHeight: ctx.viewportHeight, depth, noCollapse: true, vpW: ctx.vpW, vpH: ctx.vpH, cb: ctx.cb }, out);
      if (got) { parent.children.push(got); y += got.height; }
      continue;
    }
    y += fragmentRun(seg.kids, parent, ctx, out, spec, { y, fill, contentH, depth, rule, rules });
  }
  if (rules.length) {
    // B"H 2026-10-09: rule coords relative to the container item, so later
    // ancestor shifts move the painted rules with the container.
    for (const r of rules) { r.x -= parent.x; r.y0 -= parent.y; r.y1 -= parent.y; }
    parent.__columnRules = rules;
  }
  return y - ctx.y;
}

// Lay out one run at column width, then redistribute its line fragments
// across columns (balanced, or column-fill:auto into a fixed height).
function fragmentRun(kids, parent, ctx, out, spec, opts) {
  const { n, gap, colW } = spec;
  const tempOut = [];
  const fakeParent = { style: parent.style, children: [] };
  const flow = layoutBlockFlow(kids, fakeParent, {
    x: ctx.x, y: 0, width: Math.max(1, colW),
    viewportHeight: ctx.viewportHeight, depth: opts.depth, noCollapse: true,
    vpW: ctx.vpW, vpH: ctx.vpH, cb: ctx.cb,
  }, tempOut);
  const stripH = flow.height;

  // Collect fragment leaves (word boxes, atomic boxes). Nested multicol
  // containers and tables move as whole units.
  const leaves = [];
  const walk = (item) => {
    if (!item) return;
    if (item.__multicolRoot || item.__tableRoot) { leaves.push(item); return; }
    const ck = item.children || [];
    if (!ck.length) { leaves.push(item); return; }
    for (const k of ck) walk(k);
  };
  for (const t of fakeParent.children) walk(t);
  if (!leaves.length) return 0;
  leaves.sort((a, b) => (a.y - b.y) || (a.x - b.x));

  // Group into lines by vertical overlap.
  const lines = [];
  for (const leaf of leaves) {
    const top = leaf.y, bottom = leaf.y + (leaf.height || 0);
    const last = lines[lines.length - 1];
    if (last && top < last.bottom - 1) {
      last.leaves.push(leaf);
      if (bottom > last.bottom) last.bottom = bottom;
    } else lines.push({ top, bottom, leaves: [leaf] });
  }

  // Assign lines to columns.
  const autoFill = opts.fill === "auto" && opts.contentH > 0;
  const target = autoFill ? opts.contentH : stripH / n;
  const cols = [{ firstTop: Infinity, maxBottom: -Infinity, leaves: [], hasContent: false }];
  let c = 0, acc = 0;
  lines.forEach((ln) => {
    const adv = Math.max(0, ln.bottom - ln.top);
    const full = autoFill ? acc >= target : (acc > 0 && acc + adv > target);
    if (c < n - 1 && full) { c++; acc = 0; cols.push({ firstTop: Infinity, maxBottom: -Infinity, leaves: [], hasContent: false }); }
    const col = cols[c];
    if (ln.top < col.firstTop) col.firstTop = ln.top;
    if (ln.bottom > col.maxBottom) col.maxBottom = ln.bottom;
    for (const leaf of ln.leaves) { leaf.__col = c; col.leaves.push(leaf); }
    col.hasContent = true;
    acc += adv;
  });

  // Shift leaves into their columns (relative geometry preserved per column).
  // Atomic units (tables, nested multicol) move as whole subtrees.
  let maxColH = 0;
  cols.forEach((col, ci) => {
    if (!col.leaves.length) return;
    const dx = ci * (colW + gap);
    const dy = opts.y - col.firstTop;
    for (const leaf of col.leaves) { shiftSubtreeX(leaf, dx); shiftSubtree(leaf, dy); }
    const colH = col.maxBottom - col.firstTop;
    if (colH > maxColH) maxColH = colH;
  });

  // Column rules between adjacent content-bearing columns.
  if (opts.rule) {
    for (let i = 0; i < cols.length - 1; i++) {
      if (!cols[i].hasContent || !cols[i + 1].hasContent) continue;
      opts.rules.push({
        x: ctx.x + i * (colW + gap) + colW + (gap - opts.rule.w) / 2,
        y0: opts.y, y1: opts.y + maxColH, w: opts.rule.w, color: opts.rule.color,
      });
    }
  }

  // Fix up intermediate containers: recompute bounds from shifted children.
  // Block-level boxes keep full column width; boxes whose content landed in
  // more than one column are flagged so the painter skips their background.
  const fixUp = (item) => {
    const ck = item.children || [];
    if (!ck.length || item.__multicolRoot || item.__tableRoot) return;
    let minX = Infinity, minY = Infinity, maxR = -Infinity, maxB = -Infinity;
    const colSet = new Set();
    for (const k of ck) {
      fixUp(k);
      if (k.__col !== undefined) colSet.add(k.__col);
      if (k.x < minX) minX = k.x;
      if (k.y < minY) minY = k.y;
      if (k.x + (k.width || 0) > maxR) maxR = k.x + (k.width || 0);
      if (k.y + (k.height || 0) > maxB) maxB = k.y + (k.height || 0);
    }
    if (minX === Infinity) return;
    const singleCol = colSet.size === 1 ? [...colSet][0] : -1;
    const d = item.node && item.node.nodeType === 1 ? displayOf(item.style || {}, item.node) : "block";
    if (singleCol >= 0 && d !== "inline") {
      item.x = ctx.x + singleCol * (colW + gap);
      item.width = Math.max(1, colW);
    } else {
      item.x = minX;
      item.width = Math.max(1, maxR - minX);
    }
    item.y = minY;
    item.height = Math.max(0, maxB - minY);
    item.__col = singleCol >= 0 ? singleCol : undefined;
    if (colSet.size > 1) item.__fragSplit = true;
  };
  for (const t of fakeParent.children) fixUp(t);

  for (const it of tempOut) out.push(it);
  for (const t of fakeParent.children) parent.children.push(t);
  return maxColH;
}
