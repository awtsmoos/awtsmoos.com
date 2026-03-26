
// B"H
import { Tabs } from '../tabs/index.js';

export const SearchUI = {
    renderResultItem(container, item, matchType, snippet, originalQuery, onSelect) {
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
            if (onSelect) onSelect();
        };
        
        container.appendChild(el);
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
