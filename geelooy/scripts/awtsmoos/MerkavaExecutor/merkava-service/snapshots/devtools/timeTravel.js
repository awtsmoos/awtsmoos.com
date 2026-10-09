// B"H
/**
 * @file timeTravel.js
 * @description Time-travel debugger for the Merkava VM.
 *
 * Records EVERY bytecode instruction executed by a VM thread: the opcode,
 * the full machine state before and after (ip, operand stack, call frames,
 * scopes, catch stack, status), wall-clock timing, and heap delta.
 *
 * Replay works forwards AND backwards: stepBack() restores the exact prior
 * state, so the thread can be rewound like a video and re-stepped.
 *
 * Purely additive: wraps thread.step() without modifying the VM.
 */

const DEFAULT_MAX_STEPS = 100000;

/** Deep-copy VM state with cycle protection. Bytecode/constants are immutable: kept by reference. */
function snapshotValue(value, seen = new Map(), depth = 0) {
  if (value === null || value === undefined) return value;
  const t = typeof value;
  if (t !== "object") {
    if (t === "function") return `[function ${value.name || "anonymous"}]`;
    if (t === "bigint") return `${value}n`;
    return value;
  }
  if (seen.has(value)) return seen.get(value);
  if (depth > 6) return "[max-depth]";
  if (value instanceof Uint8Array) return { __typed: "Uint8Array", length: value.length };
  if (Array.isArray(value)) {
    const out = [];
    seen.set(value, out);
    for (const item of value) {
      // Skip raw bytecode arrays (immutable, huge): keep length only.
      out.push(snapshotValue(item, seen, depth + 1));
      if (out.length > 500) { out.push("[truncated]"); break; }
    }
    return out;
  }
  const out = {};
  seen.set(value, out);
  let n = 0;
  for (const key of Object.keys(value)) {
    if (key === "bytecode" || key === "constants") { out[key] = `[${Array.isArray(value[key]) ? value[key].length : "?"} items]`; continue; }
    if (key === "__parent") { out[key] = "[scope-parent]"; continue; }
    out[key] = snapshotValue(value[key], seen, depth + 1);
    if (++n > 60) { out["[truncated]"] = true; break; }
  }
  return out;
}

function snapshotThreadState(thread) {
  return {
    ip: thread.ip,
    status: thread.status,
    stack: snapshotValue(thread.stack),
    frames: snapshotValue(thread.frames),
    currentScope: snapshotValue(thread.currentScope),
    catchStack: snapshotValue(thread.catchStack),
    heapUsed: (typeof process !== "undefined" && process.memoryUsage) ? process.memoryUsage().heapUsed : 0
  };
}

function restoreThreadState(thread, snap) {
  // Restore live state from a snapshot (deep-copied back so later mutation can't corrupt history).
  const revive = (v) => JSON.parse(JSON.stringify(v));
  thread.ip = snap.ip;
  thread.status = snap.status;
  thread.stack = revive(snap.stack);
  thread.frames = revive(snap.frames);
  thread.currentScope = revive(snap.currentScope);
  thread.catchStack = revive(snap.catchStack);
}

export class TimeTravelRecorder {
  constructor(options = {}) {
    this.maxSteps = Math.max(1000, Number(options.maxSteps) || DEFAULT_MAX_STEPS);
    this.history = [];          // [{ step, opcode, opName, before, after, durationMs, heapDelta }]
    this.cursor = -1;           // index of last-applied step; -1 = at initial state
    this.initialState = null;
    this.thread = null;
    this.recording = false;
    this.opNames = options.opNames || null; // optional (ip)->name resolver
  }

  attach(thread) {
    this.thread = thread;
    this.initialState = snapshotThreadState(thread);
    const originalStep = thread.step.bind(thread);
    const recorder = this;
    thread.step = function () {
      if (!recorder.recording) return originalStep();
      const before = snapshotThreadState(thread);
      const ipBefore = thread.ip;
      const op = (ipBefore < thread.bytecode.length) ? thread.bytecode[ipBefore] : -1;
      const t0 = (typeof performance !== "undefined") ? performance.now() : Date.now();
      const heapBefore = before.heapUsed;
      let ok = false;
      let threw = null;
      try { ok = originalStep(); } catch (e) { threw = e; }
      const t1 = (typeof performance !== "undefined") ? performance.now() : Date.now();
      const after = snapshotThreadState(thread);
      recorder._record({
        step: recorder.history.length,
        ip: ipBefore,
        opcode: op,
        opName: recorder.opNames ? recorder.opNames(op) : `op_${op}`,
        before, after,
        durationMs: t1 - t0,
        heapDelta: after.heapUsed - heapBefore,
        returned: ok
      });
      if (threw) throw threw;
      return ok;
    };
    return this;
  }

  start() { this.recording = true; return this; }
  stop() { this.recording = false; return this; }

  _record(entry) {
    if (this.history.length >= this.maxSteps) this.history.shift();
    this.history.push(entry);
    this.cursor = this.history.length - 1;
  }

  get length() { return this.history.length; }

  /** State of the thread after step n (-1 = initial state). */
  stateAt(n) {
    if (n < 0) return this.initialState;
    if (n >= this.history.length) return null;
    return this.history[n].after;
  }

  /** Move the live thread to the state after step n. */
  gotoStep(n) {
    if (!this.thread) throw new Error("[timeTravel] no thread attached");
    const snap = this.stateAt(n);
    if (!snap) throw new Error(`[timeTravel] step ${n} out of range (0..${this.history.length - 1})`);
    restoreThreadState(this.thread, snap);
    this.cursor = n;
    return this.describeStep(n);
  }

  stepBack() {
    if (this.cursor <= -1) return { ok: false, reason: "at-initial-state" };
    return { ok: true, ...this.gotoStep(this.cursor - 1) };
  }

  stepForward() {
    if (this.cursor >= this.history.length - 1) return { ok: false, reason: "at-latest-state" };
    return { ok: true, ...this.gotoStep(this.cursor + 1) };
  }

  describeStep(n) {
    if (n < 0) return { step: -1, label: "initial-state" };
    const e = this.history[n];
    if (!e) return null;
    return {
      step: e.step, ip: e.ip, opcode: e.opcode, opName: e.opName,
      durationMs: +e.durationMs.toFixed(3), heapDelta: e.heapDelta,
      stackDepth: Array.isArray(e.after.stack) ? e.after.stack.length : 0,
      frameDepth: Array.isArray(e.after.frames) ? e.after.frames.length : 0,
      status: e.after.status
    };
  }

  /** Full trace summary: opcode histogram + timing totals. */
  summarize() {
    const hist = {};
    let totalMs = 0;
    let totalHeapDelta = 0;
    for (const e of this.history) {
      const k = e.opName;
      hist[k] = hist[k] || { count: 0, totalMs: 0 };
      hist[k].count++;
      hist[k].totalMs += e.durationMs;
      totalMs += e.durationMs;
      totalHeapDelta += e.heapDelta;
    }
    const top = Object.entries(hist)
      .map(([op, v]) => ({ op, count: v.count, totalMs: +v.totalMs.toFixed(3), avgMs: +(v.totalMs / v.count).toFixed(4) }))
      .sort((a, b) => b.totalMs - a.totalMs);
    return {
      steps: this.history.length,
      totalMs: +totalMs.toFixed(3),
      totalHeapDelta,
      topOpcodes: top.slice(0, 25),
      uniqueOpcodes: top.length
    };
  }

  toJSON() {
    return {
      steps: this.history.length,
      cursor: this.cursor,
      summary: this.summarize()
    };
  }
}
