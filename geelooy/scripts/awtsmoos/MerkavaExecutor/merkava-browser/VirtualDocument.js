// B"H
(function(root, factory) {
    if (typeof module === 'object' && module.exports) module.exports = factory(require('./VirtualElement.js'));
    else { root.Merkava = root.Merkava || {}; root.Merkava.VirtualDocument = factory({ VirtualElement: root.Merkava.VirtualElement }).VirtualDocument; }
})(typeof self !== 'undefined' ? self : this, function(elements) {
    const VirtualElement = elements.VirtualElement;
    class VirtualDocument {
        constructor() {
            const { VirtualWebGLTextureArena } = require('./VirtualWebGLTextureArena.js');
            const { VirtualFontAtlas } = require('./VirtualFontAtlas.js');
            const { VirtualCssEngine } = require('./VirtualCssEngine.js');
            this.textureArena = new VirtualWebGLTextureArena();
            this.fontAtlas = new VirtualFontAtlas();
            this.cssEngine = new VirtualCssEngine();
            this.journal = []; this.activeElement = null;
            this.documentElement = new VirtualElement('html', this); this.head = new VirtualElement('head', this); this.body = new VirtualElement('body', this);
            this.documentElement.appendChild(this.head); this.documentElement.appendChild(this.body);
        }
        createElement(tagName) { return new VirtualElement(tagName, this); }
        createDocumentFragment() { return new VirtualElement('#fragment', this); }
        createTextNode(text) { const node = new VirtualElement('#text', this); node.textContent = String(text); return node; }
        getElementById(id) { return this.documentElement.querySelector('#' + id); }
        querySelector(selector) { return this.documentElement.querySelector(selector); }
        querySelectorAll(selector) { return this.documentElement.querySelectorAll(selector); }
        addEventListener(type, handler) { this.documentElement.addEventListener(type, handler); }
        dispatchEvent(event) { return this.documentElement.dispatchEvent(event); }
        toJSON() { return { activeElement: this.activeElement?.id || this.activeElement?.tagName || null, documentElement: this.documentElement.toJSON(), journal: this.journal }; }
    }
    return { VirtualDocument };
});
