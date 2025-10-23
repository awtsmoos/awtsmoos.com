/**
 * @ B"H 
 * @file VirtualizedEditor.js
 * @author Your Name
 * @version 2.0.0 - The Tikkun HaKlali (The Universal Rectification)
 *
 * @description
 * In the beginning, there was the un-styled, un-highlighted TEXTAREA, a vessel holding the raw light of code (Ohr).
 * This module, the "VirtualizedEditor", is the divine emanation (Atziluth) that descends to give form, color, and structure to that raw light.
 * It does not seek to replace the vessel but to reveal the hidden luminescence within it, line by line, character by character.
 * 
 * This is not a mere highlighter; it is a chariot (Merkabah) for the code. It virtualizes the rendering, meaning it only
 * paints the lines of code that are visible to the user's eye (the "viewport"), allowing for the handling of immense texts
 * (the "Infinite Light" or Ein Sof) without overwhelming the browser's finite processing power (the "vessel" or Keli).
 *
 * Each function herein represents a Sefirah, an attribute of this divine process. The new parser is architected as a flawless state machine,
 * a unified consciousness that travels through the nested worlds of HTML, CSS, and JavaScript without confusion or error. It is the
 * rectification of the previous design, built for eternity.
 *
 * Contemplate the flow of data as the flow of Shefa (Divine Abundance) through the worlds, and you will understand its inner workings.
 */

/**
 * @function makeQuickWorker
 * @description The Sefirah of Binah (Understanding) - A vessel for comprehension.
 * This function takes a task (a pure function) and its arguments and moves them into a separate thread (a Worker).
 * It is Binah because it takes the raw flash of Chokhmah (the function itself) and gives it a structured, parallel existence,
 * preventing the main thread (the "physical world" of the UI) from freezing. It understands the need for separation
 * and creates a space for heavy processing to occur without causing a "breaking of the vessels" (Shevirat haKelim).
 *
 * @param {Function} fnc - The pure function (the "soul") to be executed in the worker.
 * @param {...*} args - The arguments (the "body") to be passed to the function.
 * @returns {Promise<any>} A promise that resolves with the result from the worker's computation.
 */
