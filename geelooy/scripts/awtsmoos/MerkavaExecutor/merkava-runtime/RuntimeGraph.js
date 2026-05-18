// B"H
(function(root, factory) {
    if (typeof module === 'object' && module.exports) module.exports = factory();
    else { root.Merkava = root.Merkava || {}; root.Merkava.RuntimeGraph = factory().RuntimeGraph; }
})(typeof self !== 'undefined' ? self : this, function() {
    class RuntimeGraph {
        constructor() {
            this.nodes = new Map();
            this.edges = [];
            this.events = [];
        }
        node(id, data = {}) {
            const next = { ...(this.nodes.get(id) || {}), ...data, id, updatedAt: new Date().toISOString() };
            this.nodes.set(id, next);
            return next;
        }
        edge(from, to, kind = 'depends') {
            this.edges.push({ from, to, kind, at: new Date().toISOString() });
            return this;
        }
        event(kind, data = {}) {
            this.events.push({ kind, data, at: new Date().toISOString() });
            return this;
        }
        toJSON() {
            return { nodes: Array.from(this.nodes.values()), edges: this.edges, events: this.events };
        }
    }
    return { RuntimeGraph };
});
