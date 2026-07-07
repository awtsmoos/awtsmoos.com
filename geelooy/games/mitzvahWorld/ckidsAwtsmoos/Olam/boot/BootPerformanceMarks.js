// B\"H
/**
 * BootPerformanceMarks keeps the loader honest: every stage is a footprint in
 * time, a candle on the snake-road, not a fake prophecy.
 */
export function createBootMarks(label = 'mitzvah-world') {
  const marks = [];
  const now = () => globalThis.performance?.now?.() || Date.now();
  return {
    mark(name, detail = {}) {
      const entry = { label, name, detail, at: now() };
      marks.push(entry);
      globalThis.__AWTS_BOOT_MARKS__ = marks;
      return entry;
    },
    all() {
      return marks.slice();
    },
    duration(from, to) {
      const a = marks.find(mark => mark.name === from);
      const b = [...marks].reverse().find(mark => mark.name === to);
      return a && b ? Math.max(0, b.at - a.at) : null;
    }
  };
}
