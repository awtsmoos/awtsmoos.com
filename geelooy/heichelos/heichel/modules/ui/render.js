// /heichelos/heichel/modules/ui/render.js
// B"H
import { DOMElements } from '../dom.js';
import { showContextMenu } from '../contextmenu.js';
import { getItemKey } from '../../state.js';
import * as api from '../../api.js';

export function notify(message, type='info', duration=4000) {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    DOMElements.toastContainer.appendChild(toast);
    setTimeout(() => toast.remove(), duration);
}

export function updateHeichelHeader(heichelData) {
    if (!DOMElements.mainTitle || !DOMElements.sidebarTitle || !DOMElements.sidebarDesc) {
        console.error("DOM missing for header update");
        return;
    }
    document.title = `Heichel | ${heichelData.name || 'Loading...'}`;
    DOMElements.mainTitle.textContent = heichelData.name || 'Unnamed Heichel';
    DOMElements.sidebarTitle.textContent = `About: ${heichelData.name || ''}`;
    DOMElements.sidebarDesc.textContent = heichelData.description || 'No description provided.';
}

export function renderBreadcrumb(breadcrumbData, navigator) {
    const container = DOMElements.breadcrumbContainer;
    container.innerHTML = '';
    const pathItems = (breadcrumbData || []).reverse();
    if (pathItems.length <= 1) {
        container.classList.add("hidden");
        return;
    }
    container.classList.remove("hidden");
    container.innerHTML = pathItems.map(item => `<a href="#" data-series-id="${item.id}">${item.name || "Unnamed"}</a>`).join('<span class="crumb-separator">/</span>');
    container.querySelectorAll('a').forEach(a => {
        a.onclick = e => {
            e.preventDefault();
            navigator.navigateTo(e.target.dataset.seriesId);
        };
    });
}

export async function renderSeriesInfo(seriesData, heichelGlobal, currentSeriesId) {
    if (currentSeriesId !== 'root' && seriesData && seriesData.prateem) {
        DOMElements.sidebarTitle.textContent = seriesData.prateem.name || 'Unnamed Series';
        DOMElements.sidebarDesc.innerHTML = (seriesData.prateem.description && seriesData.prateem.description !== 'undefined') ? seriesData.prateem.description : "";
        var auth = seriesData.prateem.owner || seriesData.prateem.author;
        DOMElements.authorName.innerHTML = auth ? `<a href="/@${auth}">@${auth}</a>` : 'Unknown Author';
        DOMElements.editorsSection.classList.add("hidden");
        DOMElements.sidebarTitle.classList.remove("hidden");
    } else {
        try { DOMElements.editorsSection.classList.remove("hidden"); } catch(e){}
        DOMElements.sidebarTitle.textContent = heichelGlobal?.name || "";
        DOMElements.sidebarDesc.innerHTML = heichelGlobal?.description || "";
        DOMElements.sidebarTitle.classList.add("hidden");
        var auth = heichelGlobal?.owner || heichelGlobal?.author;
        DOMElements.authorName.innerHTML = auth ? `<a href="/@${auth}">@${auth}</a>` : 'Unknown Owner';
        
        let editors = await api.getEditors(heichelGlobal?.id);
        if(!Array.isArray(editors)) editors = [];
        
        DOMElements.editorHolder.innerHTML = "";
        editors.forEach(ed => {
            var edit = document.createElement("a");
            edit.innerText = "@" + ed;
            edit.href = "/@" + ed;
            DOMElements.editorHolder.appendChild(edit);
        });
        const numEl = document.getElementById('editorNum');
        if(numEl) numEl.innerText = editors.length;
    }
}

export function renderContentGrids(seriesDetails, navigator, appState) {
    renderGrid(DOMElements.postsList, seriesDetails.posts || [], 'post', appState.currentSeries, navigator, appState);
    renderGrid(DOMElements.seriesList, seriesDetails.subSeries || [], 'series', appState.currentSeries, navigator, appState);
}

function renderGrid(container, items, type, parentId, navigator, appState) {
    container.innerHTML = "";
    if (!items || items.length === 0) {
        container.innerHTML = `<p class="empty-message">No ${type}s found in this expanse.</p>`;
        return;
    }
    items.forEach((item, idx) => {
        const data = item;
        const id = item.id || item.postId;
        if (!data || !id) return;

        const wrapper = document.createElement('div');
        wrapper.className = 'card-wrapper';
        wrapper.dataset.id = id;
        wrapper.dataset.type = type;
        wrapper.dataset.parent = parentId;

        if (appState.ownsIt) wrapper.draggable = true;

        if (appState.isSelectionMode) {
            const key = getItemKey({ id, type });
            if (appState.selectedItems.has(key)) wrapper.classList.add('selected');
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
            if (e.target.closest('.context-menu-icon')) return;
            handleCardClick({ id, type, idx, parentId }, navigator, appState);
        });

        if (appState.ownsIt) {
            wrapper.querySelector('.context-menu-icon')?.addEventListener('click', (e) => {
                e.stopPropagation();
                showContextMenu(e.currentTarget, { id, type, parentId, title }, navigator);
            });
        }
        container.appendChild(wrapper);
    });
}

function handleCardClick(item, navigator, appState) {
    if (appState.isSelectionMode) {
        import('./controls.js').then(m => m.toggleItemSelection(item, appState));
    } else {
        if (item.type === 'series') {
            navigator.navigateTo(item.id);
        } else {
            window.location.href = `/heichelos/${appState.heichelId}/series/${item.parentId}/${item.idx}`;
        }
    }
}

export function showLoading() {
    [DOMElements.loadingPosts, DOMElements.loadingSeries].forEach(el => el?.classList.remove('hidden'));
    [DOMElements.postsList, DOMElements.seriesList].forEach(el => el.innerHTML = '');
}
export function hideLoading() {
    [DOMElements.loadingPosts, DOMElements.loadingSeries].forEach(el => el?.classList.add('hidden'));
}

export function updateActiveTab(view, appState) {
    const isPosts = view === 'posts';
    DOMElements.postsTab.classList.toggle('Active', isPosts);
    DOMElements.seriesTab.classList.toggle('Active', !isPosts);
    DOMElements.postsContainer.classList.toggle('hidden', !isPosts);
    DOMElements.seriesContainer.classList.toggle('hidden', isPosts);
    DOMElements.seriesControlsContainer.classList.toggle("hidden", isPosts);
    DOMElements.postsControls.classList.toggle("hidden", !isPosts);
}