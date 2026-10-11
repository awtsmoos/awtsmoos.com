// B"H
/**
 * @file elementsInspector.js
 * @description Elements inspector for Merkava DevTools.
 *
 * Inspects the live render pipeline: the parsed DOM tree, computed styles
 * (via the real cascade), and layout boxes (via the real layout engine).
 * Supports finding elements by selector-ish queries and editing a node's
 * inline style with an instant re-render.
 *
 * Purely additive: reads pipeline outputs, never mutates shared modules.
 */

import { parseHtmlToDom } from "../software/htmlParser.js";
import { compileStylesheet } from "../software/cascade.js";
import { buildLayoutTree } from "../software/domLayout.js";

let nodeSeq = 1;
function tagNode(node, parentId = null) {
  if (!node || typeof node !== "object") return;
  if (!node.__devId) node.__devId = nodeSeq++;
  node.__devParent = parentId;
  for (const child of (node.children || [])) tagNode(child, node.__devId);
}

function nodeLabel(node) {
  const tag = node.tagName || node.localName || node.kind || "#node";
  const id = node.attributes?.id || node.id ? `#${node.attributes?.id || node.id}` : "";
  const cls = node.attributes?.class || node.className ? `.${String(node.attributes?.class || node.className).trim().split(/\s+/).join(".")}` : "";
  return `${tag}${id}${cls}`;
}

function domToTree(node, depth = 0, maxDepth = 12) {
  if (!node || depth > maxDepth) return null;
  const kids = (node.children || []).map((c) => domToTree(c, depth + 1, maxDepth)).filter(Boolean);
  const text = typeof node.textContent === "string" && !node.children?.length
    ? node.textContent.slice(0, 80) : null;
  return {
    devId: node.__devId || null,
    label: nodeLabel(node),
    tag: node.tagName || node.localName || null,
    text,
    childCount: (node.children || []).length,
    children: kids
  };
}

function findByDevId(node, devId) {
  if (!node || typeof node !== "object") return null;
  if (node.__devId === devId) return node;
  for (const child of (node.children || [])) {
    const hit = findByDevId(child, devId);
    if (hit) return hit;
  }
  return null;
}

function matchSimple(node, sel) {
  const s = String(sel).trim();
  if (!s) return false;
  const tag = (node.tagName || node.localName || "").toLowerCase();
  if (s.startsWith("#")) {
    const id = node.attributes?.id || node.id;
    return id === s.slice(1);
  }
  if (s.startsWith(".")) {
    const cls = String(node.attributes?.class || node.className || "").split(/\s+/);
    return cls.includes(s.slice(1));
  }
  return tag === s.toLowerCase();
}

function queryAll(node, sel, out = []) {
  if (!node || typeof node !== "object") return out;
  if (matchSimple(node, sel)) out.push(node);
  for (const child of (node.children || [])) queryAll(child, sel, out);
  return out;
}

export class ElementsInspector {
  constructor() {
    this.dom = null;
    this.cssText = "";
    this.layout = [];
    this.width = 0;
    this.height = 0;
  }

  /** Load raw HTML through the REAL pipeline: parse -> cascade -> layout. */
  load(html, options = {}) {
    this.width = Number(options.width) || 960;
    this.height = Number(options.height) || 640;
    this.cssText = String(options.cssText || "");
    this.dom = parseHtmlToDom(String(html || ""));
    tagNode(this.dom);
    const env = { width: this.width, height: this.height };
    this.layout = buildLayoutTree(this.dom, env, { cssText: this.cssText });
    return { nodes: this.countNodes(), layoutItems: this.layout.length };
  }

  countNodes() {
    let n = 0;
    const walk = (node) => { if (!node || typeof node !== "object") return; n++; for (const c of (node.children || [])) walk(c); };
    walk(this.dom);
    return n;
  }

  getTree(maxDepth = 8) { return this.dom ? domToTree(this.dom, 0, maxDepth) : null; }

  querySelector(sel) {
    const hits = this.dom ? queryAll(this.dom, sel).slice(0, 20) : [];
    return hits.map((n) => ({ devId: n.__devId, label: nodeLabel(n) }));
  }

  /** Full detail for one element: attributes, inline style, layout box. */
  inspect(devId) {
    const node = this.dom ? findByDevId(this.dom, Number(devId)) : null;
    if (!node) return null;
    const box = this.layout.find((item) => item && item.node === node)
      || this.layout.find((item) => item && item.devId === Number(devId))
      || null;
    return {
      devId: node.__devId,
      label: nodeLabel(node),
      tag: node.tagName || node.localName || null,
      attributes: node.attributes || {},
      inlineStyle: node.style || {},
      text: typeof node.textContent === "string" ? node.textContent.slice(0, 300) : null,
      layoutBox: box ? {
        kind: box.kind, x: box.x, y: box.y, w: box.w ?? box.width, h: box.h ?? box.height,
        bg: box.bg, color: box.color
      } : null,
      childCount: (node.children || []).length
    };
  }

  /** Computed style via the REAL cascade: compile + match against the node. */
  computedStyle(devId) {
    const node = this.dom ? findByDevId(this.dom, Number(devId)) : null;
    if (!node) return null;
    let computed = {};
    try {
      const sheet = compileStylesheet(this.cssText || "", {}, 0);
      // Best-effort: apply matching rules in order; later wins (simplified cascade).
      const rules = sheet.rules || sheet || [];
      const tag = (node.tagName || node.localName || "").toLowerCase();
      const id = node.attributes?.id || node.id;
      const cls = String(node.attributes?.class || node.className || "").split(/\s+/).filter(Boolean);
      for (const rule of (Array.isArray(rules) ? rules : [])) {
        const sel = String(rule.selector || rule.sel || "");
        let hit = false;
        if (sel === tag) hit = true;
        else if (id && sel === `#${id}`) hit = true;
        else if (cls.some((c) => sel === `.${c}`)) hit = true;
        else if (sel === "*") hit = true;
        if (hit && rule.declarations) Object.assign(computed, rule.declarations);
      }
    } catch { /* cascade shape varies; fall through */ }
    Object.assign(computed, node.style || {});
    return computed;
  }

  /** Edit a node's inline style and re-run layout (instant re-render data). */
  setInlineStyle(devId, styleObj) {
    const node = this.dom ? findByDevId(this.dom, Number(devId)) : null;
    if (!node) return { ok: false, error: "node not found" };
    node.style = { ...(node.style || {}), ...(styleObj || {}) };
    const env = { width: this.width, height: this.height };
    this.layout = buildLayoutTree(this.dom, env, { cssText: this.cssText });
    return { ok: true, layoutItems: this.layout.length, box: this.inspect(Number(devId))?.layoutBox || null };
  }

  setText(devId, text) {
    const node = this.dom ? findByDevId(this.dom, Number(devId)) : null;
    if (!node) return { ok: false, error: "node not found" };
    node.textContent = String(text);
    node.children = [];
    const env = { width: this.width, height: this.height };
    this.layout = buildLayoutTree(this.dom, env, { cssText: this.cssText });
    return { ok: true, layoutItems: this.layout.length };
  }
}
