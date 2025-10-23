/**
 * @ B"H 
 - The Ein Sof of Code Highlighting
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
    // B"H
// FILE: VirtualizedEditor.js
// ACTION: REPLACE your `constructor` with this one.

constructor(textarea, language = 'js', customColors = {}) {
    if (!textarea || textarea.tagName !== 'TEXTAREA') {
        console.error('The vessel must be a TEXTAREA element.');
        return;
    }
    
    this.wrapper = null;
    this.textarea = textarea;
    this.language = language;
    this.lines = [];
    this.lineHeight = 0;
    this.viewportDivs = [];
    this.parserState = this._getInitialState()
    this.caret = null;
    this.charWidth = 0;
    
    // --- The Tikkun of Adornment ---
    // New colors for a more sophisticated understanding of HTML and CSS.
    const defaultColors = {
        comment: '#6A9955',
        string: '#CE9178',
        number: '#B5CEA8',
        controlKeyword: '#C586C0',
        definitionKeyword: '#569CD6',
        functionName: '#DCDCAA',
        variable: '#9CDCFE',
        operator: '#D4D4D4',
        punctuation: '#808080',
        tag: '#569CD6',
        
        // -- NEW TOKENS for HTML and CSS --
        'attribute-name': '#9CDCFE',  // Light Blue (like variables)
        'attribute-value': '#CE9178', // Orange (like strings)
        selector: '#D7BA7D',           // Gold
        property: '#9CDCFE',          // Light Blue
    };

    this.colors = { ...defaultColors, ...customColors };
    this._initializeVessels();
    this._attachEventListeners();
    this._measureAndRender();
}

// B"H
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
    const caretColor = getComputedStyle(this.textarea).color || 'white';

    // CSS rules are expanded to render our new, sophisticated tokens.
    styleEl.innerHTML = `
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

        /* --- Styles for our new soulful parsers --- */
        .token-attribute-name { color: ${this.colors['attribute-name']}; }
        .token-attribute-value { color: ${this.colors['attribute-value']}; }
        .token-selector { color: ${this.colors.selector}; }
        .token-property { color: ${this.colors.property}; }

        .virtualized-editor-caret { position: absolute; display: none; background-color: ${caretColor}; width: 1px; animation: blink 1s steps(1) infinite; z-index: 10; pointer-events: none; }
        @keyframes blink { 50% { background-color: transparent; } }
    `;
    const existingStyle = document.querySelector("#" + styleEl.id);
    if (!existingStyle) { document.head.appendChild(styleEl); }
    else { existingStyle.innerHTML = styleEl.innerHTML; }
}

    _initializeVessels() {
        const computed = window.getComputedStyle(this.textarea);

        // 1. Create and style the wrapper
        this.wrapper = document.createElement('div');
        this.wrapper.className = 'virtualized-editor-wrapper';
        
        ['width', 'height', 'margin', 'padding', 'border', 'boxSizing', 'position'].forEach(prop => {
            if (prop === 'position' && computed[prop] === 'static') {
                this.wrapper.style.position = 'relative'; 
            } else {
                this.wrapper.style[prop] = computed[prop];
            }
        });
        
        // 2. Replace the textarea with the wrapper in the DOM
        this.textarea.parentNode.insertBefore(this.wrapper, this.textarea);
        this.wrapper.appendChild(this.textarea);

        // 3. Style the textarea to cover the wrapper
        this.textarea.style.position = 'absolute';
        this.textarea.style.top = '0';
        this.textarea.style.left = '0';
        this.textarea.style.width = '100%';
        this.textarea.style.height = '100%';
        this.textarea.style.resize = 'none';

        // Make the original text transparent AND HIDE THE REAL CARET
        this.textarea.style.color = 'transparent';
        this.textarea.style.background = 'transparent';
        this.textarea.style.caretColor = '#66ff67'; // <-- IMPORTANT CHANGE

        // 4. Create and style the overlay
        this.styleId = `BH_EDITOR_${Date.now()}`;
        this.overlay = document.createElement('div');
        this.viewport = document.createElement('div');
        this.overlay.appendChild(this.viewport);
        
        this.overlay.style.position = "absolute"; 
        this.overlay.style.zIndex = 1;
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
        this.viewport.style.whiteSpace = "pre";

        // Create and append the caret element
        this.caret = document.createElement('div');
        this.caret.className = 'virtualized-editor-caret';
        this.overlay.appendChild(this.caret);
        
        // 5. Place the overlay into the wrapper
        this.wrapper.appendChild(this.overlay); 
        this._applyColors();
    }
        
    

    
    
    

    /**
     * @private
     * @function _attachEventListeners
     * @description Netzach (Endurance) and Hod (Splendor) - The channels of interaction.
     * This function attaches the event listeners that will perpetually watch for changes.
     */
    _attachEventListeners() {
        let inputTimeout = null;

        // --- CORRECTED INPUT LISTENER ---
        // When text changes, we must update both the highlighting AND the caret position.
        this.textarea.addEventListener('input', () => {
            clearTimeout(inputTimeout);
            inputTimeout = setTimeout(() => {
                this._update();
                this._updateCaret(); // This line was missing its call
            }, 0);
        });

        // --- CORRECTED SCROLL/RESIZE HANDLER ---
        // When scrolling or resizing, we must re-render the text AND move the caret.
        const onScroll = () => window.requestAnimationFrame(() => {
            this._render();
            this._updateCaret(); // This line was missing its call
        });

        // --- Standard caret movement listeners (These were already correct) ---
        const onCaretMove = () => window.requestAnimationFrame(() => this._updateCaret());
        this.textarea.addEventListener('click', onCaretMove);
        this.textarea.addEventListener('keyup', onCaretMove);
        this.textarea.addEventListener('keydown', onCaretMove);
        this.textarea.addEventListener('focus', onCaretMove);
        this.textarea.addEventListener('blur', onCaretMove);

        // --- Attach handlers to the correct events ---
        new ResizeObserver(onScroll).observe(this.wrapper);
        this.textarea.addEventListener('scroll', onScroll);
    }
    
    
    /**
     * @private
     * @function _measureAndRender
     * @description The initial act of measurement.
     * Calculates the line height, the fundamental constant of this created world. If it cannot be measured
     * immediately (due to the mysteries of CSS loading), it waits and tries again.
     */
    /**
     * @private
     * @function _measureAndRender
     * @description The initial act of measurement.
     * Calculates the line height and character width, the fundamental constants of this created world.
     * If it cannot be measured immediately (due to CSS loading), it waits and tries again.
     */
    // B"H
// FILE: pnimi.js
// ACTION: Replace the _measureAndRender method.

_measureAndRender() {
    const performMeasurements = () => {
        // Guard against a detached or hidden element.
        if (!this.textarea.parentNode || !this.textarea.clientWidth) return false;

        this.lineHeight = parseFloat(getComputedStyle(this.textarea).lineHeight);
        if (!this.lineHeight || isNaN(this.lineHeight)) return false;

        const tempSpan = document.createElement('span');
        tempSpan.style.font = getComputedStyle(this.textarea).font;
        tempSpan.style.whiteSpace = 'pre';
        tempSpan.style.visibility = 'hidden';
        tempSpan.textContent = 'm';
        this.overlay.appendChild(tempSpan);
        this.charWidth = tempSpan.getBoundingClientRect().width;
        console.log(this.overlay,this.charWidth)
        tempSpan.remove();

        return this.charWidth > 0;
    };

    // Try to measure. If it succeeds, do the initial render.
    // If it fails, do nothing. The public update() method will handle it.
    if (performMeasurements()) {
        this._update();
        this._updateCaret();
    }
}






    // --- START: PARSER LOGIC ---
    // This realm is Chokhmah (Wisdom), where the raw text is discerned and understood.
    // Each parser is a specific "gate of wisdom" for its language.

    _escape(str) { return str ? str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;') : ''; }
    _wrap(str, type) { return `<span class="token-${type}">${this._escape(str)}</span>`; }
    
    
    
    
    /**
 * @private
 * @function _findMatchingBrace
 * @description The "Intelligent Scribe." A divine tool that can find the matching '}' for an interpolation,
 * possessing the wisdom to ignore braces that are hidden within nested strings or comments.
 * @param {string} line - The line of text to search within.
 * @param {number} startIndex - The position to start searching from (immediately after the opening '{').
 * @returns {number} The index of the matching '}', or -1 if it's not on this line.
 */
_findMatchingBrace(line, startIndex = 0) {
    let depth = 1;
    for (let i = startIndex; i < line.length; i++) {
        const remaining = line.substring(i);
        const char = remaining;

        // Use the same unbreakable hierarchy to skip over modal states.
        if (remaining.startsWith('/*')) {
            const endIdx = remaining.indexOf('*/', 2);
            if (endIdx === -1) break; // Unterminated comment on this line
            i += endIdx + 1;
            continue;
        }
        if (remaining.startsWith('//')) break; // Rest of the line is a comment
        if (char === '`' || char === '"' || char === "'") {
            const endIdx = this._findUnescapedChar(remaining, char, 1);
            if (endIdx === -1) break; // Unterminated string on this line
            i += endIdx;
            continue;
        }

        // Only now, with perfect context, can we count braces.
        if (char === '{') {
            depth++;
        } else if (char === '}') {
            depth--;
            if (depth === 0) {
                return i; // This is the one true matching brace.
            }
        }
    }
    return -1; // No matching brace found on this line.
}


   // B"H
