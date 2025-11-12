// B"H
// FILE: js/hex-editor.js
/**
 * The "Vivid Extreme" Hex Editor Component - v3.0 (Insane Good Edition)
 * This is not a component; it is a chronospatial data manipulator. It provides a
 * high-performance, fully interactive, and thematically integrated hex editing
 * experience with virtual rendering, real-time editing, search, and data inspection.
 */

import { UI } from './ui.js';
import { Clipboard } from './clipboard.js';
import { State } from './state.js';

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
        this._onContextMenu = this._onContextMenu.bind(this);
    }

    // --- PUBLIC API ---

    load(arrayBuffer) {
        this.data = new Uint8Array(arrayBuffer);
        this.totalLines = Math.ceil(this.data.length / BYTES_PER_LINE);
        this.selectedIndex = 0;
        this.dirtyBytes.clear();
        this.searchResults = [];
        this.searchIndex = -1;
        this._setupDOM();
        this.render();
        this._ensureVisible();
        this.show();
    }

    show() { this.navPad.classList.add('visible'); }
    hide() { this.navPad.classList.remove('visible'); }
    isDirty() { return this.dirtyBytes.size > 0; }
    getUpdatedArrayBuffer() { return this.data.buffer; }
    clearDirtyState() { this.dirtyBytes.clear(); this.render(); }

    destroy() {
        this.hide();
        this.container.removeEventListener('scroll', this._onScroll);
        this.container.removeEventListener('click', this._onClick);
        this.container.removeEventListener('contextmenu', this._onContextMenu);
        if (this._inputHandler) {
            this._inputHandler.removeEventListener('input', this._onInput);
            this._inputHandler.removeEventListener('blur', this._onBlur);
        }
        document.removeEventListener('keydown', this._onKeyDown);
        this.container.innerHTML = '';
        this.data = new Uint8Array(0);
    }
    
    // --- DOM & RENDER ---

    _setupDOM() {
        this.container.innerHTML = `
            <div class="hex-scroller"><div class="hex-content"></div></div>
            <div id="hex-search-bar" class="hex-search-bar">
                <input type="text" placeholder="Search Hex (e.g., 4A 4B) or Text..." class="hex-search-input">
                <select class="hex-search-type"><option value="text">Text</option><option value="hex">Hex</option></select>
                <button data-action="prev" title="Previous Match">▲</button>
                <button data-action="next" title="Next Match">▼</button>
            </div>
            <div id="hex-inspector" class="hex-inspector"></div>
        `;
        this.scroller = this.container.querySelector('.hex-scroller');
        this.content = this.container.querySelector('.hex-content');
        this.searchBar = this.container.querySelector('#hex-search-bar');
        this.inspector = this.container.querySelector('#hex-inspector');
        this.searchInput = this.searchBar.querySelector('.hex-search-input');
        
        if (!this._inputHandler) {
            this._inputHandler = document.createElement('input');
            this._inputHandler.className = 'hex-input-handler';
            this.container.appendChild(this._inputHandler);
        }
        this.scroller.style.height = `${this.totalLines * LINE_HEIGHT}px`;

        this.navPad.innerHTML = `<button data-action="up" title="Up">▲</button><button data-action="down" title="Down">▼</button><button data-action="left" title="Left">◀</button><button data-action="right" title="Right">▶</button>`;

        // Event Listeners
        this.container.addEventListener('scroll', this._onScroll, { passive: true });
        this.container.addEventListener('click', this._onClick);
        this.container.addEventListener('contextmenu', this._onContextMenu);
        this._inputHandler.addEventListener('input', this._onInput);
        this._inputHandler.addEventListener('blur', this._onBlur);
        this.navPad.onclick = this._onNavPadClick.bind(this);
        document.addEventListener('keydown', this._onKeyDown);
        this.searchBar.onclick = this._onSearchClick.bind(this);
        this.searchInput.onkeydown = (e) => { if (e.key === 'Enter') { e.preventDefault(); this._performSearch(); }};
    }

    render() {
        if (!this.scroller) return;
        const scrollTop = this.container.scrollTop;
        const containerHeight = this.container.clientHeight;
        const firstLine = Math.floor(scrollTop / LINE_HEIGHT);
        const visibleLines = Math.ceil(containerHeight / LINE_HEIGHT) + 2;
        const lastLine = Math.min(this.totalLines, firstLine + visibleLines);
        const fragment = document.createDocumentFragment();
        for (let i = firstLine; i < lastLine; i++) {
            const lineEl = this._createLine(i * BYTES_PER_LINE);
            lineEl.style.top = `${i * LINE_HEIGHT}px`;
            fragment.appendChild(lineEl);
        }
        this.content.innerHTML = '';
        this.content.appendChild(fragment);
        this._updateInputPosition();
        this._updateInspector();
    }

    _createLine(offset) {
        const line = document.createElement('div');
        line.className = 'hex-line';
        const offsetEl = `<div class="hex-offset">${offset.toString(16).padStart(8, '0').toUpperCase()}</div>`;
        const hexEl = document.createElement('div');
        hexEl.className = 'hex-bytes';
        const asciiEl = document.createElement('div');
        asciiEl.className = 'hex-ascii';

        for (let i = 0; i < BYTES_PER_LINE; i++) {
            const byteIndex = offset + i;
            if (byteIndex >= this.data.length) break;
            const byte = this.data[byteIndex];
            
            const hexByte = document.createElement('span');
            hexByte.textContent = byte.toString(16).padStart(2, '0').toUpperCase();
            hexByte.dataset.index = byteIndex; hexByte.dataset.column = 'hex';
            if (byteIndex === this.selectedIndex) hexByte.classList.add('selected');
            if (this.dirtyBytes.has(byteIndex)) hexByte.classList.add('dirty');
            if (this.searchResults.includes(byteIndex)) hexByte.classList.add('search-result');
            hexEl.appendChild(hexByte);

            const asciiChar = document.createElement('span');
            asciiChar.textContent = (byte >= 32 && byte <= 126) ? String.fromCharCode(byte) : '.';
            asciiChar.dataset.index = byteIndex; asciiChar.dataset.column = 'ascii';
            if (byteIndex === this.selectedIndex) asciiChar.classList.add('selected');
            if (this.dirtyBytes.has(byteIndex)) asciiChar.classList.add('dirty');
            if (this.searchResults.includes(byteIndex)) asciiChar.classList.add('search-result');
            asciiEl.appendChild(asciiChar);
        }
        line.innerHTML = offsetEl;
        line.append(hexEl, asciiEl);
        return line;
    }
    
    // --- EVENT HANDLERS ---
    
    _onScroll() { window.requestAnimationFrame(() => this.render()); }
    _onBlur() { this.isEditing = false; this.render(); }

    _onClick(e) {
        const target = e.target.closest('span[data-index]');
        if (target) {
            this.selectedIndex = parseInt(target.dataset.index, 10);
            this.activeColumn = target.dataset.column;
            this.isEditing = true;
            this.render();
            this._inputHandler.focus();
        } else if (!e.target.closest('.hex-search-bar')) {
            this.isEditing = false;
            this.render();
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
            this.render();
            this._ensureVisible();
        }
    }

    _onInput() {
        const value = this._inputHandler.value;
        this._inputHandler.value = ''; // Reset immediately
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
        this.render();
        this._ensureVisible();
    }
    
    _onNavPadClick(e) { /* ... (Same as before) ... */ }
    _onContextMenu(e) { /* ... (Same as before) ... */ }
    
    // --- SEARCH LOGIC ---

    _onSearchClick(e) {
        const button = e.target.closest('button[data-action]');
        if (!button) return;
        if (this.searchResults.length === 0) this._performSearch();
        else {
            if (button.dataset.action === 'next') this.searchIndex = (this.searchIndex + 1) % this.searchResults.length;
            else this.searchIndex = (this.searchIndex - 1 + this.searchResults.length) % this.searchResults.length;
            this.selectedIndex = this.searchResults[this.searchIndex];
            this.render();
            this._ensureVisible();
        }
    }

    _performSearch() {
        const query = this.searchInput.value;
        const type = this.searchBar.querySelector('.hex-search-type').value;
        if (!query) { this.searchResults = []; this.render(); return; }

        let queryBytes;
        if (type === 'hex') {
            queryBytes = query.trim().split(/\s+/).map(h => parseInt(h, 16)).filter(n => !isNaN(n));
        } else {
            queryBytes = Array.from(new TextEncoder().encode(query));
        }
        if (queryBytes.length === 0) { this.searchResults = []; this.render(); return; }
        
        this.searchResults = [];
        for (let i = 0; i <= this.data.length - queryBytes.length; i++) {
            let match = true;
            for (let j = 0; j < queryBytes.length; j++) {
                if (this.data[i + j] !== queryBytes[j]) { match = false; break; }
            }
            if (match) this.searchResults.push(i);
        }
        
        UI.showToast(`${this.searchResults.length} match(es) found.`, 'info');
        if (this.searchResults.length > 0) {
            this.searchIndex = 0;
            this.selectedIndex = this.searchResults[0];
            this._ensureVisible();
        }
        this.render();
    }
    
    // --- HELPERS ---

    _updateByte(index, newValue) {
        if (index < 0 || index >= this.data.length) return;
        this.data[index] = newValue & 0xFF; // Ensure it's a byte
        this.dirtyBytes.add(index);
        const activeTab = State.tabs.find(t => t.id === State.activeTabId);
        if (activeTab && !activeTab.isDirty) {
            activeTab.isDirty = true;
            // We need a way to re-render just the tab, not the whole bar.
            // For now, this is a known limitation. A full pub/sub system would solve it.
        }
    }

    _updateInspector() {
        if (this.selectedIndex < 0 || this.selectedIndex >= this.data.length) {
            this.inspector.innerHTML = ''; return;
        }
        const view = new DataView(this.data.buffer, this.selectedIndex);
        const inspectors = [];
        try { inspectors.push(`<span>Int8:</span> <span>${view.getInt8(0)}</span>`); } catch(e){}
        try { inspectors.push(`<span>UInt8:</span> <span>${view.getUint8(0)}</span>`); } catch(e){}
        try { inspectors.push(`<span>Int16:</span> <span>${view.getInt16(0, true)}</span>`); } catch(e){}
        try { inspectors.push(`<span>UInt16:</span> <span>${view.getUint16(0, true)}</span>`); } catch(e){}
        try { inspectors.push(`<span>Int32:</span> <span>${view.getInt32(0, true)}</span>`); } catch(e){}
        try { inspectors.push(`<span>UInt32:</span> <span>${view.getUint32(0, true)}</span>`); } catch(e){}
        try { inspectors.push(`<span>Float32:</span> <span>${view.getFloat32(0, true).toPrecision(5)}</span>`); } catch(e){}
        try { inspectors.push(`<span>Float64:</span> <span>${view.getFloat64(0, true).toPrecision(8)}</span>`); } catch(e){}
        this.inspector.innerHTML = inspectors.join('');
    }

    _updateInputPosition() { /* ... (Same as before) ... */ }
    _ensureVisible() { /* ... (Same as before) ... */ }
}