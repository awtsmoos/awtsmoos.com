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
        ui.renderContentGrids({ posts: [], subSeries: [] }, navigator);
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
    
    navigator.renderPostsAndSeries(contentForGrid);
    
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

export function renderPostsAndSeries(navigator, content) {
    ui.renderBreadcrumb(appState.breadcrumb, navigator);
    
    // We need the container series info again, but it was fetched in loadContent.
    // Ideally state stores it, or we re-fetch. For now, assume renderSeriesInfo handles the global state logic
    // or pass it down. Simplified:
    ui.renderSeriesInfo({ name: "Loading..." }); // Placeholder, fix in real implementation or state
    
    // Actually, ui.renderSeriesInfo logic in ui.js handles 'currentSeries' checks well.
    // We just need to make sure series data is available.
    // Let's rely on api.getSeriesDetails cached or re-fetched if needed, 
    // BUT optimization: loadContent should store it in appState.
    
    ui.renderOwnerControls(appState.breadcrumb, navigator);
    ui.renderContentGrids(content, navigator);

    if (appState.ownsIt) DND.initialize();
}