/**
 * @private
 * @function _highlightJS
 * @description The master parser for the JavaScript world and its many nested realities.
 * It manages the context stack for comments, templates, and interpolations.
 */
/**
 * @private
 * @function _highlightJS
 * @description The master parser for the JavaScript world and its many nested realities.
 * It manages the context stack for comments, templates, and interpolations.
 */
_highlightJS(line, state) {
    const currentState = state;
    let html = '';
    let i = 0;
    const keywords = new Set(['const', 'let', 'var', 'function', 'return', 'if', 'else', 'for', 'while', 'switch', 'case', 'break', 'continue', 'class', 'extends', 'super', 'new', 'import', 'export', 'from', 'async', 'await', 'try', 'catch', 'finally', 'this', 'true', 'false', 'null', 'undefined', 'typeof']);

    while (i < line.length) {
        const context = currentState.contextStack[currentState.contextStack.length - 1];
        const remaining = line.substring(i);

        // --- REALITY 1: Inside a MULTILINE JS COMMENT ---
        if (context.mode === 'js_comment') {
            const endIdx = remaining.indexOf('*/');
            if (endIdx !== -1) {
                html += this._wrap(remaining.substring(0, endIdx + 2), 'comment');
                i += endIdx + 2;
                currentState.contextStack.pop();
            } else {
                html += this._wrap(remaining, 'comment');
                break;
            }
            continue;
        }

        // --- REALITY 2: Inside a TEMPLATE STRING (tagged or plain) ---
        if (context.mode === 'tagged_template' || context.mode === 'plain_template') {
            const interpolationStart = remaining.indexOf('${');
            const templateEnd = this._findUnescapedChar(remaining, '`');

            if (interpolationStart !== -1 && (templateEnd === -1 || interpolationStart < templateEnd)) {
                const contentBefore = remaining.substring(0, interpolationStart);
                if (context.mode === 'tagged_template' && context.language) {
                    const subResult = this._getHighlightResult(contentBefore, { contextStack: [{ mode: context.language }] });
                    html += subResult.html;
                } else {
                    html += this._wrap(contentBefore, 'string');
                }
                html += this._wrap('${', 'keyword');
                i += interpolationStart + 2;
                currentState.contextStack.push({ mode: 'js' });
            } else if (templateEnd !== -1) {
                const content = remaining.substring(0, templateEnd);
                if (context.mode === 'tagged_template' && context.language) {
                     const subResult = this._getHighlightResult(content, { contextStack: [{ mode: context.language }] });
                    html += subResult.html;
                } else {
                    html += this._wrap(content, 'string');
                }
                html += this._wrap('`', 'string');
                i += templateEnd + 1;
                currentState.contextStack.pop();
            } else {
                if (context.mode === 'tagged_template' && context.language) {
                    const subResult = this._getHighlightResult(remaining, { contextStack: [{ mode: context.language }] });
                    html += subResult.html;
                } else {
                    html += this._wrap(remaining, 'string');
                }
                break;
            }
            continue;
        }

        // --- REALITY 3: In the default JAVASCRIPT world ---
        const directives = [{ tag: '/*js*/', lang: 'js' }, { tag: '/*css*/', lang: 'css' }, { tag: '/*html*/', lang: 'html' }];
        const foundDirective = directives.find(d => remaining.startsWith(d.tag + '`'));
        if (foundDirective) {
            html += this._wrap(foundDirective.tag, 'comment') + this._wrap('`', 'string');
            i += foundDirective.tag.length + 1;
            currentState.contextStack.push({ mode: 'tagged_template', language: foundDirective.lang });
            continue;
        }

        if (remaining.startsWith('/*')) {
            const endIdx = remaining.indexOf('*/');
            if (endIdx === -1) {
                html += this._wrap(remaining, 'comment');
                currentState.contextStack.push({ mode: 'js_comment' });
                break;
            } else {
                html += this._wrap(remaining.substring(0, endIdx + 2), 'comment');
                i += endIdx + 2;
            }
            continue;
        }
        
        if (remaining.startsWith('//')) {
            html += this._wrap(remaining, 'comment');
            break;
        }

        const firstChar = remaining[0];
        if (firstChar === '"' || firstChar === "'") {
            const endIdx = this._findUnescapedChar(remaining, firstChar, 1);
            if (endIdx !== -1) {
                html += this._wrap(remaining.substring(0, endIdx + 1), 'string');
                i += endIdx + 1;
            } else {
                html += this._wrap(remaining, 'string');
                break;
            }
            continue;
        }

        if (firstChar === '`') {
            html += this._wrap('`', 'string');
            i += 1;
            currentState.contextStack.push({ mode: 'plain_template' });
            continue;
        }
        
        if (firstChar === '}') {
            if (currentState.contextStack.length > 1) { // Only pop if we're in a nested context
                html += this._wrap('}', 'keyword');
                i++;
                currentState.contextStack.pop();
                continue;
            }
        }

        const wordMatch = remaining.match(/^[a-zA-Z_$][a-zA-Z0-9_$]*/);
        if (wordMatch) {
            // *** FIX #1 APPLIED HERE ***
            // We must use wordMatch[0], which is the matched string, not the whole array.
            const word = wordMatch[0];
            if (keywords.has(word)) {
                html += this._wrap(word, 'keyword');
            } else {
                html += this._wrap(word, 'variable');
            }
            i += word.length;
            continue;
        }
        
        const numMatch = remaining.match(/^-?\d+(\.\d+)?/);
        if (numMatch) {
            // *** FIX #2 APPLIED HERE ***
            // We must use numMatch[0] for the same reason.
            const numStr = numMatch[0];
            html += this._wrap(numStr, 'number');
            i += numStr.length;
            continue;
        }
        
        // *** FIX #3 APPLIED HERE ***
        // Default fallback: process one character at a time to ensure progress.
        html += this._escape(firstChar);
        i++;
    }
    return { html: html || '&nbsp;', state: currentState };
}








