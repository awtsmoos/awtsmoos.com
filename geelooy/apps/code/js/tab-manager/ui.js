
// B"H
import { State } from '../state.js';
import { TMState } from './state.js';
import { Tabs } from '../tabs/index.js';

export const TMUI = {
    createCard(tab, index, drag = true, onInteract, onContext) {
        const card = document.createElement('div');
        card.className = `tm-card ${tab.id === State.activeTabId ? 'active-tab' : ''} ${TMState.selectedTabIds.has(tab.id) ? 'selected' : ''} ${tab.pinned ? 'pinned' : ''}`;
        card.draggable = drag; card.dataset.tabId = tab.id;
        const iconMap = { 'text': 'file', 'image': 'eye', 'zip': 'save', 'html-preview': 'eye', 'console': 'laptop', 'commander': 'folder', 'vibe': 'brain', 'terminal': 'laptop' };
        let dot = tab.isDirty ? '<span class="tm-status-dot dirty"></span>' : tab.isUncommitted ? '<span class="tm-status-dot uncommitted"></span>' : '';
        card.innerHTML = `<div class="tm-card-header"><div class="tm-icon"><svg class="svg-icon"><use href="#icon-${iconMap[tab.fileType]||'file'}"></use></svg></div><div class="tm-info"><span class="tm-name">${dot}${tab.item.name}</span><span class="tm-path" title="${tab.item.path}">${tab.item.path || '/'}</span></div></div>`;
        card.onclick = () => onInteract(tab.id);
        card.oncontextmenu = (e) => { e.preventDefault(); onContext(e.clientX, e.clientY, tab.id); };
        return card;
    },

    showContextMenu(x, y, tabId, contextMenu) { 
        TMState.contextTargetTabId = tabId; 
        contextMenu.style.left = `${x}px`; 
        contextMenu.style.top = `${y}px`; 
        contextMenu.classList.remove('hidden'); 
    },
    
    hideContextMenu(contextMenu) { 
        contextMenu.classList.add('hidden'); 
    }
};
