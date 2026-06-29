// B"H
/**
 * @module SovereignUIArchitect
 * @description Fast browsing shell updates with a pinned current Heichel identity.
 */
import { ScribeOfManifestation } from '../engine/scribe-of-manifestation.js';
import { getFullLayoutBlueprint } from './blueprints/main-layout.js';
import { DOMElements, clearRegistry } from '../dom.js';
import { safeDisplayText } from './textSanitizer.js';

export { notify } from './render/toast.js';
export { updateHeichelHeader, renderBreadcrumb } from './render/header.js';
export { renderContentGrids } from './render/grids.js';

export function manifestWorld(navigator, mountPoint = document.body) {
    clearRegistry();
    const actions = {
        toggleSidebar: () => toggleSidebarDoor(),
        onSearch: event => navigator.filterContent(event.target.value),
        applyFilter: () => applyCurrentFilter(navigator),
        switchView: view => navigator.switchView(view),
        closeModal: () => import('../modal.js').then(module => module.closeModal()),
        onModalSubmit: event => event.preventDefault()
    };
    const rootVessel = ScribeOfManifestation.speakElement(getFullLayoutBlueprint(actions));
    const target = mountPoint.querySelector('.main') || mountPoint;
    target.replaceChildren(rootVessel);
}

function toggleSidebarDoor() {
    if (!DOMElements.pageContainer) return;
    const isOpen = DOMElements.pageContainer.classList.toggle('sidebar-open');
    DOMElements.pageContainer.classList.remove('sidebar-collapsed');
    if (DOMElements.sidebarToggleBtn) {
        DOMElements.sidebarToggleBtn.textContent = isOpen ? '×' : '☰';
        DOMElements.sidebarToggleBtn.setAttribute('aria-expanded', String(isOpen));
    }
}

function applyCurrentFilter(navigator) {
    const value = DOMElements.searchInput?.value || '';
    navigator.filterContent(value);
    DOMElements.searchInput?.focus();
    DOMElements.filterButton?.setAttribute('aria-pressed', value ? 'true' : 'false');
}

export async function renderSeriesInfo(seriesData, heichelGlobal, currentSeriesId) {
    const heichelName = safeDisplayText(heichelGlobal?.name, 'Heichel');
    if (currentSeriesId !== 'root' && seriesData && DOMElements.seriesInfoArea) {
        const prateem = seriesData.prateem || seriesData;
        const seriesName = safeDisplayText(prateem.name, 'A Bound Sequence');
        DOMElements.seriesTitle.textContent = seriesName;
        DOMElements.seriesDesc.textContent = safeDisplayText(prateem.description, '');
        DOMElements.topbarHeichelContext && (DOMElements.topbarHeichelContext.textContent = `Series: ${seriesName}`);
        DOMElements.seriesInfoArea.classList.remove('hidden');
        return;
    }
    DOMElements.topbarHeichelContext && (DOMElements.topbarHeichelContext.textContent = `Root of ${heichelName}`);
    DOMElements.seriesInfoArea?.classList.add('hidden');
}

export function showLoading() {
    DOMElements.loadingPosts?.classList.remove('hidden');
    DOMElements.loadingSeries?.classList.remove('hidden');
    DOMElements.postsList?.replaceChildren();
    DOMElements.seriesList?.replaceChildren();
}

export function hideLoading() {
    DOMElements.loadingPosts?.classList.add('hidden');
    DOMElements.loadingSeries?.classList.add('hidden');
}

export function updateActiveTab(view) {
    const isPosts = view === 'posts';
    DOMElements.postsTab?.classList.toggle('Active', isPosts);
    DOMElements.seriesTab?.classList.toggle('Active', !isPosts);
    const postsViewport = DOMElements.postsViewport || document.querySelector('.heichel-mobile-navigation .viewport.posts');
    const seriesViewport = DOMElements.seriesViewport || document.querySelector('.heichel-mobile-navigation .viewport.series');
    postsViewport?.classList.toggle('hidden', !isPosts);
    seriesViewport?.classList.toggle('hidden', isPosts);
}
