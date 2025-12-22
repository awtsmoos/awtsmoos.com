// B"H
// FILE: js/hex-editor/index.js

import { State, DOM } from '../state.js';
import { HexView } from './view.js';
import { HexSearch } from './search.js';

const BYTES_PER_LINE = 16;
const LINE_HEIGHT = 24;

export class HexEditor {
    constructor(containerElement, navPadElement) {
        this.container = containerElement;
        this.navPad = navPadElement;
        this.data = new Uint8Array(0);
        this.totalLines = 0;
        
        this.selectedIndex = -1;
        this.activeColumn = 'hex';
        this.dirtyBytes = new Set();
        this.nibble = '';
        this.searchResults = [];
        this.searchIndex = -1;

        this._inputHandler = null;
        this._onScroll = this._onScroll.bind(this);
        this._onClick = this._onClick.bind(this);
        this._onKeyDown = this._onKeyDown.bind(this);
        this._onInput = this._onInput.bind(this);
        this._onBlur = this._onBlur.bind(this);
    }

    load(arrayBuffer) {
        this.data = new Uint8Array(arrayBuffer);
        this.totalLines = Math.ceil(this.data.length / BYTES_PER_LINE);
        this.selectedIndex = 0;
        this.dirtyBytes.clear();
        this.searchResults = [];
        this.searchIndex = -1;
        HexView.setupDOM(this);
        HexView.render(this);
        HexView.ensureVisible(this);
        this.show();
        this._bindEvents();
    }

    _bindEvents() {
        this.container.addEventListener('scroll', this._onScroll, { passive: true });
        this.container.addEventListener('click', this._onClick);
        this._inputHandler.addEventListener('input', this._onInput);
        this._inputHandler.addEventListener('blur', this._onBlur);
        document.addEventListener('keydown', this._onKeyDown);
        this.searchBar.onclick = (e) => HexSearch.onSearchClick(e, this);
        this.searchInput.onkeydown = (e) => { 
            if (e.key === 'Enter') { e.preventDefault(); HexSearch.performSearch(this); }
        };
    }

    show() { this.navPad.classList.add('visible'); }
    hide() { this.navPad.classList.remove('visible'); }
    isDirty() { return this.dirtyBytes.size > 0; }
    getUpdatedArrayBuffer() { return this.data.buffer; }
    clearDirtyState() { this.dirtyBytes.clear(); HexView.render(this); }

    destroy() {
        this.hide();
        this.container.removeEventListener('scroll', this._onScroll);
        this.container.removeEventListener('click', this._onClick);
        if (this._inputHandler) {
            this._inputHandler.removeEventListener('input', this._onInput);
            this._inputHandler.removeEventListener('blur', this._onBlur);
        }
        document.removeEventListener('keydown', this._onKeyDown);
        this.container.innerHTML = '';
        this.data = new Uint8Array(0);
    }

    _onScroll() { window.requestAnimationFrame(() => HexView.render(this)); }
    _onBlur() { HexView.render(this); }

    _onClick(e) {
        const target = e.target.closest('span[data-index]');
        if (target) {
            this.selectedIndex = parseInt(target.dataset.index, 10);
            this.activeColumn = target.dataset.column;
            HexView.render(this);
            this._inputHandler.focus();
        } else if (!e.target.closest('.hex-search-bar')) {
            HexView.render(this);
        }
    }

    _onKeyDown(e) {
        if (!State.hexEditorInstance || DOM.hexEditorWrapper.classList.contains('hidden') || this.selectedIndex < 0) return;
        
        let handled = true;
        if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
            this._inputHandler.focus();
            return;
        }

        switch (e.key) {
            case 'ArrowUp': this.selectedIndex -= BYTES_PER_LINE; break;
            case 'ArrowDown': this.selectedIndex += BYTES_PER_LINE; break;
            case 'ArrowLeft': this.selectedIndex--; break;
            case 'ArrowRight': this.selectedIndex++; break;
            case 'PageUp': this.selectedIndex -= Math.floor(this.container.clientHeight / LINE_HEIGHT) * BYTES_PER_LINE; break;
            case 'PageDown': this.selectedIndex += Math.floor(this.container.clientHeight / LINE_HEIGHT) * BYTES_PER_LINE; break;
            case 'Home': this.selectedIndex = e.ctrlKey ? 0 : this.selectedIndex - (this.selectedIndex % BYTES_PER_LINE); break;
            case 'End': this.selectedIndex = e.ctrlKey ? this.data.length - 1 : this.selectedIndex - (this.selectedIndex % BYTES_PER_LINE) + BYTES_PER_LINE - 1; break;
            case 'Tab': e.preventDefault(); this.activeColumn = this.activeColumn === 'hex' ? 'ascii' : 'hex'; break;
            case 'Backspace': this._updateByte(this.selectedIndex, 0x00); this.selectedIndex--; break;
            default: handled = false; break;
        }

        if (handled) {
            e.preventDefault();
            this.selectedIndex = Math.max(0, Math.min(this.data.length - 1, this.selectedIndex));
            HexView.render(this);
            HexView.ensureVisible(this);
        }
    }

    _onInput() {
        const value = this._inputHandler.value;
        this._inputHandler.value = ''; 
        if (this.activeColumn === 'hex') {
            const hexChar = value.toUpperCase().slice(-1);
            if (/[0-9A-F]/.test(hexChar)) {
                this.nibble += hexChar;
                if (this.nibble.length === 2) {
                    this._updateByte(this.selectedIndex, parseInt(this.nibble, 16));
                    this.selectedIndex = Math.min(this.data.length - 1, this.selectedIndex + 1);
                    this.nibble = '';
                }
            } else { this.nibble = ''; }
        } else {
            if (value.length > 0) {
                this._updateByte(this.selectedIndex, value.charCodeAt(0));
                this.selectedIndex = Math.min(this.data.length - 1, this.selectedIndex + 1);
            }
        }
        HexView.render(this);
        HexView.ensureVisible(this);
    }

    _updateByte(index, newValue) {
        if (index < 0 || index >= this.data.length) return;
        this.data[index] = newValue & 0xFF; 
        this.dirtyBytes.add(index);
        const activeTab = State.tabs.find(t => t.id === State.activeTabId);
        if (activeTab && !activeTab.isDirty) {
            activeTab.isDirty = true;
        }
    }
}