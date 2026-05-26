
/**
 * B"H
 * @module ContentUnveiler
 * @description
 * "He speaks and it becomes." This module fetches data from the API 
 * and commands the UI to reveal it. It manages the transition from 
 * the potentiality of the server to the actuality of the browser.
 */

import { appState } from '../state.js';
import * as api from '../api.js';
import * as ui from '../ui.js';
import * as DND from '../dragdrop.js';
import { normalizeCollection } from './content-normalizer.js';

/**
 * @function loadContent
 * @description 
 * Fetches and prepares all data for a specific series.
 * @param {Object} navigator - The master navigator.
 * @param {string} seriesId - The target sequence.
 */
export async function loadContent(navigator, seriesId) {
    ui.showLoading();
    
    // Reset internal seekers
    if (appState.isSelectionMode) ui.toggleSelectionMode(false, navigator);
    appState.currentSeries = seriesId;

    try {
        // Gather the Breadcrumbs and main Series information
        const [breadcrumb, containerSeries] = await Promise.all([
            api.getBreadcrumb(appState.heichelId, seriesId),
            api.getSeriesDetails(appState.heichelId, seriesId)
        ]);
        
        appState.breadcrumb = (seriesId === 'root') ? [] : (breadcrumb || []);

        if (!containerSeries) {
            throw new Error(`The Series '${seriesId}' has vanished from the records.`);
        }

        // Gather the discrete sparks (Posts and Sub-series)
        const [posts, subSeries] = await Promise.all([
            api.getPostDetails(appState.heichelId, seriesId),
            api.getSubSeriesDetails(appState.heichelId, seriesId)
        ]);
        
        appState.currentContent = {
            posts: normalizeCollection(posts),
            subSeries: normalizeCollection(subSeries)
        };
        
        // Command the UI to manifest the gathered sparks
        await renderAll(navigator, appState.currentContent, containerSeries);
        
        // Guidance: auto-switch focus if one tab is an empty void
        autoSwitchView(navigator, appState.currentContent);

    } catch (e) {
        console.error("B\"H - Unveiling Rupture:", e);
        ui.notify(`Void Rupture: ${e.message}`, 'error');
    } finally {
        ui.hideLoading();
        navigator.updateURL();
    }
}

/**
 * @private
 * @function renderAll
 */
async function renderAll(navigator, content, seriesData) {
    ui.renderBreadcrumb(appState.breadcrumb, navigator);
    await ui.renderSeriesInfo(seriesData, appState.heichelData, appState.currentSeries); 
    ui.renderOwnerControls(appState.breadcrumb, navigator);
    ui.renderContentGrids(content, navigator, appState);

    // If the observer is the master of the Realm, enable reordering
    if (appState.ownsIt) {
        DND.initialize();
    }
}

/**
 * @private
 * @function autoSwitchView
 */
function autoSwitchView(navigator, content) {
    if (content.posts.length === 0 && content.subSeries.length > 0) {
        navigator.switchView("series", true);
    } else if (content.subSeries.length === 0 && content.posts.length > 0) {
        navigator.switchView("posts", true);
    } else {
        navigator.switchView(navigator.currentView, true);
    }
}
