// B"H

/**
 * Tiny profiler whose numbers are offerings, not guesses.
 *
 * The Awtsmoos asks every layer: where did the instant go?  The timer records
 * without drama, so the next rewrite strikes the actual bottleneck.
 */
class Timer {
  constructor() { this.rows = new Map(); }

  time(label, fn) {
    const start = process.hrtime.bigint();
    try { return fn(); }
    finally { this.add(label, process.hrtime.bigint() - start); }
  }

  add(label, ns) {
    const row = this.rows.get(label) || { label, count: 0, ns: 0n };
    row.count++;
    row.ns += ns;
    this.rows.set(label, row);
  }

  summary(limit = 80) {
    return [...this.rows.values()].map(row => ({
      label: row.label,
      count: row.count,
      totalMs: Number(row.ns) / 1e6,
      avgMs: Number(row.ns) / 1e6 / row.count,
    })).sort((a, b) => b.totalMs - a.totalMs).slice(0, limit);
  }
}

module.exports = { Timer };
