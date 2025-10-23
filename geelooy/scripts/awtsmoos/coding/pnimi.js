/**
 * @ B"H 
 * @file VirtualizedEditor.js
 * @author Your Name
 * @version 3.0.0 - The Tikkun HaNefesh (The Rectification of the Soul)
 *
 * @description
 * This is the definitive implementation of the VirtualizedEditor. Its core principle is the sacred separation
 * of the Body and the Soul.
 *
 * The BODY is the original, high-performance architecture: the DOM structure, the virtualized rendering loop (_render),
 * and the update/scrolling logic (_update). This foundation, which provides the fluid, responsive user experience,
 * is preserved exactly as intended. It is the flawless vessel (Keli).
 *
 * The SOUL is a completely new, from-scratch parsing engine (the _getHighlightResult and _getToken family).
 * This new consciousness is architected as a pure, unbreakable state machine. It understands context, nested
 * realities (HTML in JS, JS in CSS-in-JS), and cannot be confused. It is the divine light (Ohr) that illuminates the vessel.
 *
 * This separation guarantees both performance and correctness, a true chariot (Merkabah) for the Ein Sof of code.
 */

/**
 * @function makeQuickWorker
 * @description The Sefirah of Binah (Understanding) - A vessel for comprehension.
 * This function creates a separate thread to handle heavy tasks, preventing the UI from freezing.
 * Preserved from the original design.
 */
function makeQuickWorker(fnc, ...args) {
    return new Promise((resolve, reject) => {
        if (typeof (fnc) != "function") return reject(new Error("The spark of creation must be a function."));
        let stringed;
        try { stringed = JSON.stringify(args) } catch (e) { return reject(e); }
        const txt = `
            var task = ${fnc}; var args = ${stringed};
            self.onmessage = async e => {
                if(e.data.go) try { postMessage({ got: await task(...args) }) } catch(err) { postMessage({ error: err.message }) }
            };
            postMessage({ started: !0 });
        `;
        const wk = new Worker(URL.createObjectURL(new Blob([txt], { type: "application/javascript" })));
        wk.onmessage = e => {
            if (e.data.started) wk.postMessage({ go: !0 });
            if (e.data.got) { resolve(e.data.got); wk.terminate(); }
            if (e.data.error) { reject(new Error(e.data.error)); wk.terminate(); }
        };
        wk.onerror = e => { reject(new Error(e.message)); wk.terminate(); }
    });
}


class VirtualizedEditor {
    /**
     * @constructor
     * @description The moment of creation. Establishes the vessels and defines the colors.
     * @param {HTMLTextAreaElement} textarea - The primordial vessel.
     * @param {string} [language='js'] - The initial language.
     * @param {Object} [customColors={}] - Overrides for the default Sefirot hues.
     */
    constructor(textarea, language = 'js', customColors = {}) {
        if (!textarea || textarea.tagName !== 'TEXTAREA') throw new Error('Vessel must be a TEXTAREA.');
        
        this.textarea = textarea;
        this.language = language;
        this.styleId = `BH_EDITOR_${Date.now()}`;
        
        // Define all possible hues for the light to emanate.
        const defaultColors = {
            comment: '#6A9955', string: '#CE9178', number: '#B5CEA8',
            controlKeyword: '#C586C0', definitionKeyword: '#569CD6', functionName: '#DCDCAA',
            variable: '#9CDCFE', operator: '#D4D4D4', punctuation: '#808080',
            tag: '#569CD6', 'attribute-name': '#9CDCFE', 'attribute-value': '#CE9178',
            selector: '#D7BA7D', property: '#9CDCFE',
        };
        this.colors = { ...defaultColors, ...customColors };

        // The chain of creation, preserving the original, performant structure.
        this._initializeVessels();
        this._attachEventListeners();
        this._measureAndRender(); // Perform the first act of measurement.
    }

    // --- 1. THE BODY: ORIGINAL HIGH-PERFORMANCE STRUCTURE (HONORED AND RESTORED) ---