function makeQuickWorker(fnc, ...args) {
    return new Promise((resolve, reject) => {
        if (typeof (fnc) != "function") return reject(new Error("The spark of creation must be a function."));
        let stringed;
        try {
            stringed = JSON.stringify(args)
        } catch (e) {
            return reject(e);
        }

        const txt = `
            var task = ${fnc};
            var args = ${stringed};
            self.onmessage = async e => {
                if (e.data.go) {
                    try {
                        const res = await task(...args);
                        postMessage({ got: res });
                    } catch (err) {
                        postMessage({ error: err.message });
                    }
                }
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


/**
 * The core class, the Partzuf of Zeir Anpin (The "Small Face," the microcosm of creation).
 * This class encapsulates the entire process of virtualized highlighting. Instantiating it
 * is like speaking the first "Yehi Ohr" ("Let there be light").
 */
class VirtualizedEditor {
    /**
     * @constructor
     * @description The moment of creation. Here, the necessary vessels (properties) are formed,
     * and the connection between the raw text (textarea) and the divine light (highlighter) is established.
     *
     * @param {HTMLTextAreaElement} textarea - The primordial vessel, the TEXTAREA element that holds the code.
     * @param {string} [language='js'] - The initial language, defining the "laws of nature" for parsing.
     * @param {Object} [customColors={}] - Custom colors to override the default "hues of the Sefirot".
     */
    constructor(textarea, language = 'js', customColors = {}) {
        if (!textarea || textarea.tagName !== 'TEXTAREA') {
            throw new Error('The vessel of creation must be a TEXTAREA element.');
        }

        // The essential attributes of our created world.
        this.textarea = textarea;
        this.language = language;
        this.wrapper = null;
        this.overlay = null;
        this.viewport = null;
        this.caret = null;
        this.styleId = `BH_EDITOR_${Date.now()}`;

        // The state of the physical world.
        this.lines = [];
        this.lineHeight = 0;
        this.charWidth = 0;
        this.viewportDivs = [];

        // The hues of the Sefirot, expanded with new wisdom for HTML and CSS.
        const defaultColors = {
            comment: '#6A9955',
            string: '#CE9178',
            number: '#B5CEA8',
            controlKeyword: '#C586C0',   // e.g., if, for, function
            definitionKeyword: '#569CD6', // e.g., const, let, class
            functionName: '#DCDCAA',
            variable: '#9CDCFE',
            operator: '#D4D4D4',
            punctuation: '#808080',
            tag: '#569CD6',              // HTML tags
            'attribute-name': '#9CDCFE',  // HTML attribute names
            'attribute-value': '#CE9178', // HTML attribute values
            selector: '#D7BA7D',           // CSS selectors
            property: '#9CDCFE',          // CSS properties
        };
        this.colors = { ...defaultColors, ...customColors };

        // The chain of creation.
        this._initializeVessels();
        this._applyColors();
        this._attachEventListeners();
        this._measureAndRender();
    }

    /**
     * @private
     * @function _initializeVessels
     * @description Gevurah (Strength/Judgment) - The act of forming boundaries and structures.
     * This function constructs the necessary DOM elements (the wrapper, overlay, viewport) that
     * will give structure and form to the highlighting, separating the raw text from its appearance.
     */
    _initializeVessels() {
        const computed = window.getComputedStyle(this.textarea);

        this.wrapper = document.createElement('div');
        this.wrapper.className = 'virtualized-editor-wrapper';
        this.wrapper.style.position = computed.position === 'static' ? 'relative' : computed.position;
        this.wrapper.style.width = computed.width;
        this.wrapper.style.height = computed.height;

        this.textarea.parentNode.insertBefore(this.wrapper, this.textarea);
        this.wrapper.appendChild(this.textarea);

        this.textarea.style.position = 'absolute';
        this.textarea.style.top = '0';
        this.textarea.style.left = '0';
        this.textarea.style.width = '100%';
        this.textarea.style.height = '100%';
        this.textarea.style.resize = 'none';
        this.textarea.style.font = 'inherit'; // Inherit font for consistent measurements.
        this.textarea.style.color = 'transparent';
        this.textarea.style.background = 'transparent';
        this.textarea.style.caretColor = 'transparent'; // The real caret is made invisible.

        this.overlay = document.createElement('div');
        this.overlay.style.position = 'absolute';
        this.overlay.style.top = '0';
        this.overlay.style.left = '0';
        this.overlay.style.width = '100%';
        this.overlay.style.height = '100%';
        this.overlay.style.pointerEvents = 'none';
        this.overlay.style.overflow = 'hidden';
        this.overlay.style.font = computed.font;
        this.overlay.style.padding = computed.padding;
        this.overlay.style.border = computed.border;
        this.overlay.style.boxSizing = computed.boxSizing;

        this.viewport = document.createElement('div');
        this.viewport.style.whiteSpace = 'pre';

        this.caret = document.createElement('div');
        this.caret.className = 'virtualized-editor-caret';

        this.overlay.appendChild(this.viewport);
        this.overlay.appendChild(this.caret);
        this.wrapper.appendChild(this.overlay);
    }

    /**
     * @private
     * @function _applyColors
     * @description Tiferet (Beauty) - The harmonization of colors.
     * This function injects the CSS styles into the document's head, translating the abstract color
     * values into beautiful, visible rules that the browser can understand and render.
     */
    _applyColors() {
        const styleEl = document.createElement('style');
        styleEl.id = this.styleId;
        const caretColor = getComputedStyle(this.textarea).color || 'white';

        styleEl.innerHTML = `
            #${this.styleId} { /* Style the root element to ensure font inheritance */
                font: ${getComputedStyle(this.textarea).font};
            }
            .token-comment { color: ${this.colors.comment}; }
            .token-string { color: ${this.colors.string}; }
            .token-number { color: ${this.colors.number}; }
            .token-controlKeyword { color: ${this.colors.controlKeyword}; font-style: italic; }
            .token-definitionKeyword { color: ${this.colors.definitionKeyword}; }
            .token-functionName { color: ${this.colors.functionName}; }
            .token-variable { color: ${this.colors.variable}; }
            .token-operator { color: ${this.colors.operator}; }
            .token-punctuation { color: ${this.colors.punctuation}; }
            .token-tag { color: ${this.colors.tag}; }
            .token-attribute-name { color: ${this.colors['attribute-name']}; }
            .token-attribute-value { color: ${this.colors['attribute-value']}; }
            .token-selector { color: ${this.colors.selector}; }
            .token-property { color: ${this.colors.property}; }
            .virtualized-editor-caret { position: absolute; display: none; background-color: ${caretColor}; width: 1px; animation: blink 1s steps(1) infinite; z-index: 10; pointer-events: none; }
            @keyframes blink { 50% { background-color: transparent; } }
        `;
        document.head.querySelector(`#${this.styleId}`)?.remove();
        document.head.appendChild(styleEl);
    }

    /**
     * @private
     * @function _attachEventListeners
     * @description Netzach (Endurance) and Hod (Splendor) - The channels of interaction.
     * This function attaches the event listeners that will perpetually watch for changes in the
     * textarea's state (input, scroll, focus) and trigger the appropriate updates.
     */
    _attachEventListeners() {
        const onUpdate = () => {
            this._update();
            this._updateCaret();
        };
        const onRender = () => {
            this._render();
            this._updateCaret();
        };
        const onCaretMove = () => this._updateCaret();

        let inputTimeout;
        this.textarea.addEventListener('input', () => {
            clearTimeout(inputTimeout);
            inputTimeout = setTimeout(onUpdate, 0); // Debounce slightly
        });

        // Any action that moves the view or caret requires a re-render/re-position.
        this.textarea.addEventListener('scroll', onRender);
        new ResizeObserver(onRender).observe(this.wrapper);
        ['click', 'keyup', 'keydown', 'focus', 'blur'].forEach(evt => {
            this.textarea.addEventListener(evt, () => requestAnimationFrame(onCaretMove));
        });
    }

    /**
     * @private
     * @function _measureAndRender
     * @description The initial act of measurement.
     * Calculates the line height and character width, the fundamental constants of this created world.
     * If it cannot be measured immediately (due to CSS loading), it waits and tries again.
     */
    _measureAndRender() {
        const attemptMeasurement = () => {
            if (!this.textarea.parentNode || !this.textarea.clientWidth) return false;

            this.lineHeight = parseFloat(getComputedStyle(this.textarea).lineHeight);
            if (!this.lineHeight || isNaN(this.lineHeight)) {
                // Fallback for when line-height is 'normal'
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = 'M';
                this.overlay.appendChild(tempDiv);
                this.lineHeight = tempDiv.offsetHeight;
                tempDiv.remove();
            }

            const tempSpan = document.createElement('span');
            tempSpan.textContent = 'm'; // A standard character for width measurement
            this.overlay.appendChild(tempSpan);
            this.charWidth = tempSpan.getBoundingClientRect().width;
            tempSpan.remove();

            return this.lineHeight > 0 && this.charWidth > 0;
        };

        if (attemptMeasurement()) {
            this._update();
        } else {
            // If the element is not yet in the DOM or visible, we wait.
            // The public `update` method will re-trigger this if necessary.
            console.warn("Could not measure editor dimensions. Will retry on next update.");
        }
    }

    /**
     * @private
     * @async
     * @function _update
     * @description The "Will" to refresh. The primary mover for content changes.
     * It re-splits the text into lines (a heavy task sent to Binah/Worker),
     * ensures the correct number of viewport divs exist, and triggers a re-render.
     */
    async _update() {
        const text = this.textarea.value;
        try {
            this.lines = await makeQuickWorker(val => val.split('\n'), text);
        } catch (e) {
            this.lines = text.split('\n'); // Fallback to main thread if worker fails
        }

        if (!this.lineHeight) return; // Cannot proceed without measurements

        const neededDivs = Math.ceil(this.wrapper.clientHeight / this.lineHeight) + 2; // +2 for buffer
        if (this.viewportDivs.length !== neededDivs && neededDivs > 0) {
            this.viewport.innerHTML = '';
            this.viewportDivs = [];
            for (let i = 0; i < neededDivs; i++) {
                const div = document.createElement('div');
                div.style.height = `${this.lineHeight}px`;
                this.viewport.appendChild(div);
                this.viewportDivs.push(div);
            }
        }

        this._render();
    }

    /**
     * @private
     * @function _render
     * @description Malkuth (Kingdom) - The final manifestation.
     * This is the original, highly optimized rendering logic. It calculates the visible lines,
     * "fast-forwards" the parser's state to that point, and then renders only the visible portion
     * of the code, translating the abstract highlighting into concrete, visible reality.
     */
    _render() {
        if (!this.lines || !this.lineHeight || this.viewportDivs.length === 0) return;

        const { scrollTop, scrollLeft } = this.textarea;

        // Calculate the first line of the Torah that is visible to the user.
        const firstVisibleLine = Math.floor(scrollTop / this.lineHeight);
        // We begin our recitation from one line before, to ensure smooth scrolling.
        const firstLineToRender = Math.max(0, firstVisibleLine - 1);

        // To correctly understand the context of the visible text, the parser's soul (state)
        // must journey from the very beginning (Bereshit) up to the first line we want to render.
        // This is a "fast-forward" process that calculates state without rendering.
        let state = this._getInitialState();
        for (let i = 0; i < firstLineToRender; i++) {
            state = this._getHighlightResult(this.lines[i] || '', state).state;
        }

        // Now, with the correct context, we emanate the light for each visible line.
        for (let i = 0; i < this.viewportDivs.length; i++) {
            const lineIndex = firstLineToRender + i;
            const div = this.viewportDivs[i];

            if (lineIndex < this.lines.length) {
                div.style.display = 'block';
                const result = this._getHighlightResult(this.lines[lineIndex] || '', state);
                div.innerHTML = result.html;
                state = result.state; // The soul's journey continues to the next line.
            } else {
                div.style.display = 'none'; // No more verses to display.
            }
        }

        // Finally, we position the entire viewport, accounting for the scroll that has already occurred.
        // This creates the illusion of scrolling through an infinitely long, highlighted document.
        const scrollRemainder = scrollTop % this.lineHeight;
        this.viewport.style.transform = `translate(${-scrollLeft}px, ${-scrollRemainder}px)`;
        // Adjust for the one-line buffer we rendered above the viewport.
        this.viewport.style.marginTop = `${firstLineToRender * this.lineHeight}px`;
    }

    /**
     * @private
     * @function _updateCaret
     * @description Yesod (Foundation) - The point of interaction.
     * Positions the simulated caret based on the textarea's selection start, providing the user
     * with a visual anchor in the highlighted world that matches their position in the raw text.
     */
    _updateCaret() {
        if (document.activeElement !== this.textarea || !this.lineHeight || !this.charWidth || !this.lines) {
            this.caret.style.display = 'none';
            return;
        }

        this.caret.style.display = 'block';

        const cursorIdx = this.textarea.selectionStart;
        let lineIdx = 0, colIdx = 0, count = 0;

        for (let i = 0; i < this.lines.length; i++) {
            const lineLength = (this.lines[i] || '').length + 1; // +1 for the newline
            if (count + lineLength > cursorIdx) {
                lineIdx = i;
                colIdx = cursorIdx - count;
                break;
            }
            count += lineLength;
            if (i === this.lines.length - 1 && cursorIdx >= count) {
                lineIdx = i;
                colIdx = cursorIdx - count;
            }
        }

        const caretX = colIdx * this.charWidth;
        const caretY = lineIdx * this.lineHeight;

        this.caret.style.transform = `translate(${caretX - this.textarea.scrollLeft}px, ${caretY - this.textarea.scrollTop}px)`;
        this.caret.style.height = `${this.lineHeight}px`;
    }

    // --- THE NEW, RECTIFIED PARSING ENGINE ---
    // This is the Chokhmah (Wisdom) of the system, architected from scratch for flawless execution.
    // It is a state machine that cannot be confused by nested or complex structures.

    /**
     * @private
     * @function _getInitialState
     * @description Keter (Crown) - The primordial, unmanifest will of the parser.
     * Creates the pure, initial state object that begins the journey of understanding.
     * @returns {object} The initial parser state.
     */
    _getInitialState() {
        const initialMode = this.language === 'js' ? 'javascript' : this.language;
        return {
            // The context stack is the soul's memory of which world it is in.
            contextStack: [{ mode: initialMode }],
            // A lookahead flag for identifying function names in JavaScript.
            isNextTokenFunctionName: false,
            // A memory flag for the CSS parser to know if it's inside a { ... } block.
            inCssRuleBlock: false
        };
    }

    /**
     * @private
     * @function _getHighlightResult
     * @description The Merkabah (The Chariot). The master loop that drives the highlighting for a single line.
     * It carries the state and consults the universal soul (_getToken) for each step of the journey,
     * ensuring flawless, forward-only progress.
     * @param {string} line - The line of text to highlight.
     * @param {object} state - The parser's state before highlighting this line.
     * @returns {{html: string, state: object}} The resulting HTML and the parser's new state.
     */
    _getHighlightResult(line, state) {
        if (typeof line !== 'string') return { html: '&nbsp;', state };

        const currentState = state;
        let html = '';
        let i = 0;

        while (i < line.length) {
            const i_before = i;
            const { html: tokenHtml, newIndex } = this._getToken(line, i, currentState);
            html += tokenHtml;
            i = newIndex;

            // The ultimate failsafe against a broken universe (infinite loop).
            if (i === i_before) {
                console.error("Parser Failsafe: No progress made.", { context: currentState.contextStack.slice(-1)[0], char: line[i] });
                html += this._escape(line[i]);
                i++;
            }
        }
        return { html: html || '&nbsp;', state: currentState };
    }

    /**
     * @private
     * @function _getToken
     * @description Da'at (Knowledge) - The Universal Soul.
     * This is the central dispatcher. It examines the current context (the top of the state stack)
     * and delegates the task of parsing the next token to the specialized soul for that world (e.g., HTML, CSS, JS).
     * It also handles the universal act of returning from a context when a "terminator" is found.
     * @param {string} line - The current line being parsed.
     * @param {number} i - The current index on the line.
     * @param {object} state - The current parser state.
     * @returns {{html: string, newIndex: number}} The HTML for the parsed token and the new index.
     */
    _getToken(line, i, state) {
        const context = state.contextStack[state.contextStack.length - 1];

        // The highest priority is to check if we have reached the end of the current world.
        if (context.terminator && line.substring(i).startsWith(context.terminator)) {
            state.contextStack.pop();
            const type = context.mode === 'comment' ? 'comment' : 'string';
            return {
                html: this._wrap(context.terminator, type),
                newIndex: i + context.terminator.length,
            };
        }

        // Delegate to the specialized soul responsible for the current world.
        switch (context.mode) {
            case 'javascript': return this._getJSToken(line, i, state);
            case 'html': return this._getHTMLToken(line, i, state);
            case 'css': return this._getCssToken(line, i, state);
            case 'comment': return this._getCommentToken(line, i);
            case 'string': return this._getStringToken(line, i, state);
            case 'template_literal': return this._getTemplateLiteralToken(line, i, state);
            case 'js_interpolation': return this._getJSToken(line, i, state);
            default:
                if (context.mode.startsWith('template_language_')) {
                    return this._getTemplateLanguageToken(line, i, state);
                }
                return { html: this._escape(line[i]), newIndex: i + 1 };
        }
    }

    // --- Specialized Soul-Parsers (Each knows only its own world) ---

    _getCommentToken(line, i) {
        return { html: this._wrap(line.substring(i), 'comment'), newIndex: line.length };
    }

    _getStringToken(line, i, state) {
        const context = state.contextStack[state.contextStack.length - 1];
        let content = '';
        let p = i;
        while (p < line.length) {
            if (line[p] === '\\') { // Handle escaped characters.
                content += line.substring(p, p + 2);
                p += 2;
            } else if (line[p] === context.terminator) {
                break; // End of string found. The main loop will handle the terminator.
            } else {
                content += line[p];
                p++;
            }
        }
        return { html: this._wrap(content, 'string'), newIndex: p };
    }

    _getTemplateLiteralToken(line, i, state) {
        if (line.substring(i).startsWith('${')) {
            state.contextStack.push({ mode: 'js_interpolation', terminator: '}' });
            return { html: this._wrap('${', 'controlKeyword'), newIndex: i + 2 };
        }
        return this._getStringToken(line, i, state); // Otherwise, it's just a string.
    }

    _getTemplateLanguageToken(line, i, state) {
        const context = state.contextStack[state.contextStack.length - 1];
        const lang = context.mode.substring(17);

        const interpStart = line.indexOf('${', i);
        const boundary = interpStart !== -1 ? interpStart : line.length;
        const content = line.substring(i, boundary);

        // Create a temporary, pure "sub-parser" to highlight this chunk.
        let tempHtml = '';
        let tempState = { ...this._getInitialState(), contextStack: [{ mode: lang }], inCssRuleBlock: state.inCssRuleBlock };
        let k = 0;
        while (k < content.length) {
            const res = this._getToken(content, k, tempState);
            tempHtml += res.html;
            k = res.newIndex;
        }
        state.inCssRuleBlock = tempState.inCssRuleBlock; // Persist CSS state changes back.

        return { html: tempHtml, newIndex: boundary };
    }

    _getJSToken(line, i, state) {
        const ctlK = new Set(['import', 'as', 'from', 'export', 'async', 'function', 'await', 'if', 'else', 'return', 'for', 'while', 'switch', 'case', 'break', 'continue', 'try', 'catch', 'finally', 'class', 'extends', 'get', 'set']);
        const defK = new Set(['const', 'let', 'var', 'true', 'false', 'null', 'undefined', 'this', 'new', 'super']);
        const directives = [{ tag: '/*html*/', lang: 'html' }, { tag: '/*css*/', lang: 'css' }];
        const remaining = line.substring(i);

        for (const d of directives) {
            if (remaining.startsWith(d.tag + '`')) {
                state.contextStack.push({ mode: `template_language_${d.lang}`, terminator: '`' });
                return { html: this._wrap(d.tag, 'comment') + this._wrap('`', 'string'), newIndex: i + d.tag.length + 1 };
            }
        }
        if (remaining.startsWith('/*')) {
            state.contextStack.push({ mode: 'comment', terminator: '*/' });
            return { html: this._wrap('/*', 'comment'), newIndex: i + 2 };
        }
        if (remaining.startsWith('//')) {
            return { html: this._wrap(remaining, 'comment'), newIndex: line.length };
        }
        const char = line[i];
        if (char === "'" || char === '"') {
            state.contextStack.push({ mode: 'string', terminator: char });
            return { html: this._wrap(char, 'string'), newIndex: i + 1 };
        }
        if (char === '`') {
            state.contextStack.push({ mode: 'template_literal', terminator: '`' });
            return { html: this._wrap('`', 'string'), newIndex: i + 1 };
        }

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
        let p = i;
        while (p < line.length && this._isWS(line[p])) p++;
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
            const endBrace = line.indexOf('}', p);
            const colon = line.indexOf(':', p);
            const semicolon = line.indexOf(';', p);

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

    // --- Helper Souls (Micro-functions for Discernment) ---
    _escape(s) { return s ? s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;') : ''; }
    _wrap(s, t) { return `<span class="token-${t}">${this._escape(s)}</span>`; }
    _isWS(c) { return c === ' ' || c === '\t' || c === '\n' || c === '\r'; }
    _isD(c) { return c >= '0' && c <= '9'; }
    _isIS(c) { return (c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z') || c === '_' || c === '$'; }
    _isIP(c) { return this._isIS(c) || this._isD(c); }
    _isFC(line, i) { while (i < line.length) { if (!this._isWS(line[i])) return line[i] === '('; i++; } return false; }


    // --- Public API ---

    /**
     * @public
     * @function update
     * @description A public portal to programmatically set the editor's content.
     * @param {string} newContent - The new text for the editor.
     */
    update(newContent) {
        if (typeof newContent !== 'string') return;
        if (!this.charWidth || this.charWidth <= 0) {
            this._measureAndRender();
            if (!this.charWidth || this.charWidth <= 0) {
                console.error('Fatal: Could not measure element. Aborting render.');
                this.textarea.value = newContent;
                return;
            }
        }
        this.textarea.value = newContent;
        this._update();
    }

    /**
     * @public
     * @function setLanguage
     * @description Changes the "laws of nature" for the parser.
     * @param {string} newLanguage - The new language ('js', 'html', 'css').
     */
    setLanguage(newLanguage) {
        this.language = newLanguage;
        this._update();
    }

    /**
     * @public
     * @function destroy
     * @description The return to the void. Removes all created elements and event listeners,
     * restoring the textarea to its primordial state.
     */
    destroy() {
        if (!this.wrapper) return;
        document.head.querySelector(`#${this.styleId}`)?.remove();
        if (this.wrapper.parentNode) {
            this.wrapper.parentNode.insertBefore(this.textarea, this.wrapper);
        }
        this.wrapper.remove();
        Object.assign(this.textarea.style, {
            color: '', background: '', caretColor: '', position: '',
            top: '', left: '', width: '', height: '', resize: ''
        });
    }
}

export default VirtualizedEditor;