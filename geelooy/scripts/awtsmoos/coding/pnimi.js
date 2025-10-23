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
        this.parserState = { in_comment: false, in_string: false, in_rules: false, in_script: false, in_style: false, in_tagged_template: false, template_language: null };
        
        /** @private The DOM element for our simulated caret. */
        this.caret = null;
        /** @private The measured width of a single character. */
        this.charWidth = 0;
        
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
            .token-keyword { color: ${this.colors.keyword}; }
            .token-function { color: ${this.colors.function}; }
            .token-operator { color: ${this.colors.operator}; }
            .token-punctuation { color: ${this.colors.punctuation}; }
            .token-variable { color: ${this.colors.variable}; }
            .token-tag { color: ${this.colors.tag}; }
            .token-attribute { color: ${this.colors.attribute}; }
            .token-selector { color: ${this.colors.selector}; }
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

    _highlightJS(line, state) {
    // If we are continuing a tagged template from a previous line
    if (state.in_tagged_template) {
        let html = '';
        let endIdx = -1;
        let currentPos = 0;
        // Find the closing backtick, respecting escaped ones
        while((endIdx = line.indexOf('`', currentPos)) !== -1) {
            if (line[endIdx - 1] !== '\\') break;
            currentPos = endIdx + 1;
        }

        if (endIdx !== -1) { // The template ends on this line
            const content = line.substring(0, endIdx);
            // Highlight the content with the stored language, using a temporary state
            const subResult = this._getHighlightResult(content, {}, state.template_language);
            html += subResult.html;
            html += this._wrap('`', 'string'); // Add the closing backtick

            // Reset state and continue parsing the rest of the line as normal JS
            const restOfLine = line.substring(endIdx + 1);
            const finalState = { ...state, in_tagged_template: false, template_language: null };
            const restResult = this._highlightJS(restOfLine, finalState);
            html += restResult.html;
            return { html: html || '&nbsp;', state: restResult.state };

        } else { // The template continues
            // Highlight the entire line with the stored language
            const subResult = this._getHighlightResult(line, {}, state.template_language);
            return { html: subResult.html || '&nbsp;', state };
        }
    }


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
        
        const remaining = line.substring(i);
        
        // --- NEW: Manual, Regex-Free Check for Tagged Templates ---
        let directiveFound = false;
        const directives = [
            { tag: '/*js*/', lang: 'js' },
            { tag: '/*css*/', lang: 'css' },
            { tag: '/*html*/', lang: 'html' }
        ];

        for (const d of directives) {
            if (remaining.startsWith(d.tag + '`')) {
                const directive = d.tag;
                const templateLang = d.lang;

                html += this._wrap(directive, 'comment'); // Highlight the /*css*/ part
                html += this._wrap('`', 'string');        // Highlight the opening `
                i += directive.length + 1;

                let endIdx = -1;
                let currentPos = i;
                while ((endIdx = line.indexOf('`', currentPos)) !== -1) {
                    if (line[endIdx - 1] !== '\\') break; // Found non-escaped backtick
                    currentPos = endIdx + 1;
                }

                if (endIdx !== -1) { // Template ends on the same line
                    const content = line.substring(i, endIdx);
                    const subResult = this._getHighlightResult(content, {}, templateLang);
                    html += subResult.html;
                    html += this._wrap('`', 'string'); // Highlight the closing `
                    i = endIdx + 1;
                } else { // Template continues to the next line
                    const content = line.substring(i);
                    state.in_tagged_template = true;
                    state.template_language = templateLang;
                    const subResult = this._getHighlightResult(content, {}, templateLang);
                    html += subResult.html;
                    i = line.length; // We're done with this line
                }
                
                directiveFound = true;
                break; // Exit the for-loop
            }
        }

        if (directiveFound) {
            continue; // Continue to the next token in the while-loop
        }
        // --- END NEW ---
        
        if (lang.singleLineComment && remaining.startsWith(lang.singleLineComment)) { html += this._wrap(remaining, 'comment'); break; }
        if (lang.multiLineComment && remaining.startsWith(lang.multiLineComment.start)) {
            const endIdx = remaining.indexOf(lang.multiLineComment.end);
            if (endIdx !== -1) { html += this._wrap(remaining.substring(0, endIdx + lang.multiLineComment.end.length), 'comment'); i += endIdx + lang.multiLineComment.end.length; }
            else { html += this._wrap(remaining, 'comment'); state.in_comment = true; break; }
            continue;
        }
        if (remaining[0] === '"' || remaining[0] === "'") {
            const char = remaining[0];
            let endIdx = -1; let currentPos = 1;
            while((endIdx = remaining.indexOf(char, currentPos)) !== -1) { if(remaining[endIdx - 1] !== '\\') break; currentPos = endIdx + 1; }
            if (endIdx !== -1) {
                html += this._wrap(remaining.substring(0, endIdx + 1), 'string');
                i += endIdx + 1;
            } else {
                 html += this._escape(char); i++;
            }
            continue;
        }
        if (lang.templateString && remaining[0] === lang.templateString.start) {
            let endIdx = -1; let currentPos = 1;
            while((endIdx = remaining.indexOf(lang.templateString.end, currentPos)) !== -1) { if (remaining[endIdx - 1] !== '\\') break; currentPos = endIdx + 1; }
            if (endIdx !== -1) { html += this._wrap(remaining.substring(0, endIdx + 1), 'string'); i += endIdx + 1; }
            else { html += this._wrap(remaining, 'string'); state.in_string = true; break; }
            continue;
        }
        const firstChar = remaining[0];
        if ((firstChar >= 'a' && firstChar <= 'z') || (firstChar >= 'A' && firstChar <= 'Z') || firstChar === '_') {
            let word = '';
            while (i < line.length && /[a-zA-Z0-9_]/.test(line[i])) { word += line[i]; i++; }
            if (lang.keywords.includes(word)) { html += this._wrap(word, 'keyword'); }
            else { html += this._wrap(word, 'variable'); }
            continue;
        }
        html += this._escape(firstChar); i++;
    }
    return { html: html || '&nbsp;', state };
}
    
    
    
    
    
    
    
    
    
    /**
 * @private
 * @function _highlightHTML
 * @description The HTML parser, which now acts as a controller.
 * It parses HTML tags, but when it enters a <style> or <script> block,
 * it delegates the highlighting of the content to the appropriate
 * CSS or JS highlighter.
 */
