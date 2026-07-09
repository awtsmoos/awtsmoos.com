// B"H
/**
 * @module ContentUnveiler
 * @description
 * Chapter 908: Timeline, Tree, and Groupings are three windows into one room.
 * The canonical children stay canonical; alternate maps arrive beside them.
 */
import { appState } from '../state.js';
import * as api from '../api.js';
import * as ui from '../ui.js';
import * as DND from '../dragdrop.js';
import { normalizeCollection } from './content-normalizer.js';
let loadToken = 0;

export async function loadContent(navigator, seriesId) {
  const token = ++loadToken;
  ui.showLoading();
  if (appState.isSelectionMode) ui.toggleSelectionMode(false, navigator);
  appState.currentSeries = seriesId;
  try {
    const [breadcrumb, containerSeries] = await Promise.all([
      api.getBreadcrumb(appState.heichelId, seriesId),
      api.getSeriesDetails(appState.heichelId, seriesId)
    ]);
    if (token !== loadToken) return;
    appState.breadcrumb = seriesId === 'root' ? [] : (breadcrumb || []);
    if (!containerSeries) throw new Error(`The Series '${seriesId}' has vanished from the records.`);
    const [posts, subSeries, groupings] = await Promise.all([
      api.getPostDetails(appState.heichelId, seriesId),
      api.getSubSeriesDetails(appState.heichelId, seriesId),
      api.getAlternateGroupDetails(appState.heichelId, seriesId)
    ]);
    if (token !== loadToken) return;
    appState.currentContent = { posts: normalizeCollection(posts), subSeries: normalizeCollection(subSeries), groupings: normalizeCollection(groupings) };
    await renderAll(navigator, appState.currentContent, containerSeries);
    if (token === loadToken) autoSwitchView(navigator, appState.currentContent);
  } catch (error) {
    if (token === loadToken) { console.error('B"H - Unveiling Rupture:', error); ui.notify(`Void Rupture: ${error.message}`, 'error'); }
  } finally {
    if (token === loadToken) { ui.hideLoading(); navigator.updateURL(); }
  }
}

async function renderAll(navigator, content, seriesData) {
  ui.renderBreadcrumb(appState.breadcrumb, navigator);
  await ui.renderSeriesInfo(seriesData, appState.heichelData, appState.currentSeries);
  ui.renderOwnerControls(appState.breadcrumb, navigator);
  ui.renderContentGrids(content, navigator, appState);
  ui.renderHeichelWorldState({ heichel: appState.heichelData, content, ownsIt: appState.ownsIt, currentSeries: appState.currentSeries });
  if (appState.ownsIt) DND.initialize();
}
function explicitView() { const v = new URLSearchParams(window.location.search).get('view'); return ['posts', 'series', 'groupings'].includes(v) ? v : null; }
function autoSwitchView(navigator, content) {
  const requested = explicitView();
  if (requested) return navigator.switchView(requested, true);
  if (content.posts.length === 0 && content.subSeries.length > 0) navigator.switchView('series', true);
  else if (content.posts.length === 0 && content.subSeries.length === 0 && content.groupings.length > 0) navigator.switchView('groupings', true);
  else navigator.switchView(navigator.currentView, true);
}