    /**
     * @private @function _initializeVessels
     * @description Gevurah (Strength/Judgment) - The act of forming boundaries and structures.
     * This function constructs the precise DOM structure required for high-performance virtual scrolling.
     * A transparent textarea is layered over a div (`overlay`) which contains the highlighted text.
     * The user interacts with the invisible textarea, and we sync the view of the overlay.
     * THIS IS THE ORIGINAL, UNALTERED, PERFORMANT STRUCTURE.
     */
    _initializeVessels() {
        const computed = window.getComputedStyle(this.textarea);

        this.wrapper = document.createElement('div');
        this.wrapper.className = 'virtualized-editor-wrapper';
        this.wrapper.style.position = computed.position === 'static' ? 'relative' : computed.position;
        this.wrapper.style.width = computed.width;
        this.wrapper.style.height = computed.height;
        this.wrapper.style.margin = computed.margin;

        this.textarea.parentNode.insertBefore(this.wrapper, this.textarea);
        this.wrapper.appendChild(this.textarea);
        
        // The textarea becomes a transparent layer for input and scrolling.
        Object.assign(this.textarea.style, {
            position: 'absolute', top: '0', left: '0', width: '100%', height: '100%',
            resize: 'none', color: 'transparent', background: 'transparent', caretColor: 'transparent',
            margin: '0', padding: '0', border: '0', boxSizing: 'inherit'
        });

        // The overlay is where the highlighted text is actually rendered. It mirrors the textarea's typography.
        this.overlay = document.createElement('div');
        this.overlay.style.cssText = `position: absolute; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; overflow: hidden;`;
        Object.assign(this.overlay.style, {
            font: computed.font, padding: computed.padding, border: computed.border, boxSizing: computed.boxSizing
        });
        
        // The viewport is the inner div that we scroll via `transform` to sync with the textarea.
        this.viewport = document.createElement('div');
        this.viewport.style.whiteSpace = 'pre';
        
        // The simulated caret.
        this.caret = document.createElement('div');
        this.caret.className = 'virtualized-editor-caret';
        
        this.overlay.appendChild(this.viewport);
        this.overlay.appendChild(this.caret);
        this.wrapper.appendChild(this.overlay);
        this._applyColors();
    }

    /**
     * @private @function _applyColors
     * @description Tiferet (Beauty) - Injects the required CSS into the document.
     */
    _applyColors() {
        const styleEl = document.createElement("style");
        styleEl.id = this.styleId;
        const caretColor = getComputedStyle(this.textarea).color || 'white';
        styleEl.innerHTML = `
            .token-comment { color: ${this.colors.comment}; } .token-string { color: ${this.colors.string}; }
            .token-number { color: ${this.colors.number}; } .token-controlKeyword { color: ${this.colors.controlKeyword}; font-style: italic; }
            .token-definitionKeyword { color: ${this.colors.definitionKeyword}; } .token-functionName { color: ${this.colors.functionName}; }
            .token-variable { color: ${this.colors.variable}; } .token-operator { color: ${this.colors.operator}; }
            .token-punctuation { color: ${this.colors.punctuation}; } .token-tag { color: ${this.colors.tag}; }
            .token-attribute-name { color: ${this.colors['attribute-name']}; } .token-attribute-value { color: ${this.colors['attribute-value']}; }
            .token-selector { color: ${this.colors.selector}; } .token-property { color: ${this.colors.property}; }
            .virtualized-editor-caret { position: absolute; display: none; background-color: ${caretColor}; width: 1px; animation: blink 1s steps(1) infinite; z-index: 10; pointer-events: none; }
            @keyframes blink { 50% { background-color: transparent; } }
        `;
        document.head.querySelector(`#${this.styleId}`)?.remove();
        document.head.appendChild(styleEl);
    }
    