/**
 * @private
 * @function _highlightHTML
 * @description The parser for the HTML world. It understands how to enter and exit
 * the nested worlds of script tags, style tags, and comments.
 */
_highlightHTML(line, state) {
    const currentState = state;
    let html = '';
    let i = 0;

    while (i < line.length) {
        const context = currentState.contextStack[currentState.contextStack.length - 1];
        const remaining = line.substring(i);

        // --- REALITY 1: We are inside an HTML COMMENT ---
        if (context.mode === 'html_comment') {
            const endIdx = remaining.indexOf('-->');
            if (endIdx !== -1) {
                html += this._wrap(remaining.substring(0, endIdx + 3), 'comment');
                i += endIdx + 3;
                currentState.contextStack.pop(); // Exit the comment world
            } else {
                html += this._wrap(remaining, 'comment'); // The whole line is a comment
                break; // Continue in comment world on next line
            }
            continue;
        }
        
        // --- REALITY 2: We are in the default HTML world ---
        const tagStart = remaining.indexOf('<');

        if (tagStart === -1) {
            html += this._escape(remaining);
            break;
        }

        html += this._escape(remaining.substring(0, tagStart));
        i += tagStart;
        const tagRemaining = line.substring(i);

        // Check for the start of an HTML comment.
        if (tagRemaining.startsWith('<!--')) {
            const endIdx = tagRemaining.indexOf('-->');
            if (endIdx !== -1) {
                html += this._wrap(tagRemaining.substring(0, endIdx + 3), 'comment');
                i += endIdx + 3;
            } else {
                html += this._wrap(tagRemaining, 'comment');
                currentState.contextStack.push({ mode: 'html_comment' }); // Enter comment world
                break;
            }
            continue;
        }
        
        const tagEnd = tagRemaining.indexOf('>');
        if (tagEnd === -1) {
            html += this._escape(tagRemaining);
            break;
        }

        const tagContent = tagRemaining.substring(0, tagEnd + 1);
        const isClosingTag = tagContent.startsWith('</');
        const tagNameMatch = tagContent.match(/^<\/?\s*([a-zA-Z0-9-]+)/);
        const tagName = tagNameMatch ? tagNameMatch[1].toLowerCase() : '';
        
        html += this._wrap(isClosingTag ? '</' : '<', 'punctuation');
        html += this._wrap(tagName, 'tag');
        if (tagNameMatch) {
             const afterTagName = tagContent.substring(tagNameMatch[0].length, tagContent.length - 1);
             html += this._escape(afterTagName); // A real parser would tokenize attributes here.
        }
        html += this._wrap('>', 'punctuation');
        i += tagEnd + 1;

        // --- STATE TRANSITIONS: Pushing and Popping Worlds ---
        if (!isClosingTag && (tagName === 'script' || tagName === 'style')) {
            const endTag = `</${tagName}>`;
            // If the closing tag is NOT on this same line, we must push a new state.
            if (line.substring(i).toLowerCase().indexOf(endTag) === -1) {
                const newMode = tagName === 'script' ? 'script_block' : 'style_block';
                currentState.contextStack.push({ mode: newMode });
            }
        }
        else if (isClosingTag && (tagName === 'script' || tagName === 'style')) {
            const expectedMode = tagName === 'script' ? 'script_block' : 'style_block';
            // Only pop if we are actually in that world. This prevents bugs from mismatched tags.
            if (context.mode === expectedMode) {
                currentState.contextStack.pop();
            }
        }
    }
    return { html: html || '&nbsp;', state: currentState };
}
    
    
    
    
    








