// B"H
// FILE: js/search-system.js

import { State } from './state.js';
import { UI } from './ui.js';
import { FileSystemProvider } from './fs-provider.js';
import { Tabs } from './tabs.js';
import { getItemUniquePath } from './workspaces.js';

/**
 * --- SEARCH SYSTEM ---
 * The divine seeker. Allows finding files and content across workspaces,
 * with support for targeted scopes. B"H.
 */
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

    /**
     * Opens the search window, optionally focused on a folder.
     */
    show(scopeItem = null) {
        this.currentScopeItem = scopeItem;
        this._updateScopeDisplay();
        
        this.input.value = '';
        this.resultsContainer.innerHTML = '<div class="search-empty">Enter a query to seek truth...</div>';
        
        this.overlay.classList.remove('hidden');
        void this.overlay.offsetWidth;
        this.overlay.classList.add('visible');
        this.input.focus();
    },
    
    _updateScopeDisplay() {
        if (this.currentScopeItem) {
            this.scopeDisplay.innerHTML = `
                Scope: <strong style="color:var(--neon-cyan);">${this.currentScopeItem.name}</strong> 
                <span id="search-clear-scope" style="cursor:pointer; color:var(--color-accent-danger); margin-left:10px; font-weight:bold; padding:2px 5px; border:1px solid; border-radius:4px;" title="Clear Scope">×</span>
            `;
            
            const clearBtn = document.getElementById('search-clear-scope');
            if (clearBtn) {
                clearBtn.onclick = (e) => {
                    e.stopPropagation();
                    this.currentScopeItem = null;
                    this._updateScopeDisplay();
                    UI.showToast("Search scope cleared to Global.", "info");
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
        this.isSearching = false;
        this.searchButton.textContent = 'Search';
        this.searchButton.classList.remove('danger');
    },

    async performSearch() {
        const query = this.input.value.trim();
        if (!query) return;
        
        this.isSearching = true;
        this.stopSearchFlag = false;
        this.searchButton.textContent = 'Stop';
        this.searchButton.classList.add('danger');
        
        this.resultsContainer.innerHTML = '';
        const lowerQuery = query.toLowerCase();
        let matchCount = 0;

        try {
            const countDiv = document.createElement('div');
            countDiv.className = 'search-status-bar';
            countDiv.style.padding = "10px 15px";
            countDiv.style.fontSize = "0.9em";
            countDiv.style.color = "var(--neon-cyan)";
            countDiv.style.borderBottom = "1px solid var(--color-border)";
            countDiv.textContent = "Searching through the void...";
            this.resultsContainer.appendChild(countDiv);

            let roots = [];
            if (this.currentScopeItem) {
                roots = [this.currentScopeItem];
            } else {
                roots = State.workspaces.map(ws => ({ ...ws, path: '/', kind: 'directory', workspaceId: ws.id }));
            }

            for (const root of roots) {
                if (this.stopSearchFlag) break;
                await this._searchRecursive(root, lowerQuery, this.contentToggle.checked, (item, matchType, snippet) => {
                    matchCount++;
                    countDiv.textContent = `${matchCount} result(s) found...`;
                    this.renderResultItem(item, matchType, snippet, query);
                });
            }
            
            if (this.stopSearchFlag) {
                countDiv.textContent = `${matchCount} result(s) (Halted)`;
            } else {
                countDiv.textContent = matchCount === 0 ? "The search returned no essence." : `Total: ${matchCount} result(s)`;
            }

        } catch (e) {
            this.resultsContainer.insertAdjacentHTML('afterbegin', `<div class="search-empty" style="color:var(--color-accent-danger)">Error in search ritual: ${e.message}</div>`);
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
            // Optimized batch fetching for supported providers
            if (['github', 'local', 'indexeddb', 'opfs'].includes(item.type)) {
                children = await FileSystemProvider.listAllFiles(item);
                
                const chunkSize = 100;
                for (let i = 0; i < children.length; i += chunkSize) {
                    if (this.stopSearchFlag) return;
                    const chunk = children.slice(i, i + chunkSize);
                    await new Promise(r => setTimeout(r, 0)); // Yield to main thread

                    for (const child of chunk) {
                        if (this.stopSearchFlag) return;
                        const fullChild = { ...item, ...child }; 
                        
                        if (child.name.toLowerCase().includes(query)) {
                            onFound(fullChild, 'filename', null);
                        } else if (searchContent && child.kind === 'file') {
                            await this._checkContent(fullChild, query, onFound);
                        }
                    }
                }
                return; 
            } 
            
            // Sequential walk for others
            children = await FileSystemProvider.list(item);
        } catch (e) {
            console.warn("Search iteration failed:", item.name, e);
            return;
        }

        for (const child of children) {
            if (this.stopSearchFlag) return;
            const fullChild = { ...item, ...child };
            
            if (child.name.toLowerCase().includes(query)) {
                onFound(fullChild, 'filename', null);
            } else if (searchContent && child.kind === 'file') {
                await this._checkContent(fullChild, query, onFound);
            }

            if (child.kind === 'directory') {
                await this._searchRecursive(fullChild, query, searchContent, onFound);
            }
        }
    },
    
    async _checkContent(item, query, onFound) {
        const ext = item.name.split('.').pop().toLowerCase();
        // Skip binary data
        if (['png','jpg','zip','mp4','mp3','exe','bin','pdf','iso'].includes(ext)) return;
        
        try {
            const content = await FileSystemProvider.read(item);
            const text = (typeof content === 'string') ? content : (content instanceof Blob ? await content.text() : '');
            
            if (text.toLowerCase().includes(query)) {
                const idx = text.toLowerCase().indexOf(query);
                const snippet = text.substring(Math.max(0, idx - 30), Math.min(text.length, idx + 50));
                onFound(item, 'content', snippet);
            }
        } catch (e) {}
    },

    renderResultItem(item, matchType, snippet, originalQuery) {
        const el = document.createElement('div');
        el.className = 'search-result-item';
        
        const icon = item.kind === 'directory' ? 'folder' : 'file';
        let snippetHtml = '';
        
        if (matchType === 'content' && snippet) {
            const escaped = snippet.replace(/</g, '&lt;').replace(/>/g, '&gt;');
            const regex = new RegExp(`(${originalQuery})`, 'gi');
            const highlighted = escaped.replace(regex, '<span class="result-match-highlight">$1</span>');
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