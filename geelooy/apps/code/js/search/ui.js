
// B"H
import { Tabs } from '../tabs/index.js';

export const SearchUI = {
    renderResultItem(container, item, matchType, snippet, originalQuery, onSelect) {
        const el = document.createElement('div');
        el.className = 'search-result-item';
        
        const icon = item.kind === 'directory' ? 'folder' : 'file';
        let snippetHtml = '';
        const regex = new RegExp(`(${this._escapeRegExp(originalQuery)})`, 'gi');
        
        // B"H - Path Highlighting Ritual
        const highlightedPath = item.path.replace(regex, '<span class="result-match-highlight">$1</span>');
        
        if (matchType === 'content' && snippet) {
            // XSS Prevention Ritual
            const sanitizer = document.createElement('div');
            sanitizer.textContent = snippet;
            const escaped = sanitizer.innerHTML;
            
            const highlighted = escaped.replace(regex, '<span class="result-match-highlight">$1</span>');
            snippetHtml = `<div class="result-snippet">...${highlighted}...</div>`;
        }

        el.innerHTML = `
            <div class="result-header">
                <svg class="svg-icon"><use href="#icon-${icon}"></use></svg>
                <span class="result-name">${item.name}</span>
            </div>
            <div class="result-path">${highlightedPath}</div>
            ${snippetHtml}
        `;
        
        el.onclick = () => {
            Tabs.create(item);
            if (onSelect) onSelect();
        };
        
        container.appendChild(el);
    },

    _escapeRegExp(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
    },

    updateScopeDisplay(scopeDisplay, currentScopeItem, onClear) {
        if (currentScopeItem) {
            scopeDisplay.innerHTML = `
                Scope: <strong style="color:var(--neon-cyan);">${currentScopeItem.name}</strong> 
                <span id="search-clear-scope" style="cursor:pointer; color:var(--color-accent-danger); margin-left:10px; font-weight:bold; padding:2px 5px; border:1px solid; border-radius:4px;" title="Clear Scope">×</span>
            `;
            const clearBtn = document.getElementById('search-clear-scope');
            if (clearBtn) clearBtn.onclick = (e) => { e.stopPropagation(); onClear(); };
        } else {
            scopeDisplay.textContent = "Scope: All Workspaces";
        }
    }
};
