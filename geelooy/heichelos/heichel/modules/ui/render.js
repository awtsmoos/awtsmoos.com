// B"H
/**
 * @module SovereignUIArchitect
 * @description One shared roof, three browsing gates, one Heichel name.
 */
import { ScribeOfManifestation } from '../engine/scribe-of-manifestation.js';
import { getFullLayoutBlueprint } from './blueprints/main-layout.js';
import { DOMElements, clearRegistry } from '../dom.js';
import { safeDisplayText } from './textSanitizer.js';
import { renderHeichelWorldState as paintHeichelWorldState, activateDistrict } from './heichel-os/world-panel.js';
import { updateTopbarSeries } from './render/header.js';
export { notify } from './render/toast.js';
export { updateHeichelHeader, renderBreadcrumb } from './render/header.js';
export { renderContentGrids } from './render/grids.js';
export { activateDistrict };

export function manifestWorld(navigator, mountPoint = document.body) {
  clearRegistry();
  const actions = { toggleSidebar: () => toggleSidebarDoor(), onSearch: event => navigator.filterContent(event.target.value), applyFilter: () => applyCurrentFilter(navigator), switchView: view => navigator.switchView(view), openTree: () => openTree(navigator), openMiniMail: () => DOMElements.miniMailPanel?.classList.remove('hidden'), closeMiniMail: () => DOMElements.miniMailPanel?.classList.add('hidden'), closeModal: () => import('../modal.js').then(module => module.closeModal()), activateDistrict: name => activateDistrict(name), activateHeichelDistrict: name => activateDistrict(name), onModalSubmit: event => event.preventDefault() };
  const rootVessel = ScribeOfManifestation.speakElement(getFullLayoutBlueprint(actions));
  (mountPoint.querySelector('.main') || mountPoint).replaceChildren(rootVessel);
}
function openTree(navigator) { navigator.switchView('series'); requestAnimationFrame(() => DOMElements.browsePanel?.scrollIntoView({ behavior: 'smooth', block: 'start' })); }
function toggleSidebarDoor() { DOMElements.pageContainer?.classList.remove('sidebar-open', 'sidebar-collapsed'); if (DOMElements.sidebarToggleBtn) { DOMElements.sidebarToggleBtn.textContent = '🏡'; DOMElements.sidebarToggleBtn.setAttribute('aria-expanded', 'false'); } }
function applyCurrentFilter(navigator) { const value = DOMElements.searchInput?.value || ''; navigator.filterContent(value); DOMElements.searchInput?.focus(); DOMElements.filterButton?.setAttribute('aria-pressed', value ? 'true' : 'false'); }
export async function renderSeriesInfo(seriesData, heichelGlobal, currentSeriesId) { if (currentSeriesId !== 'root' && seriesData && DOMElements.seriesInfoArea) { const prateem = seriesData.prateem || seriesData; const seriesName = safeDisplayText(prateem.name, 'A Bound Sequence'); DOMElements.seriesTitle.textContent = seriesName; DOMElements.seriesDesc.textContent = safeDisplayText(prateem.description, ''); updateTopbarSeries(seriesName); DOMElements.seriesInfoArea.classList.remove('hidden'); return; } updateTopbarSeries('root'); DOMElements.seriesInfoArea?.classList.add('hidden'); }
export function renderHeichelWorldState(state) { paintHeichelWorldState(state); }
export function showLoading() { DOMElements.loadingPosts?.classList.remove('hidden'); DOMElements.loadingSeries?.classList.remove('hidden'); DOMElements.loadingGroupings?.classList.remove('hidden'); DOMElements.postsList?.replaceChildren(); DOMElements.seriesList?.replaceChildren(); DOMElements.groupingsList?.replaceChildren(); }
export function hideLoading() { DOMElements.loadingPosts?.classList.add('hidden'); DOMElements.loadingSeries?.classList.add('hidden'); DOMElements.loadingGroupings?.classList.add('hidden'); }
export function updateActiveTab(view) {
  const states = { posts: view === 'posts', series: view === 'series', groupings: view === 'groupings' };
  DOMElements.postsTab?.classList.toggle('Active', states.posts);
  DOMElements.seriesTab?.classList.toggle('Active', states.series);
  DOMElements.groupingsTab?.classList.toggle('Active', states.groupings);
  for (const key of Object.keys(states)) {
    const viewport = DOMElements[`${key}Viewport`] || document.querySelector(`.heichel-mobile-navigation .viewport.${key}`);
    viewport?.classList.toggle('hidden', !states[key]);
  }
}
