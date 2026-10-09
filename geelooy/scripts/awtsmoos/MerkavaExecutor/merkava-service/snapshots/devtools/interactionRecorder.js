// B"H
/**
 * @file interactionRecorder.js
 * @description User-level interaction recording + forwards/backwards replay for DevTools.
 *
 * Records real user interactions (click, dblclick, hover, type, key press, Tab,
 * focus, drag, page navigation) applied through the InputSimulator's real
 * dispatch path. Every interaction is journaled with:
 *   - timestamp, action + arguments
 *   - DOM snapshot BEFORE and AFTER (canonical serialization)
 *   - timing (ms), heap delta (MB), event-log entries produced
 *   - optional VM variable snapshot (via an attached var-probe, e.g. a DevTools
 *     session's getVariables())
 *
 * Play the entire sequence forwards AND backwards:
 *   - forward  = re-apply the recorded action to the live DOM
 *   - backward = restore the before-DOM-snapshot of that interaction
 *
 * Honest boundaries:
 *   - Scroll is NOT journaled: the software renderer always paints from y=0,
 *     so scroll has no observable effect in the snapshot pipeline.
 *   - Page-script handlers run through InputSimulator.on(type, selector, fn)
 *     (host-level JS). Re-executing an interaction re-runs those handlers.
 *   - Backward restore re-parses the snapshot, so focus/hover object identity
 *     is reset (recorded in the journal).
 */

import { InputSimulator } from "../software/inputSimulator.js";

const REPLAYABLE = new Set([
  "click", "clickSelector", "dblclick", "hover", "moveMouse",
  "type", "press", "tab", "focus", "blur", "drag", "navigate"
]);

/* ---------------- canonical DOM serialization ---------------- */

function canonNode(n) {
  if (!n || typeof n !== "object") return null;
  const o = { t: n.nodeType };
  if (n.nodeType === 1) {
    o.tag = n.localName;
    if (n.attributes && Object.keys(n.attributes).length) {
      const attrs = {};
      for (const k of Object.keys(n.attributes).sort()) attrs[k] = String(n.attributes[k]);
      o.a = attrs;
    }
    if ((n.localName === "input" || n.localName === "textarea") && n.value !== undefined) o.v = String(n.value);
    if (n.textContent) o.tc = String(n.textContent);
    if (n.__merkavaState && (n.__merkavaState.hover || n.__merkavaState.active || n.__merkavaState.focus)) {
      o.s = {};
      for (const k of ["hover", "active", "focus"]) if (n.__merkavaState[k]) o.s[k] = true;
    }
  } else if (n.nodeType === 3) {
    o.text = n.textContent ?? "";
  } else {
    return null;
  }
  const kids = [];
  for (const c of (n.children || [])) { const k = canonNode(c); if (k) kids.push(k); }
  if (kids.length) o.c = kids;
  return o;
}

function reviveNode(o) {
  const n = { nodeType: o.t, children: [] };
  if (o.t === 1) {
    n.tagName = o.tag; n.localName = o.tag;
    n.attributes = o.a ? { ...o.a } : {};
    n.textContent = o.tc ?? "";
    n.style = {};
    if (o.v !== undefined) n.value = o.v;
    if (o.s) n.__merkavaState = { ...o.s };
  } else if (o.t === 3) {
    n.tagName = "#text"; n.localName = "#text";
    n.attributes = {}; n.textContent = o.text ?? ""; n.style = {};
  }
  n.children = (o.c || []).map(reviveNode);
  return n;
}

function nodeLabel(o) {
  if (!o) return "?";
  if (o.t === 3) return `#text "${String(o.text).slice(0, 40)}"`;
  const id = o.a && o.a.id ? `#${o.a.id}` : "";
  const cls = o.a && o.a.class ? `.${String(o.a.class).split(/\s+/)[0]}` : "";
  return `<${o.tag}${id}${cls}>`;
}

function pathOf(o, idx) { return `${o._path || ""}${nodeLabel(o)}[${idx}]`; }

