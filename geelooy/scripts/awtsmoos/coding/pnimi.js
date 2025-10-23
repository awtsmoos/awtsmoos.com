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
    constructor(textarea, language = 'js', customColors = {}) {
        if (!textarea || textarea.tagName !== 'TEXTAREA') {
            console.error('The vessel must be a TEXTAREA element.');
            return;
        }
        
               /** @private The new wrapper element that contains both the textarea and the overlay. */
        this.wrapper = null; 

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
        this.parserState = this._getInitialState()
        
        /** @private The DOM element for our simulated caret. */
        this.caret = null;
        /** @private The measured width of a single character. */
        this.charWidth = 0;
        
        /** @private The default colors, the 10 Sefirot manifested as light. */
        const defaultColors = {
    // VS Code "Dark+" Theme Inspired Colors
    comment: '#6A9955',          // Green
    string: '#CE9178',           // Orange
    number: '#B5CEA8',           // Light Green/Blue
    
    // -- NEW CATEGORIES --
    controlKeyword: '#C586C0',   // Pink/Magenta (for import, async, if, etc.)
    definitionKeyword: '#569CD6',// Blue (for const, var, class, etc.)
    functionName: '#DCDCAA',     // Yellow (for function names and calls)
    
    // -- STANDARD TOKENS --
    variable: '#9CDCFE',         // Light Blue (for variables, parameters)
    operator: '#D4D4D4',         // Light Gray/White
    punctuation: '#808080',      // Gray
    tag: '#569CD6',              // Blue
    attribute: '#9CDCFE',        // Light Blue
    property: '#D4D4D4'          // Light Gray/White (e.g., object properties)
};
        /** @private The final colors, merging the divine and the mundane. */
        this.colors = { ...defaultColors, ...customColors };

        this._initializeVessels();
        this._attachEventListeners();
        this._measureAndRender();
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
     * @function _applyColors
     * @description Tiferet (Beauty) - The harmonization of colors.
     * This function injects the CSS styles into the document's head, translating the abstract color
     * values into beautiful, visible rules that the browser can understand and render.
     */
    _applyColors() {
        const styleEl = document.createElement("style");
        styleEl.id = this.styleId + "-style";
        
        // --- MORE ROBUST CARET COLOR ---
        const caretColor = getComputedStyle(this.textarea).color || 'white';

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
    .token-attribute { color: ${this.colors.attribute}; }
    .token-property { color: ${this.colors.property}; }
    
            .virtualized-editor-caret {
                position: absolute;
                display: none; /* Controlled by JS */
                background-color: ${caretColor};
                width: 1px;
                animation: blink 1s steps(1) infinite;
                z-index: 10;
                pointer-events: none;
                /* No top/left here; we use transform for smoother animation */
            }

            @keyframes blink {
                50% { background-color: transparent; }
            }
        `;
        const existingStyle = document.querySelector("#" + styleEl.id);
        if (!existingStyle) { document.head.appendChild(styleEl); }
        else { existingStyle.innerHTML = styleEl.innerHTML; }
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
    // We ensure that `this.language` is valid, defaulting to 'javascript'.
    // This prevents errors if the editor is initialized with a null or undefined language.
    const initialMode = this.language || 'javascript';
    
    return {
        // The contextStack's first entry defines the reality of the entire file.
        contextStack: [{ mode: initialMode, terminator: null }],
        
        // This flag is essential for the JavaScript parser to distinguish between
        // the 'function' keyword and the name of the function being declared.
        isNextTokenFunctionName: false
    };
}
/**
 * @private
 * @function _getHighlightResult
 * @description The Final, Wise, and Unified Consciousness. This master function
 * acts as a router, dispatching to the correct internal logic based on the
 * current language context (HTML, CSS, or JavaScript). It is architected to be
 * completely fault-tolerant, preventing runtime errors and infinite loops.
 */
_getHighlightResult(line, state) {
    // --- DIVINE FAILSAFE 1: Input Validation ---
    // Ensure the line is a string; if not, we cannot process it.
    if (typeof line !== 'string') {
        return { html: '&nbsp;', state: this._getInitialState() };
    }
    
    // Use the incoming state, but if it's not present, create a fresh one.
    const currentState = state || this._getInitialState();
    let html = '';
    let i = 0;

    // --- HELPER FUNCTIONS (Kept inside for scope and self-containment) ---
    const _escape = (str) => str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const _wrap = (str, type) => `<span class="token-${type}">${_escape(str)}</span>`;
    const _isWhitespace = (char) => char === ' ' || char === '\t';
    const _isDigit = (char) => char >= '0' && char <= '9';
    const _isIdentifierStart = (char) => (char >= 'a' && char <= 'z') || (char >= 'A' && char <= 'Z') || char === '_' || char === '$';
    const _isIdentifierPart = (char) => _isIdentifierStart(char) || _isDigit(char);
    const _isFunctionCall = (startIndex) => {
        let k = startIndex;
        while (k < line.length) { if (!_isWhitespace(line[k])) return line[k] === '('; k++; }
        return false;
    };

    // --- Keyword Definitions ---
    const controlKeywords = new Set(['import', 'as', 'from', 'export', 'async', 'function', 'await', 'if', 'else', 'return', 'for', 'while', 'switch', 'case', 'break', 'continue', 'try', 'catch', 'finally', 'class', 'extends', 'get', 'set']);
    const definitionKeywords = new Set(['const', 'let', 'var', 'true', 'false', 'null', 'undefined', 'this', 'new', 'super']);
    
    // --- DIVINE FAILSAFE 2: The Unshatterable Vessel (Error Boundary) ---
    try {
        // --- The MASTER `while` LOOP: The Unwavering Beat of Creation ---
        while (i < line.length) {
            // Failsafe 3a: Preserve the state before this tick.
            const i_before_tick = i;

            // At EACH beat, we re-evaluate our universe.
            const context = currentState.contextStack[currentState.contextStack.length - 1];
            const remaining = line.substring(i);
            const firstChar = remaining[0];

            // --- MASTER CONTEXT ROUTER ---
            // The consciousness first decides which world it is in.
            switch (context.mode) {
                // --- THE WORLD OF HTML ---
                case 'html':
                    const tagStart = remaining.indexOf('<');
                    if (tagStart === -1) { // No more tags, just text
                        html += _escape(remaining); i = line.length; break;
                    }
                    html += _escape(line.substring(i, i + tagStart)); i += tagStart;
                    const tagRemaining = line.substring(i);

                    if (tagRemaining.startsWith('<!--')) { // HTML Comment
                        const end = tagRemaining.indexOf('-->');
                        if (end !== -1) { html += _wrap(tagRemaining.substring(0, end + 3), 'comment'); i += end + 3; } 
                        else { html += _wrap(tagRemaining, 'comment'); i = line.length; currentState.contextStack.push({ mode: 'comment', terminator: '-->' }); }
                    } else if (tagRemaining.startsWith('</')) { // Closing Tag
                        const end = tagRemaining.indexOf('>');
                        const endPos = (end === -1) ? line.length : i + end + 1;
                        const tagContent = line.substring(i, endPos);
                        const tagName = tagContent.substring(2, tagContent.length-1);
                        html += _wrap('</', 'punctuation') + _wrap(tagName, 'tag') + _wrap('>', 'punctuation');
                        i = endPos;
                        if(context.terminator && context.terminator === tagContent) { currentState.contextStack.pop(); }
                    } else if (tagRemaining.startsWith('<')) { // Opening Tag
                        const end = tagRemaining.indexOf('>');
                        const endPos = (end === -1) ? line.length : i + end + 1;
                        let tagName = '', j = i + 1;
                        while(j < endPos -1 && !_isWhitespace(line[j])) { tagName += line[j++]; }
                        html += _wrap('<', 'punctuation') + _wrap(tagName, 'tag') + _escape(line.substring(j, endPos - 1)) + _wrap('>', 'punctuation');
                        const lowerTagName = tagName.toLowerCase();
                        if (lowerTagName === 'script' || lowerTagName === 'style') {
                             const endTag = `</${lowerTagName}>`;
                             if (line.toLowerCase().indexOf(endTag, i) === -1) {
                                currentState.contextStack.push({ mode: (lowerTagName==='script'?'javascript':'css'), terminator: endTag });
                             }
                        }
                        i = endPos;
                    }
                    break;

                // --- THE WORLD OF CSS ---
                case 'css':
                    if (remaining.startsWith('/*')) { /* Handled by default js-like comment parser */ }
                    // Basic CSS handler - treats words as properties/selectors.
                    if (_isIdentifierStart(firstChar) || firstChar === '.' || firstChar === '#' || firstChar === '-') {
                         let buffer = '', p = i;
                         while(p < line.length && /[\w-.#]/.test(line[p])) { buffer += line[p++]; }
                         html += _wrap(buffer, 'tag'); i = p;
                    } else if (!_isWhitespace(firstChar)) {
                        html += _wrap(firstChar, 'punctuation'); i++;
                    } else { html += firstChar; i++; }
                    break;
                
                // --- DEFAULT: THE WORLD OF JAVASCRIPT & ITS SUB-REALITIES (string, comment, etc.) ---
                default:
                    // PRIORITY 1: Is the current reality ending here?
                    if (context.terminator && remaining.startsWith(context.terminator)) {
                        const tokenType = (context.mode === 'comment') ? 'comment' : 'string';
                        html += _wrap(context.terminator, tokenType);
                        i += context.terminator.length;
                        currentState.contextStack.pop();
                        break;
                    }
                    // PRIORITY 2: Are we entering an interpolation?
                    if (context.mode === 'template_literal' && remaining.startsWith('${')) {
                        html += _wrap('${', 'controlKeyword'); i += 2;
                        currentState.contextStack.push({ mode: 'javascript', terminator: '}' });
                        break;
                    }
                    // PRIORITY 3: Are we in a non-JS reality that continues? (multiline comment/string)
                    if (context.mode !== 'javascript') {
                        html += _escape(remaining); i = line.length; break;
                    }

                    // --- If we are in pure JS, we tokenize ---
                    if (remaining.startsWith('/*')) { html += _wrap('/*', 'comment'); i += 2; currentState.contextStack.push({ mode: 'comment', terminator: '*/' }); }
                    else if (remaining.startsWith('//')) { html += _wrap(remaining, 'comment'); i = line.length; }
                    else if (firstChar === '`') { html += _wrap('`', 'string'); i++; currentState.contextStack.push({ mode: 'template_literal', terminator: '`' }); }
                    else if (firstChar === "'" || firstChar === '"') { html += _wrap(firstChar, 'string'); i++; currentState.contextStack.push({ mode: 'string', terminator: firstChar }); }
                    else if (_isWhitespace(firstChar)) { html += firstChar; i++; }
                    else if (_isIdentifierStart(firstChar)) {
                        let buffer = '', p = i;
                        while(p < line.length && _isIdentifierPart(line[p])) { buffer += line[p++]; }
                        if (currentState.isNextTokenFunctionName) { html += _wrap(buffer, 'functionName'); currentState.isNextTokenFunctionName = false; }
                        else if (buffer === 'function') { html += _wrap(buffer, 'controlKeyword'); currentState.isNextTokenFunctionName = true; }
                        else if (controlKeywords.has(buffer)) { html += _wrap(buffer, 'controlKeyword'); }
                        else if (definitionKeywords.has(buffer)) { html += _wrap(buffer, 'definitionKeyword'); }
                        else if (_isFunctionCall(p)) { html += _wrap(buffer, 'functionName'); }
                        else { html += _wrap(buffer, 'variable'); }
                        i = p;
                    }
                    else if (_isDigit(firstChar)) {
                        let buffer = '', p = i;
                        while(p < line.length && (_isDigit(line[p]) || line[p]==='.')) { buffer += line[p++]; }
                        html += _wrap(buffer, 'number'); i = p;
                    }
                    else { currentState.isNextTokenFunctionName = false; html += _escape(firstChar); i++; } // Fallback for operators
                    break;
            }

            // --- DIVINE FAILSAFE 3b: The Guarantee of Progress ---
            // If, for any reason, `i` has not advanced, we force it to advance by one character.
            // This makes an infinite loop a cosmic impossibility.
            if (i === i_before_tick && i < line.length) {
                console.error("Highlighter failsafe triggered. Context:", context, "Char:", line[i]);
                html += _escape(line[i]);
                i++;
            }
        }
    } catch (error) {
        // Should the laws of nature themselves break, we catch the error, log it,
        // and render the line un-highlighted rather than crashing the entire editor.
        console.error("Catastrophic error in highlighter:", error);
        html = _escape(line); 
    }

    return { html: html || '&nbsp;', state: currentState };
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

        
        
        const scrollTop = this.textarea.scrollTop;
        const scrollLeft = this.textarea.scrollLeft;
        
        // Calculate the first visible "verse" (line) from the scroll position.
        const firstVisibleLine = Math.floor(scrollTop / this.lineHeight);
        const firstLineToRender = Math.max(0, firstVisibleLine - 1); // Render one above for smoothness.

        // To correctly highlight, we must "replay" the journey of the parser's soul (state)
        // from the very beginning (Bereshit) up to the first line we want to render.
        let state = this._getInitialState()

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
        this.viewport.style.transform = `translate(${-scrollLeft}px, ${-scrollRemainder}px)`;
        
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
    const neededDivs = Math.ceil(this.wrapper.clientHeight / this.lineHeight) + 2;
    
    console.log(neededDivs,"needed")

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
    
    // This is the critical part being restored. _render() is now always called,
    // which makes user input and programmatic updates both work correctly.
    this._render();
}
    
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