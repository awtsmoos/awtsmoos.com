// B"H
(function(root, factory) {
    if (typeof module === 'object' && module.exports) module.exports = factory();
    else { root.Merkava = root.Merkava || {}; root.Merkava.VirtualStyleDeclaration = factory().VirtualStyleDeclaration; }
})(typeof self !== 'undefined' ? self : this, function() {
    /** Chapter 14: The Awtsmoos pours color into names and names into form. */
    const dash = name => String(name).replace(/[A-Z]/g, c => '-' + c.toLowerCase());
    class VirtualStyleDeclaration {
        constructor() { this.props = Object.create(null); }
        setProperty(name, value) {
            const key = dash(name);
            this.props[key] = String(value);
            // B"H: the camelCase mirror now lives on the prototype (see
            // ROUTED_CAMEL below), so no own-property write is needed here.
            this.__notifyStyle(key);
        }
        getPropertyValue(name) { return this.props[dash(name)] || ''; }
        removeProperty(name) {
            const key = dash(name), old = this.props[key] || '';
            delete this.props[key];
            this.__notifyStyle(key);
            return old;
        }
        assignText(text) { for (const part of String(text || '').split(';')) { const at = part.indexOf(':'); if (at > -1) this.setProperty(part.slice(0, at).trim(), part.slice(at + 1).trim()); } }
        toString() { return Object.entries(this.props).map(([k, v]) => `${k}: ${v};`).join(' '); }
        toJSON() { return { ...this.props }; }
        /**
         * B"H: layout thrashing defense. Every inline-style write is
         * classified by the document scheduler (layout / paint /
         * compositor-only). Writes batch — they never force sync layout.
         */
        __notifyStyle(dashedName) {
            const owner = this.__owner;
            const doc = owner && owner.ownerDocument;
            // B"H (parse fast path): style writes during initial HTML parsing
            // (e.g. UA display defaults) skip scheduler bookkeeping; the first
            // post-parse layout covers the whole tree.
            if (doc && doc.__suppressMutations) return;
            const sched = doc && doc.__layoutScheduler;
            if (sched) sched.noteStyleChange(owner, dashedName);
        }
    }

    /**
     * B"H: DOM-correct style routing. In browsers `el.style.width = 'x'` is
     * identical to `setProperty('width', 'x')`. Previously a direct camelCase
     * assignment created an own property invisible to toJSON() — and
     * therefore invisible to the cascade, computed style, and layout — while
     * the geometry getters read it. That split made write/read batching
     * meaningless. These prototype accessors route common properties through
     * the props store (and the scheduler); unknown properties keep the old
     * own-property behavior.
     */
    const ROUTED_CAMEL = [
        'width','height','minWidth','minHeight','maxWidth','maxHeight',
        'margin','marginTop','marginRight','marginBottom','marginLeft',
        'padding','paddingTop','paddingRight','paddingBottom','paddingLeft',
        'border','borderWidth','borderTopWidth','borderRightWidth','borderBottomWidth','borderLeftWidth',
        'borderColor','borderTopColor','borderRightColor','borderBottomColor','borderLeftColor',
        'borderStyle','borderRadius','outline','outlineColor','outlineWidth',
        'display','position','top','right','bottom','left','float','clear',
        'overflow','overflowX','overflowY','boxSizing','zIndex','visibility',
        'flex','flexDirection','flexWrap','flexGrow','flexShrink','flexBasis',
        'justifyContent','alignItems','alignContent','alignSelf','order',
        'gap','rowGap','columnGap',
        'grid','gridTemplateColumns','gridTemplateRows','gridTemplateAreas',
        'gridColumn','gridRow','gridArea','gridColumnStart','gridColumnEnd','gridRowStart','gridRowEnd',
        'fontSize','fontFamily','fontWeight','fontStyle','lineHeight','letterSpacing',
        'textAlign','textTransform','textDecoration','textIndent','whiteSpace','wordSpacing','verticalAlign',
        'color','background','backgroundColor','backgroundImage','boxShadow','textShadow',
        'opacity','transform','translate','rotate','scale','transformOrigin',
        'filter','mixBlendMode','clipPath','cursor','pointerEvents','fill','stroke'
    ];
    const routedDescriptors = {};
    for (const name of ROUTED_CAMEL) {
        const key = dash(name);
        routedDescriptors[name] = {
            configurable: true,
            get() { return this.props[key] || ''; },
            set(value) { this.setProperty(key, value); }
        };
    }
    Object.defineProperties(VirtualStyleDeclaration.prototype, routedDescriptors);

    return { VirtualStyleDeclaration };
});
