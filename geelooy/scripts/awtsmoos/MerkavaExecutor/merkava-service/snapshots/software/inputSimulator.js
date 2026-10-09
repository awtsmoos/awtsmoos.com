// B"H
/**
 * @file inputSimulator.js
 * @description Input simulation for Merkava's software renderer.
 *
 * Simulates mouse (hover/move/click/dblclick/drag with coordinate hit-testing),
 * keyboard (keydown/keyup/keypress, text entry, Tab focus traversal, Enter to
 * submit, modifier shortcuts), and focus. UI states (:hover, :active, :focus)
 * flow through the renderer's real cascade via the documented
 * `element.__merkavaState` / `ownerDocument.activeElement` contract in
 * merkava-browser/standards/css/CssPseudoMatcher.js — no cascade changes.
 *
 * Performance: one pooled event object reused across dispatches (no per-event
 * allocation in the hot path), HTML parsed once, layout rebuilt only on render.
 */
import { renderVirtualSnapshotPng } from "../virtualPngRenderer.js";
import { parseHtmlToDom, extractStyleText } from "./htmlParser.js";
import { buildLayoutTree } from "./domLayout.js";
import { writeFileSync } from "fs";

const FOCUSABLE_RE = /^(a|button|input|select|textarea)$/;
let simIdCounter = 1;

function isFocusable(node) {
  if (!node || node.nodeType !== 1) return false;
  const tag = node.localName;
  if (node.attributes?.tabindex != null) return true;
  if (tag === "a") return node.attributes?.href != null;
  if (tag === "input") return (node.attributes?.type || "text").toLowerCase() !== "hidden";
  return FOCUSABLE_RE.test(tag);
}

function matchesSimpleSelector(node, selector) {
  const s = String(selector).trim();
  if (!node || node.nodeType !== 1) return false;
  if (s.startsWith("#")) return node.attributes?.id === s.slice(1);
  if (s.startsWith(".")) {
    const cls = String(node.attributes?.class || "").split(/\s+/);
    return cls.includes(s.slice(1));
  }
  return node.localName === s.toLowerCase();
}

export class InputSimulator {
  constructor(html, options = {}) {
    this.width = Math.max(1, Number(options.width) || 960);
    this.height = Math.max(1, Number(options.height) || 700);
    this._html = String(html);
    this._cssText = extractStyleText(this._html) || "";
    this._dom = parseHtmlToDom(this._html);
    // Document facade satisfying the :focus / :target pseudo contract.
    this.docState = { activeElement: null, __merkavaTargetId: null, documentElement: null };
    this._handlers = new Map(); // "type:selector" -> [fn]
    this._eventLog = [];
    this._pool = { type: "", target: null, clientX: 0, clientY: 0, key: "", ctrlKey: false, shiftKey: false, altKey: false, metaKey: false, defaultPrevented: false, preventDefault() { this.defaultPrevented = true; } };
    this._mouse = { x: 0, y: 0, down: false, downX: 0, downY: 0, downNode: null, dragMoves: [] };
    this._lastClick = { t: 0, node: null };
    this._focused = null;
    this.lastResult = null;
    this._autoRender = true;
    this._indexTree(this._dom, null);
    this.docState.documentElement = this._dom;
  }

  /** Disable/enable automatic re-render after each interaction (for stress loops). */
  quiet(v = true) { this._autoRender = !v; return this; }
  _maybeRender() { if (this._autoRender) this.render(); }

  _indexTree(node, parent) {
    if (!node) return;
    node.__simParent = parent || null;
    if (node.nodeType === 1) {
      node.__simId = simIdCounter++;
      node.__merkavaState = node.__merkavaState || {};
      node.ownerDocument = this.docState;
      if (node.attributes && !("value" in node) && (node.localName === "input" || node.localName === "textarea")) {
        node.value = node.attributes.value || "";
      }
    }
    for (const c of node.children || []) this._indexTree(c, node);
  }

  _walk(node, out = []) {
    if (!node) return out;
    out.push(node);
    for (const c of node.children || []) this._walk(c, out);
    return out;
  }

