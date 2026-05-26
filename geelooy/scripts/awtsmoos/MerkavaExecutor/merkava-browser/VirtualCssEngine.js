// B"H
(function(root, factory) {
    if (typeof module === 'object' && module.exports) module.exports = factory();
    else { root.Merkava = root.Merkava || {}; root.Merkava.VirtualCssEngine = factory().VirtualCssEngine; }
})(typeof self !== 'undefined' ? self : this, function() {
    const dash = name => String(name).replace(/[A-Z]/g, c => '-' + c.toLowerCase());
    const atomsOf = selector => String(selector).replace(/([>+])/g, ' $1 ').split(/\s+/).filter(Boolean);
    const atomScore = s => s === '>' || s === '+' ? 0 : s.startsWith('#') ? 100 : s.startsWith('.') || s.includes('[') || s.includes(':') ? 10 : 1;
    const score = selector => atomsOf(selector).reduce((n, part) => n + atomScore(part), 0);
    const parseDecls = text => Object.fromEntries(String(text || '').split(';').map(x => x.trim()).filter(Boolean).map(part => { const i = part.indexOf(':'); const raw = part.slice(i + 1).trim(); return [dash(part.slice(0, i).trim()), raw.replace(/\s*!important$/, '')]; }).filter(x => x[0]));
    const atom = (el, s) => {
        if (s.endsWith(':focus')) return atom(el, s.slice(0, -6) || '*') && el.ownerDocument?.activeElement === el;
        if (s.endsWith(':checked')) return atom(el, s.slice(0, -8) || '*') && !!el.checked;
        if (s === '*') return true;
        if (s.startsWith('#')) return el.id === s.slice(1);
        if (s.startsWith('.')) return el.classList?.contains(s.slice(1));
        const attr = s.match(/^([\w-]+)?\[([\w-]+)(?:=["']?([^"'\]]+)["']?)?\]$/);
        if (attr) return (!attr[1] || el.tagName?.toLowerCase() === attr[1].toLowerCase()) && (attr[3] == null ? el.hasAttribute(attr[2]) : el.getAttribute(attr[2]) === attr[3]);
        return el.tagName?.toLowerCase() === s.toLowerCase();
    };
    const findAncestor = (el, s) => { for (let cur = el?.parentNode; cur; cur = cur.parentNode) if (atom(cur, s)) return cur; return null; };
    const match = (el, selector) => {
        const parts = atomsOf(selector); let cur = el;
        for (let i = parts.length - 1; i >= 0; i--) {
            const part = parts[i];
            if (part === '>') { i--; cur = cur?.parentNode; if (!cur || !atom(cur, parts[i])) return false; cur = cur.parentNode; continue; }
            if (part === '+') { i--; cur = cur?.previousSibling; if (!cur || !atom(cur, parts[i])) return false; cur = cur.parentNode; continue; }
            if (!atom(cur, part)) { cur = findAncestor(cur, part); if (!cur) return false; }
            if (i > 0 && parts[i - 1] !== '>' && parts[i - 1] !== '+') cur = cur.parentNode;
            if (i > 0 && parts[i - 1] !== '>' && parts[i - 1] !== '+') cur = cur.parentNode;
        }
        return true;
    };
    class VirtualCssEngine {
        constructor() { this.rules = []; }
        addRule(selector, declarations) { this.rules.push({ selector: String(selector).trim(), declarations: { ...declarations }, specificity: score(String(selector).trim()), order: this.rules.length }); }
        parseStyleSheet(cssText) { for (const m of String(cssText || '').matchAll(/([^{}]+)\{([^}]*)\}/g)) for (const selector of m[1].split(',')) this.addRule(selector.trim(), parseDecls(m[2])); }
        compute(element) { const out = Object.create(null), ranked = []; for (const rule of this.rules) if (match(element, rule.selector)) ranked.push(rule); ranked.sort((a, b) => a.specificity - b.specificity || a.order - b.order); for (const rule of ranked) Object.assign(out, rule.declarations); Object.assign(out, element.style?.toJSON?.() || {}); return out; }
    }
    return { VirtualCssEngine };
});