/**
 * @private
 * @function _findUnescapedChar
 * @description Helper to find a character that is not preceded by a backslash.
 */
_findUnescapedChar(line, char, startIndex = 0) {
    let currentPos = startIndex;
    while (true) {
        const index = line.indexOf(char, currentPos);
        if (index === -1) return -1;
        if (index > 0 && line[index - 1] === '\\') {
            currentPos = index + 1;
            continue;
        }
        return index;
    }
}
    
    
    
    
    
    
    
    
    
    
    
    /**
 * @private
 * @function _flushTokenBuffer
 * @description The Hand of the Weaver. Determines if a buffered JavaScript token is a keyword or variable.
 * @param {object} state - The current state object of the parser.
 * @param {string} buffer - The accumulated string of characters.
 * @returns {string} The generated HTML for the token.
 */
_flushTokenBuffer(state, buffer) {
    if (buffer.length === 0) return '';
    
    const keywords = new Set(['const', 'let', 'var', 'function', 'return', 'if', 'else', 'for', 'while', 'switch', 'case', 'break', 'continue', 'class', 'extends', 'super', 'new', 'import', 'export', 'from', 'async', 'await', 'try', 'catch', 'finally', 'this', 'true', 'false', 'null', 'undefined', 'typeof']);
    
    if (keywords.has(buffer)) {
        return this._wrap(buffer, 'keyword');
    }
    return this._wrap(buffer, 'variable');
}
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    /**
 * @private
 * @function _highlightCSS
 * @description The parser for the CSS world, with a perfect memory for its comments.
 */
_highlightCSS(line, state) {
    const currentState = state;
    let html = '';
    let i = 0;
    state.in_css_rules = state.in_css_rules || false;

    while (i < line.length) {
        const context = currentState.contextStack[currentState.contextStack.length - 1];
        const remaining = line.substring(i);

        // --- REALITY 1: Inside a MULTILINE CSS COMMENT ---
        if (context.mode === 'css_comment') {
            const endIdx = remaining.indexOf('*/');
            if (endIdx !== -1) {
                html += this._wrap(remaining.substring(0, endIdx + 2), 'comment');
                i += endIdx + 2;
                currentState.contextStack.pop(); // Exit comment world
            } else {
                html += this._wrap(remaining, 'comment');
                break;
            }
            continue;
        }

        // --- REALITY 2: In the default CSS world ---
        if (remaining.startsWith('/*')) {
            const endIdx = remaining.indexOf('*/', 2);
            if (endIdx !== -1) {
                html += this._wrap(remaining.substring(0, endIdx + 2), 'comment');
                i += endIdx + 2;
            } else {
                html += this._wrap(remaining, 'comment');
                currentState.contextStack.push({ mode: 'css_comment' }); // Enter comment world
                break;
            }
            continue;
        }
        
        const selectorMatch = remaining.match(/^([^{/]*?)\s*\{/);
        if (!state.in_css_rules && selectorMatch) {
            html += this._wrap(selectorMatch, 'selector');
            html += this._wrap('{', 'punctuation');
            i += selectorMatch.length;
            state.in_css_rules = true;
            continue;
        }

        const closingBraceMatch = remaining.match(/^\s*\}/);
        if (closingBraceMatch) {
            html += this._wrap('}', 'punctuation');
            i += closingBraceMatch.length;
            state.in_css_rules = false;
            continue;
        }

        if (state.in_css_rules) {
             const propertyMatch = remaining.match(/^([^:]+?)\s*:/);
             if (propertyMatch) {
                 html += this._wrap(propertyMatch.trim(), 'property');
                 html += this._wrap(':', 'punctuation');
                 i += propertyMatch.length;
                 continue;
             }
             const valueMatch = remaining.match(/^([^;}]+?)\s*(;|\})/);
             if (valueMatch) {
                 html += this._wrap(valueMatch.trim(), 'string');
                 if (valueMatch === ';') {
                     html += this._wrap(';', 'punctuation');
                 }
                 i += valueMatch.length;
                 if (valueMatch === '}') {
                     state.in_css_rules = false;
                 }
                 continue;
             }
        }
        
        html += this._escape(remaining || '');
        i++;
    }
    return { html: html || '&nbsp;', state: currentState };
}
    // --- END: PARSER LOGIC ---
    
    
    
    
    



