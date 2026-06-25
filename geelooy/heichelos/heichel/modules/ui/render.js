// B"H
/**
 * @module SovereignUIArchitect
 * @description The Heichel renderer now births the Awtsmoos OS kernel before
 * the old grids: command galaxy, dock, status pulse, and context rail.
 */
import { ScribeOfManifestation } from '../engine/scribe-of-manifestation.js';
import { getFullLayoutBlueprint } from './blueprints/main-layout.js';
import { DOMElements, clearRegistry } from '../dom.js';
import { VoidPurifier } from '../utils/VoidPurifier.js';
import { renderCommandPalette, runCommand } from './awtsmoos-os/commands.js';
import { activateDistrict, renderHeichelWorldState } from './heichel-os/world-panel.js';

export { notify } from './render/toast.js';
export { updateHeichelHeader, renderBreadcrumb } from './render/header.js';
export { renderContentGrids } from './render/grids.js';
export { renderHeichelWorldState };

export function manifestWorld(navigator, mountPoint = document.body) {
    clearRegistry();
    const actions = {
        toggleSidebar: () => toggleSidebarDoor(),
        onSearch: event => navigator.filterContent(event.target.value),
        applyFilter: () => applyCurrentFilter(navigator),
        switchView: view => navigator.switchView(view),
        closeModal: () => import('../modal.js').then(module => module.closeModal()),
        onModalSubmit: event => event.preventDefault(),
        focusCommand: () => DOMElements.osCommandInput?.focus(),
        openCommand: () => DOMElements.osCommandPalette?.classList.remove('hidden'),
        onOsCommand: event => renderCommandPalette(DOMElements.osCommandPalette, event.target.value),
        runOsCommand: command => runCommand(command),
        activateHeichelDistrict: name => activateDistrict(name)
    };
    const rootVessel = ScribeOfManifestation.speakElement(getFullLayoutBlueprint(actions));
    const target = mountPoint.querySelector('.main') || mountPoint;
    target.replaceChildren(rootVessel);
    renderCommandPalette(DOMElements.osCommandPalette, '');
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
    if (DOMElements.osStatusText) DOMElements.osStatusText.textContent = 'Loading AwtsmoosDB projections';
}

export function hideLoading() {
    DOMElements.loadingPosts?.classList.add('hidden');
    DOMElements.loadingSeries?.classList.add('hidden');
    if (DOMElements.osStatusText) DOMElements.osStatusText.textContent = 'AwtsmoosDB projections revealed';
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