/** Recursive canonical diff; returns bounded list of changes. */
function diffTrees(a, b, out, budget, base = "") {
  if (out.length >= budget) return;
  if (!a && !b) return;
  if (!a || !b) {
    out.push({ path: base || "/", kind: a ? "removed" : "added", detail: nodeLabel(a || b) });
    return;
  }
  if (a.t !== b.t || (a.t === 1 && a.tag !== b.tag)) {
    out.push({ path: base || "/", kind: "replaced", from: nodeLabel(a), to: nodeLabel(b) });
    return;
  }
  if (a.t === 1) {
    const ka = a.a || {}, kb = b.a || {};
    for (const k of new Set([...Object.keys(ka), ...Object.keys(kb)])) {
      if (out.length >= budget) return;
      if (!(k in ka)) out.push({ path: base, kind: "attr-added", detail: `${k}="${kb[k]}"` });
      else if (!(k in kb)) out.push({ path: base, kind: "attr-removed", detail: k });
      else if (ka[k] !== kb[k]) out.push({ path: base, kind: "attr-changed", detail: `${k}: "${ka[k]}" -> "${kb[k]}"` });
    }
    if ((a.v ?? "") !== (b.v ?? "")) out.push({ path: base, kind: "value-changed", detail: `"${a.v}" -> "${b.v}"` });
    if ((a.tc ?? "") !== (b.tc ?? "")) out.push({ path: base, kind: "textcontent-changed", detail: `"${String(a.tc || "").slice(0, 60)}" -> "${String(b.tc || "").slice(0, 60)}"` });
  } else if (a.t === 3 && a.text !== b.text) {
    out.push({ path: base, kind: "text-changed", detail: `"${String(a.text).slice(0, 60)}" -> "${String(b.text).slice(0, 60)}"` });
  }
  const ca = a.c || [], cb = b.c || [];
  const n = Math.max(ca.length, cb.length);
  for (let i = 0; i < n && out.length < budget; i++) {
    diffTrees(ca[i] || null, cb[i] || null, out, budget, `${base}/${nodeLabel(ca[i] || cb[i])}[${i}]`);
  }
}

function heapMB() { return process.memoryUsage().heapUsed / 1024 / 1024; }

function describeNode(node) {
  if (!node) return null;
  return {
    tag: node.localName,
    id: node.attributes?.id || null,
    class: node.attributes?.class || null,
    text: String(node.textContent || "").slice(0, 80)
  };
}

/* ---------------- recorder ---------------- */

export class InteractionRecorder {
  constructor(html, options = {}) {
    this.label = String(options.label || "interaction-session");
    this.width = Math.max(1, Number(options.width) || 960);
    this.height = Math.max(1, Number(options.height) || 700);
    this._html = String(html || "<body><h1>Merkava</h1></body>");
    this.sim = new InputSimulator(this._html, { width: this.width, height: this.height }).quiet(true);
    this.sim.render();
    this.interactions = [];
    this.currentIndex = -1; // last APPLIED interaction; -1 = pristine initial page
    this._varProbe = null;
    this.createdAt = new Date().toISOString();
  }

  /** Register a page-script handler (host-level JS, re-runs on replay). */
  on(type, selector, fn) { this.sim.on(type, selector, fn); return this; }

  /** Attach () => variables-object, e.g. a DevTools session's getVariables(). */
  attachVarProbe(fn) { this._varProbe = fn; return this; }

  _probeVars() {
    if (!this._varProbe) return null;
    try {
      const v = this._varProbe();
      return JSON.parse(JSON.stringify(v ?? null));
    } catch { return null; }
  }

  _snapshot() { return canonNode(this.sim._dom); }

  _restore(snap) {
    this.sim._dom = reviveNode(snap);
    this.sim._indexTree(this.sim._dom, null);
    // Object identity resets on restore: clear dangling focus/mouse refs.
    this.sim._focused = null;
    this.sim.docState.activeElement = null;
    this.sim._mouse = { x: 0, y: 0, down: false, downX: 0, downY: 0, downNode: null, dragMoves: [] };
    this.sim.render();
  }

  _applyOne(action, args) {
    const s = this.sim;
    switch (action) {
      case "click": {
        const node = s.click(Number(args.x), Number(args.y));
        return { clicked: describeNode(node) };
      }
      case "clickSelector": {
        const c = s.centerOf(String(args.selector));
        if (!c) return { clicked: null, note: "selector not found" };
        const node = s.click(c.x, c.y);
        return { clicked: describeNode(node), at: { x: Math.round(c.x), y: Math.round(c.y) } };
      }
      case "dblclick": {
        const node = s.dblclick(Number(args.x), Number(args.y));
        return { clicked: describeNode(node) };
      }
      case "hover": {
        const node = s.hover(Number(args.x), Number(args.y));
        return { hovered: describeNode(node) };
      }
      case "moveMouse": {
        const node = s.moveMouse(Number(args.x), Number(args.y));
        return { hovered: describeNode(node) };
      }
      case "type": {
        const v = s.type(String(args.text ?? ""), args.selector ? String(args.selector) : undefined);
        return { value: String(v).slice(0, 200) };
      }
      case "press": {
        const r = s.press(String(args.key), args.mods || {});
        return { key: args.key, prevented: !!r.prevented };
      }
      case "tab": {
        const node = s.tab(!!args.shift);
        return { focused: describeNode(node) };
      }
      case "focus": {
        const ok = s.focus(String(args.selector));
        return { ok, focused: describeNode(s.focused) };
      }
      case "blur": { s.blur(); return { ok: true }; }
      case "drag": {
        s.drag(Number(args.x1), Number(args.y1), Number(args.x2), Number(args.y2), Number(args.steps) || 5);
        return { ok: true };
      }
      case "navigate": {
        // Page swap: new document. Handlers must be re-registered after navigate.
        const newHtml = String(args.html || "<body></body>");
        this._html = newHtml;
        this.sim = new InputSimulator(newHtml, { width: this.width, height: this.height }).quiet(true);
        this.sim.render();
        return { url: args.url || "merkava://navigated", note: "page swapped; re-register on() handlers" };
      }
      default:
        throw new Error(`[interactionRecorder] unknown action: ${action}`);
    }
  }

