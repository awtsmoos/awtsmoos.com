// B"H
/**
 * @file domLayout.js
 * @description The Awtsmoos measures a compact DOM world for screenshots:
 * selectors match the node itself before climbing ancestors, grid rows remain
 * rows, flex-wrap creates real lines, and canvases keep their own dimensions.
 */
export function buildLayoutTree(dom, viewport = { width: 960, height: 640 }, options = {}) {
  const root = wireParents(nodeFrom(dom));
  applyCascade(root, [...collectCssRules(root), ...parseCssRules(options.cssText || "")], viewport);
  const out = [];
  layoutNode(findBody(root) || root, { x: 0, y: 0, width: viewport.width, height: viewport.height, viewportHeight: viewport.height, root: true }, out);
  return out;
}

function layoutNode(node, ctx, out) {
  if (!node || hidden(node)) return null;
  if (node.nodeType === 3) return layoutText(node, ctx, out, {});
  const style = styleOf(node), margin = box(style, "margin"), padding = box(style, "padding"), border = box(style, "border-width", style.border);
  const width = measuredWidth(node, style, Math.max(1, ctx.width - margin.left - margin.right));
  const fixedH = measuredHeight(node, style, ctx.height || ctx.viewportHeight || 0);
  const x = ctx.x + margin.left, y = ctx.y + margin.top;
  const item = { node, x, y, width, height: fixedH || 0, style, children: [], kind: node.localName || "div" };
  out.push(item);
  const content = { x: x + padding.left + border.left, y: y + padding.top + border.top, width: Math.max(1, width - padding.left - padding.right - border.left - border.right), height: Math.max(0, (fixedH || ctx.height || 0) - padding.top - padding.bottom - border.top - border.bottom), viewportHeight: ctx.viewportHeight };
  const kids = renderChildren(node);
  const contentH = kids.length ? layoutChildren(kids, item, content, out, display(style)) : renderOwnText(node) ? textHeight(renderOwnText(node), style, content.width) : 0;
  item.height = Math.max(fixedH || contentH + padding.top + padding.bottom + border.top + border.bottom, dim(style["min-height"], ctx.viewportHeight || 0), ctx.root ? Number(ctx.height || ctx.viewportHeight || 0) : defaultHeight(node, style));
  return item;
}

function layoutChildren(children, parent, ctx, out, mode) {
  if (mode === "grid") return layoutGrid(children, parent, ctx, out);
  if (mode === "flex") return layoutFlex(children, parent, ctx, out);
  let y = ctx.y, total = 0;
  for (const child of children) {
    const got = layoutNode(child, { x: ctx.x, y, width: ctx.width, viewportHeight: ctx.viewportHeight }, out);
    if (got) { parent.children.push(got); y += got.height; total += got.height; }
  }
  return total;
}

function layoutGrid(children, parent, ctx, out) {
  const s = parent.style || {}, gap = px(s.gap || s["column-gap"] || 0), rowGap = px(s["row-gap"] || s.gap || 0);
  const colText = String(s["grid-template-columns"] || "").trim(), rowText = String(s["grid-template-rows"] || "").trim();
  const cols = colText ? tracks(colText, ctx.width, gap, children.length) : [ctx.width];
  const rows = rowText ? tracks(rowText, ctx.height || 0, rowGap, Math.ceil(children.length / cols.length)) : [];
  const rowHeights = [];
  children.forEach((child, i) => {
    const c = i % cols.length, r = Math.floor(i / cols.length);
    const got = layoutNode(child, { x: ctx.x + sum(cols, 0, c) + gap * c, y: ctx.y + sum(rowHeights, 0, r) + rowGap * r, width: cols[c], height: rows[r] || 0, viewportHeight: ctx.viewportHeight }, out);
    if (got) { parent.children.push(got); rowHeights[r] = Math.max(rowHeights[r] || 0, rows[r] || got.height); }
  });
  return sum(rowHeights, 0, rowHeights.length) + rowGap * Math.max(0, rowHeights.length - 1);
}

