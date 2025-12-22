// B"H
// FILE: js/search-system.js

import { State } from './state.js';
import { UI } from './ui.js';
import { FileSystemProvider } from './fs-provider.js';
import { Tabs } from './tabs.js';
import { getItemUniquePath } from './workspaces.js';

export const SearchSystem = {
    overlay: null,
    input: null,
    resultsContainer: null,
    contentToggle: null,
    scopeDisplay: null,
    searchButton: null,
    
    currentScopeItem: null,
    isSearching: false,
    stopSearchFlag: false,

    init() {
        this.overlay = document.getElementById('search-overlay');
        this.input = document.getElementById('global-search-input');
        this.resultsContainer = document.getElementById('search-results');
        this.contentToggle = document.getElementById('search-content-toggle');
        this.scopeDisplay = document.getElementById('search-scope-display');
        this.searchButton = document.getElementById('global-search-btn');
        
        if (!this.overlay) return;

        document.getElementById('sidebar-search-btn').onclick = () => this.show();
        document.getElementById('search-close-btn').onclick = () => this.hide();
        this.searchButton.onclick = () => {
            if (this.isSearching) this.stopSearch();
            else this.performSearch();
        };
        
        this.input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') this.performSearch();
        });
        
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.overlay.classList.contains('visible')) {
                this.hide();
            }
        });
    },

    show(scopeItem = null) {
        this.currentScopeItem = scopeItem;
        this._updateScopeDisplay();
        
        this.input.value = '';
        this.resultsContainer.innerHTML = '<div class="search-empty">Enter query...</div>';
        
        this.overlay.classList.remove('hidden');
        void this.overlay.offsetWidth;
        this.overlay.classList.add('visible');
        this.input.focus();
    },
    
    _updateScopeDisplay() {
        if (this.currentScopeItem) {
            this.scopeDisplay.innerHTML = `Scope: <strong>${this.currentScopeItem.name}</strong> <span id="search-clear-scope" style="cursor:pointer; color:var(--color-accent-danger); margin-left:5px; font-weight:bold;">(×)</span>`;
            
            // Re-bind clear event since we rewrote innerHTML
            const clearBtn = document.getElementById('search-clear-scope');
            if (clearBtn) {
                clearBtn.onclick = (e) => {
                    e.stopPropagation();
                    this.currentScopeItem = null;
                    this._updateScopeDisplay();
                };
            }
        } else {
            this.scopeDisplay.textContent = "Scope: All Workspaces";
        }
    },

    hide() {
        if (this.isSearching) this.stopSearch();
        this.overlay.classList.remove('visible');
        setTimeout(() => this.overlay.classList.add('hidden'), 200);
    },

    stopSearch() {
        this.stopSearchFlag = true;
    },

    async performSearch() {
        const query = this.input.value.trim();
        if (!query) return;
        
        this.isSearching = true;
        this.stopSearchFlag = false;
        this.searchButton.textContent = 'Stop';
        this.searchButton.classList.add('danger');
        
        const searchContent = this.contentToggle.checked;
        this.resultsContainer.innerHTML = '';
        
        const lowerQuery = query.toLowerCase();
        let matchCount = 0;

        try {
            const countDiv = document.createElement('div');
            countDiv.style.padding = "5px 15px";
            countDiv.style.fontSize = "0.8em";
            countDiv.style.color = "var(--neon-cyan)";
            countDiv.textContent = "Searching...";
            this.resultsContainer.appendChild(countDiv);

            let roots = [];
            if (this.currentScopeItem) {
                roots = [this.currentScopeItem];
            } else {
                roots = State.workspaces.map(ws => ({ ...ws, path: '/', kind: 'directory', workspaceId: ws.id }));
            }

            for (const root of roots) {
                if (this.stopSearchFlag) break;
                await this._searchRecursive(root, lowerQuery, searchContent, (item, matchType, snippet) => {
                    matchCount++;
                    countDiv.textContent = `${matchCount} result(s) found...`;
                    this.renderResultItem(item, matchType, snippet, query);
                });
            }
            
            if (this.stopSearchFlag) {
                countDiv.textContent = `${matchCount} result(s) (Stopped)`;
            } else {
                countDiv.textContent = matchCount === 0 ? "No matches found." : `${matchCount} result(s) (Complete)`;
            }

        } catch (e) {
            this.resultsContainer.insertAdjacentHTML('afterbegin', `<div class="search-empty" style="color:var(--color-accent-danger)">Error: ${e.message}</div>`);
        } finally {
            this.isSearching = false;
            this.searchButton.textContent = 'Search';
            this.searchButton.classList.remove('danger');
        }
    },

    async _searchRecursive(item, query, searchContent, onFound) {
        if (this.stopSearchFlag) return;

        let children = [];
        try {
            // B"H - Optimized List Fetching for supported types
            if (['github', 'local', 'indexeddb', 'opfs'].includes(item.type)) {
                children = await FileSystemProvider.listAllFiles(item);
                // listAllFiles returns a flat array of files, so we iterate differently than a tree walk
                
                const chunkSize = 50;
                for (let i = 0; i < children.length; i += chunkSize) {
                    if (this.stopSearchFlag) return;
                    const chunk = children.slice(i, i + chunkSize);
                    await new Promise(r => setTimeout(r, 0)); // Yield to UI

                    for (const child of chunk) {
                        if (this.stopSearchFlag) return;
                        
                        // Note: child from listAllFiles usually has full path relative to root
                        const fullChild = { ...item, ...child }; 
                        
                        if (child.name.toLowerCase().includes(query)) {
                            onFound(fullChild, 'filename', null);
                        } else if (searchContent) {
                            await this._checkContent(fullChild, query, onFound);
                        }
                    }
                }
                return; // Done with this provider
            } 
            
            // Fallback for other types (ssh, osfolder, etc.)
            children = await FileSystemProvider.list(item);
        } catch (e) {
            console.warn("Search list failed for", item.name, e);
            return;
        }

        const chunkSize = 50;
        for (let i = 0; i < children.length; i += chunkSize) {
            if (this.stopSearchFlag) return;
            const chunk = children.slice(i, i + chunkSize);
            await new Promise(r => setTimeout(r, 0));

            for (const child of chunk) {
                if (this.stopSearchFlag) return;
                const fullChild = { ...item, ...child };
                
                if (child.name.toLowerCase().includes(query)) {
                    onFound(fullChild, 'filename', null);
                } 
                else if (searchContent && child.kind === 'file') {
                    await this._checkContent(fullChild, query, onFound);
                }

                if (child.kind === 'directory') {
                    await this._searchRecursive(fullChild, query, searchContent, onFound);
                }
            }
        }
    },
    
    async _checkContent(item, query, onFound) {
        const ext = item.name.split('.').pop().toLowerCase();
        if (!['png','jpg','zip','mp4','mp3','exe','bin','pdf'].includes(ext)) {
            try {
                const content = await FileSystemProvider.read(item);
                if (typeof content === 'string' && content.toLowerCase().includes(query)) {
                    const idx = content.toLowerCase().indexOf(query);
                    const snippet = content.substring(Math.max(0, idx - 20), Math.min(content.length, idx + 40));
                    onFound(item, 'content', snippet);
                }
            } catch (e) {}
        }
    },

    renderResultItem(item, matchType, snippet, originalQuery) {
        const el = document.createElement('div');
        el.className = 'search-result-item';
        
        const icon = item.kind === 'directory' ? 'folder' : 'file';
        let snippetHtml = '';
        
        if (matchType === 'content' && snippet) {
            const regex = new RegExp(`(${originalQuery})`, 'gi');
            const highlighted = snippet.replace(regex, '<span class="result-match-highlight">$1</span>');
            snippetHtml = `<div class="result-snippet">...${highlighted}...</div>`;
        }

        el.innerHTML = `
            <div class="result-header">
                <svg class="svg-icon"><use href="#icon-${icon}"></use></svg>
                <span class="result-name">${item.name}</span>
            </div>
            <div class="result-path">${item.path}</div>
            ${snippetHtml}
        `;
        
        el.onclick = () => {
            Tabs.create(item);
            this.hide();
        };
        
        this.resultsContainer.appendChild(el);
    }
};