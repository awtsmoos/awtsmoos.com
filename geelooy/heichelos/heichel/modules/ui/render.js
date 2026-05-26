
/**
 * B"H
 * @module SovereignUIArchitect
 * @description
 * Unites the Sacred Blueprints with the Genesis Engine.
 */

import { ScribeOfManifestation } from '../engine/scribe-of-manifestation.js';
import { getFullLayoutBlueprint } from './blueprints/main-layout.js';
import { DOMElements, clearRegistry } from '../dom.js';
import { VoidPurifier } from '../utils/VoidPurifier.js';

// B"H - Exporting child emanations for public interaction
export { notify } from './render/toast.js';
export { updateHeichelHeader, renderBreadcrumb } from './render/header.js';
export { renderContentGrids } from './render/grids.js';

/**
 * @function manifestWorld
 * @description
 * Recreates the Realm from nothingness using the Word of the JSON.
 */
export function manifestWorld(navigator, mountPoint = document.body) {

    // 1. Purify existing registries
    clearRegistry();

    // 2. Define Internal Rituals (Actions)
    const actions = {
        toggleSidebar: () => {
            if (DOMElements.pageContainer) {
                const isCollapsed = DOMElements.pageContainer.classList.toggle('sidebar-collapsed');
                if (DOMElements.sidebarToggleBtn) {
                    DOMElements.sidebarToggleBtn.innerHTML = isCollapsed ? '‹' : '›';
                }
            }
        },
        onSearch: (e) => navigator.filterContent(e.target.value),
        switchView: (v) => navigator.switchView(v),
        closeModal: () => import('../modal.js').then(m => m.closeModal()),
        onModalSubmit: (e) => {
            e.preventDefault();
        }
    };

    // 3. Obtain the Celestial Blueprint
    const layout = getFullLayoutBlueprint(actions);

    // 4. Manifest the physical vessels
    const rootVessel = ScribeOfManifestation.speakElement(layout);

    // 5. Anchor to physical space
    const target = mountPoint.querySelector('.main') || mountPoint;
    target.innerHTML = "";
    target.appendChild(rootVessel);

}

/**
 * @function renderSeriesInfo
 */
export async function renderSeriesInfo(seriesData, heichelGlobal, currentSeriesId) {
    if (currentSeriesId !== 'root' && seriesData && DOMElements.seriesInfoArea) {
        const prateem = seriesData.prateem || seriesData;
        
        // B"H - Apply the Void Purifier to crush undefined and execute-able scripts
        const cleanName = VoidPurifier.purify(prateem.name) || "A Bound Sequence";
        let rawDesc = prateem.description;
        if (rawDesc === "undefined") rawDesc = "";
        const cleanDesc = VoidPurifier.purify(rawDesc);
        
        DOMElements.seriesTitle.textContent = cleanName;
        DOMElements.seriesDesc.textContent = cleanDesc;
        DOMElements.seriesInfoArea.classList.remove('hidden');
    } else if (DOMElements.seriesInfoArea) {
        DOMElements.seriesInfoArea.classList.add('hidden');
    }
}

/**
 * @function showLoading
 */
export function showLoading() {
    if (DOMElements.loadingPosts) DOMElements.loadingPosts.classList.remove('hidden');
    if (DOMElements.loadingSeries) DOMElements.loadingSeries.classList.remove('hidden');
    if (DOMElements.postsList) DOMElements.postsList.innerHTML = "";
    if (DOMElements.seriesList) DOMElements.seriesList.innerHTML = "";
}

/**
 * @function hideLoading
 */
export function hideLoading() {
    if (DOMElements.loadingPosts) DOMElements.loadingPosts.classList.add('hidden');
    if (DOMElements.loadingSeries) DOMElements.loadingSeries.classList.add('hidden');
}

/**
 * @function updateActiveTab
 */
export function updateActiveTab(view) {
    const isPosts = view === 'posts';
    if (DOMElements.postsTab) DOMElements.postsTab.classList.toggle('Active', isPosts);
    if (DOMElements.seriesTab) DOMElements.seriesTab.classList.toggle('Active', !isPosts);
    
    // Grid containers usually identified by class as children of panels
    const pv = document.querySelector('.viewport.posts');
    const sv = document.querySelector('.viewport.series');
    if (pv) pv.classList.toggle('hidden', !isPosts);
    if (sv) sv.classList.toggle('hidden', isPosts);
}
