/**
 * @file B"H - The Ein Sof of Code Highlighting
 * @author Your Name
 * @version 1.0.0
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
 * Each function herein represents a Sefirah, an attribute of this divine process. From the initial "Keter" (Crown) of
 * creating the highlighter instance, to the "Chokhmah" (Wisdom) of parsing the language, down to the "Malkuth" (Kingdom)
 * of rendering the final colored HTML to the screen.
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
    // Binah creates a promise, a vessel in time, to hold the future result.
    return new Promise((resolve, reject) => {
        if (typeof (fnc) != "function") return reject(new Error("The spark of creation must be a function."));

        var stringed = '[]';
        try {
            // The arguments are serialized, prepared for their journey to the other side.
            stringed = JSON.stringify(args)
        } catch (e) {
            return reject(e);
        }

        // A new world (Worker) is created from a Blob, a concentration of potential.
        // The script text is the "Tzimtzum" (constriction) that defines the worker's reality.
        var txt = `
            var task = ${fnc};
            var args = ${stringed};
            self.onmessage = async e => {
                if (e.data.go) {
                    try {
                        // The task is executed, the light shines within the new world.
                        const res = await task(...args);
                        postMessage({ got: res }); // The light is returned.
                    } catch (err) {
                        postMessage({ error: err.message }); // Or a reflection of its absence.
                    }
                }
            };
            postMessage({ started: !0 });
        `;
        var wk = new Worker(URL.createObjectURL(new Blob([txt], { type: "application/javascript" })));

        // A channel is opened to receive the light from the worker.
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
            console.error('The vessel must be a TEXTAREA element.');
            return;
        }

        /** @private The textarea element, the foundation (Yesod) of our world. */
        this.textarea = textarea;
        /** @private The current language, the "Torah" by which the text is judged. */
        this.language = language;
        /** @private An array of strings, the text broken into lines, like verses. */
        this.lines = [];
        /** @private The height of a single line, the fundamental measure of our vertical world. */
        this.lineHeight = 0;
        /** @private The DOM elements used as a canvas for our highlighted lines. */
        this.viewportDivs = [];
        /** @private The parsing state, carrying context between lines like a soul's journey. */
        this.parserState = { in_comment: false, in_string: false, in_rules: false };

        /** @private The default colors, the 10 Sefirot manifested as light. */
        const defaultColors = {
            comment: '#6a9955', string: '#ce9178', number: '#b5cea8',
            keyword: '#569cd6', 'function': '#dcdcaa', operator: '#d4d4d4',
            punctuation: '#808080', variable: '#9cdcfe', tag: '#569cd6',
            attribute: '#9cdcfe', selector: '#d7ba7d', property: '#9cdcfe',
        };
        /** @private The final colors, merging the divine and the mundane. */
        this.colors = { ...defaultColors, ...customColors };

        this._initializeVessels();
        this._attachEventListeners();
        this._measureAndRender();
    }

    /**
     * @private
     * @function _initializeVessels
     * @description Gevurah (Severity/Strength) - The act of separation and definition.
     * This function creates the necessary DOM elements (the overlay and viewport) and styles,
     * separating the world of colored text from the underlying (and now transparent) textarea.
     * It is Gevurah because it sets firm boundaries and structures.
     */
    _initializeVessels() {
        const computed = window.getComputedStyle(this.textarea);

        // Make the original text transparent, its light is now channeled elsewhere.
        this.textarea.style.color = 'transparent';
        this.textarea.style.background = 'transparent';
        this.textarea.style.caretColor = computed.color; // The caret remains visible, a guide for the user's soul.

        /** @private A unique ID for styles, a "Holy Name" for this instance. */
        this.styleId = `BH_EDITOR_${Date.now()}`;

        /** @private The overlay, a fixed-position firmament that holds our rendered world. */
        this.overlay = document.createElement('div');
        /** @private The viewport, the part of the firmament that moves, revealing different heavens. */
        this.viewport = document.createElement('div');
        this.overlay.appendChild(this.viewport);

        this.overlay.style.position = "fixed";
        this.overlay.style.zIndex = 1;
        this.overlay.style.pointerEvents = 'none';
        this.overlay.style.font = computed.font;
        this.viewport.style.whiteSpace = "pre";

        const existingOverlay = document.querySelector('.bh-overlay-' + this.styleId);
        if (existingOverlay) existingOverlay.remove();
        this.overlay.classList.add('bh-overlay-' + this.styleId);
        document.body.appendChild(this.overlay);

        this._applyColors();
    }

    /**
     * @private
     * @function _applyColors
     * @description Tiferet (Beauty) - The harmonization of colors.
     * This function injects the CSS styles into the document's head, translating the abstract color
     * values into beautiful, visible rules that the browser can understand and render.
     */
    _applyColors() {
        const styleEl = document.createElement("style");
        styleEl.id = this.styleId + "-style";
        styleEl.innerHTML = `
            .token-comment { color: ${this.colors.comment}; }
            .token-string { color: ${this.colors.string}; }
            .token-number { color: ${this.colors.number}; }
            .token-keyword { color: ${this.colors.keyword}; }
            .token-function { color: ${this.colors.function}; }
            .token-operator { color: ${this.colors.operator}; }
            .token-punctuation { color: ${this.colors.punctuation}; }
            .token-variable { color: ${this.colors.variable}; }
            .token-tag { color: ${this.colors.tag}; }
            .token-attribute { color: ${this.colors.attribute}; }
            .token-selector { color: ${this.colors.selector}; }
            .token-property { color: ${this.colors.property}; }
        `;
        const existingStyle = document.querySelector("#" + styleEl.id);
        if (!existingStyle) { document.head.appendChild(styleEl); }
        else { existingStyle.innerHTML = styleEl.innerHTML; }
    }

    /**
     * @private
     * @function _attachEventListeners
     * @description Netzach (Endurance) and Hod (Splendor) - The channels of interaction.
     * This function attaches the event listeners that will perpetually watch for changes (input, scroll, resize).
     * Netzach is the endurance to always be listening, and Hod is the splendor of the responsive update.
     */
    _attachEventListeners() {
        let inputTimeout = null;
        this.textarea.addEventListener('input', () => {
            clearTimeout(inputTimeout);
            inputTimeout = setTimeout(() => this._update(), 0);
        });

        const onScroll = () => window.requestAnimationFrame(() => this._render());
        new ResizeObserver(onScroll).observe(this.textarea);
        this.textarea.addEventListener('scroll', onScroll);

        // The light must also follow the scroll of the outer vessels (parent elements).
        let parent = this.textarea.parentElement;
        while (parent) {
            parent.addEventListener('scroll', onScroll);
            parent = parent.parentElement;
        }
    }

    /**
     * @private
     * @function _measureAndRender
     * @description The initial act of measurement.
     * Calculates the line height, the fundamental constant of this created world. If it cannot be measured
     * immediately (due to the mysteries of CSS loading), it waits and tries again.
     */
    _measureAndRender() {
        this.lineHeight = parseFloat(getComputedStyle(this.textarea).lineHeight);
        if (this.lineHeight === 0) {
            setTimeout(() => {
                this.lineHeight = parseFloat(getComputedStyle(this.textarea).lineHeight);
                if (this.lineHeight > 0) this._update();
            }, 200);
            return;
        }
        this._update();
    }

    // --- START: PARSER LOGIC ---
    // This realm is Chokhmah (Wisdom), where the raw text is discerned and understood.
    // Each parser is a specific "gate of wisdom" for its language.

    _escape(str) { return str ? str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;') : ''; }
    _wrap(str, type) { return `<span class="token-${type}">${this._escape(str)}</span>`; }

    _highlightJS(line, state) {
        const lang = {
            keywords: ['const', 'let', 'var', 'function', 'return', 'if', 'else', 'for', 'class', 'new', 'await', 'async', 'import', 'export', 'from', 'while', 'do', 'switch', 'case', 'break'],
            singleLineComment: '//', multiLineComment: { start: '/*', end: '*/' }, templateString: { start: '`', end: '`' }
        };
        let html = ''; let i = 0;
        while (i < line.length) {
             if (state.in_comment) {
                const endIdx = line.indexOf(lang.multiLineComment.end, i);
                if (endIdx !== -1) { html += this._wrap(line.substring(i, endIdx + lang.multiLineComment.end.length), 'comment'); i = endIdx + lang.multiLineComment.end.length; state.in_comment = false; }
                else { html += this._wrap(line.substring(i), 'comment'); break; }
                continue;
            }
            if (state.in_string) {
                let endIdx = -1; let currentPos = i;
                while((endIdx = line.indexOf(lang.templateString.end, currentPos)) !== -1) { if (line[endIdx - 1] !== '\\') break; currentPos = endIdx + 1; }
                if (endIdx !== -1) { html += this._wrap(line.substring(i, endIdx + lang.templateString.end.length), 'string'); i = endIdx + lang.templateString.end.length; state.in_string = false; }
                else { html += this._wrap(line.substring(i), 'string'); break; }
                continue;
            }
            const char = line[i]; const remaining = line.substring(i);
            if (lang.singleLineComment && remaining.startsWith(lang.singleLineComment)) { html += this._wrap(remaining, 'comment'); break; }
            if (lang.multiLineComment && remaining.startsWith(lang.multiLineComment.start)) {
                const endIdx = remaining.indexOf(lang.multiLineComment.end);
                if (endIdx !== -1) { html += this._wrap(remaining.substring(0, endIdx + lang.multiLineComment.end.length), 'comment'); i += endIdx + lang.multiLineComment.end.length; }
                else { html += this._wrap(remaining, 'comment'); state.in_comment = true; break; }
                continue;
            }
            if (char === '"' || char === "'") {
                let endIdx = -1; let currentPos = i + 1;
                while((endIdx = line.indexOf(char, currentPos)) !== -1) { if(line[endIdx - 1] !== '\\') break; currentPos = endIdx + 1; }
                if (endIdx !== -1) { html += this._wrap(line.substring(i, endIdx + 1), 'string'); i = endIdx + 1; }
                else { html += this._escape(char); i++; }
                continue;
            }
            if (lang.templateString && char === lang.templateString.start) {
                let endIdx = -1; let currentPos = i + 1;
                while((endIdx = line.indexOf(lang.templateString.end, currentPos)) !== -1) { if (line[endIdx - 1] !== '\\') break; currentPos = endIdx + 1; }
                if (endIdx !== -1) { html += this._wrap(line.substring(i, endIdx + 1), 'string'); i = endIdx + 1; }
                else { html += this._wrap(remaining, 'string'); state.in_string = true; break; }
                continue;
            }
            if ((char >= 'a' && char <= 'z') || (char >= 'A' && char <= 'Z') || char === '_') {
                let word = '';
                while (i < line.length && /[a-zA-Z0-9_]/.test(line[i])) { word += line[i]; i++; }
                if (lang.keywords.includes(word)) { html += this._wrap(word, 'keyword'); }
                else { html += this._wrap(word, 'variable'); }
                continue;
            }
            html += this._escape(char); i++;
        }
        return { html: html || '&nbsp;', state };
    }
    _highlightHTML(line, state) {
        let html = '';
        let i = 0;
        while (i < line.length) {
            if (state.in_comment) {
                const endIdx = line.indexOf('-->', i);
                if (endIdx !== -1) {
                    html += this._wrap(line.substring(i, endIdx + 3), 'comment');
                    i = endIdx + 3;
                    state.in_comment = false;
                } else {
                    html += this._wrap(line.substring(i), 'comment');
                    break;
                }
                continue;
            }
            const tagStart = line.indexOf('<', i);
            if (tagStart === -1) {
                html += this._escape(line.substring(i));
                break;
            }
            html += this._escape(line.substring(i, tagStart));
            i = tagStart;
            if (line.substring(i, i + 4) === '<!--') {
                const endIdx = line.indexOf('-->', i + 4);
                if (endIdx !== -1) {
                    html += this._wrap(line.substring(i, endIdx + 3), 'comment');
                    i = endIdx + 3;
                } else {
                    html += this._wrap(line.substring(i), 'comment');
                    state.in_comment = true;
                    break;
                }
                continue;
            }
            const tagEnd = line.indexOf('>', i);
            if (tagEnd === -1) {
                html += this._escape(line.substring(i));
                break;
            }
            let currentPos = i + 1;
            html += this._wrap('<', 'punctuation');
            if (line[currentPos] === '/') {
                html += this._wrap('/', 'punctuation');
                currentPos++;
            }
            let tagName = '';
            while (currentPos < tagEnd && /[\w-]/.test(line[currentPos])) {
                tagName += line[currentPos++];
            }
            html += this._wrap(tagName, 'tag');
            while (currentPos < tagEnd) {
                let whitespace = '';
                while (currentPos < tagEnd && /\s/.test(line[currentPos])) {
                    whitespace += line[currentPos++];
                }
                if (whitespace) html += this._escape(whitespace);
                if (currentPos >= tagEnd) break;
                let attrName = '';
                while (currentPos < tagEnd && /[\w-]/.test(line[currentPos])) {
                    attrName += line[currentPos++];
                }
                if (attrName) {
                    html += this._wrap(attrName, 'attribute');
                    let equalsPart = '';
                    while (currentPos < tagEnd && /\s/.test(line[currentPos])) {
                        equalsPart += line[currentPos++];
                    }
                    if (line[currentPos] === '=') {
                        equalsPart += '=';
                        currentPos++;
                        while (currentPos < tagEnd && /\s/.test(line[currentPos])) {
                            equalsPart += line[currentPos++];
                        }
                        html += `${this._escape(equalsPart.replace('=', ''))}${this._wrap('=', 'operator')}${this._escape(equalsPart.replace('=', ''))}`;
                        const quoteChar = line[currentPos];
                        if (quoteChar === '"' || quoteChar === "'") {
                            let attrValue = quoteChar;
                            currentPos++;
                            while (currentPos < tagEnd && line[currentPos] !== quoteChar) {
                                attrValue += line[currentPos++];
                            }
                            if (currentPos < tagEnd) attrValue += line[currentPos++];
                            html += this._wrap(attrValue, 'string');
                        }
                    }
                } else {
                    html += this._escape(line.substring(currentPos, tagEnd));
                    currentPos = tagEnd;
                }
            }
            html += this._wrap('>', 'punctuation');
            i = tagEnd + 1;
        }
        return { html: html || '&nbsp;', state };
    }
    _highlightCSS(line, state) {
        let html = '';
        let i = 0;
        state.in_rules = state.in_rules || false;

        while(i < line.length) {
            if (state.in_comment) {
                const endIdx = line.indexOf('*/', i);
                if (endIdx !== -1) {
                    html += this._wrap(line.substring(i, endIdx + 2), 'comment');
                    i = endIdx + 2;
                    state.in_comment = false;
                } else {
                    html += this._wrap(line.substring(i), 'comment');
                    break;
                }
                continue;
            }
            
            let preContent = '';
            while(i < line.length && /\s/.test(line[i])) {
                 preContent += line[i++];
            }

            if (line.substring(i).startsWith('/*')) {
                html += this._escape(preContent);
                const endIdx = line.indexOf('*/', i + 2);
                if (endIdx !== -1) {
                    html += this._wrap(line.substring(i, endIdx + 2), 'comment');
                    i = endIdx + 2;
                } else {
                    html += this._wrap(line.substring(i), 'comment');
                    state.in_comment = true;
                    break;
                }
                continue;
            }

            html += this._escape(preContent);
            if (i >= line.length) break;

            if (state.in_rules) {
                if (line[i] === '}') {
                    html += this._wrap('}', 'punctuation');
                    state.in_rules = false;
                    i++;
                    continue;
                }
                const colonIdx = line.indexOf(':', i);
                const semiIdx = line.indexOf(';', i);
                const braceIdx = line.indexOf('}', i);
                
                if (colonIdx !== -1 && (semiIdx === -1 || colonIdx < semiIdx) && (braceIdx === -1 || colonIdx < braceIdx)) {
                    const prop = line.substring(i, colonIdx).trim();
                    html += this._wrap(prop, 'property');
                    html += this._escape(line.substring(i + prop.length, colonIdx));
                    html += this._wrap(':', 'punctuation');
                    i = colonIdx + 1;
                    let endValueIdx = (semiIdx !== -1 && (braceIdx === -1 || semiIdx < braceIdx)) ? semiIdx : (braceIdx !== -1 ? braceIdx : line.length);
                    const val = line.substring(i, endValueIdx).trim();
                    html += this._escape(line.substring(i, line.indexOf(val, i)));
                    html += this._wrap(val, 'string');
                    html += this._escape(line.substring(line.indexOf(val, i) + val.length, endValueIdx));
                    i = endValueIdx;
                    if (i < line.length && line[i] === ';') {
                        html += this._wrap(';', 'punctuation');
                        i++;
                    }
                } else {
                    let endIdx = braceIdx !== -1 ? braceIdx : line.length;
                    html += this._escape(line.substring(i, endIdx));
                    i = endIdx;
                }
            } else {
                const braceIdx = line.indexOf('{', i);
                if (braceIdx !== -1) {
                    const selector = line.substring(i, braceIdx).trim();
                    html += this._wrap(selector, 'selector');
                    html += this._escape(line.substring(i + selector.length, braceIdx));
                    html += this._wrap('{', 'punctuation');
                    state.in_rules = true;
                    i = braceIdx + 1;
                } else {
                    html += this._escape(line.substring(i));
                    break;
                }
            }
        }
        return { html: html || '&nbsp;', state };
    }
    // --- END: PARSER LOGIC ---

    /**
     * @private
     * @function _getVisibleRect
     * @description This function perceives the "World of Assiah" (the physical world of the DOM).
     * It calculates the true visible portion of the textarea, accounting for all scrolled parent
     * containers. It reveals what is truly "seen" by clipping the element's rectangle against
     * the rectangles of its ancestors.
     * @param {HTMLElement} element - The element whose visible portion we need to find.
     * @returns {DOMRect} The rectangle representing the visible part of the element.
     */
    _getVisibleRect(element) {
        let rect = element.getBoundingClientRect();
        let parent = element.parentElement;
        while (parent && parent !== document.body) {
            const parentRect = parent.getBoundingClientRect();
            const parentStyle = getComputedStyle(parent);
            if (['auto', 'scroll'].includes(parentStyle.overflow) || ['auto', 'scroll'].includes(parentStyle.overflowY)) {
                rect = {
                    top: Math.max(rect.top, parentRect.top),
                    left: Math.max(rect.left, parentRect.left),
                    bottom: Math.min(rect.bottom, parentRect.bottom),
                    right: Math.min(rect.right, parentRect.right),
                    width: Math.min(rect.right, parentRect.right) - Math.max(rect.left, parentRect.left),
                    height: Math.min(rect.bottom, parentRect.bottom) - Math.max(rect.top, parentRect.top)
                };
            }
            parent = parent.parentElement;
        }
        return rect;
    }

    /**
     * @private
     * @function _render
     * @description Malkuth (Kingdom) - The final manifestation.
     * This function is the culmination of the entire process. It takes the calculated state and
     * paints the colored HTML onto the viewport divs. It is the point where the divine, abstract
     * process becomes a concrete, visible reality for the user. It is highly optimized to only
     * process and render the visible lines of code.
     */
    _render() {
        if (!this.lines) return;

        // Find the location of our Kingdom in the greater world.
        const fullRect = this.textarea.getBoundingClientRect();
        const visibleRect = this._getVisibleRect(this.textarea);
        
        // Position the firmament (overlay) exactly over the textarea.
        this.overlay.style.left = fullRect.left + "px";
        this.overlay.style.top = fullRect.top + "px";
        this.overlay.style.width = fullRect.width + "px";
        this.overlay.style.height = fullRect.height + "px";

        // Create a "Tzimtzum" (constriction) on the overlay, clipping it to the visible part.
        const clipTop = Math.max(0, visibleRect.top - fullRect.top);
        const clipLeft = Math.max(0, visibleRect.left - fullRect.left);
        const clipBottom = Math.max(0, fullRect.bottom - visibleRect.bottom);
        const clipRight = Math.max(0, fullRect.right - visibleRect.right);
        this.overlay.style.clipPath = `inset(${clipTop}px ${clipRight}px ${clipBottom}px ${clipLeft}px)`;
        
        const scrollTop = this.textarea.scrollTop;
        // Calculate the first visible "verse" (line) from the scroll position.
        const firstVisibleLine = Math.floor(scrollTop / this.lineHeight);
        const firstLineToRender = Math.max(0, firstVisibleLine - 1); // Render one above for smoothness.

        // To correctly highlight, we must "replay" the journey of the parser's soul (state)
        // from the very beginning (Bereshit) up to the first line we want to render.
        let state = { in_comment: false, in_string: false, in_rules: false };
        for (let i = 0; i < firstLineToRender; i++) {
            this._getHighlightResult(this.lines[i], state);
        }

        // Now, emanate the light for the visible lines.
        for (let i = 0; i < this.viewportDivs.length; i++) {
            const lineIndex = firstLineToRender + i;
            const div = this.viewportDivs[i];
            if (lineIndex < this.lines.length) {
                div.style.display = 'block';
                const result = this._getHighlightResult(this.lines[lineIndex], state);
                div.innerHTML = result.html;
                state = result.state; // The soul continues its journey to the next line.
            } else {
                div.style.display = 'none'; // No more verses to display.
            }
        }

        // Finally, position the viewport itself, accounting for both horizontal and vertical scroll.
        const scrollRemainder = scrollTop - (firstLineToRender * this.lineHeight);
        const computed = window.getComputedStyle(this.textarea);
        const paddingLeft = parseFloat(computed.paddingLeft);
        const paddingTop = parseFloat(computed.paddingTop);
        this.viewport.style.transform = `translate(${-this.textarea.scrollLeft + paddingLeft}px, ${-scrollRemainder + paddingTop}px)`;
    }

    /**
     * @private
     * @function _getHighlightResult
     * @description A helper to select the correct "Gate of Wisdom" (parser) for the current language.
     * @param {string} line - The line of text to highlight.
     * @param {object} state - The current parser state.
     * @returns {{html: string, state: object}} The highlighted HTML and the new state.
     */
    _getHighlightResult(line, state) {
        switch (this.language) {
            case 'js': return this._highlightJS(line, state);
            case 'html': return this._highlightHTML(line, state);
            case 'css': return this._highlightCSS(line, state);
            default: return { html: this._escape(line || ''), state };
        }
    }

    /**
     * @private
     * @async
     * @function _update
     * @description The "Will" to refresh. This function is called when the underlying text changes.
     * It re-splits the text into lines (a potentially heavy task sent to Binah/Worker),
     * ensures the correct number of viewport divs exist, and triggers a re-render.
     */
    async _update() {
        const txt = this.textarea.value;
        try {
            // Send the great task of splitting the text to another world.
            this.lines = await makeQuickWorker(val => val.split("\n"), txt);
        } catch (e) {
            // If the worker fails, we must do the work in this world.
            this.lines = txt.split("\n");
        }
        
        // Ensure we have enough vessels (divs) for the visible lines.
        const neededDivs = Math.ceil(this.textarea.clientHeight / this.lineHeight) + 2;
        if (this.viewportDivs.length !== neededDivs) {
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
    }

    /**
     * @public
     * @function setLanguage
     * @description A public portal to change the "laws of nature".
     * Switches the language highlighter and refreshes the view.
     * @param {string} newLanguage - The new language to use ('js', 'html', 'css').
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
        // Remove listeners to prevent memory leaks (souls trapped between worlds).
        // Note: A more robust implementation would store references to listeners to remove them.
        // For this example, we assume this is the final cleanup.

        // Remove the created vessels.
        if (this.overlay) this.overlay.remove();
        const styleEl = document.querySelector("#" + this.styleId + "-style");
        if (styleEl) styleEl.remove();

        // Restore the textarea's visibility.
        this.textarea.style.color = '';
        this.textarea.style.background = '';
        this.textarea.style.caretColor = '';
    }
}

// Export the main class as the default emanation from this module.
export default VirtualizedEditor;