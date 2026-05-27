// B"H
(function(root, factory) {
    if (typeof module === 'object' && module.exports) module.exports = factory(require('./CssValueResolver.js'));
    else { root.Merkava = root.Merkava || {}; root.Merkava.VirtualCssEngine = factory(root.Merkava).VirtualCssEngine; }
})(typeof self !== 'undefined' ? self : this, function(valueMod) {
    const CssValueResolver = valueMod.CssValueResolver;
    const dash = name => String(name).replace(/[A-Z]/g, c => '-' + c.toLowerCase());
    const parseDecls = text => Object.fromEntries(splitDecls(text).map(part => {
        const i = part.indexOf(':'); if (i < 0) return ['', ''];
        return [dash(part.slice(0, i).trim()), normalizeValue(part.slice(i + 1).trim().replace(/\s*!important$/, ''))];
    }).filter(x => x[0]));

    function splitDecls(text) {
        const out = []; let buf = '', depth = 0, quote = '';
        for (const ch of String(text || '')) {
            if (quote) { buf += ch; if (ch === quote) quote = ''; continue; }
            if (ch === '"' || ch === "'") { quote = ch; buf += ch; continue; }
            if (ch === '(') depth++;
            if (ch === ')') depth = Math.max(0, depth - 1);
            if (ch === ';' && depth === 0) { if (buf.trim()) out.push(buf.trim()); buf = ''; continue; }
            buf += ch;
        }
        if (buf.trim()) out.push(buf.trim());
        return out;
    }

    /** Chapter 29: Selectors descend through ancestry without C learning CSS. */
    class VirtualCssEngine {
        constructor() { this.rules = []; this.values = new CssValueResolver(); }
        addRule(selector, declarations) {
            const clean = String(selector || '').trim();
            if (!clean) return;
            this.rules.push({ selector: clean, declarations: { ...declarations }, specificity: specificity(clean), order: this.rules.length });
        }
        parseStyleSheet(cssText) {
            const text = unwrapMedia(String(cssText || '').replace(/\/\*[\s\S]*?\*\//g, '').replace(/@keyframes[\s\S]*?\}\s*\}/g, ''));
            for (const m of text.matchAll(/([^{}]+)\{([^}]*)\}/g)) for (const selector of m[1].split(',')) {
                const clean = selector.trim();
                if (/::|:(?:before|after|placeholder|selection|marker)\b/.test(clean)) continue;
                this.addRule(clean, parseDecls(m[2]));
            }
        }
        compute(element) {
            const out = Object.create(null), ranked = [];
            for (const rule of this.rules) if (matchesSelector(element, rule.selector)) ranked.push(rule);
            ranked.sort((a, b) => a.specificity - b.specificity || a.order - b.order);
            const inherited = element?.parentNode?.ownerDocument ? this.compute(element.parentNode) : {};
            Object.assign(out, pickCustomProperties(inherited));
            for (const rule of ranked) Object.assign(out, expandDeclarations(rule.declarations));
            Object.assign(out, element.style?.toJSON?.() || {});
            return this.values.resolveDeclarations(out, inherited);
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

    function tokenize(selector) { return String(selector || '').replace(/::?before|::?after/g, '').replace(/([>+~])/g, ' $1 ').split(/\s+/).filter(Boolean); }

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
        if (combinator === '~') { for (let sib = element.previousSibling; sib; sib = sib.previousSibling) if (matchFromRight(sib, tokens, index - 2)) return true; return false; }
        for (let parent = element.parentNode; parent; parent = parent.parentNode) if (matchFromRight(parent, tokens, index - 1)) return true;
        return false;
    }

    function matchCompound(element, compound) {
        if (!element || !compound) return false;
        if (compound === '*') return true;
        const structural = compound;
        const simple = compound.replace(/:(?:is|where|not|has)\([^)]*\)/g, '');
        const tag = simple.match(/^[a-zA-Z][\w-]*|^\*/)?.[0] || '';
        if (tag && tag !== '*' && element.localName !== tag.toLowerCase()) return false;
        for (const id of simple.match(/#[\w-]+/g) || []) if (element.id !== id.slice(1)) return false;
        for (const cls of simple.match(/\.[\w-]+/g) || []) if (!element.classList?.contains(cls.slice(1))) return false;
        for (const attrText of simple.match(/\[[^\]]+\]/g) || []) if (!matchAttr(element, attrText.slice(1, -1))) return false;
        for (const pseudo of simple.match(/:[\w-]+(?:\([^)]*\))?/g) || []) if (!matchPseudo(element, pseudo.slice(1))) return false;
        for (const pseudo of structural.match(/:(is|where)\(([^)]*)\)/g) || []) {
            const inner = pseudo.slice(pseudo.indexOf('(') + 1, -1).split(',').map(x => x.trim());
            if (!inner.some(sel => matchesSelector(element, sel))) return false;
        }
        for (const pseudo of structural.match(/:not\(([^)]*)\)/g) || []) if (matchesSelector(element, pseudo.slice(5, -1))) return false;
        for (const pseudo of structural.match(/:has\(([^)]*)\)/g) || []) {
            const inner = pseudo.slice(5, -1);
            if (!Array.from(element.children || []).some(child => matchesSelector(child, inner) || child.querySelector?.(inner))) return false;
        }
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
        if (pseudo === 'last-child') { const kids = element.parentNode?.children?.filter(x => x.nodeType === 1) || []; return kids[kids.length - 1] === element; }
        if (pseudo === 'first-of-type') return (element.parentNode?.children || []).filter(x => x.localName === element.localName)[0] === element;
        if (pseudo === 'last-of-type') { const kids = (element.parentNode?.children || []).filter(x => x.localName === element.localName); return kids[kids.length - 1] === element; }
        if (pseudo.startsWith('nth-child')) return nth(element, pseudo, element.parentNode?.children?.filter(x => x.nodeType === 1) || []);
        return false;
    }

    function normalizeValue(value) { return String(value || '').replace(/\s+/g, ' ').trim(); }
    function pickCustomProperties(style) {
        const out = Object.create(null);
        for (const [key, value] of Object.entries(style || {})) if (key.startsWith('--')) out[key] = value;
        return out;
    }
    function unwrapMedia(css) {
        let out = css;
        out = out.replace(/@media[^{]*\{([\s\S]*?)\}\s*/g, (_m, body) => body);
        out = out.replace(/@supports[^{]*\{([\s\S]*?)\}\s*/g, (_m, body) => body);
        return out;
    }
    function expandDeclarations(declarations) {
        const out = { ...declarations };
        if (out.background && !out['background-color']) {
            const c = firstBackgroundColor(out.background);
            if (c) out['background-color'] = c;
        }
        if (out.background && !out['background-image']) {
            const img = firstBackgroundImage(out.background);
            if (img) out['background-image'] = img;
        }
        if (out.border) {
            if (!out['border-width']) out['border-width'] = out.border;
            if (!out['border-color']) out['border-color'] = out.border;
        }
        if (out['border-left']) { out['border-left-width'] ||= out['border-left']; out['border-left-color'] ||= out['border-left']; }
        if (out['border-right']) { out['border-right-width'] ||= out['border-right']; out['border-right-color'] ||= out['border-right']; }
        if (out['border-top']) { out['border-top-width'] ||= out['border-top']; out['border-top-color'] ||= out['border-top']; }
        if (out['border-bottom']) { out['border-bottom-width'] ||= out['border-bottom']; out['border-bottom-color'] ||= out['border-bottom']; }
        return out;
    }
    function firstBackgroundColor(value) {
        const text = String(value || '');
        if (/(?:repeating-)?(?:linear|radial|conic)-gradient\(/i.test(text) || /url\(/i.test(text)) return '';
        const hex = text.match(/#[0-9a-f]{3,8}\b/i); if (hex) return hex[0];
        const rgb = text.match(/rgba?\([^)]+\)/i); if (rgb) return rgb[0];
        const hsl = text.match(/hsla?\([^)]+\)/i); if (hsl) return hsl[0];
        const named = text.match(/\b(?:black|white|red|green|blue|yellow|cyan|magenta|gray|grey|orange|purple|pink|brown|transparent)\b/i);
        return named ? named[0] : '';
    }
    function firstBackgroundImage(value) {
        const text = String(value || '');
        const gradient = text.match(/(?:repeating-)?(?:linear|radial|conic)-gradient\([^)]*\)/i);
        if (gradient) return gradient[0];
        const url = text.match(/url\(([^)]+)\)/i);
        return url ? url[0] : '';
    }
    function firstBackgroundColor(value) {
        const text = String(value || '');
        if (/(?:repeating-)?(?:linear|radial|conic)-gradient\(/i.test(text) || /url\(/i.test(text)) return '';
        const hex = text.match(/#[0-9a-f]{3,8}\b/i); if (hex) return hex[0];
        const rgb = text.match(/rgba?\([^)]+\)/i); if (rgb) return rgb[0];
        const hsl = text.match(/hsla?\([^)]+\)/i); if (hsl) return hsl[0];
        const named = text.match(/\b(?:black|white|red|green|blue|yellow|cyan|magenta|gray|grey|orange|purple|pink|brown|transparent)\b/i);
        return named ? named[0] : '';
    }
    function firstBackgroundImage(value) {
        const text = String(value || '');
        const gradient = text.match(/(?:repeating-)?(?:linear|radial|conic)-gradient\([^)]*\)/i);
        if (gradient) return gradient[0];
        const url = text.match(/url\(([^)]+)\)/i);
        return url ? url[0] : '';
    }
    function nth(element, pseudo, siblings) {
        const index = siblings.indexOf(element) + 1;
        const raw = pseudo.match(/\(([^)]+)\)/)?.[1]?.trim() || '';
        if (raw === 'odd') return index % 2 === 1;
        if (raw === 'even') return index % 2 === 0;
        return Number(raw) === index;
    }

    return { VirtualCssEngine };
});
