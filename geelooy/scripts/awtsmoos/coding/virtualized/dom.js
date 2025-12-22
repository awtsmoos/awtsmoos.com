
// B"H
// FILE: js/coding/virtualized/dom.js

export const DOMMethods = {
    /** @private Structures the DOM and enforces strict CSS alignment. */
    _initializeVessels() {
        const computed = window.getComputedStyle(this.textarea);
        
        this.wrapper = document.createElement('div');
        this.wrapper.className = 'virtualized-editor-wrapper';
        
        // Clone layout properties
        ['margin', 'padding', 'border', 'boxSizing', 'position', 'display', 'top', 'left', 'right', 'bottom', 'width', 'height'].forEach(prop => {
            if (prop === 'position' && computed[prop] === 'static') this.wrapper.style.position = 'relative';
            else this.wrapper.style[prop] = computed[prop];
        });
        
        this.wrapper.style.width = "100%";
        this.wrapper.style.height = "100%";
        
        // Create Overlay Vessels
        this.overlay = document.createElement('div');
        this.viewport = document.createElement('div');
        this.overlay.appendChild(this.viewport);
        
        // --- B"H ALIGNMENT FIX ---
        // We explicitly sync font properties to prevent sub-pixel drift.
        const fontProps = [
            'font-family', 'font-size', 'font-weight', 'font-style', 
            'font-variant', 'font-stretch', 'line-height', 'letter-spacing', 
            'tab-size', 'white-space', 'text-rendering', 'font-feature-settings'
        ];
        
        fontProps.forEach(p => {
            this.overlay.style[p] = computed[p];
        });

        // Enforce specific rendering modes for consistency
        this.overlay.style.fontVariantLigatures = 'none';
        this.textarea.style.fontVariantLigatures = 'none';
        
        Object.assign(this.overlay.style, {
            position: "absolute",
            top: '0',
            left: '0',
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
            overflow: 'hidden',
            padding: computed.padding,
            border: computed.border,
            boxSizing: computed.boxSizing,
            margin: '0', // Wrapper handles margin
            backgroundColor: 'transparent'
        });

        this.viewport.style.whiteSpace = "pre";
        
        // Caret setup
        this.caret = document.createElement('div');
        this.caret.className = 'virtualized-editor-caret';
        this.overlay.appendChild(this.caret);

        // Inject into DOM
        if (this.textarea.parentNode) {
            this.textarea.parentNode.insertBefore(this.wrapper, this.textarea);
        }
        this.wrapper.appendChild(this.textarea);
        this.wrapper.insertBefore(this.overlay, this.textarea);

        // Make Textarea Transparent but Interactive
        Object.assign(this.textarea.style, {
            position: 'absolute',
            top: '0',
            left: '0',
            width: '100%',
            height: '100%',
            resize: 'none',
            color: 'transparent',
            background: 'transparent',
            caretColor: '#66ff77', // Visible caret
            WebkitTextFillColor: 'transparent',
            margin: '0',
            padding: computed.padding, // Ensure strict padding match
            boxSizing: computed.boxSizing,
            border: computed.border,
            overflow: 'auto' // Keep scrollbars on textarea
        });
        
        this.textarea.setAttribute("spellcheck", "false");
        this._applyColors();
    },

    /** @private Injects dynamic CSS for tokens. */
    _applyColors() {
        const styleEl = document.createElement("style");
        styleEl.id = this.styleId + "-style";
        const caretColor = getComputedStyle(this.textarea).caretColor || 'white';
        styleEl.innerHTML = /*css*/`
            .token-comment { color: ${this.colors.comment}; } .token-string { color: ${this.colors.string}; }
            .token-number { color: ${this.colors.number}; } .token-controlKeyword { color: ${this.colors.controlKeyword}; }
            .token-definitionKeyword { color: ${this.colors.definitionKeyword}; } .token-functionName { color: ${this.colors.functionName}; }
            .token-variable { color: ${this.colors.variable}; } .token-operator { color: ${this.colors.operator}; }
            .token-punctuation { color: ${this.colors.punctuation}; } .token-tag { color: ${this.colors.tag}; }
            .token-attribute-name { color: ${this.colors['attribute-name']}; } .token-attribute-value { color: ${this.colors['attribute-value']}; }
            .token-selector { color: ${this.colors.selector}; } .token-property { color: ${this.colors.property}; }
            .virtualized-editor-caret { position: absolute; display: none; background-color: ${caretColor}; width: 2px; animation: blink 1s steps(1) infinite; z-index: 10; pointer-events: none; }
            @keyframes blink { 50% { opacity: 0; } }
        `;
        document.head.querySelector("#" + styleEl.id)?.remove();
        document.head.appendChild(styleEl);
    },

    _updateCaret() {
        // Disabled for now as native caret is visible via caret-color
        return; 
    }
};
