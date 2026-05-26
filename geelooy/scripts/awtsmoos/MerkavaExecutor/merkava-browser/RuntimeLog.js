// B"H
(function(root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else { root.Merkava = root.Merkava || {}; root.Merkava.RuntimeLog = factory().RuntimeLog; }
})(typeof self !== 'undefined' ? self : this, function() {
  class RuntimeLog {
    constructor(prefix = 'executor') { this.prefix = prefix; this.lines = []; this.counters = Object.create(null); }
    count(name, by = 1) { this.counters[name] = (this.counters[name] || 0) + by; return this.counters[name]; }
    push(channel, message, data = null) {
      const suffix = data ? ' ' + Object.entries(data).map(([k, v]) => `${k}=${format(v)}`).join(' ') : '';
      const line = `[${channel}] ${message}${suffix}`;
      this.lines.push(line);
      return line;
    }
    child(prefix) { const log = new RuntimeLog(prefix); log.lines = this.lines; log.counters = this.counters; return log; }
    text() { return this.lines.join('\n'); }
    toJSON() { return { prefix: this.prefix, counters: { ...this.counters }, lines: this.lines.slice() }; }
  }
  function format(value) { return typeof value === 'string' ? value : JSON.stringify(value); }
  return { RuntimeLog };
});
