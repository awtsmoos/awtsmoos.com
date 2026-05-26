// B"H
(function(root, factory) {
    if (typeof module === 'object' && module.exports) module.exports = factory();
    else { root.Merkava = root.Merkava || {}; root.Merkava.ModuleExecutor = factory().ModuleExecutor; }
})(typeof self !== 'undefined' ? self : this, function() {
    /**
     * ModuleExecutor is intentionally disabled as a native-source executor.
     * VM-only module execution now lives in merkava-binary/MerkavaVmFileExecutor.js.
     */
    class ModuleExecutor {
        constructor(options = {}) { this.options = options; }
        async execute() {
            throw new Error('ModuleExecutor native source execution disabled. Use MerkavaExecutor.executeFiles / executeVmFiles.');
        }
        async load() { return this.execute(); }
    }
    return { ModuleExecutor };
});
