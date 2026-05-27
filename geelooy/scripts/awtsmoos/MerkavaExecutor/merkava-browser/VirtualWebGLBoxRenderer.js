// B"H
(function(root, factory) {
    if (typeof module === 'object' && module.exports) module.exports = factory(require('./VirtualWebGLTextureArena.js'));
    else { root.Merkava = root.Merkava || {}; root.Merkava.VirtualWebGLBoxRenderer = factory(root.Merkava).VirtualWebGLBoxRenderer; }
})(typeof self !== 'undefined' ? self : this, function(arenaMod) {
    const VirtualWebGLTextureArena = arenaMod.VirtualWebGLTextureArena;
    const hiddenTags = new Set(['head', 'script', 'style', 'meta', 'link', 'title', 'option']);
    const inlineTags = new Set(['#text', 'span', 'a', 'b', 'i', 'strong', 'em', 'small', 'label']);
    const replacedTags = new Set(['img', 'canvas', 'video', 'svg']);
    const blockTags = new Set('address article aside blockquote body div dl fieldset figcaption figure footer form h1 h2 h3 h4 h5 h6 header hr li main nav ol p pre section table ul'.split(' '));
    const inherited = ['color', 'font-family', 'font-size', 'font-weight', 'font-style', 'line-height', 'text-align', 'letter-spacing', 'white-space'];
    const names = { black:'#000000', white:'#ffffff', red:'#ff0000', green:'#008000', blue:'#0000ff', yellow:'#ffff00', cyan:'#00ffff', magenta:'#ff00ff', gray:'#808080', grey:'#808080', orange:'#ffa500', purple:'#800080', pink:'#ffc0cb', brown:'#a52a2a', transparent:'transparent', currentcolor:'currentColor' };

    /**
     * Chapter 34: The browser begins remembering gravity.
     *
     * The renderer is the MerkavaExecutor's CSS layout throat. HTML and CSS
     * enter as virtual DOM; rectangles, text, and image placeholders leave as
     * render ops. C still receives only geometry and colors, never DOM law.
     */
    class VirtualWebGLBoxRenderer {
        constructor(arena = new VirtualWebGLTextureArena(), options = {}) {
            this.arena = arena;
            this.viewportWidth = options.width || 760;
            this.viewportHeight = options.height || 560;
            this.rootStyle = null;
        }
        ensureTexture(element) {
            if (!element.__webglBoxTexture) element.__webglBoxTexture = this.arena.createTexture('dom-box', element, 0, 0);
            return element.__webglBoxTexture;
        }
        paintElement(element, x = 0, y = 0, containingWidth = this.viewportWidth, containingHeight = this.viewportHeight, parentStyle = null) {
            if (!element || this.isHidden(element)) return emptyBox();
            const style = this.computed(element, parentStyle);
            if (style.display === 'none' || style.visibility === 'hidden') return emptyBox();
            if (element.localName === 'body') this.rootStyle = style;
            const metrics = this.measure(element, style, containingWidth, containingHeight);
            const placed = this.place(element, style, metrics, x, y, containingWidth, containingHeight);
            const texture = this.ensureTexture(element);
            texture.width = metrics.outerWidth; texture.height = metrics.outerHeight;
            this.paintVisual(element, texture, placed, metrics, style);
            if (replacedTags.has(element.localName)) return this.paintReplaced(element, texture, placed, metrics, style);
            if (style.display === 'flex' || style.display === 'inline-flex') return this.paintFlex(element, placed, containingWidth, containingHeight, style, metrics);
            this.paintTextIfDirect(element, texture, placed, metrics, style);
            this.paintNormalFlow(element, placed, metrics, style);
            return metrics;
        }
        isHidden(element) { return !!element.hidden || hiddenTags.has(element.localName); }
        computed(element, parentStyle = null) {
            const raw = element.ownerDocument?.cssEngine?.compute(element) || element.style?.toJSON?.() || {};
            const style = Object.create(null);
            Object.assign(style, defaultStyle(element.localName));
            for (const key of inherited) if (parentStyle?.[key]) style[key] = parentStyle[key];
            Object.assign(style, raw);
            normalizeShorthands(style);
            return style;
        }
        place(element, style, metrics, x, y, containingWidth, containingHeight) {
            let px = x + metrics.marginLeft;
            let py = y + metrics.marginTop;
            const pos = style.position || 'static';
            if (pos === 'fixed') {
                px = edge(style.left, this.viewportWidth, null);
                py = edge(style.top, this.viewportHeight, null);
                if (px == null) px = edge(style.right, this.viewportWidth, this.viewportWidth - metrics.outerWidth) ?? x;
                if (py == null) py = edge(style.bottom, this.viewportHeight, this.viewportHeight - metrics.outerHeight) ?? y;
            } else if (pos === 'absolute') {
                px = edge(style.left, containingWidth, null);
                py = edge(style.top, containingHeight, null);
                if (px == null) px = (containingWidth - metrics.outerWidth) / 2;
                if (py == null) py = y + metrics.marginTop;
            } else if (pos === 'relative') {
                px += length(style.left, containingWidth);
                py += length(style.top, containingHeight);
            }
            const tx = transformX(style.transform, metrics.outerWidth);
            const ty = transformY(style.transform, metrics.outerHeight);
            return { x: px + tx, y: py + ty, contentX: px + tx + metrics.borderLeft + metrics.paddingLeft, contentY: py + ty + metrics.borderTop + metrics.paddingTop };
        }
        paintVisual(element, texture, placed, metrics, style) {
            const background = backgroundColor(style);
            const border = borderColor(style);
            if (background !== 'transparent') this.arena.record(texture, 'paintBox', {
                x: placed.x, y: placed.y, width: metrics.outerWidth, height: metrics.outerHeight,
                padding: metrics.paddingTop, margin: metrics.marginTop, border: metrics.borderTop,
                background, color: style.color || '#111111', display: style.display || 'block'
            });
            if ((metrics.borderTop || metrics.borderRight || metrics.borderBottom || metrics.borderLeft) && border !== 'transparent') this.arena.record(texture, 'paintBorder', {
                x: placed.x, y: placed.y, width: metrics.outerWidth, height: metrics.outerHeight, color: border, widthPx: Math.max(metrics.borderTop, metrics.borderRight, metrics.borderBottom, metrics.borderLeft)
            });
            if (style['box-shadow']) this.arena.record(texture, 'paintShadow', {
                x: placed.x + 3, y: placed.y + 3, width: metrics.outerWidth, height: metrics.outerHeight, color: '#000000'
            });
        }
        paintReplaced(element, texture, placed, metrics, style) {
            if (element.localName === 'img') {
                const src = element.getAttribute?.('src') || '';
                this.arena.record(texture, 'paintImagePlaceholder', {
                    src, x: placed.x, y: placed.y, width: metrics.outerWidth, height: metrics.outerHeight,
                    background: style['background-color'] || '#dddddd'
                });
            }
            if (element.localName === 'canvas') this.arena.record(texture, 'paintBox', {
                x: placed.x, y: placed.y, width: metrics.outerWidth, height: metrics.outerHeight,
                background: style['background-color'] || '#102038', color: '#ffffff', display: style.display || 'block'
            });
            return metrics;
        }
        paintTextIfDirect(element, texture, placed, metrics, style) {
            const directText = this.directText(element);
            if (!directText) return;
            const lines = wrapText(directText, metrics.contentWidth, style);
            const lh = lineHeight(style);
            let y = placed.contentY + lh * 0.78;
            for (const line of lines) {
                const tw = textWidth(line, style);
                const align = style['text-align'] || 'left';
                const tx = align === 'center' ? placed.contentX + (metrics.contentWidth - tw) / 2 : align === 'right' ? placed.contentX + metrics.contentWidth - tw : placed.contentX;
                this.arena.record(texture, 'paintTextPlaceholder', { text: line, x: tx, y, color: color(style.color || '#111111'), note: 'executor text layout' });
                y += lh;
            }
        }
        paintNormalFlow(element, placed, metrics, style) {
            let childY = placed.contentY + (this.directText(element) ? textBlockHeight(this.directText(element), metrics.contentWidth, style) : 0);
            let childX = placed.contentX;
            let lineHeightMax = 0;
            for (const child of element.children || []) {
                if (this.isHidden(child)) continue;
                const childStyle = this.computed(child, style);
                if (childStyle.display === 'none') continue;
                const childMetrics = this.measure(child, childStyle, metrics.contentWidth, metrics.contentHeight);
                const positioned = childStyle.position === 'absolute' || childStyle.position === 'fixed';
                const inline = !positioned && (childStyle.display === 'inline' || childStyle.display === 'inline-block' || inlineTags.has(child.localName));
                if (inline) {
                    if (childX + childMetrics.outerWidth > placed.contentX + metrics.contentWidth && childX > placed.contentX) {
                        childX = placed.contentX; childY += lineHeightMax || childMetrics.outerHeight; lineHeightMax = 0;
                    }
                    this.paintElement(child, childX, childY, metrics.contentWidth, metrics.contentHeight, style);
                    childX += childMetrics.outerWidth;
                    lineHeightMax = Math.max(lineHeightMax, childMetrics.outerHeight);
                } else {
                    this.paintElement(child, placed.contentX, childY, metrics.contentWidth, metrics.contentHeight, style);
                    if (!positioned) childY += childMetrics.outerHeight;
                    childX = placed.contentX; lineHeightMax = 0;
                }
            }
        }
        paintFlex(element, placed, containingWidth, containingHeight, style, metrics) {
            this.paintTextIfDirect(element, this.ensureTexture(element), placed, metrics, style);
            const children = Array.from(element.children || []).filter(child => {
                const childStyle = this.computed(child, style);
                return !this.isHidden(child) && childStyle.display !== 'none' && childStyle.position !== 'absolute' && childStyle.position !== 'fixed';
            });
            const row = !String(style['flex-direction'] || 'row').startsWith('column');
            const gap = length(style.gap || style['column-gap'] || style['row-gap'], row ? metrics.contentWidth : metrics.contentHeight);
            const boxes = children.map(child => this.measure(child, this.computed(child, style), metrics.contentWidth, metrics.contentHeight));
            const growTotal = children.reduce((sum, child) => sum + number(this.computed(child, style)['flex-grow']), 0);
            const totalMain = boxes.reduce((sum, box) => sum + (row ? box.outerWidth : box.outerHeight), 0) + Math.max(0, boxes.length - 1) * gap;
            const free = Math.max(0, (row ? metrics.contentWidth : metrics.contentHeight) - totalMain);
            const justify = style['justify-content'] || 'flex-start';
            const align = style['align-items'] || 'stretch';
            let main = justify === 'center' ? free / 2 : justify === 'flex-end' ? free : 0;
            const between = justify === 'space-between' && boxes.length > 1 ? free / (boxes.length - 1) : justify === 'space-around' && boxes.length ? free / boxes.length : 0;
            if (justify === 'space-around') main = between / 2;
            for (let i = 0; i < children.length; i++) {
                const child = children[i];
                const childStyle = this.computed(child, style);
                const box = { ...boxes[i] };
                if (growTotal && number(childStyle['flex-grow'])) {
                    if (row) box.outerWidth += free * number(childStyle['flex-grow']) / growTotal;
                    else box.outerHeight += free * number(childStyle['flex-grow']) / growTotal;
                }
                const crossFree = Math.max(0, (row ? metrics.contentHeight - box.outerHeight : metrics.contentWidth - box.outerWidth));
                const cross = align === 'center' ? crossFree / 2 : align === 'flex-end' ? crossFree : 0;
                if (align === 'stretch') {
                    if (row && !lengthValue(childStyle.height)) box.outerHeight = metrics.contentHeight;
                    if (!row && !lengthValue(childStyle.width)) box.outerWidth = metrics.contentWidth;
                }
                const childX = placed.contentX + (row ? main : cross);
                const childY = placed.contentY + (row ? cross : main);
                this.paintElement(child, childX, childY, row ? box.outerWidth : metrics.contentWidth, row ? metrics.contentHeight : box.outerHeight, style);
                main += (row ? box.outerWidth : box.outerHeight) + gap + between;
            }
            for (const child of element.children || []) {
                const childStyle = this.computed(child, style);
                if (childStyle.position === 'absolute' || childStyle.position === 'fixed') this.paintElement(child, placed.contentX, placed.contentY, metrics.contentWidth, metrics.contentHeight, style);
            }
            return metrics;
        }
        directText(element) {
            if (!element) return '';
            if (element.localName === 'input') return String(element.value || element.placeholder || '').trim();
            if (element.localName === 'textarea') return String(element.value || element.textContent || element.placeholder || '').trim();
            if (element.localName === 'select') return String((element.children || []).find(child => child.selected)?.textContent || element.value || '').trim();
            if (element.nodeType === 3) return normalizeText(element._textContent || '');
            return normalizeText(element._textContent || '');
        }
        measureText(element, style = {}) {
            const text = this.directText(element);
            return { width: textWidth(text, style), height: text ? textBlockHeight(text, this.viewportWidth, style) : 0 };
        }
        measure(element, style, containingWidth, containingHeight = this.viewportHeight) {
            const box = boxEdges(style, containingWidth, containingHeight);
            const availableW = Math.max(0, containingWidth - box.marginLeft - box.marginRight);
            const explicitWidth = cssLength(style.width, availableW, this.viewportWidth, this.viewportHeight);
            const minWidth = cssLength(style['min-width'], availableW, this.viewportWidth, this.viewportHeight);
            const maxWidth = cssLength(style['max-width'], availableW, this.viewportWidth, this.viewportHeight);
            const explicitHeight = cssLength(style.height, containingHeight, this.viewportWidth, this.viewportHeight);
            const minHeight = cssLength(style['min-height'], containingHeight, this.viewportWidth, this.viewportHeight);
            const maxHeight = cssLength(style['max-height'], containingHeight, this.viewportWidth, this.viewportHeight);
            const borderPadW = box.paddingLeft + box.paddingRight + box.borderLeft + box.borderRight;
            const borderPadH = box.paddingTop + box.paddingBottom + box.borderTop + box.borderBottom;
            let contentWidth = explicitWidth != null ? explicitWidth : intrinsicWidth(element, style, availableW, this.viewportWidth);
            if (style['box-sizing'] === 'border-box' && explicitWidth != null) contentWidth = Math.max(0, contentWidth - borderPadW);
            contentWidth = clamp(contentWidth, minWidth, maxWidth == null ? availableW : maxWidth);
            let childHeight = 0, childWidth = 0;
            const ownText = this.directText(element);
            if (ownText) childHeight += textBlockHeight(ownText, contentWidth, style);
            for (const child of element.children || []) {
                if (this.isHidden(child)) continue;
                const childStyle = this.computed(child, style);
                if (childStyle.display === 'none' || childStyle.position === 'absolute' || childStyle.position === 'fixed') continue;
                const childBox = this.measure(child, childStyle, contentWidth, containingHeight);
                if (style.display === 'flex' || style.display === 'inline-flex') {
                    const row = !String(style['flex-direction'] || 'row').startsWith('column');
                    const gap = length(style.gap || style['column-gap'] || 0, row ? contentWidth : containingHeight);
                    childHeight = row ? Math.max(childHeight, childBox.outerHeight) : childHeight + childBox.outerHeight + gap;
                    childWidth = row ? childWidth + childBox.outerWidth + gap : Math.max(childWidth, childBox.outerWidth);
                } else {
                    childHeight += childBox.outerHeight;
                    childWidth = Math.max(childWidth, childBox.outerWidth);
                }
            }
            if (style.display === 'inline' || style.display === 'inline-block') contentWidth = explicitWidth ?? Math.max(textWidth(ownText, style), childWidth, 1);
            let contentHeight = explicitHeight != null ? explicitHeight : Math.max(childHeight, intrinsicHeight(element, style, containingHeight));
            if (style['box-sizing'] === 'border-box' && explicitHeight != null) contentHeight = Math.max(0, contentHeight - borderPadH);
            contentHeight = clamp(contentHeight, minHeight, maxHeight);
            const outerWidth = contentWidth + borderPadW + box.marginLeft + box.marginRight;
            const outerHeight = contentHeight + borderPadH + box.marginTop + box.marginBottom;
            return { ...box, contentWidth, contentHeight, outerWidth, outerHeight };
        }
        snapshot() { return this.arena.snapshot(); }
    }

    function defaultStyle(tag) {
        const display = inlineTags.has(tag) ? 'inline' : tag === 'img' ? 'inline-block' : blockTags.has(tag) ? 'block' : 'block';
        const fontSize = /^h[1-6]$/.test(tag) ? ({ h1: '32px', h2: '24px', h3: '19px', h4: '16px', h5: '13px', h6: '11px' })[tag] : '16px';
        return { display, position: 'static', color: '#000000', 'background-color': 'transparent', 'font-size': fontSize, 'line-height': 'normal', 'box-sizing': 'content-box', margin: tag === 'body' ? '0' : '0', padding: '0', 'border-width': '0', 'border-color': 'transparent', overflow: 'visible', visibility: 'visible' };
    }
    function normalizeShorthands(style) {
        if (style.background && !style['background-color']) style['background-color'] = firstColor(style.background);
        if (style.background && !style['background-image']) style['background-image'] = firstUrl(style.background);
        if (style.border && !style['border-width']) {
            const width = String(style.border).match(/(?:^|\s)(\d+(?:\.\d+)?(?:px|em|rem)?|thin|medium|thick)(?:\s|$)/);
            if (width) style['border-width'] = width[1];
            const c = firstColor(style.border); if (c !== 'transparent') style['border-color'] = c;
        }
        if (style.flex) {
            const parts = String(style.flex).trim().split(/\s+/);
            if (!style['flex-grow'] && /^\d/.test(parts[0] || '')) style['flex-grow'] = parts[0];
            if (!style['flex-basis'] && parts.find(x => /px|%|auto/.test(x))) style['flex-basis'] = parts.find(x => /px|%|auto/.test(x));
        }
        if (style['flex-flow']) {
            if (!style['flex-direction']) style['flex-direction'] = String(style['flex-flow']).split(/\s+/).find(x => /row|column/.test(x)) || 'row';
            if (!style['flex-wrap']) style['flex-wrap'] = String(style['flex-flow']).split(/\s+/).find(x => /wrap/.test(x)) || 'nowrap';
        }
    }
    function boxEdges(style, w, h) {
        const margin = sides(style.margin, w, h), padding = sides(style.padding, w, h), border = sides(style['border-width'], w, h);
        return {
            marginTop: length(style['margin-top'] ?? margin[0], h), marginRight: length(style['margin-right'] ?? margin[1], w), marginBottom: length(style['margin-bottom'] ?? margin[2], h), marginLeft: length(style['margin-left'] ?? margin[3], w),
            paddingTop: length(style['padding-top'] ?? padding[0], h), paddingRight: length(style['padding-right'] ?? padding[1], w), paddingBottom: length(style['padding-bottom'] ?? padding[2], h), paddingLeft: length(style['padding-left'] ?? padding[3], w),
            borderTop: length(style['border-top-width'] ?? border[0], h), borderRight: length(style['border-right-width'] ?? border[1], w), borderBottom: length(style['border-bottom-width'] ?? border[2], h), borderLeft: length(style['border-left-width'] ?? border[3], w)
        };
    }
    function sides(value) { const p = String(value ?? '0').trim().split(/\s+/); return [p[0] || '0', p[1] || p[0] || '0', p[2] || p[0] || '0', p[3] || p[1] || p[0] || '0']; }
    function intrinsicWidth(element, style, available, viewportW) {
        if (style['flex-basis'] && style['flex-basis'] !== 'auto') return length(style['flex-basis'], available);
            if (element.localName === 'img') return length(element.getAttribute?.('width'), available) || Math.min(available, 460);
        if (element.localName === 'canvas') return Number(element.getAttribute?.('width') || element.width || 300);
        if (style.display === 'inline' || style.display === 'inline-block') return textWidth(element.textContent || '', style);
        return Math.max(0, Math.min(available || viewportW, viewportW));
    }
    function intrinsicHeight(element, style, containingHeight) {
        if (element.localName === 'img') {
            const attrHeight = length(element.getAttribute?.('height'), containingHeight);
            if (attrHeight) return attrHeight;
            const attrWidth = length(element.getAttribute?.('width'), containingHeight);
            if (attrWidth) return Math.max(24, attrWidth * 0.70);
            return 433;
        }
        if (element.localName === 'canvas') return Number(element.getAttribute?.('height') || element.height || 150);
        return 0;
    }
    function cssLength(value, basis, viewportW, viewportH) {
        if (!lengthValue(value)) return null;
        return length(value, basis, viewportW, viewportH);
    }
    function length(value, basis = 0, viewportW = 760, viewportH = 560) {
        const text = String(value ?? '0').trim().toLowerCase();
        if (!text || text === 'auto' || text === 'unset' || text === 'normal') return 0;
        if (text === 'thin') return 1; if (text === 'medium') return 3; if (text === 'thick') return 5;
        if (text.startsWith('calc(')) return calc(text.slice(5, -1), basis, viewportW, viewportH);
        if (text.endsWith('vw')) return number(text) * viewportW / 100;
        if (text.endsWith('vh')) return number(text) * viewportH / 100;
        if (text.endsWith('vmin')) return number(text) * Math.min(viewportW, viewportH) / 100;
        if (text.endsWith('vmax')) return number(text) * Math.max(viewportW, viewportH) / 100;
        if (text.endsWith('%')) return number(text) * basis / 100;
        if (text.endsWith('rem') || text.endsWith('em')) return number(text) * 16;
        return number(text);
    }
    function calc(expr, basis, viewportW, viewportH) {
        const safe = String(expr).replace(/(-?\d+(?:\.\d+)?)(vw|vh|vmin|vmax|%|rem|em|px)?/g, (_, n, unit) => String(length(n + (unit || 'px'), basis, viewportW, viewportH)));
        if (!/^[\d+\-*/().\s]+$/.test(safe)) return 0;
        try { return Function(`"use strict";return (${safe})`)(); } catch { return 0; }
    }
    function edge(value, basis, fallback) { return lengthValue(value) ? length(value, basis) : fallback; }
    function lengthValue(value) { return value != null && String(value).trim() !== '' && !['auto', 'normal', 'unset'].includes(String(value).trim()); }
    function number(value) { return Number.parseFloat(String(value ?? '0')) || 0; }
    function clamp(value, min = null, max = null) { let out = value; if (min != null) out = Math.max(out, min); if (max != null && max > 0) out = Math.min(out, max); return out; }
    function lineHeight(style) { return style['line-height'] && style['line-height'] !== 'normal' ? length(style['line-height'], fontSize(style)) : fontSize(style) * 1.2; }
    function fontSize(style) { return length(style['font-size'] || '16px', 16) || 16; }
    function textWidth(text, style) { return Math.max(0, normalizeText(text).length * fontSize(style) * 0.55 + number(style['letter-spacing']) * normalizeText(text).length); }
    function textBlockHeight(text, width, style) { return wrapText(text, width, style).length * lineHeight(style); }
    function wrapText(text, width, style) {
        const value = normalizeText(text);
        if (!value) return [];
        if ((style['white-space'] || '').includes('nowrap') || width <= 0) return [value];
        const words = value.split(/\s+/), lines = []; let line = '';
        for (const word of words) {
            const test = line ? line + ' ' + word : word;
            if (line && textWidth(test, style) > width) { lines.push(line); line = word; }
            else line = test;
        }
        if (line) lines.push(line);
        return lines;
    }
    function normalizeText(text) { return String(text || '').replace(/\s+/g, ' ').trim(); }
    function backgroundColor(style) { return color(style['background-color'] || firstColor(style.background || '') || 'transparent', style.color); }
    function borderColor(style) { return color(style['border-color'] || firstColor(style.border || '') || 'transparent', style.color); }
    function color(value, current = '#000000') {
        const text = String(value || 'transparent').trim().toLowerCase();
        if (text === 'currentcolor') return color(current);
        if (names[text]) return names[text];
        if (/^#[0-9a-f]{6}$/i.test(text)) return text;
        if (/^#[0-9a-f]{3}$/i.test(text)) return '#' + text.slice(1).split('').map(c => c + c).join('');
        const rgb = text.match(/^rgba?\(([^)]+)\)$/);
        if (rgb) {
            const parts = rgb[1].split(/[,\s/]+/).filter(Boolean).slice(0, 3).map(part => Math.max(0, Math.min(255, Number.parseFloat(part))));
            if (parts.length === 3 && parts.every(Number.isFinite)) return '#' + parts.map(v => Math.round(v).toString(16).padStart(2, '0')).join('');
        }
        return text === 'transparent' ? 'transparent' : '#000000';
    }
    function firstColor(value) {
        const text = String(value || '');
        const hex = text.match(/#[0-9a-f]{3,8}\b/i); if (hex) return hex[0];
        const rgb = text.match(/rgba?\([^)]+\)/i); if (rgb) return rgb[0];
        for (const word of text.toLowerCase().split(/\s+/)) if (names[word]) return word;
        return 'transparent';
    }
    function firstUrl(value) { const m = String(value || '').match(/url\(([^)]+)\)/i); return m ? m[1].replace(/^["']|["']$/g, '') : ''; }
    function transformX(value, width) { const m = String(value || '').match(/translate(?:3d|x)?\(([^,)]+)/i); return m ? length(m[1], width) : 0; }
    function transformY(value, height) { const m = String(value || '').match(/translate(?:3d|y)?\([^,]+,\s*([^,)]+)/i); return m ? length(m[1], height) : 0; }
    function emptyBox() { return { outerWidth: 0, outerHeight: 0, contentWidth: 0, contentHeight: 0 }; }
    return { VirtualWebGLBoxRenderer };
});
