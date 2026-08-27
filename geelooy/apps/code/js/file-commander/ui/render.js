
// B"H
import { State } from '../../state.js';
import { Menus } from '../../menus/index.js';
import { Tabs } from '../../tabs/index.js';
import { SelectionManager } from '../../selection-manager.js';
import { getItemUniquePath } from '../../workspaces/utils.js';

export const FCGridRender = {
    render(grid, currentFiles, currentPathItem, viewMode, navigateFn) {
        grid.innerHTML = '';
        currentFiles.forEach(file => {
            const itemEl = document.createElement('div');
            itemEl.className = 'fc-item';
            const isDir = file.kind === 'directory';
            let icon = isDir ? 'folder' : 'file';
            
            if (currentPathItem.kind === 'root') {
                 if (file.type === 'github') icon = 'github';
                 else if (file.type === 'local') icon = 'laptop';
                 else if (file.type === 'ssh') icon = 'ssh';
                 else if (file.type === 'indexeddb') icon = 'brain';
                 else if (file.type === 'opfs') icon = 'save';
                 else if (file.type === 'relay') icon = 'laptop'; // B"H - Added relay icon logic
            }
            
            let sizeStr = isDir ? '--' : this._formatSize(file.size);
            let dateStr = file.lastModified ? new Date(file.lastModified).toLocaleDateString() : '--';

            if (viewMode === 'grid') {
                itemEl.innerHTML = `<div class="fc-icon"><svg class="svg-icon"><use href="#icon-${icon}"></use></svg></div><div class="fc-name">${file.name}</div>`;
            } else {
                itemEl.innerHTML = `<div class="fc-col-name"><svg class="svg-icon"><use href="#icon-${icon}"></use></svg><span>${file.name}</span></div><div class="fc-col-size">${sizeStr}</div><div class="fc-col-date">${dateStr}</div>`;
            }

            const fullItem = { ...currentPathItem, ...file };
            const uniquePath = getItemUniquePath(fullItem);
            
            State.domItemMap.set(uniquePath, { el: itemEl, item: fullItem });
            if (State.selectedItems.has(uniquePath)) itemEl.classList.add('selected');

            itemEl.onclick = (e) => {
                if (State.isSelectionModeActive || e.ctrlKey || e.metaKey) {
                    State.contextEvent = e;
                    SelectionManager.toggle(fullItem);
                    return;
                }
                if (isDir) navigateFn(fullItem); else Tabs.create(fullItem);
            };
            itemEl.oncontextmenu = (e) => { State.contextEvent = e; Menus.show(e, fullItem); };
            grid.appendChild(itemEl);
        });
    },

    _formatSize(bytes) {
        if (!bytes) return '0 B';
        const k = 1024, sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    }
};