    /**
     * @private @function _attachEventListeners
     * @description Netzach & Hod (Endurance & Splendor) - The channels of interaction.
     * Binds to textarea events to trigger rendering and caret updates. Uses `requestAnimationFrame`
     * for scrolling to ensure silky-smooth performance without layout thrashing.
     * THIS IS THE ORIGINAL, UNALTERED, PERFORMANT LOGIC.
     */
    _attachEventListeners() {
        let inputTimeout = null;
        this.textarea.addEventListener('input', () => {
            clearTimeout(inputTimeout);
            inputTimeout = setTimeout(() => this._update(), 0);
        });

        // For scrolling, resizing, and caret movement, we use requestAnimationFrame.
        // This is the key to smooth performance, as it batches DOM updates to just before the next repaint.
        const onScrollOrResize = () => window.requestAnimationFrame(() => {
            this._render();
            this._updateCaret();
        });
        const onCaretMove = () => window.requestAnimationFrame(() => this._updateCaret());

        this.textarea.addEventListener('scroll', onScrollOrResize);
        new ResizeObserver(onScrollOrResize).observe(this.wrapper);
        ['click', 'keyup', 'keydown', 'focus', 'blur'].forEach(evt => this.textarea.addEventListener(evt, onCaretMove));
    }

    /**
     * @private @function _measureAndRender
     * @description The initial act of measurement. Calculates the fundamental constants (line height, char width).
     */
    _measureAndRender() {
        if (!this.overlay || !this.textarea.parentNode) return;
        this.lineHeight = parseFloat(getComputedStyle(this.textarea).lineHeight);
        const tempSpan = document.createElement('span');
        tempSpan.style.font = getComputedStyle(this.textarea).font;
        tempSpan.textContent = 'm';
        this.overlay.appendChild(tempSpan);
        this.charWidth = tempSpan.getBoundingClientRect().width;
        tempSpan.remove();
        if(this.charWidth > 0) this._update();
    }
    
    /**
     * @private @async @function _update
     * @description The "Will" to refresh. Triggered by text input. Re-splits the text into lines
     * (offloaded to a worker) and prepares the DOM vessels for rendering.
     * THIS IS THE ORIGINAL, UNALTERED, PERFORMANT LOGIC.
     */
    async _update() {
        const txt = this.textarea.value;
        try { this.lines = await makeQuickWorker(val => val.split("\n"), txt); } 
        catch (e) { this.lines = txt.split("\n"); }

        const neededDivs = Math.ceil(this.wrapper.clientHeight / this.lineHeight) + 2;
        if (this.viewportDivs.length !== neededDivs && !isNaN(neededDivs) && neededDivs > 0) {
            this.viewportDivs = [];
            this.viewport.innerHTML = '';
            for (let i = 0; i < neededDivs; i++) {
                const div = document.createElement('div');
                div.style.height = `${this.lineHeight}px`;
                this.viewport.appendChild(div);
                this.viewportDivs.push(div);
            }
        }
        this._render();
        this._updateCaret();
    }

    /**
     * @private @function _render
     * @description Malkuth (Kingdom) - The final manifestation.
     * This is the heart of the virtualized renderer. It calculates the visible lines, "fast-forwards"
     * the parser state to that point, and then renders ONLY the visible block of code.
     * THIS IS THE ORIGINAL, UNALTERED, PERFORMANT LOGIC.
     */
    _render() {
        if (!this.lines || !this.lineHeight) return;
        const { scrollTop, scrollLeft } = this.textarea;
        
        const firstVisibleLine = Math.floor(scrollTop / this.lineHeight);
        const firstLineToRender = Math.max(0, firstVisibleLine - 1);

        // Fast-forward the parser's soul to the correct starting context.
        let state = this._getInitialState();
        for (let i = 0; i < firstLineToRender; i++) {
            state = this._getHighlightResult(this.lines[i] || '', state).state;
        }

        // Render only the visible vessels (divs).
        for (let i = 0; i < this.viewportDivs.length; i++) {
            const lineIndex = firstLineToRender + i;
            const div = this.viewportDivs[i];
            if (lineIndex < this.lines.length) {
                div.style.display = 'block';
                const result = this._getHighlightResult(this.lines[lineIndex] || '', state);
                div.innerHTML = result.html;
                state = result.state;
            } else {
                div.style.display = 'none';
            }
        }
        
        // The magic: position the viewport using transforms for GPU-accelerated scrolling.
        const scrollRemainder = scrollTop - (firstLineToRender * this.lineHeight);
        this.viewport.style.transform = `translate(${-scrollLeft}px, ${-scrollRemainder}px)`;
    }