  _nodeBySimId(id) {
    return this._walk(this._dom).find((n) => n.__simId === id) || null;
  }

  /* ---------------- events ---------------- */

  /** Register a handler: on('click', '#buy', fn). */
  on(type, selector, fn) {
    const key = `${type}:${selector}`;
    if (!this._handlers.has(key)) this._handlers.set(key, []);
    this._handlers.get(key).push(fn);
    return this;
  }

  _dispatch(type, targetNode, props = {}) {
    const e = this._pool;
    e.type = type; e.target = targetNode;
    e.clientX = props.clientX ?? 0; e.clientY = props.clientY ?? 0;
    e.key = props.key ?? ""; e.ctrlKey = !!props.ctrlKey; e.shiftKey = !!props.shiftKey;
    e.altKey = !!props.altKey; e.metaKey = !!props.metaKey;
    e.defaultPrevented = false;
    this._eventLog.push({ type, node: targetNode ? (targetNode.attributes?.id || targetNode.localName) : null, key: e.key || undefined });
    if (!targetNode) return e;
    // Bubble: target -> ancestors (real DOM behavior).
    let node = targetNode;
    while (node) {
      for (const [key, fns] of this._handlers) {
        const idx = key.indexOf(":");
        const t = key.slice(0, idx), sel = key.slice(idx + 1);
        if (t !== type) continue;
        if (matchesSimpleSelector(node, sel)) {
          for (const fn of fns) { try { fn(e, node); } catch { /* handler errors don't break sim */ } }
        }
      }
      node = node.__simParent || null;
    }
    return e;
  }

  get eventLog() { return this._eventLog; }
  clearLog() { this._eventLog = []; return this; }

  /* ---------------- layout + hit testing ---------------- */

  _layoutItems() {
    return buildLayoutTree(this._dom, { width: this.width, height: this.height }, { cssText: this._cssText });
  }

  _elementForItem(item) {
    let node = item?.node;
    if (!node) return null;
    if (node.nodeType === 3) node = node.__simParent || node.parentNode || null;
    // Map layout copy back to canonical node via __simId.
    if (node && node.__simId) return this._nodeBySimId(node.__simId);
    return null;
  }

  /** Topmost element at viewport coordinates. */
  hitTest(x, y) {
    const items = this._layoutItems();
    for (let i = items.length - 1; i >= 0; i--) {
      const it = items[i];
      if (!it || it.width <= 0 || it.height <= 0) continue;
      if (x >= it.x && x <= it.x + it.width && y >= it.y && y <= it.y + it.height) {
        const el = this._elementForItem(it);
        if (el) return el;
      }
    }
    return null;
  }

  /** Center of a node matched by selector (for driving clicks/hovers). */
  centerOf(selector) {
    const target = this._walk(this._dom).find((n) => n.nodeType === 1 && matchesSimpleSelector(n, selector));
    if (!target) return null;
    const items = this._layoutItems();
    for (let i = items.length - 1; i >= 0; i--) {
      const it = items[i];
      const el = this._elementForItem(it);
      if (el === target && it.width > 0 && it.height > 0) {
        return { x: Math.round(it.x + it.width / 2), y: Math.round(it.y + it.height / 2), node: target };
      }
    }
    return null;
  }

  /* ---------------- mouse ---------------- */

  _setHover(node) {
    const prev = this._walk(this._dom).find((n) => n.__merkavaState?.hover);
    if (prev === node) return;
    if (prev) {
      prev.__merkavaState.hover = false;
      this._dispatch("mouseout", prev); this._dispatch("mouseleave", prev);
    }
    if (node) {
      node.__merkavaState.hover = true;
      this._dispatch("mouseover", node); this._dispatch("mouseenter", node);
    }
  }

  /** Move the mouse; hover states + mousemove fire. Returns hovered node. */
  moveMouse(x, y) {
    const node = this.hitTest(x, y);
    this._setHover(node);
    this._mouse.x = x; this._mouse.y = y;
    if (node) this._dispatch("mousemove", node, { clientX: x, clientY: y });
    if (this._mouse.down) this._mouse.dragMoves.push({ x, y });
    this._maybeRender();
    return node;
  }

