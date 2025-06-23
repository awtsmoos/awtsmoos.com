// /heichelos/heichel/modules/ui.js
// B"H - The World of Forms. Renders the UI based on state. Corrected and enhanced.
import {DOMElements} from './dom.js';
import {appState, getItemKey} from '../state.js';
import {showContextMenu} from './contextmenu.js';
import {openModal} from './modal.js';

let navigatorInstance;
var heichelGlobal;
var global = {};
export function updateStaticHeichelInfo(heichelData) {
    heichelGlobal = heichelData;
    if (!DOMElements.mainTitle || !DOMElements.sidebarTitle || !DOMElements.sidebarDesc) {
        console.error("Cannot update static heichel info because one or more required DOM elements are missing.");
        return;
    }
    document.title = `Heichel | ${heichelData.name || 'Loading...'}`;
    DOMElements.mainTitle.textContent = heichelData.name || 'Unnamed Heichel';
    DOMElements.sidebarTitle.textContent = `About: ${heichelData.name || ''}`;
    DOMElements.sidebarDesc.textContent = heichelData.description || 'No description provided.';
}

export function notify(message, type='info', duration=4000) {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    DOMElements.toastContainer.appendChild(toast);
    const removeToast = () => {
        toast.remove();
    }
    ;
    setTimeout(removeToast, duration);
}

export function renderBreadcrumb(breadcrumbData, navigator) {
    if (!navigatorInstance)
        navigatorInstance = navigator;
    const container = DOMElements.breadcrumbContainer;
    container.innerHTML = '';
    const pathItems = (breadcrumbData || []).reverse();
    if (pathItems.length <= 1) {
        container.classList.add("hidden");
        return;
    }
    container.classList.remove("hidden");
    container.innerHTML = pathItems.map(item => `<a href="#" data-series-id="${item.id}">${item.name || "Unnamed"}</a>`).join('<span> / </span>');
    container.querySelectorAll('a').forEach(a => {
        a.onclick = e => {
            e.preventDefault();
            navigatorInstance.navigateTo(e.target.dataset.seriesId);
        }
        ;
    }
    );
}

export function renderSeriesInfo(seriesData) {
    if (appState.currentSeries !== 'root' && seriesData) {
        DOMElements.sidebarTitle.textContent = seriesData.name || 'Unnamed Series';
        DOMElements.sidebarDesc.innerHTML = (seriesData.description && seriesData.description !== 'undefined') ? seriesData.description : "";
        var auth = seriesData.author
        DOMElements.authorName.innerHTML = `<a href="/@${auth}">@${auth}</a>`
    } else {
        DOMElements.sidebarTitle.textContent = heichelGlobal?.name || "";
        DOMElements.sidebarDesc.innerHTML = heichelGlobal?.description || "";
        var auth = heichelGlobal?.author
        DOMElements.authorName.innerHTML = `<a href="/@${auth}">@${auth}</a>`
    }
}

export function renderOwnerControls(breadcrumb, navigator) {
    if (!navigatorInstance)
        navigatorInstance = navigator;
    DOMElements.postsControls.innerHTML = '';
    DOMElements.seriesControlsContainer.innerHTML = '';
    DOMElements.seriesControls.innerHTML = '';

    if (appState.ownsIt) {
        const addPostBtn = createButton('Add New Post', () => {
            if (appState.currentSeries === 'root')
                return notify('Cannot add posts to root. Enter a series first.', 'info');
            // This behavior of opening a new page is preserved from your code.
            window.open(`/heichelos/${appState.heichelId}/submit?parentSeriesId=${appState.currentSeries}`, '_blank');
        }
        );
        DOMElements.postsControls.appendChild(addPostBtn);

        const addSeriesBtn = createButton('Add New Series', () => openModal('series', navigator));
        DOMElements.seriesControlsContainer.appendChild(addSeriesBtn);
        const selectBtn = createButton('Select Items', () => ui.toggleSelectionMode(!appState.isSelectionMode, navigator));
        global.selectBtn = selectBtn;
        DOMElements.seriesControlsContainer.appendChild(selectBtn);
        
        if (appState.currentSeries !== 'root') {
            const editBtn = createButton('Edit Series', () => notify('Editing series details is not yet implemented.', 'info'));
            const deleteBtn = createButton('Delete This Series', () => {
                const parentItem = breadcrumb.length > 1 ? breadcrumb[breadcrumb.length - 2] : {
                    id: 'root'
                };
                navigator.deleteSingleItem({
                    id: appState.currentSeries,
                    type: 'series',
                    parentId: parentItem.id
                });
            }
            , 'danger');
            DOMElements.seriesControls.append(editBtn, deleteBtn);
        }
    }
}

export function renderContentGrids(seriesDetails, navigator) {
    if (!navigatorInstance)
        navigatorInstance = navigator;
    renderGrid(DOMElements.postsList, seriesDetails.posts || [], 'post', appState.currentSeries);
    renderGrid(DOMElements.seriesList, seriesDetails.subSeries || [], 'series', appState.currentSeries);
}

