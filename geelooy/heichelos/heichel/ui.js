// B"H
// The world of forms, shaped by divine will. This module renders the UI.

import { appState, getItemKey } from './state.js';
import { generateInputId } from './api.js';

let heichelNavigator;
// FIX: Defer element selection until after DOM load
let modal, form, titleInput, descTextarea, idInput;

// --- Notification Toasts ---
export function notify(message, type = 'info', duration = 5000) {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), duration);
}

// --- Card & List Rendering ---
export function renderElements(items, container, type, parentId, navigator) {
    if (!heichelNavigator) heichelNavigator = navigator;
    container.innerHTML = "";
    if (!items || items.length === 0) {
        container.innerHTML = `<p class="empty-message">No ${type}s found in this expanse.</p>`;
        return;
    }
    items.forEach(item => {
        // ... (render logic as before) ...
        const data = (type === "post") ? item : item.prateem;
        const id = item.id || item.postId;
        if (!data || !id) return;
        const title = data[type === "post" ? "title" : "name"] || "Unnamed";
        const description = (type === 'post' ? data.content : data.description) || "";

        const wrapper = document.createElement('div');
        wrapper.className = 'card-wrapper';
        wrapper.dataset.id = id;
        wrapper.dataset.type = type;
        wrapper.dataset.parent = parentId;
        
        // Make draggable if owner
        if (appState.ownsIt) wrapper.draggable = true;

        const itemKey = getItemKey({ id, type });
        if (appState.isSelectionMode && appState.selectedItems.has(itemKey)) {
            wrapper.classList.add('selected');
        }

        const contextMenuHTML = appState.ownsIt ? `<div class="context-menu-icon" title="Actions">⋮</div>` : '';
        wrapper.innerHTML = `
            ${contextMenuHTML}
            <div class="post-card ${type}">
                <h2>${title}</h2>
                <div class="post-preview">${description.substring(0, 200)}${description.length > 200 ? '...' : ''}</div>
            </div>
        `;
        
        wrapper.addEventListener('click', () => handleCardClick({ id, type, parentId }));
        if (appState.ownsIt) {
            wrapper.querySelector('.context-menu-icon')?.addEventListener('click', (e) => {
                e.stopPropagation();
                showContextMenu(e.currentTarget, { id, type, parentId, title });
            });
        }
        container.appendChild(wrapper);
    });
}
// --- All other UI functions (selection, context menu, etc.) ---

// --- Drag and Drop (Restored Functionality) ---
let draggedItem = null;
let placeholder = null;

export function initializeDragAndDrop(container) {
    container.removeEventListener('dragstart', handleDragStart);
    container.addEventListener('dragstart', handleDragStart);
    // Add other listeners only when dragging
}
function handleDragStart(e) {
    if (e.target.classList.contains('card-wrapper')) {
        draggedItem = e.target;
        setTimeout(() => e.target.classList.add('dragging'), 0);
        
        placeholder = document.createElement('div');
        placeholder.className = 'placeholder card-wrapper'; // Give it same class for grid layout
        placeholder.style.height = `${draggedItem.offsetHeight}px`;
        
        const container = draggedItem.parentElement;
        container.addEventListener('dragover', handleDragOver);
        container.addEventListener('drop', handleDrop);
        container.addEventListener('dragend', handleDragEnd);
    }
}
function handleDragOver(e) {
    e.preventDefault();
    const overElement = e.target.closest('.card-wrapper:not(.placeholder)');
    if (overElement && overElement !== draggedItem) {
        const rect = overElement.getBoundingClientRect();
        const isAfter = e.clientY > rect.top + rect.height / 2;
        if(isAfter) overElement.parentElement.insertBefore(placeholder, overElement.nextSibling);
        else overElement.parentElement.insertBefore(placeholder, overElement);
    }
}
function handleDrop(e) {
    e.preventDefault();
    if (placeholder && placeholder.parentNode) {
        placeholder.parentNode.replaceChild(draggedItem, placeholder);
        // HERE YOU WOULD CALL THE API TO SAVE THE NEW ORDER
        const newOrder = [...draggedItem.parentElement.children].map(c => c.dataset.id).filter(Boolean);
        console.log("New visual order:", newOrder);
        notify('Visual order updated. Saving to server not yet implemented.', 'info');
    }
}
function handleDragEnd() {
    draggedItem?.classList.remove('dragging');
    draggedItem?.parentElement?.removeEventListener('dragover', handleDragOver);
    draggedItem?.parentElement?.removeEventListener('drop', handleDrop);
    draggedItem?.parentElement?.removeEventListener('dragend', handleDragEnd);
    placeholder?.remove();
    draggedItem = null;
    placeholder = null;
}
// END of Drag-and-Drop

// FIX: This function now correctly selects elements after DOM load
export function initializeModalListeners() {
    modal = document.getElementById('creation-modal');
    form = document.getElementById('creation-form');
    titleInput = document.getElementById('modal-input-title');
    descTextarea = document.getElementById('modal-input-description');
    idInput = document.getElementById('modal-input-id');

    document.getElementById('modal-cancel-btn').addEventListener('click', hideCreationModal);
    document.querySelector('.modal-backdrop').addEventListener('click', hideCreationModal);
    form.addEventListener('submit', handleFormSubmit);
}