/**
 * @private
 * @function _findNextUnnestedToken
 * @description The "Wise Scribe." This is the source of the Weaver's wisdom.
 * It finds the next occurrence of a set of target tokens, but intelligently
 * skips over any that are sealed inside comments, strings, or regex literals.
 * @param {string} line - The text to search.
 * @param {number} startIndex - The position to start searching from.
 * @param {string[]} targets - An array of strings to search for (e.g., ['`', '${']).
 * @returns {{index: number, token: string}|null} - The location and text of the found token.
 */
_findNextUnnestedToken(line, startIndex, targets) {
    let i = startIndex;
    while (i < line.length) {
        // Check if the current position matches one of our primary targets
        for (const target of targets) {
            if (line.substring(i).startsWith(target)) {
                return { index: i, token: target };
            }
        }
        
        const char = line[i];
        
        // If not a target, check if we're entering a "sealed" context to skip
        if (char === '/' && line[i+1] === '/') { // Skip single-line comments
            i = line.length;
            continue;
        }
        if (char === '/' && line[i+1] === '*') { // Skip multi-line comments
            const end = line.indexOf('*/', i + 2);
            i = end === -1 ? line.length : end + 2;
            continue;
        }
        if (char === '"' || char === "'" || char === '`') { // Skip strings
            const endChar = char;
            let j = i + 1;
            while (j < line.length) {
                if (line[j] === '\\') { // Handle escaped characters
                    j += 2;
                } else if (line[j] === endChar) {
                    j++;
                    break;
                } else {
                    j++;
                }
            }
            i = j;
            continue;
        }

        // If nothing special, just move to the next character
        i++;
    }
    return null;
}




/**
 * @private B"H - A pure and flawless function to tokenize a "safe" chunk of JS.
 */
_tokenizeJSChunk(chunk) {
    if (!chunk) return '';
    let html = '';
    const keywords = new Set(['const', 'let', 'var', 'function', 'return', 'if', 'else', 'for', 'while', 'switch', 'case', 'break', 'continue', 'class', 'extends', 'super', 'new', 'import', 'export', 'from', 'async', 'await', 'try', 'catch', 'finally', 'this', 'true', 'false', 'null', 'undefined', 'typeof']);
    
    // This regex is safe because it only ever runs on chunks of code
    // that have already been cleared of any portals or terminators.
    const tokenRegex = /([a-zA-Z_$][a-zA-Z0-9_$]*)|(\d+(?:\.\d+)?)|(.)/g;
    let match;
    while ((match = tokenRegex.exec(chunk)) !== null) {
        const token = match[0]; // match[0] is the full matched string.
        if (keywords.has(token)) {
            html += this._wrap(token, 'keyword');
        } else if (match[1]) { // If it was matched by the "word" group
            html += this._wrap(token, 'variable');
        } else if (match[2]) { // If it was matched by the "number" group
            html += this._wrap(token, 'number');
        } else { // It must be a single punctuation/operator character
            html += this._escape(token);
        }
    }
    return html;
}



// --- START: NEW HELPER METHODS (Add these to your class) ---

/** @private Checks if a character can start a JS identifier. */
_isIdentifierStart(char) {
    if (!char) return false;
    const a = 'a', z = 'z', A = 'A', Z = 'Z';
    return (char >= a && char <= z) || (char >= A && char <= Z) || char === '_' || char === '$';
}

/** @private Checks if a character can be part of a JS identifier. */
_isIdentifierPart(char) {
    if (!char) return false;
    const zero = '0', nine = '9';
    return this._isIdentifierStart(char) || (char >= zero && char <= nine);
}

/** @private Checks if a character is a numeric digit. */
_isDigit(char) {
    if (!char) return false;
    const zero = '0', nine = '9';
    return char >= zero && char <= nine;
}

/** @private Checks if a character is whitespace. */
_isWhitespace(char) {
    return char === ' ' || char === '\t' || char === '\n' || char === '\r';
}

/**
 * @private Manually looks ahead to see if an identifier is being called as a function.
 * @param {string} line - The full line of code.
 * @param {number} startIndex - The position *after* the identifier to start looking from.
 * @returns {boolean} - True if the next non-whitespace character is '('.
 */
_isFunctionCall(line, startIndex) {
    let i = startIndex;
    while (i < line.length) {
        const char = line[i];
        if (!this._isWhitespace(char)) {
            return char === '(';
        }
        i++;
    }
    return false;
}

// --- END: NEW HELPER METHODS ---


/**
 * @private
 * @function _getInitialState
 * @description B"H - Creates the pure, primordial soul for the parser,
 * correctly setting the initial language and state flags.
 */
_getInitialState() {
    let initialMode = this.language || 'javascript';
    
    // --- The Tikkun of Identity ---
    // We normalize the name to prevent the fatal 'js' vs 'javascript' error.
    // The parser's soul now knows its true name, always.
    if (initialMode === 'js') {
        initialMode = 'javascript';
    }

    return {
        contextStack: [{ mode: initialMode, terminator: null }],
        isNextTokenFunctionName: false,
        // --- A Soul for CSS ---
        // This new flag gives the CSS parser a memory of its context.
        inCssRuleBlock: false 
    };
}

/**
 * @private
 * @function _getHighlightResult
 * @description The Final, Wise, and Rectified Consciousness. This master function
 * handles all language contexts with a corrected understanding of state transitions
 * and nested realities. It is architected for maximum fault-tolerance.
 */
// B"H
// FILE: VirtualizedEditor.js
// ACTION: REPLACE your entire `_getHighlightResult` method with this definitive version.

// B"H
// FILE: VirtualizedEditor.js
// ACTION: REPLACE your entire `_getHighlightResult` method with this definitive version.

/**
 * @private
 * @function _getHighlightResult
 * @description The Master Dispatcher (The Chariot). It delegates to the appropriate soul-parser.
 */