function renderGrid(container, items, type, parentId) {
    container.innerHTML = "";
    if (!items || items.length === 0) {
        container.innerHTML = `<p class="empty-message">No ${type}s found in this expanse.</p>`;
        return;
    }
    items.forEach((item, idx) => {
        const data = (type === "post") ? item : item.prateem;
        const id = item.id || item.postId;
        if (!data || !id)
            return;

        const wrapper = document.createElement('div');
        wrapper.className = 'card-wrapper';
        wrapper.dataset.id = id;
        wrapper.dataset.type = type;
        wrapper.dataset.parent = parentId;

        if (appState.ownsIt)
            wrapper.draggable = true;

        if (appState.isSelectionMode) {
            const key = getItemKey({
                id,
                type
            });
            if (appState.selectedItems.has(key))
                wrapper.classList.add('selected');
        }

        const title = data.name || data.title || "Unnamed";
        const description = (type === 'post') ? (data.content || "") : ((data.description && data.description !== 'undefined') ? data.description : "");
        const contextMenuHTML = appState.ownsIt ? `<div class="context-menu-icon" title="Actions">⋮</div>` : '';

        wrapper.innerHTML = `
            ${contextMenuHTML}
            <div class="post-card ${type}">
                <h2>${title}</h2>
                <div class="post-preview">${description.substring(0, 150)}${description.length > 150 ? '...' : ''}</div>
            </div>
        `;

        wrapper.addEventListener('click', (e) => {
            if (e.target.closest('.context-menu-icon'))
                return;
            handleCardClick({
                id,
                type,
                idx,
                parentId
            });
        }
        );

        if (appState.ownsIt) {
            wrapper.querySelector('.context-menu-icon')?.addEventListener('click', (e) => {
                e.stopPropagation();
                showContextMenu(e.currentTarget, {
                    id,
                    type,
                    parentId,
                    title
                }, navigatorInstance);
            }
            );
        }
        container.appendChild(wrapper);
    }
    );
}

export function showLoading() {
    [DOMElements.loadingPosts, DOMElements.loadingSeries].forEach(el => el?.classList.remove('hidden'));
    [DOMElements.postsList, DOMElements.seriesList].forEach(el => el.innerHTML = '');
}
export function hideLoading() {
    [DOMElements.loadingPosts, DOMElements.loadingSeries].forEach(el => el?.classList.add('hidden'));
}
export function updateActiveTab(view) {
    const isPosts = view === 'posts';
    
    // Update tab button styles
    DOMElements.postsTab.classList.toggle('Active', isPosts);
    DOMElements.seriesTab.classList.toggle('Active', !isPosts);
    
    // FIX: Use the updated DOMElements properties to toggle the view containers
    DOMElements.postsContainer.classList.toggle('hidden', !isPosts);
    DOMElements.seriesContainer.classList.toggle('hidden', isPosts);
    DOMElements.seriesControlsContainer.classList.toggle("hidden", isPosts)
    
    DOMElements.postsControls.classList.toggle("hidden", !isPosts)
    
    // Determine if the "Select Items" button should be visible
    const container = isPosts ? DOMElements.postsList : DOMElements.seriesList;
    // The optional chaining (?.) is crucial here in case the list is empty on load
    const hasContent = container?.querySelector('.card-wrapper');
    global?.selectBtn?.classList?.toggle?.('hidden', !(appState.ownsIt && hasContent));
}

function handleCardClick(item) {
    
    if (appState.isSelectionMode) {
        toggleItemSelection(item);
    } else {
        if (item.type === 'series') {
            navigatorInstance.navigateTo(item.id)
        } else {
            console.log(item)
            // Using parentId from the item object which is the current series ID.
            window.location.href = `/heichelos/${appState.heichelId}/series/${item.parentId}/${item.idx}`;
        }
    }
}
function createButton(text, onClick, className='') {
    const btn = document.createElement('button');
    btn.textContent = text;
    if (className)
        btn.classList.add(className);
    btn.onclick = (e) => {
        e.preventDefault();
        onClick();
    }
    ;
    return btn;
}

// --- SELECTION MODE UI LOGIC (CORRECTED) ---

export function toggleSelectionMode(isActive, navigator) {
    if (!navigatorInstance && navigator)
        navigatorInstance = navigator;
    appState.isSelectionMode = isActive;

    document.querySelector('.heichel-page-container').classList.toggle('selection-mode-active', isActive);
    global.selectBtn.textContent = isActive ? 'Cancel Selection' : 'Select Items';

    if (!isActive) {
        clearAllSelections();
        // This will also hide the bulk actions bar
    }
}

function toggleItemSelection(item) {
    const cardWrapper = document.querySelector(`.card-wrapper[data-id="${item.id}"][data-type="${item.type}"]`);
    if (!cardWrapper)
        return;

    const key = getItemKey(item);
    if (appState.selectedItems.has(key)) {
        appState.selectedItems.delete(key);
        cardWrapper.classList.remove('selected');
    } else {
        // We need the full title for the delete confirmation, so let's get it.
        const title = cardWrapper.querySelector('h2')?.textContent || 'Unnamed Item';
        appState.selectedItems.set(key, {
            ...item,
            title
        });
        cardWrapper.classList.add('selected');
    }

    // Update the count and visibility of the bulk actions bar
    const count = appState.selectedItems.size;
    DOMElements.selectionCount.textContent = `${count} selected`;
    DOMElements.bulkActionsBar.classList.toggle('visible', count > 0);
}

function clearAllSelections() {
    document.querySelectorAll('.card-wrapper.selected').forEach(el => el.classList.remove('selected'));
    appState.selectedItems.clear();
    DOMElements.selectionCount.textContent = '0 selected';
    DOMElements.bulkActionsBar.classList.remove('visible');
    // Explicitly hide the bar
}
