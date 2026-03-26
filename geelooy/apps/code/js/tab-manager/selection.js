
// B"H
import { TMState } from './state.js';
import { State } from '../state.js';
import { Tabs } from '../tabs/index.js';

export const TMSelection = {
    toggle(tabId, overlay, renderGrid) {
        if (TMState.selectedTabIds.has(tabId)) TMState.selectedTabIds.delete(tabId); 
        else TMState.selectedTabIds.add(tabId); 
        this.updateUI(overlay); 
    },
    
    updateUI(overlay) { 
        document.getElementById('tm-selection-count').textContent = `${TMState.selectedTabIds.size} Selected`; 
        overlay.gridContainer.querySelectorAll('.tm-card').forEach(c => c.classList.toggle('selected', TMState.selectedTabIds.has(Number(c.dataset.tabId)))); 
    },
    
    enter(overlay, renderGrid) { 
        TMState.isSelectionMode = true; 
        overlay.element.classList.add('selection-mode'); 
        overlay.selectionBar.classList.remove('hidden'); 
        this.updateUI(overlay); 
        renderGrid(); 
    },
    
    exit(overlay, renderGrid) { 
        TMState.isSelectionMode = false; 
        TMState.selectedTabIds.clear(); 
        overlay.element.classList.remove('selection-mode'); 
        overlay.selectionBar.classList.add('hidden'); 
        renderGrid(); 
    },
    
    selectAll(overlay) { 
        State.tabs.forEach(t => TMState.selectedTabIds.add(t.id)); 
        this.updateUI(overlay); 
    },
    
    async closeSelected(overlay, renderGrid) { 
        for (const id of Array.from(TMState.selectedTabIds)) await Tabs.close(id, true); 
        this.exit(overlay, renderGrid); 
    }
};
