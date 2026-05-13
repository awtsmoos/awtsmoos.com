
/**
 * @ B"H 
 * @file VirtualizedEditor.js
 * @version 7.0.0 - Olam HaYetzirah (The World of Formation)
 * @description The unified soul, composed of distinct vessels.
 */

import { DOMMethods } from './virtualized/dom.js';
import { MetricsMethods } from './virtualized/metrics.js';
import { WorkerMethods } from './virtualized/worker-bridge.js';

class VirtualizedEditor {
    constructor(textarea, language = 'js', customColors = {}) {
        if (!textarea || textarea.tagName !== 'TEXTAREA') {
            throw new Error('The vessel of creation must be a TEXTAREA element.');
        }

        this.textarea = textarea;
        this.language = language;
        this.currentFirstLine = 0;
        this.latestRequestId = 0;
        this.lastRenderedId = -1;
        this.wrapper = null;
        this.overlay = null;
        this.viewport = null;
        this.caret = null;
        this.styleId = `BH_EDITOR_${Date.now()}`;
        this.lines = [];
        this.lineHeight = 0;
        this.charWidth = 0;
        this.viewportDivs = [];
        this.highlighterWorker = null;

        // Bind Events
        this._boundHandleKeyDown = this._handleKeyDown.bind(this);
        this._boundUpdate = this._update.bind(this);
        this._boundOnScroll = this._onScroll.bind(this);

        this.colors = {
            comment: '#6A9555', string: '#CE9178', number: '#B5CEA8',
            controlKeyword: '#C586C0', definitionKeyword: '#569CD6', functionName: '#DCDCAA',
            variable: '#9CDCFE', operator: '#D4D4D4', punctuation: '#808080',
            tag: '#569CD6', 'attribute-name': '#9CDCFE', 'attribute-value': '#CE9178',
            selector: '#D7BA7D', property: '#9CDCFE',
            ...customColors
        };

        this._initializeVessels();
        this._initializeHighlightingWorker();
        this._attachEventListeners();
        this._measureAndRender();
    }

    _attachEventListeners() {
        this.textarea.addEventListener('input', this._boundUpdate);
        this.textarea.addEventListener('keydown', this._boundHandleKeyDown);
        
        // Use ResizeObserver to keep layers synced if container changes size
        new ResizeObserver(() => {
             this._measureAndRender();
        }).observe(this.wrapper);
        
        this.textarea.addEventListener('scroll', this._boundOnScroll);
    }

    update(newContent) {
        if (typeof newContent !== 'string' || newContent === this.textarea.value) return;
        this.textarea.value = newContent;
        this._update();
    }
    
    setText(txt) { return this.update(txt); }

    setLanguage(newLanguage) {
        if (typeof newLanguage !== 'string') return;
        this.language = newLanguage;
        this._update();
    }
    
    refresh() { this._measureAndRender(); }

    destroy() {
        this.textarea.removeEventListener('input', this._boundUpdate);
        this.textarea.removeEventListener('keydown', this._boundHandleKeyDown);
        this.textarea.removeEventListener('scroll', this._boundOnScroll);

        if (typeof this._disposeWorkerBinding === 'function') {
            this._disposeWorkerBinding();
        }
        if (this.wrapper && this.wrapper.parentNode) {
            this.wrapper.parentNode.insertBefore(this.textarea, this.wrapper);
            this.wrapper.remove();
        }
        this.textarea.style.cssText = "";
        const style = document.head.querySelector("#" + this.styleId + "-style");
        if (style) style.remove();
    }
}

// Mixin the methods from the sub-modules
Object.assign(VirtualizedEditor.prototype, DOMMethods);
Object.assign(VirtualizedEditor.prototype, MetricsMethods);
Object.assign(VirtualizedEditor.prototype, WorkerMethods);

export default VirtualizedEditor;
