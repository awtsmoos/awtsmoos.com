
// B"H
import { SearchEngine } from './engine.js';
import { SearchUI } from './ui.js';
import { UI } from '../ui.js';

export const SearchSystem = {
    overlay: null, input: null, resultsContainer: null, contentToggle: null, scopeDisplay: null, searchButton: null,
    currentScopeItem: null, isSearching: false, stopSearchFlag: false,

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
        
        this.input.addEventListener('keydown', (e) => { if (e.key === 'Enter') this.performSearch(); });
        document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && this.overlay.classList.contains('visible')) this.hide(); });
    },

    show(scopeItem = null) {
        this.currentScopeItem = scopeItem;
        SearchUI.updateScopeDisplay(this.scopeDisplay, this.currentScopeItem, () => {
            this.currentScopeItem = null;
            SearchUI.updateScopeDisplay(this.scopeDisplay, this.currentScopeItem, () => {});
            UI.showToast("Search scope cleared to Global.", "info");
        });
        
        this.input.value = '';
        this.resultsContainer.innerHTML = '<div class="search-empty">Enter a query to seek truth...</div>';
        
        this.overlay.classList.remove('hidden');
        void this.overlay.offsetWidth;
        this.overlay.classList.add('visible');
        this.input.focus();
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
        const countDiv = document.createElement('div');
        countDiv.className = 'search-status-bar';
        countDiv.style.padding = "10px 15px";
        countDiv.style.fontSize = "0.9em";
        countDiv.style.color = "var(--neon-cyan)";
        countDiv.style.borderBottom = "1px solid var(--color-border)";
        countDiv.textContent = "Searching through the void...";
        this.resultsContainer.appendChild(countDiv);

        const uiContext = {
            stopSearchFlag: false,
            onMatchFound: (count, item, type, snippet, q) => {
                countDiv.textContent = `${count} result(s) found...`;
                SearchUI.renderResultItem(this.resultsContainer, item, type, snippet, q, () => this.hide());
            },
            onSearchComplete: (count) => {
                if (this.stopSearchFlag) countDiv.textContent = `${count} result(s) (Halted)`;
                else countDiv.textContent = count === 0 ? "The search returned no essence." : `Total: ${count} result(s)`;
                this.isSearching = false;
                this.searchButton.textContent = 'Search';
                this.searchButton.classList.remove('danger');
            }
        };

        try {
            await SearchEngine.performSearch(uiContext, query, this.contentToggle.checked, this.currentScopeItem);
        } catch (e) {
            this.resultsContainer.insertAdjacentHTML('afterbegin', `<div class="search-empty" style="color:var(--color-accent-danger)">Error: ${e.message}</div>`);
            uiContext.onSearchComplete(0);
        }
    }
};