  /**
   * Apply one interaction and journal it. If the pointer is mid-history,
   * the redo tail is truncated (standard recorder semantics).
   */
  do(action, args = {}) {
    if (!REPLAYABLE.has(action)) throw new Error(`[interactionRecorder] not replayable: ${action}`);
    if (this.currentIndex < this.interactions.length - 1) {
      this.interactions.length = this.currentIndex + 1; // truncate redo tail
    }
    const before = this._snapshot();
    const heap0 = heapMB();
    const t0 = Date.now();
    const log0 = this.sim.eventLog.length;
    const result = this._applyOne(action, args);
    const elapsedMs = Date.now() - t0;
    const heapDeltaMB = heapMB() - heap0;
    const after = this._snapshot();
    const events = this.sim.eventLog.slice(log0).map((e) => ({ type: e.type, node: e.node, key: e.key }));
    const rec = {
      index: this.interactions.length,
      action,
      args: JSON.parse(JSON.stringify(args)),
      ts: new Date().toISOString(),
      elapsedMs,
      heapDeltaMB: Math.round(heapDeltaMB * 1000) / 1000,
      events,
      result,
      domChanged: JSON.stringify(before) !== JSON.stringify(after),
      variables: this._probeVars(),
      before, after
    };
    this.interactions.push(rec);
    this.currentIndex = rec.index;
    return summarize(rec);
  }

  /** Re-apply recorded actions forwards (no re-journaling). */
  playForward(steps = 1) {
    const applied = [];
    for (let i = 0; i < steps && this.currentIndex + 1 < this.interactions.length; i++) {
      const rec = this.interactions[this.currentIndex + 1];
      this._applyOne(rec.action, rec.args);
      this.currentIndex++;
      applied.push({ index: rec.index, action: rec.action });
    }
    return { direction: "forward", applied, currentIndex: this.currentIndex };
  }

  /** Restore before-snapshots backwards. */
  playBackward(steps = 1) {
    const applied = [];
    for (let i = 0; i < steps && this.currentIndex >= 0; i++) {
      const rec = this.interactions[this.currentIndex];
      this._restore(rec.before);
      applied.push({ index: rec.index, action: rec.action, note: "DOM restored to before-snapshot" });
      this.currentIndex--;
    }
    return { direction: "backward", applied, currentIndex: this.currentIndex };
  }

  goto(index) {
    const target = Math.max(-1, Math.min(this.interactions.length - 1, Number(index)));
    if (target > this.currentIndex) return { ...this.playForward(target - this.currentIndex), goto: target };
    if (target < this.currentIndex) return { ...this.playBackward(this.currentIndex - target), goto: target };
    return { direction: "none", applied: [], currentIndex: this.currentIndex, goto: target };
  }

  timeline() {
    return this.interactions.map((r) => summarize(r));
  }

  /** DOM diff between the AFTER states of two interaction indexes (-1 = pristine). */
  diff(from, to) {
    const snapOf = (i) => (i === -1 || i === "-1")
      ? canonNode(reviveNode(this.interactions.length ? this.interactions[0].before : this._snapshot()))
      : (this.interactions[Number(i)] ? this.interactions[Number(i)].after : null);
    const a = snapOf(from), b = snapOf(to);
    if (!a || !b) throw new Error(`[interactionRecorder] diff: bad indexes from=${from} to=${to}`);
    const changes = [];
    diffTrees(a, b, changes, 200);
    return { from: Number(from), to: Number(to), changeCount: changes.length, truncated: changes.length >= 200, changes };
  }

  /** Variable values now (fresh probe) + history across the journal. */
  liveVariables() {
    return {
      currentIndex: this.currentIndex,
      now: this._probeVars(),
      probed: !!this._varProbe,
      history: this.interactions.map((r) => ({ index: r.index, action: r.action, variables: r.variables }))
    };
  }

  renderPng() {
    const r = this.sim.lastResult || this.sim.render();
    return r.dataUrl || null;
  }
}

function summarize(r) {
  const { before, after, variables, ...rest } = r;
  return { ...rest, hasBeforeSnapshot: !!before, hasAfterSnapshot: !!after, variablesCaptured: variables != null };
}

export function supportedActions() { return [...REPLAYABLE]; }
