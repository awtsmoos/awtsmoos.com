// B"H
/**
 * @module SovereignUIArchitect
 * @description
 * Chapter 289: The visible world swaps vessels without string-parsing ash.
 *
 * Main render clears with DOM methods, not HTML reparsing. Loading hides old
 * grids by replacing children. Tabs use cached registry elements first, then a
 * narrow fallback query only if the blueprint did not register them.
 */

import { ScribeOfManifestation } from '../engine/scribe-of-manifestation.js';
import { getFullLayoutBlueprint } from './blueprints/main-layout.js';
import { DOMElements, clearRegistry } from '../dom.js';
import { VoidPurifier } from '../utils/VoidPurifier.js';

export { notify } from './render/toast.js';
export { updateHeichelHeader, renderBreadcrumb } from './render/header.js';
export { renderContentGrids } from './render/grids.js';

export function manifestWorld(navigator, mountPoint = document.body) {
    clearRegistry();
    const actions = {
        toggleSidebar: () => {
            if (!DOMElements.pageContainer) return;
            const isCollapsed = DOMElements.pageContainer.classList.toggle('sidebar-collapsed');
            if (DOMElements.sidebarToggleBtn) DOMElements.sidebarToggleBtn.textContent = isCollapsed ? '‹' : '›';
        },
        onSearch: event => navigator.filterContent(event.target.value),
        switchView: view => navigator.switchView(view),
        closeModal: () => import('../modal.js').then(module => module.closeModal()),
        onModalSubmit: event => event.preventDefault()
    };
    const rootVessel = ScribeOfManifestation.speakElement(getFullLayoutBlueprint(actions));
    const target = mountPoint.querySelector('.main') || mountPoint;
    target.replaceChildren(rootVessel);
}

export async function renderSeriesInfo(seriesData, heichelGlobal, currentSeriesId) {
    if (currentSeriesId !== 'root' && seriesData && DOMElements.seriesInfoArea) {
        const prateem = seriesData.prateem || seriesData;
        const cleanName = VoidPurifier.purify(prateem.name) || 'A Bound Sequence';
        const rawDesc = prateem.description === 'undefined' ? '' : prateem.description;
        DOMElements.seriesTitle.textContent = cleanName;
        DOMElements.seriesDesc.textContent = VoidPurifier.purify(rawDesc);
        DOMElements.seriesInfoArea.classList.remove('hidden');
        return;
    }
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
    const postsViewport = DOMElements.postsViewport || document.querySelector('.viewport.posts');
    const seriesViewport = DOMElements.seriesViewport || document.querySelector('.viewport.series');
    postsViewport?.classList.toggle('hidden', !isPosts);
    seriesViewport?.classList.toggle('hidden', isPosts);
}