  hover(x, y) { return this.moveMouse(x, y); }

  /** Tooltip text for the currently hovered element (title attribute). */
  tooltip() {
    const hov = this._walk(this._dom).find((n) => n.__merkavaState?.hover);
    return hov?.attributes?.title || "";
  }

  mousedown(x, y, button = 0) {
    const node = this.hitTest(x, y);
    this._mouse.down = true; this._mouse.downX = x; this._mouse.downY = y;
    this._mouse.downNode = node; this._mouse.dragMoves = [{ x, y }];
    if (node) {
      node.__merkavaState.active = true;
      this._dispatch("mousedown", node, { clientX: x, clientY: y });
      // mousedown focuses focusable elements (real browser behavior)
      if (isFocusable(node)) this.focus(node);
    }
    this._maybeRender();
    return node;
  }

  mouseup(x, y, button = 0) {
    const node = this.hitTest(x, y);
    const wasDown = this._mouse.downNode;
    this._mouse.down = false;
    if (wasDown) wasDown.__merkavaState.active = false;
    if (node) this._dispatch("mouseup", node, { clientX: x, clientY: y });
    let clicked = null;
    if (node && wasDown && node === wasDown) {
      clicked = node;
      const now = Date.now();
      const isDbl = this._lastClick.node === node && now - this._lastClick.t < 500;
      this._dispatch("click", node, { clientX: x, clientY: y });
      if (isDbl) { this._dispatch("dblclick", node, { clientX: x, clientY: y }); this._lastClick = { t: 0, node: null }; }
      else this._lastClick = { t: now, node };
    } else {
      this._lastClick = { t: 0, node: null };
    }
    if (this._mouse.dragMoves.length > 2 && wasDown) {
      this._dispatch("dragend", wasDown, { clientX: x, clientY: y });
    }
    this._mouse.downNode = null; this._mouse.dragMoves = [];
    this._maybeRender();
    return clicked;
  }

  /** Full click: mousedown + mouseup. Returns the clicked node (or null). */
  click(x, y) { this.mousedown(x, y); return this.mouseup(x, y); }
  dblclick(x, y) {
    this._lastClick = { t: 0, node: null }; // isolate from prior clicks
    // Suppress intermediate renders: wall-clock dblclick threshold (500ms)
    // would otherwise expire during layout/paint between the two clicks.
    const q = this._autoRender;
    this._autoRender = false;
    this.click(x, y);
    this.click(x, y);
    this._autoRender = q;
    this._maybeRender();
  }

  /** Drag from (x1,y1) to (x2,y2) in steps. Returns recorded move points. */
  drag(x1, y1, x2, y2, steps = 5) {
    const node = this.mousedown(x1, y1);
    if (node) this._dispatch("dragstart", node, { clientX: x1, clientY: y1 });
    const moves = [];
    for (let i = 1; i <= steps; i++) {
      const x = Math.round(x1 + ((x2 - x1) * i) / steps);
      const y = Math.round(y1 + ((y2 - y1) * i) / steps);
      const n = this.hitTest(x, y);
      this._setHover(n);
      if (node) this._dispatch("drag", node, { clientX: x, clientY: y });
      moves.push({ x, y });
      this._mouse.dragMoves.push({ x, y });
    }
    this.mouseup(x2, y2);
    return moves;
  }

  /* ---------------- focus + keyboard ---------------- */

  focusable() { return this._walk(this._dom).filter(isFocusable); }

  focus(node) {
    const el = typeof node === "string" ? this._walk(this._dom).find((n) => n.nodeType === 1 && matchesSimpleSelector(n, node)) : node;
    if (!el || !isFocusable(el)) return false;
    if (this._focused === el) return true;
    if (this._focused) this._dispatch("blur", this._focused);
    this._focused = el;
    this.docState.activeElement = el;
    this._dispatch("focus", el);
    this._maybeRender();
    return true;
  }

  blur() {
    if (this._focused) { this._dispatch("blur", this._focused); this._focused = null; }
    this.docState.activeElement = null;
    this._maybeRender();
  }

  get focused() { return this._focused; }

