
// B"H
// FILE: js/zip/render.js

import { DOM, State } from '../state.js';
import { Menus } from '../menus.js';
import { ZipState } from './state.js'; // The proper import
import { SelectionManager } from '../selection-manager.js';
import { getItemUniquePath } from '../workspaces.js';

export const ZipRenderer = {
    render(tab, zipOps) {
        const state = tab.zipState;
        if (!state) return;

        const container = DOM.zipExplorerWrapper;
        if (!container) return;

        if (!container.querySelector('.zip-toolbar')) {
            container.innerHTML = `
                <div class="zip-toolbar">
                    <div class="zip-info">
                        <span class="zip-filename">${tab.item.name}</span>
                        <span class="zip-stats" id="zip-stats">Loading...</span>
                    </div>
                    <div class="zip-actions">
                        <button id="zip-add-file" class="icon-button" title="New File"><svg class="svg-icon"><use href="#icon-file"></use></svg></button>
                        <button id="zip-add-folder" class="icon-button" title="New Folder"><svg class="svg-icon"><use href="#icon-folder"></use></svg></button>
                        <div style="width:1px; background:var(--color-border); margin:0 8px;"></div>
                        <button id="zip-extract-all" class="secondary-btn">Extract All</button>
                        <button id="zip-save-btn" class="primary-btn">Save Changes</button>
                    </div>
                </div>
                <div class="zip-content" id="zip-drop-zone" style="transition: background 0.2s;">
                    <table class="zip-table">
                        <thead>
                            <tr>
                                <th width="40"></th>
                                <th>Name</th>
                                <th width="120">Size</th>
                                <th width="80">Ratio</th>
                            </tr>
                        </thead>
                        <tbody id="zip-table-body"></tbody>
                    </table>
                </div>
            `;
            
            container.querySelector('#zip-save-btn').onclick = () => zipOps.save(tab);
            container.querySelector('#zip-extract-all').onclick = () => zipOps.extractAll(tab);
            container.querySelector('#zip-add-file').onclick = () => zipOps.createItem(tab, 'file');
            container.querySelector('#zip-add-folder').onclick = () => zipOps.createItem(tab, 'directory');
            
            const contentDiv = container.querySelector('.zip-content');
            contentDiv.oncontextmenu = (e) => {
                if (e.target.closest('.zip-row')) return;
                const rootItem = { name: '/', path: '', kind: 'directory', type: 'zip-entry', zipTabId: state.tabId, workspaceId: 'zip' };
                State.contextEvent = e;
                Menus.show(e, rootItem);
            };

            const dropZone = container.querySelector('#zip-drop-zone');
            dropZone.addEventListener('dragover', (e) => {
                e.preventDefault();
                dropZone.style.background = 'rgba(0, 246, 255, 0.1)';
            });
            dropZone.addEventListener('dragleave', (e) => {
                e.preventDefault();
                dropZone.style.background = 'transparent';
            });
            dropZone.addEventListener('drop', async (e) => {
                e.preventDefault();
                dropZone.style.background = 'transparent';
                
                if (e.dataTransfer.items) {
                    for (let i = 0; i < e.dataTransfer.items.length; i++) {
                        if (e.dataTransfer.items[i].kind === 'file') {
                            const file = e.dataTransfer.items[i].getAsFile();
                            if (file) {
                                const buffer = new Uint8Array(await file.arrayBuffer());
                                zipOps.updateEntry(tab, file.name, buffer);
                            }
                        }
                    }
                }
            });

        } else {
            container.querySelector('.zip-filename').textContent = tab.item.name;
        }

        this.renderTable(tab, state, zipOps);
    },

    renderTable(tab, state, zipOps) {
        const tbody = document.getElementById('zip-table-body');
        if (!tbody) return;
        tbody.innerHTML = '';

        // B"H - Directly calling the imported module function instead of 'require'
        const displayEntries = ZipState.getDisplayEntries(state);
        
        displayEntries.sort((a, b) => {
            if (a.isDir !== b.isDir) return b.isDir ? 1 : -1;
            return a.filename.localeCompare(b.filename);
        });

        const statsEl = document.getElementById('zip-stats');
        if (statsEl) statsEl.textContent = `${displayEntries.length} items`;

        if (displayEntries.length === 0) {
            tbody.innerHTML = `<tr><td colspan="4" class="zip-empty-msg">Archive is empty. Drop files here.</td></tr>`;
            return;
        }

        displayEntries.forEach(entry => {
            const tr = document.createElement('tr');
            tr.className = 'zip-row';
            
            const fullItem = {
                name: entry.filename.split('/').pop(),
                path: entry.filename,
                kind: entry.isDir ? 'directory' : 'file',
                type: 'zip-entry',
                zipTabId: state.tabId,
                workspaceId: 'zip' 
            };
            
            const uniquePath = getItemUniquePath(fullItem);
            State.domItemMap.set(uniquePath, { el: tr, item: fullItem });
            if (State.selectedItems.has(uniquePath)) tr.classList.add('selected');
            
            const isModified = state.modifications.has(entry.filename);
            const isNew = state.newEntries.has(entry.filename);
            if (isModified || isNew) tr.classList.add('modified');
            
            let ratio = 0; let sizeStr = '';
            if (isNew) {
                sizeStr = entry.isDir ? '' : 'New';
                ratio = '-';
            } else {
                ratio = entry.compressedSize > 0 ? Math.round((entry.compressedSize / entry.uncompressedSize) * 100) : 0;
                sizeStr = entry.isDir ? '' : this._formatSize(entry.uncompressedSize);
            }
            
            tr.innerHTML = `
                <td class="zip-icon-cell">${entry.isDir ? '📁' : '📄'}</td>
                <td class="zip-name-cell">${entry.filename}</td>
                <td class="zip-size-cell">${sizeStr}</td>
                <td class="zip-ratio-cell">${entry.isDir ? '-' : ratio + '%'}</td>
            `;
            
            tr.onclick = (e) => {
                if (State.isSelectionModeActive || e.ctrlKey || e.metaKey) {
                    if (!State.isSelectionModeActive) SelectionManager.start(fullItem, e);
                    else SelectionManager.toggle(fullItem);
                } else {
                    if (!entry.isDir) zipOps.openEntry(tab, entry);
                }
            };
            
            tr.oncontextmenu = (e) => {
                State.contextEvent = e; 
                Menus.show(e, fullItem);
            };

            tbody.appendChild(tr);
        });
    },

    _formatSize(bytes) {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes =['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    }
};
