// /heichelos/heichel/modules/navigator.js
// B"H - The Primary Application Logic. The mind of the Heichel. Restored.
import { appState } from '../state.js';
import * as api from '../api.js';
import * as ui from './ui.js';
import * as DND from './dragdrop.js';

// Helper to handle API returning an object {id1:..} instead of an array [{id:id1,..}]
function ensureArray(data) {
    if (Array.isArray(data)) return data;
    
    if (data && typeof data === 'object') {
        if(data.error) {
            console.trace("Error:", data);
            return []
        }
        return Object.values(data);
    }
    return [];
}

export class HeichelNavigator {
    constructor(heichelId) {
        appState.heichelId = heichelId;
        this.currentView = 'posts'; // Default view
    }

    async initialize() {
        // In a real app this would come from a user session, but we use your original's convention.
        window.curAlias = "demo-user-alias";
        
        appState.heichelData = await api.getHeichelDetails(appState.heichelId);
        appState.heichelData.id=appState.heichelId;
        if (!appState.heichelData) throw new Error("Could not load initial Heichel data.");
        
        appState.ownsIt = await api.checkOwnership(window.curAlias, appState.heichelId);
        ui.updateStaticHeichelInfo(appState.heichelData);

        const params = new URLSearchParams(window.location.search);
        this.currentView = params.get("view") || 'series'; // Changed default to series as it's more foundational
        const initialSeries = params.get("series") || "root";
        await this.loadContent(initialSeries);
    }
    
    updateURL() {
        // Only update 'view' and 'series' to prevent cluttering the URL
        const params = new URLSearchParams({
            view: this.currentView,
            series: appState.currentSeries
        });
        const url = `${window.location.pathname}?${params}`;
        window.history.replaceState({path: url}, '', url);
    }
    
    async navigateTo(seriesId) {
        const url = `${window.location.pathname}?view=${this.currentView}&series=${seriesId}`;
        window.history.pushState({path: url}, '', url);
        await this.loadContent(seriesId);
    }

    async loadContent(seriesId) {
        ui.showLoading();
        if (appState.isSelectionMode) ui.toggleSelectionMode(false, this);
        appState.currentSeries = seriesId;

        const [breadcrumb, containerSeries] = await Promise.all([
            api.getBreadcrumb(appState.heichelId, seriesId),
            api.getSeriesDetails(appState.heichelId, seriesId)
        ]);
        
        appState.breadcrumb = (seriesId === 'root') ? [] : (breadcrumb || []);

        if (!containerSeries) {
            ui.hideLoading();
            ui.notify(`Error: Could not load details for series '${seriesId}'.`, 'error');
            ui.renderContentGrids({ posts: [], subSeries: [] }, this); // Render empty grids
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
        
        ui.renderBreadcrumb(appState.breadcrumb, this);
        await ui.renderSeriesInfo(containerSeries.prateem);
        ui.renderOwnerControls(appState.breadcrumb, this);
        ui.renderContentGrids(contentForGrid, this);

        if (appState.ownsIt) DND.initialize();
        console.log("LOL",contentForGrid)
        if(contentForGrid.posts.length == 0) {
//            if(contentForGrid.subSeries.length)
            this.currentView = "series";
        } else if(!contentForGrid.subSeries.length) {
            this.currentView = "posts";
        }
        this.switchView(this.currentView, true); // Force view update without reload
        ui.hideLoading();
        this.updateURL();
    }
    
    async deleteItems(items, clear=false) {
        if (!items || items.length === 0) return;
        const itemStr = items.length === 1 ? `"${items[0].title || items[0].type}"` : `${items.length} items`;
        if (!confirm(`Are you sure you want to delete ${itemStr}? This cannot be undone.`)) return;
        
        ui.notify('Deleting...', 'info');
	
        const results = !clear ? 
	        await api.deleteContent({
	            heichelId: appState.heichelId,
	            aliasId: window.curAlias,
	            itemsToDelete: items,
	        })
	: await api.clearSeries({
	            heichelId: appState.heichelId,
	            aliasId: window.curAlias,
	            itemsToDelete: items,
	        })

        const failures = results.filter(r => !r.success);
        if (failures.length > 0) {
            ui.notify(`${failures.length} items failed to delete. Check console for details.`, 'error');
            console.error("Deletion failures:", failures);
        } else {
            ui.notify('Items deleted successfully!', 'success');
        }

        const didDeleteCurrent = items.some(item => item.type === 'series' && item.id === appState.currentSeries);
        if (didDeleteCurrent) {
            const parent = appState.breadcrumb.length > 0 ? appState.breadcrumb[appState.breadcrumb.length - 1] : null;
            await this.navigateTo(parent ? parent.id : 'root');
        } else {
            await this.loadContent(appState.currentSeries);
        }
    }
    
    deleteSelectedItems = () => this.deleteItems(Array.from(appState.selectedItems.values()));
    deleteSingleItem = (item) => this.deleteItems([item]);
    clearSingleItem = (item) => this.deleteItems([item], true);
    
    switchView = (newView, force = false) => {
        if (!force && this.currentView === newView) return;
        this.currentView = newView;
        if (appState.isSelectionMode) ui.toggleSelectionMode(false, this);
        ui.updateActiveTab(this.currentView);
        this.updateURL();
    }
}