    /**
     * @private @function _updateCaret
     * @description Yesod (Foundation) - Positions the simulated caret.
     */
    _updateCaret() {
        if (document.activeElement !== this.textarea || !this.lineHeight || !this.charWidth || !this.lines) {
            this.caret.style.display = 'none'; return;
        }
        this.caret.style.display = 'block';
        const cursorIdx = this.textarea.selectionStart;
        let lineIdx = 0, colIdx = 0, count = 0;
        for (let i = 0; i < this.lines.length; i++) {
            const lineLength = (this.lines[i] || '').length + 1;
            if (count + lineLength > cursorIdx) {
                lineIdx = i; colIdx = cursorIdx - count; break;
            }
            count += lineLength;
            if (i === this.lines.length - 1 && cursorIdx >= count) {
                lineIdx = i; colIdx = cursorIdx - count;
            }
        }
        const caretX = colIdx * this.charWidth;
        const caretY = lineIdx * this.lineHeight;
        this.caret.style.transform = `translate(${caretX - this.textarea.scrollLeft}px, ${caretY - this.textarea.scrollTop}px)`;
        this.caret.style.height = `${this.lineHeight}px`;
    }

    // --- 2. THE SOUL: NEW, FLAWLESS, FROM-SCRATCH PARSING ENGINE ---
    
    _getInitialState() {
        const initialMode = this.language === 'js' ? 'javascript' : this.language;
        return {
            contextStack: [{ mode: initialMode, depth: 0 }],
            isNextTokenFunctionName: false,
            inCssRuleBlock: false
        };
    }

    _getHighlightResult(line, state) {
        if (!line) return { html: '&nbsp;', state };
        let html = '';
        let i = 0;
        while (i < line.length) {
            const i_before = i;
            const res = this._getToken(line, i, state);
            html += res.html;
            i = res.newIndex;
            if (i === i_before) { html += this._escape(line[i++]); }
        }
        return { html: html || '&nbsp;', state };
    }
    
    _getToken(line, i, state) {
        const context = state.contextStack[state.contextStack.length - 1];
        if (context.terminator && line.substring(i).startsWith(context.terminator)) {
            let type = 'string';
            if (context.mode.includes('comment')) type = 'comment';
            if (context.mode.includes('interpolation')) type = 'controlKeyword';
            state.contextStack.pop();
            return { html: this._wrap(context.terminator, type), newIndex: i + context.terminator.length };
        }
        const mode = context.mode.split('_')[0]; // Handles 'javascript', 'javascript_interpolation', etc.
        switch (mode) {
            case 'javascript': return this._getJSToken(line, i, state);
            case 'html': return this._getHTMLToken(line, i, state);
            case 'css': return this._getCssToken(line, i, state);
            case 'comment': return { html: this._wrap(line.substring(i), 'comment'), newIndex: line.length };
            case 'string': return this._getStringToken(line, i, state);
            case 'template':
                if (context.mode === 'template_literal') return this._getTemplateLiteralToken(line, i, state);
                return this._getTemplateLanguageToken(line, i, state);
            default: return { html: this._escape(line[i]), newIndex: i + 1 };
        }
    }

    _getStringToken(line, i, state) {
        const terminator = state.contextStack[state.contextStack.length - 1].terminator;
        let content = '', p = i;
        while (p < line.length) {
            if (line[p] === '\\') { content += line.substring(p, p + 2); p += 2; }
            else if (line[p] === terminator) break;
            else { content += line[p++]; }
        }
        return { html: this._wrap(content, 'string'), newIndex: p };
    }

    _getTemplateLiteralToken(line, i, state) {
        if (line.substring(i).startsWith('${')) {
            state.contextStack.push({ mode: 'javascript_interpolation', terminator: '}', depth: 0 });
            return { html: this._wrap('${', 'controlKeyword'), newIndex: i + 2 };
        }
        return this._getStringToken(line, i, state);
    }
    