// --- Selection Mode UI ---
export function toggleSelectionMode(isActive) {
    const heichelEl = document.querySelector('.heichel');
    const bulkBar = document.getElementById('bulk-actions-bar');
    const selectionBtn = document.getElementById('selectionModeBtn');
    
    appState.isSelectionMode = isActive;
    heichelEl.classList.toggle('selection-mode', isActive);
    
    if (isActive) {
        bulkBar.classList.add('visible');
        selectionBtn.textContent = 'Cancel Selection';
    } else {
        bulkBar.classList.remove('visible');
        selectionBtn.textContent = 'Select Items';
        clearAllSelections();
    }
}

function toggleItemSelection(item) {
    const cardWrapper = document.querySelector(`.card-wrapper[data-id="${item.id}"][data-type="${item.type}"]`);
    if (!cardWrapper) return;
    
    const key = getItemKey(item);
    
    if (appState.selectedItems.has(key)) {
        appState.selectedItems.delete(key);
        cardWrapper.classList.remove('selected');
    } else {
        appState.selectedItems.set(key, item);
        cardWrapper.classList.add('selected');
    }
    updateSelectionCount();
}

function clearAllSelections() {
    document.querySelectorAll('.card-wrapper.selected').forEach(el => el.classList.remove('selected'));
    appState.selectedItems.clear();
    updateSelectionCount();
}

function updateSelectionCount() {
    const countEl = document.getElementById('selection-count');
    countEl.textContent = `${appState.selectedItems.size} item${appState.selectedItems.size !== 1 ? 's' : ''} selected`;
}

// --- Context Menu UI ---
function showContextMenu(event, item) {
    closeContextMenu(); // Close any existing menus

    const menu = document.createElement('div');
    menu.id = 'context-menu';
    menu.className = 'context-menu';
    
    const actions = {
        'Edit': () => notify(`Editing "${item.title}" is not yet fully implemented.`),
        'Delete': () => heichelNavigator.deleteSingleItem(item),
        
        'Share': () => notify('Sharing is not yet implemented.')
    };
	
    if(item.type == "series") {
    
	    actions['Clear'] = () => heichelNavigator.clearSingleItem(item),
    }
    for(const [label, action] of Object.entries(actions)) {
        const menuItem = document.createElement('div');
        menuItem.className = 'context-menu-item';
        menuItem.textContent = label;
        menuItem.onclick = (e) => {
            e.stopPropagation();
            action();
            closeContextMenu();
        };
        menu.appendChild(menuItem);
    }

    document.body.appendChild(menu);
    menu.style.top = `${event.pageY}px`;
    menu.style.left = `${event.pageX}px`;

    setTimeout(() => document.body.addEventListener('click', closeContextMenu, { once: true }), 0);
}

function closeContextMenu() {
    document.getElementById('context-menu')?.remove();
}


let currentOnSubmit;

export function showCreationModal(type, onSubmit) {
    currentOnSubmit = onSubmit;
    form.reset();
    
    modalTitle.textContent = `Create New ${type.charAt(0).toUpperCase() + type.slice(1)}`;
    const isPost = type === 'post';
    descTextarea.labels[0].textContent = isPost ? "Content (Dayuh)" : "Description";
    idInput.parentElement.style.display = 'block';

    titleInput.onkeyup = () => { idInput.value = generateInputId(titleInput.value) };

    modal.classList.remove('modal-hidden');
    titleInput.focus();
}

function hideCreationModal() {
    modal.classList.add('modal-hidden');
}





// --- General UI ---
export function showLoading(section) {
    document.querySelector(`.loading${section}`).classList.remove('hidden');
    document.getElementById(`${section.toLowerCase()}List`).innerHTML = '';
}

export function hideLoading(section) {
     document.querySelector(`.loading${section}`).classList.add('hidden');
}

export function updateActiveTab(view) {
    const isPosts = view === 'posts';
    document.getElementById('postsTab').classList.toggle('Active', isPosts);
    document.getElementById('seriesTab').classList.toggle('Active', !isPosts);
    document.querySelector('.posts').classList.toggle('hidden', !isPosts);
    document.querySelector('.series').classList.toggle('hidden', isPosts);
    
    const hasContent = document.querySelector(`.${view} .grid-container`).children.length > 0;
    document.getElementById('selectionModeBtn').classList.toggle('hidden', !(appState.ownsIt && hasContent));
}

// --- Card Clicking ---
function handleCardClick(item) {
    if (appState.isSelectionMode) {
        toggleItemSelection(item);
    } else {
        if (item.type === 'series') {
            heichelNavigator.navigateTo(item.id);
        } else {
            window.location.href = `/heichelos/${appState.heichelId}/series/${item.parentId}/${item.id}`;
        }
    }
}



function handleFormSubmit(e) {
    e.preventDefault();
    if(titleInput.value.trim() === '') return notify('Title cannot be empty.', 'error');
    const data = {
        title: titleInput.value,
        description: descTextarea.value, 
        inputId: idInput.value || generateInputId(titleInput.value)
    };
    if (currentOnSubmit) currentOnSubmit(data);
    hideCreationModal();
}