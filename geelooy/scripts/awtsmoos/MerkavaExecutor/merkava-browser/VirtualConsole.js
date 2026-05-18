// B"H
(function(root, factory) {
    if (typeof module === 'object' && module.exports) module.exports = factory();
    else { root.Merkava = root.Merkava || {}; root.Merkava.VirtualConsole = factory().VirtualConsole; }
})(typeof self !== 'undefined' ? self : this, function() {
    class VirtualConsole {
        constructor(graph = null) {
            this.graph = graph;
            this.logs = [];
        }
        entry(level, args) {
            const item = { level, args: Array.from(args).map(String), at: new Date().toISOString() };
            this.logs.push(item);
            this.graph?.event?.('console.' + level, item);
            return item;
        }
        log(...args) { return this.entry('log', args); }
        warn(...args) { return this.entry('warn', args); }
        error(...args) { return this.entry('error', args); }
        info(...args) { return this.entry('info', args); }
        toJSON() { return { logs: this.logs }; }
    }
    return { VirtualConsole };
});