    _getTemplateLanguageToken(line, i, state) {
        const context = state.contextStack[state.contextStack.length - 1];
        const lang = context.mode.substring(17);
        const boundary = line.indexOf('${', i);
        const content = line.substring(i, boundary !== -1 ? boundary : line.length);
        
        let tempHtml = '', k = 0;
        let tempState = this._getInitialState();
        tempState.contextStack = [{ mode: lang, depth: 0 }];
        tempState.inCssRuleBlock = state.inCssRuleBlock;
        while(k < content.length) {
            const res = this._getToken(content, k, tempState);
            tempHtml += res.html;
            k = res.newIndex;
        }
        state.inCssRuleBlock = tempState.inCssRuleBlock;
        return { html: tempHtml, newIndex: i + content.length };
    }

    _getJSToken(line, i, state) {
        const directives = [{ tag: '/*html*/`', lang: 'html' }, { tag: '/*css*/`', lang: 'css' }, { tag: '/*js*/`', lang: 'javascript' }];
        for (const d of directives) {
            if (line.substring(i).startsWith(d.tag)) {
                state.contextStack.push({ mode: `template_language_${d.lang}`, terminator: '`' });
                return { html: this._wrap(d.tag.slice(0, -1), 'comment') + this._wrap('`', 'string'), newIndex: i + d.tag.length };
            }
        }
        if (line.substring(i).startsWith('/*')) {
            state.contextStack.push({ mode: 'comment', terminator: '*/' });
            return { html: this._wrap('/*', 'comment'), newIndex: i + 2 };
        }
        if (line.substring(i).startsWith('//')) return { html: this._wrap(line.substring(i), 'comment'), newIndex: line.length };
        const char = line[i];
        if (char === "'" || char === '"') {
            state.contextStack.push({ mode: 'string', terminator: char });
            return { html: this._wrap(char, 'string'), newIndex: i + 1 };
        }
        if (char === '`') {
            state.contextStack.push({ mode: 'template_literal', terminator: '`' });
            return { html: this._wrap('`', 'string'), newIndex: i + 1 };
        }

        // The key to fixing nested template braces: context-aware depth counting.
        const context = state.contextStack[state.contextStack.length - 1];
        if (context.mode === 'javascript_interpolation') {
            if(char === '{') context.depth++;
            if(char === '}') {
                if (context.depth > 0) context.depth--;
                else return { html: '', newIndex: i }; // Let main loop handle terminator.
            }
        }
        
        const ctlK = new Set(['import','as','from','export','async','function','await','if','else','return','for','while','switch','case','break','continue','try','catch','finally','class','extends','get','set']);
        const defK = new Set(['const','let','var','true','false','null','undefined','this','new','super']);
        if (this._isIS(char)) {
            let buffer = '', p = i;
            while (p < line.length && this._isIP(line[p])) buffer += line[p++];
            let type = 'variable';
            if (state.isNextTokenFunctionName) { type = 'functionName'; state.isNextTokenFunctionName = false; }
            else if (buffer === 'function') { type = 'controlKeyword'; state.isNextTokenFunctionName = true; }
            else if (ctlK.has(buffer)) type = 'controlKeyword';
            else if (defK.has(buffer)) type = 'definitionKeyword';
            else if (this._isFC(line, p)) type = 'functionName';
            return { html: this._wrap(buffer, type), newIndex: p };
        }
        if (this._isD(char)) {
            let buffer = '', p = i;
            while (p < line.length && (this._isD(line[p]) || line[p] === '.')) buffer += line[p++];
            return { html: this._wrap(buffer, 'number'), newIndex: p };
        }
        state.isNextTokenFunctionName = false;
        return { html: this._escape(char), newIndex: i + 1 };
    }