_highlightHTML(line, state) {
    let html = '';
    let i = 0;

    // --- NEW: Handle being inside a multi-line script block ---
    if (state.in_script) {
        const endTag = '</script>';
        const endIdx = line.indexOf(endTag, i);
        if (endIdx !== -1) {
            const scriptContent = line.substring(i, endIdx);
            html += this._highlightJS(scriptContent, state).html; // Use JS highlighter
            html += this._wrap('</', 'punctuation') + this._wrap('script', 'tag') + this._wrap('>', 'punctuation');
            i = endIdx + endTag.length;
            state.in_script = false; // We've exited the block
        } else {
            // The entire line is script content
            html += this._highlightJS(line.substring(i), state).html;
            return { html: html || '&nbsp;', state };
        }
    }

    // --- NEW: Handle being inside a multi-line style block ---
    if (state.in_style) {
        const endTag = '</style>';
        const endIdx = line.indexOf(endTag, i);
        if (endIdx !== -1) {
            const styleContent = line.substring(i, endIdx);
            html += this._highlightCSS(styleContent, state).html; // Use CSS highlighter
            html += this._wrap('</', 'punctuation') + this._wrap('style', 'tag') + this._wrap('>', 'punctuation');
            i = endIdx + endTag.length;
            state.in_style = false; // We've exited the block
        } else {
            // The entire line is style content
            html += this._highlightCSS(line.substring(i), state).html;
            return { html: html || '&nbsp;', state };
        }
    }

    // --- Main HTML parsing loop ---
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

        // --- Standard Tag and Attribute Parsing (mostly unchanged) ---
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
        const isClosingTag = line[i+1] === '/';
        const normalizedTagName = tagName.toLowerCase();
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

        // --- NEW: Logic to enter script/style modes ---
        if (!isClosingTag && (normalizedTagName === 'script' || normalizedTagName === 'style')) {
            const endTag = `</${normalizedTagName}>`;
            const endOfBlockIdx = line.indexOf(endTag, i);

            if (endOfBlockIdx !== -1) {
                // Block ends on the same line
                const content = line.substring(i, endOfBlockIdx);
                if (normalizedTagName === 'script') {
                    html += this._highlightJS(content, state).html;
                } else {
                    html += this._highlightCSS(content, state).html;
                }
                html += this._wrap('</', 'punctuation') + this._wrap(normalizedTagName, 'tag') + this._wrap('>', 'punctuation');
                i = endOfBlockIdx + endTag.length;
            } else {
                // Block continues to the next line
                const content = line.substring(i);
                if (normalizedTagName === 'script') {
                    html += this._highlightJS(content, state).html;
                    state.in_script = true;
                } else {
                    html += this._highlightCSS(content, state).html;
                    state.in_style = true;
                }
                break; // We're done with this line
            }
        }
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
        let state = { in_comment: false, in_string: false, in_rules: false, in_script: false, in_style: false, in_tagged_template: false, template_language: null };

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
 * @function _getHighlightResult
 * @description A helper to select the correct "Gate of Wisdom" (parser) for the current language.
 * @param {string} line - The line of text to highlight.
 * @param {object} state - The current parser state.
 * @param {string} [languageOverride] - An optional language to force-use for this line.
 * @returns {{html: string, state: object}} The highlighted HTML and the new state.
 */
_getHighlightResult(line, state, languageOverride) {
    const lang = languageOverride || this.language; // Use override if provided
    switch (lang) {
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