_getHighlightResult(line, state) {
    if (typeof line !== 'string') return { html: '&nbsp;', state: this._getInitialState() };
    const currentState = state;
    let html = '';
    let i = 0;
    
    try {
        while (i < line.length) {
            const i_before = i;
            const context = currentState.contextStack[currentState.contextStack.length - 1];
            let result;

            // The dispatcher's only job: Choose the correct world-parser.
            switch (context.mode) {
                case 'javascript': result = this._parseJS(line, i, currentState); break;
                case 'html': result = this._parseHTML(line, i, currentState); break;
                case 'css': result = this._parseCSS(line, i, currentState); break;
                case 'comment': result = this._parseGeneric(line, i, currentState, 'comment'); break;
                case 'string': result = this._parseGeneric(line, i, currentState, 'string', true); break;
                case 'template_literal': result = this._parseTemplateLiteral(line, i, currentState); break;
                default: // Handles embedded languages like 'template_language_css'
                    result = this._parseTemplateLanguage(line, i, currentState);
                    break;
            }
            
            html += result.html;
            i = result.newIndex;

            // The ultimate failsafe against unforeseen paradoxes.
            if (i === i_before && i < line.length) {
                console.error("Failsafe triggered:", context, `char: '${line[i]}'`);
                html += this._escape(line[i]);
                i++;
            }
        }
    } catch (e) {
        html = this._escape(line); // Will bend, but not break.
        console.error("Highlighter catastrophe:", e);
    }
    return { html: html || '&nbsp;', state: currentState };
}




/** @private A soul for parsing simple, terminator-defined contexts like comments and strings. */
_parseGeneric(line, i, state, type, useUnescaped) {
    const context = state.contextStack[state.contextStack.length - 1];
    const endIdx = useUnescaped
        ? this._findUnescapedChar(line, context.terminator, i)
        : line.indexOf(context.terminator, i);

    if (endIdx !== -1) { // Terminator found on this line
        const content = line.substring(i, endIdx);
        state.contextStack.pop(); // Exit this world
        return {
            html: this._wrap(content, type) + this._wrap(context.terminator, type),
            newIndex: endIdx + context.terminator.length,
        };
    }
    // Terminator not found, the entire rest of the line is this context
    const content = line.substring(i);
    return { html: this._wrap(content, type), newIndex: line.length };
}

/** @private A soul for parsing template literals and their interpolations (`${...}`). */
_parseTemplateLiteral(line, i, state) {
    const interpStart = line.indexOf('${', i);
    if (interpStart !== -1) { // Found an interpolation
        const content = line.substring(i, interpStart);
        state.contextStack.push({ mode: 'javascript', terminator: '}' }); // Enter a JS world
        return {
            html: this._wrap(content, 'string') + this._wrap('${', 'controlKeyword'),
            newIndex: interpStart + 2
        };
    }
    // No interpolation, treat as a simple string with a ` terminator
    return this._parseGeneric(line, i, state, 'string', true);
}

/** @private A soul for parsing language blocks inside template literals (e.g., /*css* /`...`). */
_parseTemplateLanguage(line, i, state) {
    const context = state.contextStack[state.contextStack.length - 1];
    const interpStart = line.indexOf('${', i);
    const endIdx = this._findUnescapedChar(line, context.terminator, i);

    let boundary = -1;
    if (interpStart !== -1 && (endIdx === -1 || interpStart < endIdx)) {
        boundary = interpStart;
    } else if (endIdx !== -1) {
        boundary = endIdx;
    }
    
    const lang = context.mode.substring(17); // e.g., 'css' from 'template_language_css'
    const content = (boundary === -1) ? line.substring(i) : line.substring(i, boundary);
    
    // Highlight the content using a temporary, clean state for that language
    const subState = this._getInitialState();
    subState.language = lang;
    subState.contextStack = [{ mode: lang }];
    subState.inCssRuleBlock = state.inCssRuleBlock; // IMPORTANT: Carry over CSS block state
    const result = this._getHighlightResult(content, subState);
    state.inCssRuleBlock = result.state.inCssRuleBlock; // Bring back the updated CSS state

    if (boundary === interpStart) {
        state.contextStack.push({ mode: 'javascript', terminator: '}' }); // Enter JS world
        return {
            html: result.html + this._wrap('${', 'controlKeyword'),
            newIndex: boundary + 2
        };
    }
    if (boundary === endIdx) {
        state.contextStack.pop(); // Exit the template language world
        return {
            html: result.html + this._wrap(context.terminator, 'string'),
            newIndex: boundary + context.terminator.length
        };
    }
    return { html: result.html, newIndex: line.length }; // End of line
}

