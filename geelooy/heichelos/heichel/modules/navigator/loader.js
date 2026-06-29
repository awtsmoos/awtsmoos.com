// B"H
/**
 * @module ContentUnveiler
 * @description
 * Chapter 286: The loader rejects stale thunder.
 *
 * Fast taps can summon multiple loads. Only the newest request may paint the
 * screen. Older fetches may finish, but they become whispers and cannot replace
 * the newest grid.
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

        const [posts, subSeries] = await Promise.all([
            api.getPostDetails(appState.heichelId, seriesId),
            api.getSubSeriesDetails(appState.heichelId, seriesId)
        ]);
        if (token !== loadToken) return;

        appState.currentContent = {
            posts: normalizeCollection(posts),
            subSeries: normalizeCollection(subSeries)
        };
        await renderAll(navigator, appState.currentContent, containerSeries);
        if (token === loadToken) autoSwitchView(navigator, appState.currentContent);
    } catch (error) {
        if (token === loadToken) {
            console.error('B"H - Unveiling Rupture:', error);
            ui.notify(`Void Rupture: ${error.message}`, 'error');
        }
    } finally {
        if (token === loadToken) {
            ui.hideLoading();
            navigator.updateURL();
        }
    }
}

async function renderAll(navigator, content, seriesData) {
    ui.renderBreadcrumb(appState.breadcrumb, navigator);
    await ui.renderSeriesInfo(seriesData, appState.heichelData, appState.currentSeries);
    ui.renderOwnerControls(appState.breadcrumb, navigator);
    ui.renderContentGrids(content, navigator, appState);
    if (appState.ownsIt) DND.initialize();
}

function autoSwitchView(navigator, content) {
    if (content.posts.length === 0 && content.subSeries.length > 0) navigator.switchView('series', true);
    else if (content.subSeries.length === 0 && content.posts.length > 0) navigator.switchView('posts', true);
    else navigator.switchView(navigator.currentView, true);
}
