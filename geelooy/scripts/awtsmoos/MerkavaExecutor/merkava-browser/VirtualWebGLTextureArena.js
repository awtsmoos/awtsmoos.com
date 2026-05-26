// B"H
(function(root, factory) {
    if (typeof module === 'object' && module.exports) module.exports = factory();
    else { root.Merkava = root.Merkava || {}; root.Merkava.VirtualWebGLTextureArena = factory().VirtualWebGLTextureArena; }
})(typeof self !== 'undefined' ? self : this, function() {
    /**
     * Chapter 15: The Awtsmoos folds every surface into one glowing ledger.
     *
     * Each DOM box, 2D canvas, WebGL canvas, and future text atlas becomes a
     * compact texture record. Nothing renders to a real GPU here; this is the
     * deterministic texture arena that bytecode can inspect, replay, and later
     * hand to a native/WebGL renderer without changing DOM semantics.
     */
    class VirtualWebGLTextureArena {
        constructor() { this.textures = []; this.commands = []; }
        createTexture(kind, owner, width = 0, height = 0) {
            const texture = { id: this.textures.length, kind, ownerTag: owner?.tagName || null, width, height, commands: [] };
            this.textures.push(texture);
            this.commands.push({ op: 'createTexture', id: texture.id, kind, width, height });
            return texture;
        }
        record(texture, op, data = {}) {
            const entry = { op, ...data };
            texture?.commands?.push(entry);
            this.commands.push({ texture: texture?.id ?? null, ...entry });
            return entry;
        }
        snapshot() { return { textures: this.textures.map(t => ({ id: t.id, kind: t.kind, ownerTag: t.ownerTag, width: t.width, height: t.height, commands: t.commands })), commands: this.commands }; }
    }
    return { VirtualWebGLTextureArena };
});
