// /heichelos/heichel/modules/ui/controls.js
// B"H
import { DOMElements } from '../dom.js';
import { openModal } from '../modal.js';
import * as api from '../../api.js';
import { notify } from './render.js';
import { getItemKey } from '../../state.js';

export function renderOwnerControls(breadcrumb, navigator, appState) {
    DOMElements.postsControls.innerHTML = '';
    DOMElements.seriesControlsContainer.innerHTML = '';
    DOMElements.seriesControls.innerHTML = '';

    if (appState.ownsIt) {
        const addPostBtn = createButton('Add New Post', () => {
            window.open(`/heichelos/${appState.heichelId}/submit?parentSeriesId=${appState.currentSeries}`, '_blank');
        });
        DOMElements.postsControls.appendChild(addPostBtn);

        const addSeriesBtn = createButton('Add New Series', () => openModal('series', navigator));
        DOMElements.seriesControlsContainer.appendChild(addSeriesBtn);
        
        const selectBtn = createButton('Select Items', () => toggleSelectionMode(!appState.isSelectionMode, navigator, appState));
        selectBtn.style.display="none"; // Initially hidden until content checked in rendering update

        if(appState.currentSeries == "root") {
             var addEditorBtn = createButton("Add New Editor", async () => {
                var editorNm = await window.AwtsmoosPrompt.go({ headerTxt: "Enter Editor ID" });
                if(!editorNm || !editorNm.length) {
                    await window.AwtsmoosPrompt.go({ headerTxt: "Canceled", isAlert: true });
                    return;
                }
                await api.addEditor({
                    heichelId: appState.heichelData.id,
                    aliasId:  window.curAlias,
                    editorAliasId: editorNm
                });
            });
            DOMElements.seriesControlsContainer.appendChild(addEditorBtn);
        }
        
        DOMElements.seriesControlsContainer.appendChild(selectBtn);
        
        if (appState.currentSeries !== 'root') {
            const editBtn = createButton('Edit Series', () => openModal('series', navigator, { mode: 'edit', seriesId: appState.currentSeries, title: breadcrumb[breadcrumb.length - 1]?.name || '' }));
            const deleteBtn = createButton('Delete This Series', () => {
                const parentItem = breadcrumb.length > 1 ? breadcrumb[breadcrumb.length - 2] : { id: 'root' };
                navigator.deleteSingleItem({
                    id: appState.currentSeries,
                    type: 'series',
                    parentId: parentItem.id
                });
            }, 'danger');
            DOMElements.seriesControls.append(editBtn, deleteBtn);
        }
    } else {
         DOMElements.controlsArea.classList.add("hidden");
    }
}

function createButton(text, onClick, className='') {
    const btn = document.createElement('button');
    btn.textContent = text;
    if (className) btn.classList.add(className);
    btn.onclick = (e) => { e.preventDefault(); onClick(); };
    return btn;
}

export function toggleSelectionMode(isActive, navigator, appState) {
    appState.isSelectionMode = isActive;
    document.querySelector('.heichel-page-container').classList.toggle('selection-mode-active', isActive);
    
    // Attempt to find the select button globally or query it (fragile but preserved from original logic)
    const btns = document.querySelectorAll('button');
    const selectBtn = Array.from(btns).find(b => b.textContent === 'Select Items' || b.textContent === 'Cancel Selection');
    if(selectBtn) selectBtn.textContent = isActive ? 'Cancel Selection' : 'Select Items';

    if (!isActive) {
        clearAllSelections(appState);
    }
}

export function toggleItemSelection(item, appState) {
    const cardWrapper = document.querySelector(`.card-wrapper[data-id="${item.id}"][data-type="${item.type}"]`);
    if (!cardWrapper) return;

    const key = getItemKey(item);
    if (appState.selectedItems.has(key)) {
        appState.selectedItems.delete(key);
        cardWrapper.classList.remove('selected');
    } else {
        const title = cardWrapper.querySelector('h2')?.textContent || 'Unnamed Item';
        appState.selectedItems.set(key, { ...item, title });
        cardWrapper.classList.add('selected');
    }

    const count = appState.selectedItems.size;
    DOMElements.selectionCount.textContent = `${count} selected`;
    DOMElements.bulkActionsBar.classList.toggle('visible', count > 0);
}

function clearAllSelections(appState) {
    document.querySelectorAll('.card-wrapper.selected').forEach(el => el.classList.remove('selected'));
    appState.selectedItems.clear();
    DOMElements.selectionCount.textContent = '0 selected';
    DOMElements.bulkActionsBar.classList.remove('visible');
}