function layoutFlex(children, parent, ctx, out) {
  const s = parent.style || {}, gap = px(s.gap || s["column-gap"] || 0), rowGap = px(s["row-gap"] || s.gap || 0);
  if (String(s["flex-direction"] || "row").startsWith("column")) return layoutColumn(children, parent, ctx, out, rowGap);
  const wrap = String(s["flex-wrap"] || "nowrap") !== "nowrap", lines = [[]];
  let lineW = 0;
  for (const child of children) {
    const basis = Math.min(ctx.width, flexBasis(child, ctx.width)), next = lineW ? lineW + gap + basis : basis;
    if (wrap && lines.at(-1).length && next > ctx.width + 0.5) { lines.push([]); lineW = 0; }
    lines.at(-1).push({ child, basis }); lineW = lineW ? lineW + gap + basis : basis;
  }
  let y = ctx.y, total = 0;
  for (const line of lines) {
    let x = ctx.x, h = 0;
    for (const e of line) { const got = layoutNode(e.child, { x, y, width: e.basis, viewportHeight: ctx.viewportHeight }, out); if (got) { parent.children.push(got); h = Math.max(h, got.height); } x += e.basis + gap; }
    y += h + rowGap; total += h + (line === lines.at(-1) ? 0 : rowGap);
  }
  return total;
}

