/**
 * @ B"H 
 * @file VirtualizedEditor.js
 * @author Your Name
 * @version 5.0.0 - Olam HaAsiyah (The World of Action)
 *
 * @description
 * This evolution perfects the separation of Guf (Body) and Neshama (Soul) by placing the
 * entire Neshama (the highlighting engine) into a dedicated Web Worker.
 *
 * THE BODY (Guf/Keli):
 * The main thread is now purely for action. It handles user input, scrolling, and DOM updates
 * with zero blocking from the highlighter. Its original high-performance architecture is
 * preserved and now unburdened, guaranteeing a perfectly fluid user experience.
 *
 * THE SOUL (Neshama/Ohr):
 * The complete, unbreakable state machine now lives and breathes in a separate world (a Web Worker).
 * On every keystroke, the Body sends the current text to the Soul. The Soul performs its sacred
 * task of parsing and highlighting, then sends the pure, ready-to-render HTML back to the Body.
 * This sacred division of labor ensures the world of action never freezes.
 */

/**
 * @function makeQuickWorker
 * @description The Sefirah of Binah (Understanding). Offloads heavy processing to prevent freezing the world of action.
 * (Preserved from original for potential other uses)
 */
function makeQuickWorker(fnc, ...args) {
    return new Promise((resolve, reject) => {
        if (typeof fnc !== 'function') return reject(new Error("The spark must be a function."));
        let stringed;
        try { stringed = JSON.stringify(args); } catch (e) { return reject(e); }
        const txt = `var task=${fnc};var args=${stringed};self.onmessage=async e=>{if(e.data.go)try{postMessage({got:await task(...args)})}catch(t){postMessage({error:t.message})}};postMessage({started:!0});`;
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
     * @description The moment of creation, now with a dedicated soul in a separate realm.
     */
    constructor(textarea, language = 'js', customColors = {}) {
        if (!textarea || textarea.tagName !== 'TEXTAREA') {
            throw new Error('The vessel of creation must be a TEXTAREA element.');
        }

        this.textarea = textarea;
        this.language = language;
        this.wrapper = null;
        this.overlay = null;
        this.viewport = null;
        this.caret = null;
        this.styleId = `BH_EDITOR_${Date.now()}`;
        this.lines = [];
        this.lineHeight = 0;
        this.charWidth = 0;
        this.viewportDivs = [];
        this.highlighterWorker = null; // Vessel for the soul

        const defaultColors = {
            comment: '#6A9555', string: '#CE9178', number: '#B5CEA8',
            controlKeyword: '#C586C0', definitionKeyword: '#569CD6', functionName: '#DCDCAA',
            variable: '#9CDCFE', operator: '#D4D4D4', punctuation: '#808080',
            tag: '#569CD6', 'attribute-name': '#9CDCFE', 'attribute-value': '#CE9178',
            selector: '#D7BA7D', property: '#9CDCFE',
        };
        this.colors = { ...defaultColors, ...customColors };

        this._initializeVessels();
        this._initializeHighlightingWorker(); // Give birth to the soul
        this._attachEventListeners();
        this._measureAndRender();
    }

    // --- 1. THE BODY (Guf/Keli): HIGH-PERFORMANCE MAIN THREAD ARCHITECTURE ---

    /**
     * @private @function _initializeVessels
     * @description Gevurah (Strength). Structures the DOM for virtual scrolling.
     */
    _initializeVessels() {
        const computed = window.getComputedStyle(this.textarea);
        this.wrapper = document.createElement('div');
        this.wrapper.className = 'virtualized-editor-wrapper';
        ['width', 'height', 'margin', 'padding', 'border', 'boxSizing', 'position'].forEach(prop => {
            if (prop === 'position' && computed[prop] === 'static') this.wrapper.style.position = 'relative';
            else this.wrapper.style[prop] = computed[prop];
        });
        this.textarea.parentNode.insertBefore(this.wrapper, this.textarea);
        this.wrapper.appendChild(this.textarea);
        Object.assign(this.textarea.style, {
            position: 'absolute', top: '0', left: '0', width: '100%', height: '100%', resize: 'none',
            color: 'transparent', background: 'transparent', caretColor: '#66ff77'
        });
        this.overlay = document.createElement('div');
        this.viewport = document.createElement('div');
        this.overlay.appendChild(this.viewport);
        Object.assign(this.overlay.style, {
            position: "absolute", zIndex: 1, top: '0', left: '0', width: '100%', height: '100%',
            pointerEvents: 'none', overflow: 'hidden', font: computed.font,
            padding: computed.padding, border: computed.border, boxSizing: computed.boxSizing
        });
        this.viewport.style.whiteSpace = "pre";
        this.caret = document.createElement('div');
        this.caret.className = 'virtualized-editor-caret';
        this.overlay.appendChild(this.caret);
        this.wrapper.appendChild(this.overlay);
        this._applyColors();
    }

    /** @private @function _applyColors */
    _applyColors() {
        const styleEl = document.createElement("style");
        styleEl.id = this.styleId + "-style";
        const caretColor = getComputedStyle(this.textarea).color || 'white';
        styleEl.innerHTML = /*css*/`
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
        document.head.querySelector("#" + styleEl.id)?.remove();
        document.head.appendChild(styleEl);
    }

    /**
     * @private @function _attachEventListeners
     * @description Netzach & Hod (Endurance & Splendor). Listens for user actions.
     */
    _attachEventListeners() {
        this.textarea.addEventListener('input', () => this._update());
        
        const onScroll = () => window.requestAnimationFrame(() => { this._render(); this._updateCaret(); });
        const onCaretMove = () => window.requestAnimationFrame(() => this._updateCaret());

        new ResizeObserver(onScroll).observe(this.wrapper);
        this.textarea.addEventListener('scroll', onScroll);
        ['click', 'keyup', 'keydown', 'focus', 'blur'].forEach(evt => this.textarea.addEventListener(evt, onCaretMove));
    }

    /**
     * @private @function _measureAndRender
     * @description The first act of measurement and rendering.
     */
    _measureAndRender() {
        const performMeasurements = () => {
            if (!this.textarea.parentNode || !this.textarea.clientWidth || !this.lineHeight) {
                const lh = parseFloat(getComputedStyle(this.textarea).lineHeight);
                if (lh && !isNaN(lh)) this.lineHeight = lh;
                else return false;
            }
            if (!this.charWidth) {
                const tempSpan = document.createElement('span');
                tempSpan.style.font = getComputedStyle(this.textarea).font;
                tempSpan.textContent = 'm';
                this.overlay.appendChild(tempSpan);
                this.charWidth = tempSpan.getBoundingClientRect().width;
                tempSpan.remove();
            }
            return this.charWidth > 0 && this.lineHeight > 0;
        };
        const attemptMeasure = () => {
            if (performMeasurements()) {
                this._update();
                this._updateCaret();
            } else {
                setTimeout(attemptMeasure, 50);
            }
        }
        attemptMeasure();
    }

    /**
     * @private @function _update
     * @description The Will to refresh. Sends the new text to the worker soul.
     */
    _update() {
        this.lines = this.textarea.value.split("\n");

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
        
        // This now simply messages the worker and does not render directly.
        this._render();
    }

    /**
     * @private @function _render
     * @description Malkuth (Kingdom). Asks the worker for highlighted HTML and updates the DOM.
     */
    _render() {
        if (!this.lines || !this.lineHeight || !this.highlighterWorker) return;
        const scrollTop = this.textarea.scrollTop;
        const scrollLeft = this.textarea.scrollLeft;
        const firstVisibleLine = Math.floor(scrollTop / this.lineHeight);
        const firstLineToRender = Math.max(0, firstVisibleLine - 1);

        this.highlighterWorker.postMessage({
            type: 'highlight',
            text: this.textarea.value,
            language: this.language,
            firstLineToRender: firstLineToRender,
            numLinesToRender: this.viewportDivs.length
        });

        const scrollRemainder = scrollTop - (firstLineToRender * this.lineHeight);
        this.viewport.style.transform = `translate(${-scrollLeft}px, ${-scrollRemainder}px)`;
    }

    /**
     * @private @function _updateCaret
     * @description Yesod (Foundation). Positions the simulated caret.
     */
    _updateCaret() {
        if (document.activeElement !== this.textarea || !this.lineHeight || !this.charWidth || !this.lines) {
            if (this.caret) this.caret.style.display = 'none';
            return;
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

    // --- 2. THE SOUL (Neshama/Ohr): THE WORKER INITIALIZATION ---

    /**
     * @private @function _initializeHighlightingWorker
     * @description Creates the worker and provides it with the entire highlighting engine (the soul).
     */
    _initializeHighlightingWorker() {
        const workerScript = /*js*/`
            // --- Worker State ---
            let lines = [];
            let language = 'js';

            // --- Worker Message Handler ---
            self.onmessage = (e) => {
                const { type, text, firstLineToRender, numLinesToRender, language: newLanguage } = e.data;

                if (type === 'highlight') {
                    lines = text.split('\\n');
                    language = newLanguage;

                    let state = _getInitialState();

                    // Fast-forward state to the first visible line
                    for (let i = 0; i < firstLineToRender; i++) {
                        state = _getHighlightResult(lines[i] || '', state).state;
                    }

                    // Highlight only the visible lines
                    const highlightedLines = [];
                    for (let i = 0; i < numLinesToRender; i++) {
                        const lineIndex = firstLineToRender + i;
                        if (lineIndex < lines.length) {
                            const result = _getHighlightResult(lines[lineIndex] || '', state);
                            highlightedLines.push(result.html);
                            state = result.state;
                        } else {
                            highlightedLines.push(null); // Signal end of content
                        }
                    }

                    // Send the result back to the main thread
                    self.postMessage({
                        type: 'highlightResult',
                        htmlLines: highlightedLines
                    });
                }
            };

            // --- ALL HIGHLIGHTING LOGIC IS NOW SELF-CONTAINED IN THE WORKER ---

            function _getInitialState() {
                return {
                    contextStack: [{ mode: language === 'js' ? 'javascript' : language }],
                    isNextTokenFunctionName: false
                };
            }

            function _getHighlightResult(line, state) {
                if (!line) return { html: '&nbsp;', state };
                let html = '';
                let i = 0;
                while (i < line.length) {
                    const i_before = i;
                    const res = _getToken(line, i, state);
                    html += res.html;
                    i = res.newIndex;
                    if (i === i_before) { html += _escape(line[i++]); }
                }
                return { html: html || '&nbsp;', state };
            }
            
            function _getToken(line, i, state) {
                const context = state.contextStack[state.contextStack.length - 1];
                if (context.terminator && line.substring(i).startsWith(context.terminator)) {
                    const terminatorLength = context.terminator.length;
                    let type = 'string';
                    if (context.mode.includes('comment')) type = 'comment';
                    if (context.mode.includes('interpolation')) type = 'controlKeyword';
                    if (context.terminator.startsWith('</')) type = 'tag';
                    state.contextStack.pop();
                    return { html: _wrap(line.substring(i, i + terminatorLength), type), newIndex: i + terminatorLength };
                }
                if (context.mode.startsWith('template_') && line.substring(i).startsWith('\${')) {
                    state.contextStack.push({ mode: 'javascript_interpolation', terminator: '}', depth: 0 });
                    return { html: _wrap('\${', 'controlKeyword'), newIndex: i + 2 };
                }
                let currentMode = context.mode;
                if (currentMode.startsWith('template_language_')) {
                    currentMode = currentMode.substring(18);
                }
                switch (currentMode) {
                    case 'javascript':
                    case 'javascript_interpolation':
                        return _getJSToken(line, i, state);
                    case 'html':
                        return _getHTMLToken(line, i, state);
                    case 'css':
                        return _getCssToken(line, i, state);
                    case 'template_literal': {
                        const nextInterpolationIndex = line.indexOf('\${', i);
                        const nextTerminatorIndex = line.indexOf('`', i);
                        let endOfChunk = line.length;
                        if (nextInterpolationIndex !== -1) { endOfChunk = nextInterpolationIndex; }
                        if (nextTerminatorIndex !== -1 && nextTerminatorIndex < endOfChunk) { endOfChunk = nextTerminatorIndex; }
                        if (endOfChunk > i) {
                            return { html: _wrap(line.substring(i, endOfChunk), 'string'), newIndex: endOfChunk };
                        }
                        return { html: _escape(line[i]), newIndex: i + 1 };
                    }
                    case 'comment': {
                        const endIdx = line.indexOf(context.terminator, i);
                        const content = line.substring(i, endIdx !== -1 ? endIdx : line.length);
                        return { html: _wrap(content, 'comment'), newIndex: i + content.length };
                    }
                    case 'string': {
                        const endIdx = line.indexOf(context.terminator, i);
                        const content = line.substring(i, endIdx !== -1 ? endIdx : line.length);
                        return { html: _wrap(content, 'string'), newIndex: i + content.length };
                    }
                    default:
                        return { html: _escape(line[i]), newIndex: i + 1 };
                }
            }

            function _getJSToken(line, i, state) {
                const directives = [ { tag: '/*html*/`', lang: 'html' }, { tag: '/*css*/', lang: 'css' }, { tag: '/*js*/`', lang: 'javascript' }];
                for (const d of directives) {
                    if (line.substring(i).startsWith(d.tag)) {
                        state.contextStack.push({ mode: \`template_language_\${d.lang}\`, terminator: '\`' });
                        return { html: _wrap(d.tag.slice(0, -1), 'comment') + _wrap('\`', 'string'), newIndex: i + d.tag.length };
                    }
                }
                const context = state.contextStack[state.contextStack.length - 1];
                const char = line[i];
                if (line.substring(i, i + 2) === '/*') { state.contextStack.push({ mode: 'comment', terminator: '*/' }); return { html: _wrap('/*', 'comment'), newIndex: i + 2 }; }
                if (line.substring(i, i + 2) === '//') { return { html: _wrap(line.substring(i), 'comment'), newIndex: line.length }; }
                if (char === "'" || char === '"') { state.contextStack.push({ mode: 'string', terminator: char }); return { html: _wrap(char, 'string'), newIndex: i + 1 };}
                if (char === '\`') { state.contextStack.push({ mode: 'template_literal', terminator: '\`' }); return { html: _wrap('\`', 'string'), newIndex: i + 1 }; }
                if (context.mode === 'javascript_interpolation') {
                    if (char === '{') { context.depth = (context.depth || 0) + 1; } 
                    else if (char === '}') { if (context.depth && context.depth > 0) { context.depth--; } else { return { html: '', newIndex: i }; } }
                }
                const ctlK = new Set(['import','as','from','export','async','function','await','if','else','return','for','while','switch','case','break','continue','try','catch','finally','class','extends','get','set', 'typeof', 'of']);
                const defK = new Set(['const','let','var','true','false','null','undefined','this','new','super']);
                if (_isIS(char)) {
                    let buffer = '', p = i;
                    while (p < line.length && _isIP(line[p])) buffer += line[p++];
                    let type = 'variable';
                    if (state.isNextTokenFunctionName) { type = 'functionName'; state.isNextTokenFunctionName = false; }
                    else if (buffer === 'function') { type = 'controlKeyword'; state.isNextTokenFunctionName = true; }
                    else if (ctlK.has(buffer)) type = 'controlKeyword';
                    else if (defK.has(buffer)) type = 'definitionKeyword';
                    else if (_isFC(line, p)) type = 'functionName';
                    return { html: _wrap(buffer, type), newIndex: p };
                }
                if (_isD(char)) { let buffer = '', p = i; while (p < line.length && (_isD(line[p]) || line[p] === '.')) buffer += line[p++]; return { html: _wrap(buffer, 'number'), newIndex: p }; }
                state.isNextTokenFunctionName = false;
                const isPunctuation = '{}[]().,;'.includes(char);
                const type = isPunctuation ? 'punctuation' : 'operator';
                return { html: _wrap(char, type), newIndex: i + 1 };
            }

            function _getHTMLToken(line, i, state) {
                const tagStart = line.indexOf('<', i);
                if (tagStart === -1) { return { html: _escape(line.substring(i)), newIndex: line.length }; }
                let html = _escape(line.substring(i, tagStart));
                if (line.substring(tagStart).startsWith('<!--')) { state.contextStack.push({ mode: 'comment', terminator: '-->' }); return { html: html + _wrap('<!--', 'comment'), newIndex: tagStart + 4 }; }
                const tagEnd = line.indexOf('>', tagStart);
                if (tagEnd === -1) { return { html: html + _escape(line.substring(tagStart)), newIndex: line.length }; }
                const isClosing = line[tagStart + 1] === '/';
                html += _wrap(isClosing ? '</' : '<', 'punctuation');
                let p = isClosing ? tagStart + 2 : tagStart + 1;
                let tagName = '';
                while (p < tagEnd && !_isWS(line[p]) && line[p] !== '>') tagName += line[p++];
                html += _wrap(tagName, 'tag');
                const lowerTagName = tagName.toLowerCase();
                while (p < tagEnd) {
                    const whitespaceStart = p;
                    while (p < tagEnd && _isWS(line[p])) p++;
                    if (p > whitespaceStart) { html += _escape(line.substring(whitespaceStart, p)); }
                    if (p >= tagEnd) break;
                    const attrNameStart = p;
                    while (p < tagEnd && !_isWS(line[p]) && line[p] !== '=' && line[p] !== '>') p++;
                    html += _wrap(line.substring(attrNameStart, p), 'attribute-name');
                    if (p >= tagEnd) break;
                    while (p < tagEnd && _isWS(line[p])) p++;
                    if (line[p] === '=') {
                        html += _wrap('=', 'operator'); p++;
                        while (p < tagEnd && _isWS(line[p])) p++;
                        const quote = line[p];
                        if (quote === '"' || quote === "'") {
                            const valueStart = p + 1; const valueEnd = line.indexOf(quote, valueStart);
                            if (valueEnd !== -1 && valueEnd < tagEnd) { html += _wrap(quote, 'string') + _wrap(line.substring(valueStart, valueEnd), 'attribute-value') + _wrap(quote, 'string'); p = valueEnd + 1; } 
                            else { html += _wrap(line.substring(p, tagEnd), 'string'); p = tagEnd; }
                        } else {
                            const valueStart = p; while (p < tagEnd && !_isWS(line[p]) && line[p] !== '>') p++;
                            html += _wrap(line.substring(valueStart, p), 'attribute-value');
                        }
                    }
                }
                html += _wrap('>', 'punctuation');
                if (!isClosing && (lowerTagName === 'script' || lowerTagName === 'style')) {
                    const lang = lowerTagName === 'script' ? 'javascript' : 'css';
                    state.contextStack.push({ mode: lang, terminator: \`</\${lowerTagName}>\` });
                }
                return { html, newIndex: tagEnd + 1 };
            }

            function _getCssToken(line, i, state) {
                if (line.substring(i, i + 2) === '/*') { state.contextStack.push({ mode: 'comment', terminator: '*/' }); return { html: _wrap('/*', 'comment'), newIndex: i + 2 }; }
                const char = line[i];
                if (_isWS(char)) { let p = i; while (p < line.length && _isWS(line[p])) { p++; } return { html: line.substring(i, p), newIndex: p }; }
                if (state.inCssRuleBlock) {
                    if (char === '}') { state.inCssRuleBlock = false; return { html: _wrap('}', 'punctuation'), newIndex: i + 1 }; }
                    let p = i; while (p < line.length && !':;{}'.includes(line[p]) && !_isWS(line[p])) { p++; }
                    const buffer = line.substring(i, p);
                    let nextChar = ''; let next_p = p;
                    while (next_p < line.length && _isWS(line[next_p])) { next_p++; }
                    if (next_p < line.length) { nextChar = line[next_p]; }
                    if (nextChar === ':') { return { html: _wrap(buffer, 'property'), newIndex: p }; }
                    return { html: _wrap(buffer, 'attribute-value'), newIndex: p };
                } else {
                    if (char === '{') { state.inCssRuleBlock = true; return { html: _wrap('{', 'punctuation'), newIndex: i + 1 }; }
                    const braceIndex = line.indexOf('{', i); const commentIndex = line.indexOf('/*', i);
                    let end = braceIndex !== -1 ? braceIndex : line.length;
                    if(commentIndex !== -1 && commentIndex < end) { end = commentIndex; }
                    return { html: _wrap(line.substring(i, end), 'selector'), newIndex: end };
                }
            }
            
            // --- Helper Functions ---
            function _escape(s){return s?s.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;"):""}
            function _wrap(s,t){return \`<span class="token-\${t}">\${_escape(s)}</span>\`}
            function _isWS(c){return" "===c||"\\t"===c||"\\n"===c||"\\r"===c}
            function _isD(c){return c>="0"&&c<="9"}
            function _isIS(c){return c>="a"&&c<="z"||c>="A"&&c<="Z"||"_"===c||"$"===c}
            function _isIP(c){return _isIS(c)||_isD(c)}
            function _isFC(line,i){for(;i<line.length;){if(!_isWS(line[i]))return"("===line[i];i++}return!1}
        `;
        const blob = new Blob([workerScript.trim()], { type: 'application/javascript' });
        this.highlighterWorker = new Worker(URL.createObjectURL(blob));
        this.highlighterWorker.onmessage = this._onWorkerMessage.bind(this);
    }
    
    /**
     * @private @function _onWorkerMessage
     * @description Receives the highlighted HTML from the worker and applies it to the DOM.
     */
    _onWorkerMessage(e) {
        const { type, htmlLines } = e.data;
        if (type === 'highlightResult') {
            htmlLines.forEach((html, i) => {
                const div = this.viewportDivs[i];
                if (div) {
                    if (html === null) {
                        div.style.display = 'none';
                    } else {
                        div.style.display = 'block';
                        // Avoids unnecessary DOM writes if content is identical
                        if (div.innerHTML !== html) {
                           div.innerHTML = html;
                        }
                    }
                }
            });
        }
    }


    // --- 3. PUBLIC API (UNCHANGED) ---

    update(newContent) {
        if (typeof newContent !== 'string') return;
        if (!this.charWidth || this.charWidth <= 0) this._measureAndRender();
        this.textarea.value = newContent;
        this._update();
    }
    
    setLanguage(newLanguage) { 
        this.language = newLanguage; 
        this._update(); // This will trigger a re-render with the new language
    }

    destroy() {
        if (this.highlighterWorker) {
            this.highlighterWorker.terminate();
        }
        if (this.wrapper) {
            this.wrapper.parentNode.insertBefore(this.textarea, this.wrapper);
            this.wrapper.remove();
        }
        this.textarea.style.cssText = "";
        document.head.querySelector("#" + this.styleId + "-style")?.remove();
    }
}

export default VirtualizedEditor;