// B"H
(function(root, factory) {
    if (typeof module === 'object' && module.exports) module.exports = factory();
    else { root.Merkava = root.Merkava || {}; root.Merkava.VirtualConsole = factory().VirtualConsole; }
})(typeof self !== 'undefined' ? self : this, function() {
    /**
     * B"H
     * Chapter 103: The Console Remembered Its Trace.
     *
     * Browser code may call log, warn, info, error, debug, trace, table, group,
     * and time without meaning to crash the world. Merkava records the speech;
     * it does not demand that every console ceremony be a real terminal.
     */
    class VirtualConsole {
        constructor(graph = null) {
            this.graph = graph;
            this.logs = [];
            this.timers = new Map();
        }

        entry(level, args) {
            const item = { level, args: Array.from(args).map(stringify), at: new Date().toISOString() };
            this.logs.push(item);
            this.graph?.event?.('console.' + level, item);
            return item;
        }

        log(...args) { return this.entry('log', args); }
        warn(...args) { return this.entry('warn', args); }
        error(...args) { return this.entry('error', args); }
        info(...args) { return this.entry('info', args); }
        debug(...args) { return this.entry('debug', args); }
        trace(...args) { return this.entry('trace', args.length ? args : ['Trace']); }
        table(...args) { return this.entry('table', args); }
        dir(...args) { return this.entry('dir', args); }
        group(...args) { return this.entry('group', args); }
        groupCollapsed(...args) { return this.entry('groupCollapsed', args); }
        groupEnd() { return this.entry('groupEnd', []); }
        clear() { this.logs.length = 0; return null; }
        assert(condition, ...args) { if (!condition) return this.entry('assert', args.length ? args : ['Assertion failed']); return null; }
        count(label = 'default') { const key = String(label); const next = (this.timers.get('count:' + key) || 0) + 1; this.timers.set('count:' + key, next); return this.entry('count', [key + ': ' + next]); }
        countReset(label = 'default') { this.timers.set('count:' + String(label), 0); }
        time(label = 'default') { this.timers.set('time:' + String(label), Date.now()); }
        timeEnd(label = 'default') { const key = 'time:' + String(label); const start = this.timers.get(key) || Date.now(); this.timers.delete(key); return this.entry('timeEnd', [String(label) + ': ' + (Date.now() - start) + 'ms']); }
        timeLog(label = 'default', ...args) { const key = 'time:' + String(label); const start = this.timers.get(key) || Date.now(); return this.entry('timeLog', [String(label) + ': ' + (Date.now() - start) + 'ms', ...args]); }
        toJSON() { return { logs: this.logs }; }
    }

    function stringify(value) {
        if (typeof value === 'string') return value;
        if (value && value.stack) return value.stack;
        try { return JSON.stringify(value); }
        catch (_) { return String(value); }
    }

    return { VirtualConsole };
});