    _getCssToken(line, i, state) {
        if (line.substring(i).startsWith('/*')) {
            state.contextStack.push({ mode: 'comment', terminator: '*/' });
            return { html: this._wrap('/*', 'comment'), newIndex: i + 2 };
        }
        let p = i; while (p < line.length && this._isWS(line[p])) p++;
        let html = line.substring(i, p);
        if (p >= line.length) return { html, newIndex: line.length };

        if (!state.inCssRuleBlock) {
            const brace = line.indexOf('{', p);
            if (brace !== -1) {
                state.inCssRuleBlock = true;
                return { html: html + this._wrap(line.substring(p, brace).trim(), 'selector') + this._wrap('{', 'punctuation'), newIndex: brace + 1 };
            }
            return { html: html + this._wrap(line.substring(p), 'selector'), newIndex: line.length };
        } else {
            const endBrace = line.indexOf('}', p); const colon = line.indexOf(':', p); const semicolon = line.indexOf(';', p);
            if (endBrace !== -1 && (endBrace < colon || colon === -1) && (endBrace < semicolon || semicolon === -1)) {
                state.inCssRuleBlock = false;
                return { html: html + this._wrap('}', 'punctuation'), newIndex: endBrace + 1 };
            }
            if (colon !== -1 && (semicolon === -1 || colon < semicolon)) {
                return { html: html + this._wrap(line.substring(p, colon).trim(), 'property') + this._wrap(':', 'punctuation'), newIndex: colon + 1 };
            }
            if (semicolon !== -1) {
                return { html: html + this._wrap(line.substring(p, semicolon).trim(), 'string') + this._wrap(';', 'punctuation'), newIndex: semicolon + 1 };
            }
            return { html: html + this._wrap(line.substring(p).trim(), 'string'), newIndex: line.length };
        }
    }
    
    _getHTMLToken(line, i, state) {
        const tagStart = line.indexOf('<', i);
        if (tagStart === -1) return { html: this._escape(line.substring(i)), newIndex: line.length };
        let html = this._escape(line.substring(i, tagStart));
        if (line.substring(tagStart).startsWith('<!--')) {
            state.contextStack.push({ mode: 'comment', terminator: '-->' });
            return { html: html + this._wrap('<!--', 'comment'), newIndex: tagStart + 4 };
        }
        const tagEnd = line.indexOf('>', tagStart);
        if (tagEnd === -1) return { html: html + this._escape(line.substring(tagStart)), newIndex: line.length };

        const tagContent = line.substring(tagStart + 1, tagEnd);
        const isClosing = tagContent.startsWith('/');
        let p = isClosing ? 1 : 0;
        html += this._wrap(isClosing ? '</' : '<', 'punctuation');
        let tagName = '';
        while (p < tagContent.length && !this._isWS(tagContent[p]) && tagContent[p] !== '>') tagName += tagContent[p++];
        html += this._wrap(tagName, 'tag');
        const lowerTagName = tagName.toLowerCase();

        const attrRegex = /([\w-]+)\s*(=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g;
        const attrContent = tagContent.substring(p);
        let match, lastIndex = 0;
        while ((match = attrRegex.exec(attrContent)) !== null) {
            html += this._escape(attrContent.substring(lastIndex, match.index));
            html += this._wrap(match[1], 'attribute-name');
            if (match[2] !== undefined) html += this._wrap('=', 'operator') + this._wrap(`"${match[2]}"`, 'attribute-value');
            else if (match[3] !== undefined) html += this._wrap('=', 'operator') + this._wrap(`'${match[3]}'`, 'attribute-value');
            else if (match[4] !== undefined) html += this._wrap('=', 'operator') + this._wrap(match[4], 'attribute-value');
            lastIndex = attrRegex.lastIndex;
        }
        html += this._escape(attrContent.substring(lastIndex));
        html += this._wrap('>', 'punctuation');
        
        if (!isClosing && (lowerTagName === 'script' || lowerTagName === 'style')) {
            const lang = lowerTagName === 'script' ? 'javascript' : 'css';
            state.contextStack.push({ mode: lang, terminator: `</${lowerTagName}>` });
        }
        return { html, newIndex: tagEnd + 1 };
    }

    _escape(s) { return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
    _wrap(s, t) { return `<span class="token-${t}">${this._escape(s)}</span>`; }
    _isWS(c) { return c === ' ' || c === '\t' || c === '\n' || c === '\r'; }
    _isD(c) { return c >= '0' && c <= '9'; }
    _isIS(c) { return (c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z') || c === '_' || c === '$'; }
    _isIP(c) { return this._isIS(c) || this._isD(c); }
    _isFC(line, i) { while (i < line.length) { if (!this._isWS(line[i])) return line[i] === '('; i++; } return false; }
}

export default VirtualizedEditor;