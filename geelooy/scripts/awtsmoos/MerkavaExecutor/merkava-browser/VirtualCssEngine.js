// B"H
(function(root, factory) {
    if (typeof module === 'object' && module.exports) module.exports = factory();
    else { root.Merkava = root.Merkava || {}; root.Merkava.VirtualCssEngine = factory().VirtualCssEngine; }
})(typeof self !== 'undefined' ? self : this, function() {
    const dash = name => String(name).replace(/[A-Z]/g, c => '-' + c.toLowerCase());
    const parseDecls = text => Object.fromEntries(String(text || '').split(';').map(x => x.trim()).filter(Boolean).map(part => {
        const i = part.indexOf(':'); if (i < 0) return ['', ''];
        return [dash(part.slice(0, i).trim()), part.slice(i + 1).trim().replace(/\s*!important$/, '')];
    }).filter(x => x[0]));

    /** Chapter 29: Selectors descend through ancestry without C learning CSS. */
    class VirtualCssEngine {
        constructor() { this.rules = []; }
        addRule(selector, declarations) {
            const clean = String(selector || '').trim();
            if (!clean) return;
            this.rules.push({ selector: clean, declarations: { ...declarations }, specificity: specificity(clean), order: this.rules.length });
        }
        parseStyleSheet(cssText) {
            const text = String(cssText || '').replace(/\/\*[\s\S]*?\*\//g, '');
            for (const m of text.matchAll(/([^{}]+)\{([^}]*)\}/g)) for (const selector of m[1].split(',')) this.addRule(selector.trim(), parseDecls(m[2]));
        }
        compute(element) {
            const out = Object.create(null), ranked = [];
            for (const rule of this.rules) if (matchesSelector(element, rule.selector)) ranked.push(rule);
            ranked.sort((a, b) => a.specificity - b.specificity || a.order - b.order);
            for (const rule of ranked) Object.assign(out, rule.declarations);
            Object.assign(out, element.style?.toJSON?.() || {});
            return out;
        }
    }

    function specificity(selector) {
        let ids = 0, classes = 0, tags = 0;
        for (const part of tokenize(selector).filter(t => t !== '>' && t !== '+')) {
            ids += (part.match(/#[\w-]+/g) || []).length;
            classes += (part.match(/\.[\w-]+|\[[^\]]+\]|:[\w-]+/g) || []).length;
            const tag = part.match(/^[a-zA-Z][\w-]*/)?.[0];
            if (tag && tag !== '*') tags++;
        }
        return ids * 100 + classes * 10 + tags;
    }

    function tokenize(selector) { return String(selector || '').replace(/([>+])/g, ' $1 ').split(/\s+/).filter(Boolean); }

    function matchesSelector(element, selector) {
        const tokens = tokenize(selector);
        return matchFromRight(element, tokens, tokens.length - 1);
    }

    function matchFromRight(element, tokens, index) {
        if (!element || index < 0) return index < 0;
        if (!matchCompound(element, tokens[index])) return false;
        if (index === 0) return true;
        const combinator = tokens[index - 1];
        if (combinator === '>') return matchFromRight(element.parentNode, tokens, index - 2);
        if (combinator === '+') return matchFromRight(element.previousSibling, tokens, index - 2);
        for (let parent = element.parentNode; parent; parent = parent.parentNode) if (matchFromRight(parent, tokens, index - 1)) return true;
        return false;
    }

    function matchCompound(element, compound) {
        if (!element || !compound) return false;
        if (compound === '*') return true;
        const tag = compound.match(/^[a-zA-Z][\w-]*|^\*/)?.[0] || '';
        if (tag && tag !== '*' && element.localName !== tag.toLowerCase()) return false;
        for (const id of compound.match(/#[\w-]+/g) || []) if (element.id !== id.slice(1)) return false;
        for (const cls of compound.match(/\.[\w-]+/g) || []) if (!element.classList?.contains(cls.slice(1))) return false;
        for (const attrText of compound.match(/\[[^\]]+\]/g) || []) if (!matchAttr(element, attrText.slice(1, -1))) return false;
        for (const pseudo of compound.match(/:[\w-]+/g) || []) if (!matchPseudo(element, pseudo.slice(1))) return false;
        return true;
    }

    function matchAttr(element, raw) {
        const m = raw.match(/^([\w-]+)(?:\s*=\s*["']?([^"']*)["']?)?$/);
        if (!m) return false;
        const value = element.getAttribute?.(m[1]);
        return m[2] == null ? value != null : value === m[2];
    }

    function matchPseudo(element, pseudo) {
        if (pseudo === 'focus') return element.ownerDocument?.activeElement === element;
        if (pseudo === 'checked') return !!element.checked;
        if (pseudo === 'disabled') return !!element.disabled;
        if (pseudo === 'enabled') return !element.disabled;
        if (pseudo === 'first-child') return element.parentNode?.children?.filter(x => x.nodeType === 1)[0] === element;
        return false;
    }

    return { VirtualCssEngine };
});
