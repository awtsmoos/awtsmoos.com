// /heichelos/heichel/modules/navigator.js
// B"H - The Mind of the Heichel.
// Orchestrates the flow by delegating to specialized nervous systems.

import { appState } from '../state.js';
import * as ui from './ui.js';
import * as api from '../api.js';
import * as DND from './dragdrop.js';

// Sub-modules
import { loadContent, renderPostsAndSeries } from './navigator/loader.js';
import { handleCreateSeries, handleCreatePost, handleDelete, handleShare } from './navigator/actions.js';

export class HeichelNavigator {
    constructor(heichelId) {
        appState.heichelId = heichelId;
        this.currentView = 'posts';
        
        // Bind sub-module functions to this instance context
        this.loadContent = (seriesId) => loadContent(this, seriesId);
        this.renderPostsAndSeries = async (details, seriesData) => await renderPostsAndSeries(this, details, seriesData);
        
        // Bind actions
        this.promptCreateSeries = () => handleCreateSeries(this);
        this.promptCreatePost = () => handleCreatePost(this);
        this.deleteSingleItem = (item) => handleDelete(this, item);
        this.deleteSelectedItems = () => {
            const items = Array.from(appState.selectedItems.values());
            if(items.length) handleDelete(this, items);
        };
        this.clearSingleItem = (item) => handleDelete(this, item, true); // Clear = true
        this.handleShareClick = (item) => handleShare(this, item);
    }

    async initialize() {
        window.curAlias = "demo-user-alias"; // Placeholder
        
        try {
            appState.heichelData = await api.getHeichelDetails(appState.heichelId);
            if (!appState.heichelData) throw new Error("Void Heichel Data");
            appState.heichelData.id = appState.heichelId;
            
            appState.ownsIt = await api.checkOwnership(window.curAlias, appState.heichelId);
            ui.updateStaticHeichelInfo(appState.heichelData);

            const params = new URLSearchParams(window.location.search);
            this.currentView = params.get("view") || 'posts';
            const initialSeries = params.get("series") || "root";
            
            await this.loadContent(initialSeries);
        } catch(e) {
            console.error("Initialization Rupture:", e);
            document.body.innerHTML = `<h1 style="color:red; text-align:center; padding:50px;">FATAL ERROR: ${e.message}</h1>`;
        }
    }
    
    updateURL() {
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
    
    switchView(newView, force = false) {
        if (!force && this.currentView === newView) return;
        this.currentView = newView;
        if (appState.isSelectionMode) ui.toggleSelectionMode(false, this);
        ui.updateActiveTab(this.currentView);
        this.updateURL();
    }

    filterContent(query) {
        const lowerQ = query.toLowerCase();
        const filterFn = (item) => {
            const title = (item.name || item.title || "").toLowerCase();
            const desc = (item.description || item.content || "").substring(0, 500).toLowerCase();
            return title.includes(lowerQ) || desc.includes(lowerQ);
        };

        const filteredPosts = (appState.currentContent.posts || []).filter(filterFn);
        const filteredSeries = (appState.currentContent.subSeries || []).filter(filterFn);

        ui.renderContentGrids({ posts: filteredPosts, subSeries: filteredSeries }, this);
        
        // Ensure Drag Drop is re-initialized if needed
        if (appState.ownsIt) DND.initialize();
    }
}