function layoutColumn(children, parent, ctx, out, gap) { let y = ctx.y, total = 0; for (const child of children) { const got = layoutNode(child, { x: ctx.x, y, width: ctx.width, viewportHeight: ctx.viewportHeight }, out); if (got) { parent.children.push(got); y += got.height + gap; total += got.height + gap; } } return Math.max(0, total - gap); }
function measuredWidth(node, s, avail) { return Math.min(avail, dim(s.width, avail) || (node.localName === "canvas" ? dim(node.attributes?.width || node.width, avail) || avail : avail)); }
function measuredHeight(node, s, parent) { return dim(s.height, parent) || (node.localName === "canvas" ? dim(node.attributes?.height || node.height, parent) : 0); }
function flexBasis(node, parent) { const s = styleOf(node); return Math.max(1, dim(s["flex-basis"], parent) || dim(s.width, parent) || (node.localName === "canvas" ? dim(node.attributes?.width || node.width, parent) : 0) || Math.floor(parent / 2)); }
function tracks(text, total, gap, hint) { const parts = expandRepeat(text); const fixed = parts.map(p => p.endsWith("fr") ? 0 : dim(p, total)); const fr = parts.map(p => p.endsWith("fr") ? Number(p.slice(0, -2)) || 1 : 0); const free = Math.max(1, (total || sum(fixed, 0, fixed.length) || 1) - gap * Math.max(0, parts.length - 1) - sum(fixed, 0, fixed.length)); const frSum = sum(fr, 0, fr.length) || 1; return parts.length ? parts.map((_, i) => fixed[i] || (fr[i] ? free * fr[i] / frSum : 1)) : Array.from({ length: Math.max(1, hint || 1) }, () => total || 1); }
function expandRepeat(text) { const m = String(text || "").match(/repeat\((\d+)\s*,\s*([^)]*)\)/); return m ? Array.from({ length: Number(m[1]) || 1 }, () => m[2].trim()) : String(text || "").split(/\s+/).filter(Boolean); }
function layoutText(node, ctx, out, parentStyle) { const text = String(node.textContent || "").trim(); if (!text) return null; const item = { node, x: ctx.x, y: ctx.y, width: ctx.width, height: textHeight(text, parentStyle || {}, ctx.width), style: parentStyle || {}, kind: "#text", text }; out.push(item); return item; }
export function nodeFrom(raw = {}) { const localName = String(raw.tagName || raw.localName || "div").replace(/^#TEXT$/i, "#text").toLowerCase(); return { ...raw, localName, nodeType: raw.nodeType || (localName === "#text" ? 3 : 1), textContent: raw.textContent || "", style: raw.style || {}, computedStyle: raw.computedStyle || {}, attributes: raw.attributes || {}, children: childArray(raw.children).map(nodeFrom) }; }
function wireParents(node, parent = null) { if (!node) return node; Object.defineProperty(node, "parentNode", { value: parent, enumerable: false, configurable: true }); for (const child of node.children || []) wireParents(child, node); return node; }
function applyCascade(root, rules, viewport) { walk(root, n => { if (n.nodeType !== 1) return; const c = {}; for (const r of rules) if (matchesSelector(n, r.selector)) Object.assign(c, r.body); Object.assign(c, n.style || {}, parseStyleAttr(n.attributes?.style || "")); if (n.localName === "body") Object.assign(c, { margin: c.margin || "0", "background-color": c["background-color"] || "#090b12", color: c.color || "#f6f6fa", "min-height": c["min-height"] || `${viewport.height}px` }); n.computedStyle = c; }); }
function matchesSelector(node, selector) { const parts = String(selector || "").trim().split(/\s+/).filter(Boolean); if (!parts.length || !simpleMatch(node, parts.at(-1))) return false; let cur = node.parentNode; for (let i = parts.length - 2; i >= 0; i--) { while (cur && !simpleMatch(cur, parts[i])) cur = cur.parentNode; if (!cur) return false; cur = cur.parentNode; } return true; }
function simpleMatch(node, selector) { if (!node || node.nodeType !== 1) return false; const tag = selector.match(/^[a-zA-Z][\w-]*/)?.[0] || "", id = selector.match(/#([\w-]+)/)?.[1] || ""; const classes = [...selector.matchAll(/\.([\w-]+)/g)].map(m => m[1]); if (tag && node.localName !== tag.toLowerCase()) return false; if (id && node.id !== id && node.attributes?.id !== id) return false; const cn = String(node.className || node.attributes?.class || ""); return classes.every(c => cn.split(/\s+/).includes(c)); }
function collectCssRules(root) { const rules = []; walk(root, n => { if (n.localName === "style") rules.push(...parseCssRules(n.textContent || "")); }); return rules; }
function parseCssRules(css) { const rules = []; for (const m of String(css || "").matchAll(/([^{}]+)\{([^{}]+)\}/g)) for (const sel of m[1].split(",").map(s => s.trim()).filter(Boolean)) rules.push({ selector: sel, body: parseStyleAttr(m[2]), specificity: specificity(sel) }); return rules.sort((a, b) => a.specificity - b.specificity); }
function childArray(c) { if (!c) return []; if (Array.isArray(c)) return c; if (typeof c === "object") return Object.values(c).filter(v => v && typeof v === "object"); return []; }
function renderChildren(n) { return (n.children || []).filter(c => !hidden(c) && (c.nodeType !== 3 || String(c.textContent || "").trim())); }
function renderOwnText(n) { return hidden(n) || (n.children || []).length ? "" : String(n.textContent || "").trim(); }
function findBody(n) { if (!n) return null; if (n.localName === "body") return n; for (const c of n.children || []) { const got = findBody(c); if (got) return got; } return null; }
function walk(n, fn) { if (!n) return; fn(n); for (const c of n.children || []) walk(c, fn); }
function styleOf(n) { return { ...(n.computedStyle || {}), ...(n.style || {}), ...parseStyleAttr(n.attributes?.style || "") }; }
function parseStyleAttr(t) { const out = {}; for (const p of String(t || "").split(";")) { const at = p.indexOf(":"); if (at > -1) out[p.slice(0, at).trim()] = p.slice(at + 1).trim(); } return out; }
function display(s) { return String(s.display || "block").toLowerCase(); }
function hidden(n) { return ["br", "script", "style", "template", "head", "title", "meta", "link"].includes(n.localName) || n.hidden || String(n.style?.display || n.computedStyle?.display || "").toLowerCase() === "none"; }
function dim(v, parent) { const t = String(v || "").trim(); if (!t || t === "auto") return 0; if (t.endsWith("%")) return parent * Number(t.slice(0, -1)) / 100; const m = t.match(/-?\d+(?:\.\d+)?/); return m ? Number(m[0]) : 0; }
function box(s, p, shorthand = "") { const all = dim(s[p] || shorthand, 0); return { top: dim(s[`${p}-top`], 0) || all, right: dim(s[`${p}-right`], 0) || all, bottom: dim(s[`${p}-bottom`], 0) || all, left: dim(s[`${p}-left`], 0) || all }; }
function textHeight(text, s, width) { const size = dim(s["font-size"], 0) || 14; return Math.max(size + 4, Math.ceil(String(text || "").length / Math.max(1, Math.floor(width / Math.max(6, size * 0.55)))) * (size + 5)); }
function defaultHeight(n, s) { if (["h1", "h2", "h3"].includes(n.localName)) return 36; if (n.localName === "p") return 28; if (["button", "input", "select", "textarea"].includes(n.localName)) return dim(s.height, 0) || 38; if (n.localName === "canvas") return measuredHeight(n, s, 0) || 150; return 22; }
function px(v) { const m = String(v || "").match(/-?\d+(?:\.\d+)?/); return m ? Number(m[0]) : 0; }
function sum(list, from, to) { let n = 0; for (let i = from; i < to; i++) n += Number(list[i] || 0); return n; }
function specificity(s) { return (s.match(/#/g) || []).length * 100 + (s.match(/\./g) || []).length * 10 + s.split(/[.#\s:]+/).filter(Boolean).length; }
