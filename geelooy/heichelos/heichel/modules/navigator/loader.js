// /heichelos/heichel/modules/navigator/loader.js
// B"H
import { appState } from '../../state.js';
import * as api from '../../api.js';
import * as ui from '../ui.js';
import * as DND from '../dragdrop.js';

function ensureArray(data) {
    if (Array.isArray(data)) return data;
    if (data && typeof data === 'object' && !data.error) return Object.values(data);
    return [];
}

export async function loadContent(navigator, seriesId) {
    ui.showLoading();
    
    // Reset search input if exists
    if(document.getElementById('heichel-search-input')) {
        document.getElementById('heichel-search-input').value = "";
    }

    if (appState.isSelectionMode) ui.toggleSelectionMode(false, navigator);
    appState.currentSeries = seriesId;

    const [breadcrumb, containerSeries] = await Promise.all([
        api.getBreadcrumb(appState.heichelId, seriesId),
        api.getSeriesDetails(appState.heichelId, seriesId)
    ]);
    
    appState.breadcrumb = (seriesId === 'root') ? [] : (breadcrumb || []);

    if (!containerSeries) {
        ui.hideLoading();
        ui.notify(`Error: Series '${seriesId}' collapsed into void.`, 'error');
        appState.currentContent = { posts: [], subSeries: [] };
        ui.renderContentGrids(appState.currentContent, navigator);
        return;
    }

    const [postsFromApi, subSeriesFromApi] = await Promise.all([
        api.getPostDetails(appState.heichelId, seriesId),
        api.getSubSeriesDetails(appState.heichelId, seriesId)
    ]);
    
    const contentForGrid = {
        posts: ensureArray(postsFromApi),
        subSeries: ensureArray(subSeriesFromApi)
    };
    
    // SAVE TO STATE FOR SEARCH/FILTERING
    appState.currentContent = contentForGrid;
    
    await navigator.renderPostsAndSeries(contentForGrid, containerSeries);
    
    // Auto-switch view if empty
    if(contentForGrid.posts.length === 0 && contentForGrid.subSeries.length > 0) {
        navigator.switchView("series", true);
    } else if (contentForGrid.subSeries.length === 0 && contentForGrid.posts.length > 0) {
        navigator.switchView("posts", true);
    } else {
        navigator.switchView(navigator.currentView, true);
    }

    ui.hideLoading();
    navigator.updateURL();
}

export async function renderPostsAndSeries(navigator, content, seriesData) {
    ui.renderBreadcrumb(appState.breadcrumb, navigator);
    
    await ui.renderSeriesInfo(seriesData); 
    
    ui.renderOwnerControls(appState.breadcrumb, navigator);
    ui.renderContentGrids(content, navigator);

    if (appState.ownsIt) DND.initialize();
}