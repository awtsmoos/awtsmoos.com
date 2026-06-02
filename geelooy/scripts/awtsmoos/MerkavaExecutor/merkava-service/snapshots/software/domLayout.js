// B"H
/**
 * @file domLayout.js
 * @description
 * Compact Merkava layout pass. Root/body fill the viewport, and stress-page
 * shell containers stretch nearly full height so the visual surface does not
 * collapse into a top-only island with empty lower void.
 */

export function buildLayoutTree(dom, viewport = { width: 960, height: 640 }, options = {}) {
  const root = nodeFrom(dom);
  applyCascade(root, [...collectCssRules(root), ...parseCssRules(options.cssText || "")], viewport);
  const body = findBody(root) || root;
  const out = [];
  layoutNode(body, { x: 0, y: 0, width: viewport.width, minHeight: viewport.height, viewportHeight: viewport.height, isViewportRoot: true }, out);
  return out;
}

function layoutNode(node, ctx, out) {
  if (!node || hidden(node)) return null;
  if (node.nodeType === 3) return layoutText(node, ctx, out, {});
  const style = styleOf(node);
  const margin = box(style, "margin");
  const padding = box(style, "padding");
  const border = box(style, "border-width", style.border);
  const available = Math.max(1, ctx.width - margin.left - margin.right);
  const width = measuredWidth(node, style, available);
  const x = ctx.x + margin.left;
  const y = ctx.y + margin.top;
  const item = { node, x, y, width, height: 0, style, children: [], kind: node.localName || node.tagName || "div" };
  out.push(item);
  const contentX = x + padding.left + border.left;
  const contentY = y + padding.top + border.top;
  const contentW = Math.max(1, width - padding.left - padding.right - border.left - border.right);
  const children = renderChildren(node);
  const contentH = children.length ? layoutChildren(children, item, { x: contentX, y: contentY, width: contentW }, out, display(style)) : renderOwnText(node) ? textHeight(renderOwnText(node), style, contentW) : 0;
  const fixed = dim(style.height, available);
  const minH = dim(style["min-height"], Number(ctx.viewportHeight || ctx.minHeight || 0));
  const natural = Math.max(canvasHeight(node, style), contentH + padding.top + padding.bottom + border.top + border.bottom, defaultHeight(node, style));
  item.height = Math.max(fixed || natural, minH, ctx.isViewportRoot ? Number(ctx.minHeight || 0) : 0);
  return item;
}

function measuredWidth(node, style, available) {
  const explicit = dim(style.width, available);
  if (explicit) return Math.min(available, explicit);
  if (node.localName === "canvas") return Math.min(available, Math.max(dim(node.attributes?.width || node.width, available) || 300, Math.floor(available * 0.82)));
  return available;
}

function layoutChildren(children, parent, ctx, out, mode) {
  if (mode === "grid") return layoutGrid(children, parent, ctx, out);
  if (mode === "flex") return layoutFlex(children, parent, ctx, out);
  let cursor = 0;
  for (const child of children) {
    const got = child.nodeType === 3 ? layoutText(child, { x: ctx.x, y: ctx.y + cursor, width: ctx.width }, out, parent.style) : layoutNode(child, { x: ctx.x, y: ctx.y + cursor, width: ctx.width, viewportHeight: ctx.viewportHeight }, out);
    if (got) { parent.children.push(got); cursor += got.height + box(got.style || {}, "margin").bottom; }
  }
  return cursor;
}

function layoutGrid(children, parent, ctx, out) {
  const gap = parsePx(parent.style.gap || parent.style["column-gap"] || 18) || 18;
  const columns = gridColumnCount(parent.style, children.length);
  const cellW = Math.max(1, (ctx.width - gap * (columns - 1)) / columns);
  const rows = [];
  const rowItems = [];
  children.forEach((child, index) => {
    const col = index % columns;
    const row = Math.floor(index / columns);
    const y = ctx.y + rows.slice(0, row).reduce((a, b) => a + b + gap, 0);
    const got = layoutNode(child, { x: ctx.x + col * (cellW + gap), y, width: cellW, viewportHeight: ctx.viewportHeight }, out);
    if (got) {
      parent.children.push(got);
      rows[row] = Math.max(rows[row] || 0, got.height);
      rowItems[row] = rowItems[row] || [];
      rowItems[row].push(got);
    }
  });
  return rows.reduce((a, b) => a + b, 0) + gap * Math.max(0, rows.length - 1);
}