/** @private The flawless soul for JavaScript, with perfect memory. */
_parseJS(line, i, state) {
    const ctlK = new Set(['import', 'as', 'from', 'export', 'async', 'function', 'await', 'if', 'else', 'return', 'for', 'while', 'switch', 'case', 'break', 'continue', 'try', 'catch', 'finally', 'class', 'extends', 'get', 'set']);
    const defK = new Set(['const', 'let', 'var', 'true', 'false', 'null', 'undefined', 'this', 'new', 'super']);
    const directives = [{ tag: '/*html*/', lang: 'html' }, { tag: '/*css*/', lang: 'css' }];

    // 1. Check for gates to other worlds. This is the highest priority.
    // THE RECTIFIED GATE: Checks for a directive AND the backtick ` together.
    for (const d of directives) {
        if (line.substring(i).startsWith(d.tag + '`')) {
            state.contextStack.push({ mode: `template_language_${d.lang}`, terminator: '`' });
            return { html: this._wrap(d.tag, 'comment') + this._wrap('`', 'string'), newIndex: i + d.tag.length + 1 };
        }
    }
    if (line.substring(i, i + 2) === '/*') {
        state.contextStack.push({ mode: 'comment', terminator: '*/' });
        return { html: this._wrap('/*', 'comment'), newIndex: i + 2 };
    }
    if (line.substring(i, i + 2) === '//') {
        return { html: this._wrap(line.substring(i), 'comment'), newIndex: line.length };
    }
    const char = line[i];
    if (char === "'" || char === '"') {
        state.contextStack.push({ mode: 'string', terminator: char });
        return { html: this._wrap(char, 'string'), newIndex: i + 1 };
    }
    if (char === '`') {
        state.contextStack.push({ mode: 'template_literal', terminator: '`' });
        return { html: this._wrap(char, 'string'), newIndex: i + 1 };
    }

    // 2. If not a gate, tokenize the characters of this world.
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

/** @private The rectified soul for CSS, with a true understanding of blocks. */
_parseCSS(line, i, state) {
    if (line.substring(i, i + 2) === '/*') {
        state.contextStack.push({ mode: 'comment', terminator: '*/' });
        return { html: this._wrap('/*', 'comment'), newIndex: i + 2 };
    }

    let p = i;
    while(p < line.length && this._isWS(line[p])) p++;
    let html = line.substring(i, p);

    if (p >= line.length) return { html, newIndex: line.length };

    if (!state.inCssRuleBlock) { // We are outside a { ... } block, looking for a selector.
        const brace = line.indexOf('{', p);
        if (brace !== -1) {
            state.inCssRuleBlock = true; // Enter the block world
            return {
                html: html + this._wrap(line.substring(p, brace), 'selector') + this._wrap('{', 'punctuation'),
                newIndex: brace + 1
            };
        }
        return { html: html + this._wrap(line.substring(p), 'selector'), newIndex: line.length };
    } else { // We are inside a { ... } block.
        const endBrace = line.indexOf('}', p);
        const colon = line.indexOf(':', p);
        const semicolon = line.indexOf(';', p);

        // Check for closing brace first, as it takes precedence.
        if (endBrace !== -1 && (endBrace < colon || colon === -1) && (endBrace < semicolon || semicolon === -1)) {
            state.inCssRuleBlock = false; // Exit the block world
            return { html: html + this._wrap('}', 'punctuation'), newIndex: endBrace + 1 };
        }
        // Check for a property:value pair.
        if (colon !== -1 && (semicolon === -1 || colon < semicolon)) {
            const prop = line.substring(p, colon);
            return {
                html: html + this._wrap(prop.trim(), 'property') + this._wrap(':', 'punctuation'),
                newIndex: colon + 1
            };
        }
        // Check for the end of a value.
        if (semicolon !== -1) {
            const val = line.substring(p, semicolon);
            return {
                html: html + this._wrap(val.trim(), 'string') + this._wrap(';', 'punctuation'),
                newIndex: semicolon + 1
            };
        }
        // If nothing else, the rest of the line is part of a value.
        return { html: html + this._wrap(line.substring(p).trim(), 'string'), newIndex: line.length };
    }
}

/** @private The soul for HTML, with clean logic for entering script/style worlds. */
_parseHTML(line, i, state) {
    const tagStart = line.indexOf('<', i);
    if (tagStart === -1) {
        return { html: this._escape(line.substring(i)), newIndex: line.length };
    }
    const text = this._escape(line.substring(i, tagStart));

    if (line.substring(tagStart, tagStart + 4) === '<!--') {
        state.contextStack.push({ mode: 'comment', terminator: '-->' });
        return { html: text + this._wrap('<!--', 'comment'), newIndex: tagStart + 4 };
    }
    
    const tagEnd = line.indexOf('>', tagStart);
    if (tagEnd === -1) {
        return { html: text + this._escape(line.substring(tagStart)), newIndex: line.length };
    }

    let html = text;
    const newIndex = tagEnd + 1;
    const isClosing = line[tagStart + 1] === '/';
    let p = isClosing ? tagStart + 2 : tagStart + 1;
    
    // Parse Tag Name
    let tagName = '';
    while(p < tagEnd && !this._isWS(line[p]) && line[p] !== '>') tagName += line[p++];
    html += this._wrap(isClosing ? '</' : '<', 'punctuation') + this._wrap(tagName, 'tag');

    // Simple, robust attribute parsing: just escape everything else for now.
    html += this._escape(line.substring(p, tagEnd));
    
    html += this._wrap('>', 'punctuation');
    
    const lowerTagName = tagName.toLowerCase();
    if (!isClosing && (lowerTagName === 'script' || lowerTagName === 'style')) {
        const lang = lowerTagName === 'script' ? 'javascript' : 'css';
        // Enter the new world, with a clear terminator to find our way back.
        state.contextStack.push({ mode: lang, terminator: `</${lowerTagName}>` });
    }
     else if (isClosing) {
        const currentContext = state.contextStack[state.contextStack.length - 1];
        if (currentContext.terminator === `</${lowerTagName}>`) {
            state.contextStack.pop();
        }
    }
    
    return { html, newIndex };
}



// --- Helper Souls (Micro-Parsers) ---
_escape(s) { return s ? s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;') : ''; }
_wrap(s, t) { return `<span class="token-${t}">${this._escape(s)}</span>`; }
_isWS(c) { return c === ' ' || c === '\t'; }
_isD(c) { return c >= '0' && c <= '9'; }
_isIS(c) { return (c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z') || c === '_' || c === '$'; }
_isIP(c) { return this._isIS(c) || this._isD(c); }
_isFC(line, i) { while (i < line.length) { if (!this._isWS(line[i])) return line[i] === '('; i++; } return false; }

    /**
     * @private
     * @function _render
     * @description Malkuth (Kingdom) - The final manifestation.
     * This function is the culmination of the entire process. It takes the calculated state and
     * paints the colored HTML onto the viewport divs. It is the point where the divine, abstract
     * process becomes a concrete, visible reality for the user. It is highly optimized to only
     * process and render the visible lines of code.
     */
    async _update() {
    this.lines = this.textarea.value.split('\n');
    
    // On a major text change, the soul of the parser must be returned to its primordial state.
    this.parserState = this._getInitialState(); 
    
    const neededDivs = Math.ceil(this.wrapper.clientHeight / this.lineHeight) + 2;
    if (this.viewportDivs.length !== neededDivs && neededDivs > 0 && !isNaN(neededDivs)) {
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

_render() {
    if (!this.lines || !this.lineHeight) return;
    const scrollTop = this.textarea.scrollTop;
    const scrollLeft = this.textarea.scrollLeft;
    const firstVisibleLine = Math.floor(scrollTop / this.lineHeight);
    
    // Start rendering from the beginning of the scrollback buffer for accuracy.
    const firstLineToRender = Math.max(0, firstVisibleLine - 2);

    // Replay the journey of the parser's soul from the beginning to the first rendered line.
    let state = this._getInitialState();
    for (let i = 0; i < firstLineToRender; i++) {
        state = this._getHighlightResult(this.lines[i] || '', state).state;
    }

    // Now, render the visible lines, carrying the state from one to the next.
    for (let i = 0; i < this.viewportDivs.length; i++) {
        const lineIndex = firstLineToRender + i;
        const div = this.viewportDivs[i];
        if (lineIndex < this.lines.length) {
            div.style.display = 'block';
            const result = this._getHighlightResult(this.lines[lineIndex] || '', state);
            div.innerHTML = result.html;
            state = result.state; // The soul's memory carries over perfectly.
        } else {
            div.style.display = 'none';
        }
    }
    
    // Position the viewport to match the scroll of the textarea.
    const yOffset = firstLineToRender * this.lineHeight;
    this.viewport.style.transform = `translate(${-scrollLeft}px, ${yOffset}px)`;
}
    
    
    /**
     * @private
     * @function _updateCaret
     * @description Yesod (Foundation) of Interaction - Positions the simulated caret.
     * This version includes guards to prevent running before the editor is initialized.
     */
    _updateCaret() {
    //better default caret for now
    return;
        // --- NEW, STRONGER GUARD ---
        // Do not run if the editor is not focused, if measurements are not ready,
        // or if the lines of text have not been processed yet.
        if (document.activeElement !== this.textarea || !this.lineHeight || !this.charWidth || !this.lines || this.lines.length === 0) {
            if (this.caret) { // Ensure caret exists before trying to hide it
                this.caret.style.display = 'none';
            }
            return;
        }

        this.caret.style.display = 'block';

        const cursorIdx = this.textarea.selectionStart;
        let lineIdx = 0;
        let colIdx = 0;
        let count = 0;

        // This loop correctly calculates the line and column from the cursor index.
        for (let i = 0; i < this.lines.length; i++) {
            // The line itself could theoretically be null/undefined, so we default to an empty string.
            const line = this.lines[i] || ''; 
            const lineLength = line.length + 1; // +1 for the newline character

            if (count + lineLength > cursorIdx) {
                lineIdx = i;
                colIdx = cursorIdx - count;
                break;
            }
            count += lineLength;
            
            // If we are on the last line and the cursor is at the very end
            if (i === this.lines.length - 1 && cursorIdx >= count) {
                lineIdx = i;
                colIdx = cursorIdx - count;
            }
        }

        const caretX = colIdx * this.charWidth;
        const caretY = lineIdx * this.lineHeight;

        // Position the caret, accounting for the textarea's scroll
        this.caret.style.transform = `translate(${caretX - this.textarea.scrollLeft}px, ${caretY - this.textarea.scrollTop}px)`;
        this.caret.style.height = `${this.lineHeight}px`;
    }
    
    


    /**
     * @private
     * @async
     * @function _update
     * @description The "Will" to refresh. This function is called when the underlying text changes.
     * It re-splits the text into lines (a potentially heavy task sent to Binah/Worker),
     * ensures the correct number of viewport divs exist, and triggers a re-render.
     */
    // B"H
// FILE: pnimi.js
// ACTION: Replace this entire method to restore its original functionality.


    
    /**
     * @public
     * @function update
     * @description B"H - A new, reliable method to programmatically update the editor's content.
     * This sets the textarea's value and forces the highlighter to re-render.
     * @param {string} newContent - The new text content for the editor.
     */
// B"H
// FILE: pnimi.js
// ACTION: Replace the public update method.

update(newContent) {
    if (typeof newContent !== 'string') return;
    
    // --- THE SELF-HEALING FIX ---
    // If our measurements failed in the constructor (charWidth is 0),
    // it means the element was not ready. We force a re-measurement NOW.
    if (!this.charWidth || this.charWidth <= 0) {
        this._measureAndRender();
        // If it still fails, we cannot proceed.
        if (!this.charWidth || this.charWidth <= 0) {
            console.error('pnimi: Fatal error. Could not measure element dimensions. Aborting render.');
            this.textarea.value = newContent; // At least show the raw text
            return;
        }
    }
    // --- END FIX ---
    
    this.textarea.value = newContent;
    // Now that we are guaranteed to have measurements, this will work.
    this._update();
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
        // Remove created vessels.
        if (this.overlay) this.overlay.remove();
        if (this.caret) this.caret.remove();
        const styleEl = document.querySelector("#" + this.styleId + "-style");
        if (styleEl) styleEl.remove();

        // 1. Move the textarea back out of the wrapper
        if (this.wrapper && this.textarea.parentNode === this.wrapper) {
            this.wrapper.parentNode.insertBefore(this.textarea, this.wrapper);
        }

        // 2. Remove the wrapper itself
        if (this.wrapper) this.wrapper.remove();
        
        // 3. Restore the textarea's visibility and positioning
        this.textarea.style.color = '';
        this.textarea.style.background = '';
        this.textarea.style.caretColor = '';
        this.textarea.style.position = ''; // Restore positioning
        this.textarea.style.top = '';      // Restore positioning
        this.textarea.style.left = '';  
        this.textarea.style.width = '';    // Restore size
        this.textarea.style.height = '';   // Restore size
        this.textarea.style.resize = '';   // Restore resize
    }
}

// Export the main class as the default emanation from this module.
export default VirtualizedEditor;