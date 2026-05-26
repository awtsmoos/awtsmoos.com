// B"H
(function(root, factory) {
    if (typeof module === 'object' && module.exports) module.exports = factory();
    else { root.Merkava = root.Merkava || {}; root.Merkava.VirtualFontAtlas = factory().VirtualFontAtlas; }
})(typeof self !== 'undefined' ? self : this, function() {
    /**
     * Chapter 18: Letters wait as empty vessels until the user gives a font.
     *
     * The atlas stores caller-provided font bytes and text draw requests. It
     * ships no font files. Measurement can be delegated to an offscreen host
     * canvas-like measurer when present, with deterministic fallback metrics.
     */
    class VirtualFontAtlas {
        constructor() { this.fonts = []; this.textRuns = []; this.measureHook = null; }
        registerFont(name, bytes, meta = {}) {
            const data = bytes ? Array.from(bytes instanceof Uint8Array ? bytes : Buffer.from(bytes)) : [];
            const font = { id: this.fonts.length, name: String(name || `font-${this.fonts.length}`), bytes: data.length, meta };
            this.fonts.push(font);
            return font;
        }
        setMeasureHook(hook) { this.measureHook = typeof hook === 'function' ? hook : null; return !!this.measureHook; }
        recordText(run) { const item = { id: this.textRuns.length, ...run }; this.textRuns.push(item); return item; }
        measure(text, font = '10px sans-serif') {
            if (this.measureHook) {
                const measured = this.measureHook(String(text), String(font));
                if (measured && Number.isFinite(Number(measured.width))) return { ...measured, font, source: measured.source || 'offscreen-measure-hook' };
            }
            return { width: String(text).length * 8, actualBoundingBoxAscent: 8, actualBoundingBoxDescent: 2, font, source: 'placeholder-metrics' };
        }
        snapshot() { return { fonts: this.fonts, textRuns: this.textRuns }; }
    }
    return { VirtualFontAtlas };
});
