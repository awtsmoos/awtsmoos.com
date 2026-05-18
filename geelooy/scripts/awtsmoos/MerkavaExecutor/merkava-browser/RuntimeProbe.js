// B"H
(function(root, factory) {
    if (typeof module === 'object' && module.exports) module.exports = factory();
    else { root.Merkava = root.Merkava || {}; root.Merkava.RuntimeProbe = factory().RuntimeProbe; }
})(typeof self !== 'undefined' ? self : this, function() {
    class RuntimeProbe {
        constructor() { this.records = []; }
        wrap(name, fn, capture = () => ({})) {
            return (...args) => {
                const record = { name, args, before: capture(), at: Date.now() };
                try { record.value = fn(...args); record.after = capture(); return record.value; }
                catch (error) { record.error = error.message; throw error; }
                finally { this.records.push(record); }
            };
        }
        capture(label, value) { this.records.push({ label, value, at: Date.now() }); return value; }
        toJSON() { return this.records; }
    }
    return { RuntimeProbe };
});
