// B"H
// FILE: js/hex-editor/view.js

export const HexView = {
    BYTES_PER_LINE: 16,
    LINE_HEIGHT: 24,

    setupDOM(editor) {
        editor.container.innerHTML = `
            <div class="hex-scroller"><div class="hex-content"></div></div>
            <div id="hex-search-bar" class="hex-search-bar">
                <input type="text" placeholder="Search Hex (e.g., 4A 4B) or Text..." class="hex-search-input">
                <select class="hex-search-type"><option value="text">Text</option><option value="hex">Hex</option></select>
                <button data-action="prev" title="Previous Match">▲</button>
                <button data-action="next" title="Next Match">▼</button>
            </div>
            <div id="hex-inspector" class="hex-inspector"></div>
        `;
        editor.scroller = editor.container.querySelector('.hex-scroller');
        editor.content = editor.container.querySelector('.hex-content');
        editor.searchBar = editor.container.querySelector('#hex-search-bar');
        editor.inspector = editor.container.querySelector('#hex-inspector');
        editor.searchInput = editor.searchBar.querySelector('.hex-search-input');
        
        if (!editor._inputHandler) {
            editor._inputHandler = document.createElement('input');
            editor._inputHandler.className = 'hex-input-handler';
            editor.container.appendChild(editor._inputHandler);
        }
        editor.scroller.style.height = `${editor.totalLines * this.LINE_HEIGHT}px`;
        editor.navPad.innerHTML = `<button data-action="up" title="Up">▲</button><button data-action="down" title="Down">▼</button><button data-action="left" title="Left">◀</button><button data-action="right" title="Right">▶</button>`;
    },

    render(editor) {
        if (!editor.scroller) return;
        const scrollTop = editor.container.scrollTop;
        const containerHeight = editor.container.clientHeight;
        const firstLine = Math.floor(scrollTop / this.LINE_HEIGHT);
        const visibleLines = Math.ceil(containerHeight / this.LINE_HEIGHT) + 2;
        const lastLine = Math.min(editor.totalLines, firstLine + visibleLines);
        const fragment = document.createDocumentFragment();
        for (let i = firstLine; i < lastLine; i++) {
            const lineEl = this.createLine(editor, i * this.BYTES_PER_LINE);
            lineEl.style.top = `${i * this.LINE_HEIGHT}px`;
            fragment.appendChild(lineEl);
        }
        editor.content.innerHTML = '';
        editor.content.appendChild(fragment);
        this.updateInputPosition(editor);
        this.updateInspector(editor);
    },

    createLine(editor, offset) {
        const line = document.createElement('div');
        line.className = 'hex-line';
        const offsetEl = `<div class="hex-offset">${offset.toString(16).padStart(8, '0').toUpperCase()}</div>`;
        const hexEl = document.createElement('div');
        hexEl.className = 'hex-bytes';
        const asciiEl = document.createElement('div');
        asciiEl.className = 'hex-ascii';

        for (let i = 0; i < this.BYTES_PER_LINE; i++) {
            const byteIndex = offset + i;
            if (byteIndex >= editor.data.length) break;
            const byte = editor.data[byteIndex];
            
            const hexByte = document.createElement('span');
            hexByte.textContent = byte.toString(16).padStart(2, '0').toUpperCase();
            hexByte.dataset.index = byteIndex; hexByte.dataset.column = 'hex';
            if (byteIndex === editor.selectedIndex) hexByte.classList.add('selected');
            if (editor.dirtyBytes.has(byteIndex)) hexByte.classList.add('dirty');
            if (editor.searchResults.includes(byteIndex)) hexByte.classList.add('search-result');
            hexEl.appendChild(hexByte);

            const asciiChar = document.createElement('span');
            asciiChar.textContent = (byte >= 32 && byte <= 126) ? String.fromCharCode(byte) : '.';
            asciiChar.dataset.index = byteIndex; asciiChar.dataset.column = 'ascii';
            if (byteIndex === editor.selectedIndex) asciiChar.classList.add('selected');
            if (editor.dirtyBytes.has(byteIndex)) asciiChar.classList.add('dirty');
            if (editor.searchResults.includes(byteIndex)) asciiChar.classList.add('search-result');
            asciiEl.appendChild(asciiChar);
        }
        line.innerHTML = offsetEl;
        line.append(hexEl, asciiEl);
        return line;
    },

    updateInspector(editor) {
        if (editor.selectedIndex < 0 || editor.selectedIndex >= editor.data.length) {
            editor.inspector.innerHTML = ''; return;
        }
        const view = new DataView(editor.data.buffer, editor.selectedIndex);
        const inspectors = [];
        try { inspectors.push(`<span>Int8:</span> <span>${view.getInt8(0)}</span>`); } catch(e){}
        try { inspectors.push(`<span>UInt8:</span> <span>${view.getUint8(0)}</span>`); } catch(e){}
        try { inspectors.push(`<span>Int16:</span> <span>${view.getInt16(0, true)}</span>`); } catch(e){}
        try { inspectors.push(`<span>UInt16:</span> <span>${view.getUint16(0, true)}</span>`); } catch(e){}
        try { inspectors.push(`<span>Int32:</span> <span>${view.getInt32(0, true)}</span>`); } catch(e){}
        try { inspectors.push(`<span>UInt32:</span> <span>${view.getUint32(0, true)}</span>`); } catch(e){}
        try { inspectors.push(`<span>Float32:</span> <span>${view.getFloat32(0, true).toPrecision(5)}</span>`); } catch(e){}
        try { inspectors.push(`<span>Float64:</span> <span>${view.getFloat64(0, true).toPrecision(8)}</span>`); } catch(e){}
        editor.inspector.innerHTML = inspectors.join('');
    },

    updateInputPosition(editor) {
        const selectedEl = editor.content.querySelector('span.selected');
        if (!selectedEl) {
            editor._inputHandler.style.left = '-9999px';
            editor.inspector.style.display = 'none';
            return;
        }

        const containerRect = editor.container.getBoundingClientRect();
        const elRect = selectedEl.getBoundingClientRect();
        const isHexColumn = selectedEl.dataset.column === 'hex';

        const inputTop = elRect.top - containerRect.top + editor.container.scrollTop;
        const inputLeft = elRect.left - containerRect.left;
        editor._inputHandler.style.top = `${inputTop}px`;
        editor._inputHandler.style.left = `${inputLeft}px`;
        editor._inputHandler.style.width = isHexColumn ? `${elRect.width}px` : '1ch';

        editor.inspector.style.display = 'grid'; 
        const inspectorRect = editor.inspector.getBoundingClientRect();
        
        let inspectorTop = elRect.top - containerRect.top - inspectorRect.height - 8 + editor.container.scrollTop;
        if (inspectorTop < editor.container.scrollTop) {
            inspectorTop = elRect.bottom - containerRect.top + 8 + editor.container.scrollTop;
        }

        let inspectorLeft = elRect.left - containerRect.left;
        if (inspectorLeft + inspectorRect.width > containerRect.width) {
            inspectorLeft = containerRect.width - inspectorRect.width - 16;
        }
        if (inspectorLeft < 0) inspectorLeft = 16;

        editor.inspector.style.top = `${inspectorTop}px`;
        editor.inspector.style.left = `${inspectorLeft}px`;
    },

    ensureVisible(editor) {
        if (editor.selectedIndex < 0) return;
        
        const lineIndex = Math.floor(editor.selectedIndex / this.BYTES_PER_LINE);
        const targetLineTop = lineIndex * this.LINE_HEIGHT;
        const targetLineBottom = targetLineTop + this.LINE_HEIGHT;
        const viewTop = editor.container.scrollTop;
        const viewBottom = viewTop + editor.container.clientHeight;
    
        if (targetLineTop < viewTop) {
            editor.container.scrollTop = targetLineTop;
        } else if (targetLineBottom > viewBottom) {
            const newScrollTop = targetLineBottom - editor.container.clientHeight;
            editor.container.scrollTop = newScrollTop;
        }
    }
};