  /** Tab order traversal. shift=true goes backward. */
  tab(shift = false) {
    const list = this.focusable();
    if (!list.length) return null;
    let idx = list.indexOf(this._focused);
    idx = idx < 0 ? (shift ? list.length - 1 : 0) : (idx + (shift ? -1 : 1) + list.length) % list.length;
    this.focus(list[idx]);
    this._dispatch("keydown", list[idx], { key: "Tab", shiftKey: shift });
    return list[idx];
  }

  keyDown(key, mods = {}) {
    const t = this._focused || this._dom;
    return this._dispatch("keydown", t.nodeType === 1 ? t : null, { key, ...mods });
  }
  keyUp(key, mods = {}) {
    const t = this._focused || this._dom;
    return this._dispatch("keyup", t.nodeType === 1 ? t : null, { key, ...mods });
  }

  /**
   * Press a key: keydown -> (keypress + input for printable) -> keyup.
   * Handles text entry, Backspace, Enter (submit), Tab (traversal).
   */
  press(key, mods = {}) {
    const target = this._focused && this._focused.nodeType === 1 ? this._focused : null;
    const kd = this.keyDown(key, mods);
    let result = { key, prevented: kd.defaultPrevented };
    if (!kd.defaultPrevented) {
      if (key === "Tab") { this.tab(!!mods.shiftKey); }
      else if (key === "Enter") {
        if (target) this._dispatch("keypress", target, { key, ...mods });
        this._submitFrom(target);
      }
      else if (key === "Backspace") {
        if (target && (target.localName === "input" || target.localName === "textarea")) {
          target.value = String(target.value || "").slice(0, -1);
          this._dispatch("input", target, { key, ...mods });
        }
      }
      else if (key.length === 1 && target && (target.localName === "input" || target.localName === "textarea") && !mods.ctrlKey && !mods.metaKey) {
        target.value = String(target.value || "") + key;
        this._dispatch("keypress", target, { key, ...mods });
        this._dispatch("input", target, { key, ...mods });
      } else if (target) {
        this._dispatch("keypress", target, { key, ...mods });
      }
    }
    this.keyUp(key, mods);
    this._maybeRender();
    return result;
  }

  /** Type a string into the focused (or selected) field. */
  type(text, selector) {
    if (selector) this.focus(selector);
    for (const ch of String(text)) this.press(ch);
    return this._focused ? this._focused.value : "";
  }

  _submitFrom(node) {
    let form = node;
    while (form && form.localName !== "form") form = form.__simParent;
    if (!form) return false;
    // Collect named field values (real form serialization behavior) — recorded
    // even when preventDefault stops submission, like a real submit event.
    const data = {};
    for (const n of this._walk(form)) {
      if (n.nodeType === 1 && n.attributes?.name && (n.localName === "input" || n.localName === "textarea" || n.localName === "select")) {
        data[n.attributes.name] = n.value ?? n.attributes.value ?? "";
      }
    }
    this._lastSubmit = { form, data };
    const e = this._dispatch("submit", form);
    return !e.defaultPrevented;
  }

  get lastSubmit() { return this._lastSubmit || null; }

  /* ---------------- render ---------------- */

  render() {
    this.lastResult = renderVirtualSnapshotPng(
      { dom: this._dom, cssText: this._cssText },
      { width: this.width, height: this.height }
    );
    return this.lastResult;
  }

  savePng(path) {
    if (!this.lastResult) this.render();
    writeFileSync(path, Buffer.from(this.lastResult.dataUrl.split(",")[1], "base64"));
    return path;
  }

  /** Computed background-color of a selector's box (for :hover assertions). */
  computedBg(selector) {
    const target = this._walk(this._dom).find((n) => n.nodeType === 1 && matchesSimpleSelector(n, selector));
    if (!target) return null;
    const items = this._layoutItems();
    for (let i = items.length - 1; i >= 0; i--) {
      const el = this._elementForItem(items[i]);
      if (el === target && items[i].width > 0 && items[i].height > 0) {
        const st = items[i].style || {};
        return st["background-color"] || st.background || null;
      }
    }
    return null;
  }

  heapMB() { return process.memoryUsage().heapUsed / 1024 / 1024; }
}
