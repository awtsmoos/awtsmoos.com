
// B"H
import { State } from '../state.js';
import { StatusBar } from '../statusbar.js';
import { Menus } from '../menus.js';

export const TabsRenderer = {
    render(container, TabsController) {
        if (!container) return;
        
        // Determine the targeted ID securely
        const safeActiveId = State.activeTabId;

        container.innerHTML = '';
        let draggedTabId = null;

        const sortedTabs = [...State.tabs].sort((a, b) => {
            if (a.pinned && !b.pinned) return -1;
            if (!a.pinned && b.pinned) return 1;
            return 0; 
        });

        sortedTabs.forEach((tab) => {
            const isActive = (tab.id === safeActiveId);
            const tabEl = this._createTabElement(tab, isActive, TabsController);
            this._setupDragEvents(tabEl, tab.id, (id) => draggedTabId = id, () => draggedTabId);
            container.appendChild(tabEl);
        });

        this._setupContainerDragEvents(container, () => draggedTabId, TabsController);

        if (!container.dataset.wheelBound) {
            container.addEventListener('wheel', (e) => {
                if (e.deltaY !== 0) {
                    e.preventDefault();
                    container.scrollLeft += e.deltaY;
                }
            }, { passive: false });
            container.dataset.wheelBound = "true";
        }

        StatusBar.update();
    },

    _createTabElement(tab, isActive, TabsController) {
        const tabEl = document.createElement('div');
        
        tabEl.className = `tab ${isActive ? 'active' : ''} ${tab.isDirty ? 'dirty' : ''} ${tab.isUncommitted ? 'uncommitted' : ''} ${tab.pinned ? 'pinned' : ''}`;
        tabEl.dataset.tabId = String(tab.id);
        
        // Find workspace with ultra-safe traversal to prevent null reference errors on 'id'
        const workspace = State.workspaces.find(ws => ws?.id === tab.item.workspaceId);
        const wsName = workspace ? workspace.name : 'System';
        tabEl.title = `${wsName} :: ${tab.item.path || tab.item.name}`;
        
        tabEl.draggable = true;
        
        if (tab.pinned) {
            const pinIcon = document.createElement('span');
            pinIcon.className = 'tab-pin-icon';
            pinIcon.innerHTML = '📌';
            tabEl.appendChild(pinIcon);
        }
        
        const tabName = document.createElement('span');
        tabName.className = 'tab-name';
        tabName.textContent = tab.item.name;

        const closeButton = document.createElement('button');
        closeButton.className = 'close-tab-btn';
        closeButton.innerHTML = `<svg viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>`;

        tabEl.appendChild(tabName);
        tabEl.appendChild(closeButton);
        
        tabEl.onclick = (e) => {
            if (e.target.closest('.close-tab-btn')) {
                e.stopPropagation();
                TabsController.close(tab.id);
            } else {
                TabsController.activate(tab.id);
            }
        };

        // B"H - IMPROVEMENT 6: Swift Closure (Double Click & Middle Click)
        tabEl.ondblclick = (e) => {
            e.stopPropagation();
            TabsController.close(tab.id);
        };

        tabEl.addEventListener('auxclick', (e) => {
            if (e.button === 1) { 
                e.preventDefault(); e.stopPropagation();
                TabsController.close(tab.id);
            }
        });

        tabEl.oncontextmenu = (e) => {
            Menus.showTabMenu(e, tab);
        };

        return tabEl;
    },

    _setupDragEvents(tabEl, tabId, setDraggedId, getDraggedId) { /* Drag remains clean */
        tabEl.addEventListener('dragstart', (e) => {
            setDraggedId(tabId);
            setTimeout(() => e.target.classList.add('dragging'), 0);
        });
        tabEl.addEventListener('dragend', (e) => {
            setDraggedId(null);
            e.target.classList.remove('dragging');
        });
    },

    _setupContainerDragEvents(container, getDraggedId, TabsController) {
        const getDragAfterElement = (container, x) => {
            const draggableElements = [...container.querySelectorAll('.tab:not(.dragging)')];
            return draggableElements.reduce((closest, child) => {
                const box = child.getBoundingClientRect();
                const offset = x - box.left - box.width / 2;
                if (offset < 0 && offset > closest.offset) {
                    return { offset: offset, element: child };
                } else {
                    return closest;
                }
            }, { offset: Number.NEGATIVE_INFINITY }).element;
        };

        container.addEventListener('dragover', (e) => {
            e.preventDefault();
            container.querySelectorAll('.drop-indicator').forEach(el => el.classList.remove('drop-indicator'));
            const afterElement = getDragAfterElement(container, e.clientX);
            if (afterElement) afterElement.classList.add('drop-indicator');
        });

        container.addEventListener('drop', (e) => {
            e.preventDefault();
            container.querySelectorAll('.drop-indicator').forEach(el => el.classList.remove('drop-indicator'));
            const draggedTabId = getDraggedId();
            if (draggedTabId === null) return;

            const afterElement = getDragAfterElement(container, e.clientX);
            const sourceIndex = State.tabs.findIndex(t => t.id === draggedTabId);
            if (sourceIndex < 0) return;
            
            const [draggedTab] = State.tabs.splice(sourceIndex, 1);
            
            let targetIndex;
            if (afterElement) {
                const targetTabId = Number(afterElement.dataset.tabId);
                targetIndex = State.tabs.findIndex(t => t.id === targetTabId);
            } else {
                targetIndex = State.tabs.length;
            }

            State.tabs.splice(targetIndex, 0, draggedTab);
            TabsController.render(); 
        });
    }
};