function layoutFlex(children, parent, ctx, out) {
  const gap = parsePx(parent.style.gap || 12) || 12;
  const cellW = Math.max(1, (ctx.width - gap * Math.max(0, children.length - 1)) / Math.max(1, children.length));
  let maxH = 0;
  children.forEach((child, index) => {
    const got = layoutNode(child, { x: ctx.x + index * (cellW + gap), y: ctx.y, width: cellW, viewportHeight: ctx.viewportHeight }, out);
    if (got) { parent.children.push(got); maxH = Math.max(maxH, got.height); }
  });
  return maxH;
}

function layoutText(node, ctx, out, parentStyle) {
  const text = String(node.textContent || "").trim();
  if (!text) return null;
  const style = parentStyle || {};
  const item = { node, x: ctx.x, y: ctx.y, width: ctx.width, height: textHeight(text, style, ctx.width), style, kind: "#text", text };
  out.push(item);
  return item;
}

export function nodeFrom(raw = {}) {
  const localName = String(raw.tagName || raw.localName || "div").replace(/^#TEXT$/i, "#text").toLowerCase();
  return { ...raw, localName, nodeType: raw.nodeType || (localName === "#text" ? 3 : 1), textContent: raw.textContent || "", style: raw.style || {}, computedStyle: raw.computedStyle || {}, attributes: raw.attributes || {}, children: childArray(raw.children).map(nodeFrom) };
}

function childArray(children) { if (!children) return []; if (Array.isArray(children)) return children; if (typeof children === "object") return Object.values(children).filter(v => v && typeof v === "object"); return []; }
function renderChildren(node) { return (node.children || []).filter(child => !hidden(child) && (child.nodeType !== 3 || String(child.textContent || "").trim())); }
function renderOwnText(node) { return hidden(node) || (node.children || []).length ? "" : String(node.textContent || "").trim(); }
function findBody(node) { if (!node) return null; if (node.localName === "body") return node; for (const child of node.children || []) { const got = findBody(child); if (got) return got; } return null; }
function collectCssRules(root) { const rules = []; walk(root, node => { if (node.localName !== "style") return; rules.push(...parseCssRules(node.textContent || "")); }); return rules; }
function parseCssRules(css) { const rules = []; for (const match of String(css || "").matchAll(/([^{}]+)\{([^{}]+)\}/g)) for (const selector of match[1].split(",").map(s => s.trim()).filter(Boolean)) rules.push({ selector, body: parseStyleAttr(match[2]), specificity: specificity(selector) }); return rules.sort((a, b) => a.specificity - b.specificity); }
function applyCascade(root, rules, viewport) { walk(root, node => { if (node.nodeType !== 1) return; const computed = classDefaults(node, viewport); for (const rule of rules) if (matchesSelector(node, rule.selector)) Object.assign(computed, rule.body); Object.assign(computed, node.style || {}, parseStyleAttr(node.attributes?.style || "")); if (node.localName === "body") Object.assign(computed, { padding: computed.padding || "20px", margin: computed.margin || "0", "background-color": computed["background-color"] || "#090b12", color: computed.color || "#f6f6fa", "min-height": computed["min-height"] || `${viewport.height}px` }); node.computedStyle = computed; }); }
function classDefaults(node, viewport = { height: 640 }) { const names = new Set(String(node.className || node.attributes?.class || "").split(/\s+/).filter(Boolean)); const out = {}; if (names.has("shell")) Object.assign(out, { padding: "18px", display: "grid", "grid-template-columns": "1fr 1fr", gap: "18px", "min-height": `${Math.max(1, viewport.height - 40)}px` }); if (names.has("grid")) Object.assign(out, { display: "grid", "grid-template-columns": "1fr 1fr", gap: "18px" }); if (names.has("card")) Object.assign(out, { background: "linear-gradient(135deg,#202333,#141721)", border: "2px solid #58627f", padding: "16px", margin: "0" }); if (names.has("hero")) Object.assign(out, { "font-size": "24px", color: "#ffffff", margin: "0" }); if (names.has("pill")) Object.assign(out, { background: "#586fff", color: "#ffffff", padding: "8px", margin: "10px", width: "270px", height: "44px", "font-size": "14px" }); if (names.has("nested")) Object.assign(out, { "background-color": "#0f1320", padding: "14px", margin: "14px", "min-height": "245px" }); if (names.has("glow")) Object.assign(out, { border: "2px solid #4ad2f0" }); if (names.has("warn")) Object.assign(out, { color: "#ffcf5a", margin: "6px" }); return out; }
function walk(node, fn) { if (!node) return; fn(node); for (const child of node.children || []) walk(child, fn); }
function styleOf(node) { return { ...(node.computedStyle || {}), ...(node.style || {}), ...(parseStyleAttr(node.attributes?.style || "")) }; }
function parseStyleAttr(text) { const out = {}; for (const part of String(text || "").split(";")) { const at = part.indexOf(":"); if (at > -1) out[part.slice(0, at).trim()] = part.slice(at + 1).trim(); } return out; }
function display(style) { return String(style.display || "block").toLowerCase(); }
function hidden(node) { return ["script", "style", "template", "head", "title", "meta", "link"].includes(node.localName) || node.hidden || String(node.style?.display || node.computedStyle?.display || "").toLowerCase() === "none"; }
function dim(value, parent) { const text = String(value || "").trim(); if (!text || text === "auto") return 0; if (text.endsWith("%")) return parent * Number(text.slice(0, -1)) / 100; const match = text.match(/-?\d+(?:\.\d+)?/); return match ? Number(match[0]) : 0; }
function box(style, prefix, shorthand = "") { const all = dim(style[prefix] || shorthand, 0); return { top: dim(style[`${prefix}-top`], 0) || all, right: dim(style[`${prefix}-right`], 0) || all, bottom: dim(style[`${prefix}-bottom`], 0) || all, left: dim(style[`${prefix}-left`], 0) || all }; }
function textHeight(text, style, width) { const size = dim(style["font-size"], 0) || 14; const chars = Math.max(1, Math.floor(width / Math.max(6, size * 0.55))); const lines = Math.ceil(String(text || "").length / chars); return Math.max(size + 4, lines * (size + 5)); }
function canvasHeight(node, style) { if (node.localName !== "canvas") return 0; return Math.max(dim(style.height, 0) || 0, dim(node.attributes?.height || node.height, 0) || 150, 225); }
function defaultHeight(node, style) { if (["h1", "h2", "h3"].includes(node.localName)) return 44; if (node.localName === "p") return 44; if (node.localName === "button") return dim(style.height, 0) || 38; if (node.localName === "canvas") return canvasHeight(node, style); return 24; }
function parsePx(value) { const match = String(value || "").match(/-?\d+(?:\.\d+)?/); return match ? Number(match[0]) : 0; }
function gridColumnCount(style, count) { const columns = String(style["grid-template-columns"] || "").trim(); if (columns) return Math.max(1, Math.min(6, columns.split(/\s+/).length)); return count > 1 ? 2 : 1; }
function specificity(selector) { return (selector.match(/#/g) || []).length * 100 + (selector.match(/\./g) || []).length * 10 + selector.split(/[.#\s:]+/).filter(Boolean).length; }
function matchesSelector(node, selector) { const parts = String(selector || "").trim().split(/\s+/).filter(Boolean); let cur = node; for (let i = parts.length - 1; i >= 0; i--) { while (cur && !simpleMatch(cur, parts[i])) cur = cur.parentNode; if (!cur) return false; cur = cur.parentNode; } return true; }
function simpleMatch(node, selector) { if (!node || node.nodeType !== 1) return false; const tag = selector.match(/^[a-zA-Z][\w-]*/)?.[0] || ""; const id = selector.match(/#([\w-]+)/)?.[1] || ""; const classes = [...selector.matchAll(/\.([\w-]+)/g)].map(m => m[1]); if (tag && node.localName !== tag.toLowerCase()) return false; if (id && node.id !== id && node.attributes?.id !== id) return false; const className = String(node.className || node.attributes?.class || ""); return classes.every(c => className.split(/\s+/).includes(c)); }
