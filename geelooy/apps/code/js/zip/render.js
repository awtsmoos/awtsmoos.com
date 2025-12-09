// B"H
// FILE: js/zip/render.js

import { DOM, State } from '../state.js';
import { Menus } from '../menus.js';
import { ZipState } from './state.js';
import { SelectionManager } from '../selection-manager.js';
import { getItemUniquePath } from '../workspaces.js';

export const ZipRenderer = {
    render(tab, zipOps) {
        const state = tab.zipState;
        if (!state) return;

        const container = DOM.zipExplorerWrapper;
        if (!container) return;

        // Only render the toolbar if it doesn't exist (optimization)
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
                <div class="zip-content">
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
            
            // Bind Events
            container.querySelector('#zip-save-btn').onclick = () => zipOps.save(tab);
            container.querySelector('#zip-extract-all').onclick = () => zipOps.extractAll(tab);
            container.querySelector('#zip-add-file').onclick = () => zipOps.createItem(tab, 'file');
            container.querySelector('#zip-add-folder').onclick = () => zipOps.createItem(tab, 'directory');
            
            // B"H - Bind Context Menu to Empty Space (Root)
            const contentDiv = container.querySelector('.zip-content');
            contentDiv.oncontextmenu = (e) => {
                // If we clicked on a row, don't trigger this (row has its own listener)
                if (e.target.closest('.zip-row')) return;
                
                const rootItem = {
                    name: '/',
                    path: '', // Root path in zip is empty string for logic
                    kind: 'directory',
                    type: 'zip-entry',
                    zipTabId: state.tabId,
                    workspaceId: 'zip'
                };
                State.contextEvent = e;
                Menus.show(e, rootItem);
            };

        } else {
            // Update filename just in case
            container.querySelector('.zip-filename').textContent = tab.item.name;
        }

        this.renderTable(tab, state, zipOps);
    },

    renderTable(tab, state, zipOps) {
        const tbody = document.getElementById('zip-table-body');
        if (!tbody) return;
        tbody.innerHTML = '';

        const entries = ZipState.getDisplayEntries(state);
        
        // Sort
        entries.sort((a, b) => {
            // Always folders first
            if (a.isDir !== b.isDir) return b.isDir ? 1 : -1;
            return a.filename.localeCompare(b.filename);
        });

        // Update stats
        const statsEl = document.getElementById('zip-stats');
        if (statsEl) statsEl.textContent = `${entries.length} items`;

        if (entries.length === 0) {
            tbody.innerHTML = `<tr><td colspan="4" class="zip-empty-msg">Archive is empty.</td></tr>`;
            return;
        }

        entries.forEach(entry => {
            const tr = document.createElement('tr');
            tr.className = 'zip-row';
            
            // Construct a proper item object for this entry
            const fullItem = {
                name: entry.filename.split('/').pop(),
                path: entry.filename,
                kind: entry.isDir ? 'directory' : 'file',
                type: 'zip-entry',
                zipTabId: state.tabId,
                workspaceId: 'zip' // Generic ID for context menus
            };
            
            const uniquePath = getItemUniquePath(fullItem);
            
            // Register for SelectionManager
            State.domItemMap.set(uniquePath, { el: tr, item: fullItem });
            
            if (State.selectedItems.has(uniquePath)) {
                tr.classList.add('selected');
            }
            
            const isModified = state.modifications.has(entry.filename);
            const isNew = state.newEntries.has(entry.filename);
            
            if (isModified || isNew) tr.classList.add('modified');
            
            let ratio = 0;
            let sizeStr = '';
            
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
            
            // B"H - Click handler supporting selection mode
            tr.onclick = (e) => {
                if (State.isSelectionModeActive || e.ctrlKey || e.metaKey) {
                    if (!State.isSelectionModeActive) {
                        SelectionManager.start(fullItem, e);
                    } else {
                        SelectionManager.toggle(fullItem);
                    }
                } else {
                    if (!entry.isDir) {
                        zipOps.openEntry(tab, entry);
                    }
                }
            };
            
            // Context Menu
            tr.oncontextmenu = (e) => {
                State.contextEvent = e; // Important for selection start
                Menus.show(e, fullItem);
            };

            tbody.appendChild(tr);
        });
    },

    _formatSize(bytes) {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    }
};