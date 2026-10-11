// B"H
/**
 * @file profiler.js
 * @description Performance profiler for the Merkava VM.
 *
 * Records per-opcode execution counts and wall-clock time, builds a call
 * tree from thread frames for flame-graph rendering, and samples the heap
 * into a memory-allocation timeline (every sample tagged with the current
 * opcode + frame depth).
 *
 * Purely additive: wraps thread.step() without modifying the VM.
 */

export class Profiler {
  constructor(options = {}) {
    this.opcodeStats = new Map();   // op -> { count, totalMs }
    this.samples = 0;
    this.totalMs = 0;
    this.callTree = { name: "(root)", value: 0, children: new Map() };
    this.frameStack = [];           // shadow stack of frame keys for flame attribution
    this.memTimeline = [];
    this.memSampleEvery = Math.max(1, Number(options.memSampleEvery) || 200);
    this.opNames = options.opNames || null;
    this.thread = null;
    this.profiling = false;
    this.startedAt = 0;
  }

  attach(thread) {
    this.thread = thread;
    const originalStep = thread.step.bind(thread);
    const prof = this;
    thread.step = function () {
      if (!prof.profiling) return originalStep();
      const ipBefore = thread.ip;
      const op = (ipBefore < thread.bytecode.length) ? thread.bytecode[ipBefore] : -1;
      const opName = prof.opNames ? prof.opNames(op) : `op_${op}`;
      const frameDepth = (thread.frames || []).length;
      const t0 = (typeof performance !== "undefined") ? performance.now() : Date.now();
      let ok = false;
      let threw = null;
      try { ok = originalStep(); } catch (e) { threw = e; }
      const t1 = (typeof performance !== "undefined") ? performance.now() : Date.now();
      const dt = t1 - t0;
      prof.samples++;
      prof.totalMs += dt;
      let s = prof.opcodeStats.get(opName);
      if (!s) { s = { count: 0, totalMs: 0, maxMs: 0 }; prof.opcodeStats.set(opName, s); }
      s.count++; s.totalMs += dt; if (dt > s.maxMs) s.maxMs = dt;
      // Attribute time to the flame tree: root -> frame-depth path -> opcode.
      prof._attribute(opName, frameDepth, dt);
      if (prof.samples % prof.memSampleEvery === 0 && typeof process !== "undefined" && process.memoryUsage) {
        const m = process.memoryUsage();
        prof.memTimeline.push({
          sample: prof.samples, op: opName, frameDepth,
          heapUsed: m.heapUsed, heapTotal: m.heapTotal, rss: m.rss, external: m.external
        });
      }
      if (threw) throw threw;
      return ok;
    };
    return this;
  }

  _attribute(opName, frameDepth, dt) {
    let node = this.callTree;
    node.value += dt;
    const path = [`frames:${frameDepth}`, opName];
    for (const key of path) {
      let child = node.children.get(key);
      if (!child) { child = { name: key, value: 0, children: new Map() }; node.children.set(key, child); }
      child.value += dt;
      node = child;
    }
  }

  start() { this.profiling = true; this.startedAt = Date.now(); return this; }
  stop() { this.profiling = false; return this; }

  opcodeProfile(limit = 30) {
    return [...this.opcodeStats.entries()]
      .map(([op, s]) => ({ op, count: s.count, totalMs: +s.totalMs.toFixed(3), avgMs: +(s.totalMs / s.count).toFixed(4), maxMs: +s.maxMs.toFixed(3) }))
      .sort((a, b) => b.totalMs - a.totalMs)
      .slice(0, limit);
  }

  /** Flame graph as a nested JSON tree (name/value/children), suitable for d3-flame-graph. */
  flameGraph() {
    const convert = (node) => ({
      name: node.name,
      value: +node.value.toFixed(3),
      children: [...node.children.values()].map(convert).sort((a, b) => b.value - a.value)
    });
    return convert(this.callTree);
  }

  memoryTimeline() { return this.memTimeline.map((m) => ({ ...m })); }

  memorySummary() {
    if (!this.memTimeline.length) return { samples: 0 };
    const heaps = this.memTimeline.map((m) => m.heapUsed);
    return {
      samples: this.memTimeline.length,
      heapStart: heaps[0], heapEnd: heaps[heaps.length - 1],
      heapMax: Math.max(...heaps), heapMin: Math.min(...heaps),
      heapGrowth: heaps[heaps.length - 1] - heaps[0]
    };
  }

  report() {
    return {
      steps: this.samples,
      totalMs: +this.totalMs.toFixed(3),
      avgMsPerStep: this.samples ? +(this.totalMs / this.samples).toFixed(4) : 0,
      uniqueOpcodes: this.opcodeStats.size,
      topOpcodes: this.opcodeProfile(15),
      memory: this.memorySummary(),
      wallMs: Date.now() - this.startedAt
    };
  }

  reset() {
    this.opcodeStats.clear();
    this.samples = 0; this.totalMs = 0;
    this.callTree = { name: "(root)", value: 0, children: new Map() };
    this.memTimeline = [];
    return this;
  }
}
