
/**
 * B"H
 * @module SovereignNavigator
 * @description
 * The Navigator is the Chariot (Merkavah) for the application's intent. 
 * It unites the Loader (unveiling), the Actions (Gevurot), 
 * and the Filtering (Netzach) into a single functional identity.
 */

import { appState } from './state.js';
import * as api from '../api.js';
import * as ui from './ui.js';
import { loadContent } from './navigator/loader.js';
import { handleDelete, handleShare } from './navigator/actions.js';

export class HeichelNavigator {
    constructor(heichelId) {
        appState.heichelId = heichelId;
        this.currentView = 'posts';
    }

    /**
     * @method initialize
     * @description Awaking the identity of the Heichel.
     */
    async initialize() {
        // Identity ritual - who are we in this space?
        window.curAlias = window.curAlias || "seeker"; 
        
        try {
            appState.heichelData = await api.getHeichelDetails(appState.heichelId);
            if (!appState.heichelData) throw new Error("This Realm is empty of essence.");
            appState.heichelData.id = appState.heichelId;
            
            // Check the observer's authority
            appState.ownsIt = await api.checkOwnership(window.curAlias, appState.heichelId);
            ui.updateHeichelHeader(appState.heichelData);

            // Determine initial coordinates from the URL
            const params = new URLSearchParams(window.location.search);
            this.currentView = params.get("view") || 'posts';
            const initialSeries = params.get("series") || "root";
            
            await this.loadContent(initialSeries);
        } catch(e) {
            console.error("B\"H - Initialization Failed:", e);
            document.body.innerHTML = `<div class='void-error'>FATAL: ${e.message}</div>`;
        }
    }

    // --- High Level Orchestrations ---

    async loadContent(seriesId) {
        return await loadContent(this, seriesId);
    }

    async navigateTo(seriesId) {
        const url = `${window.location.pathname}?view=${this.currentView}&series=${seriesId}`;
        window.history.pushState({path: url}, '', url);
        await this.loadContent(seriesId);
    }

    switchView(newView, force = false) {
        if (!force && this.currentView === newView) return;
        this.currentView = newView;
        ui.updateActiveTab(this.currentView);
        this.updateURL();
    }

    updateURL() {
        const params = new URLSearchParams({
            view: this.currentView,
            series: appState.currentSeries
        });
        const url = `${window.location.pathname}?${params}`;
        window.history.replaceState({path: url}, '', url);
    }

    // --- Action Conduits ---

    deleteSingleItem(item) {
        return handleDelete(this, item);
    }

    clearSingleItem(item) {
        return handleDelete(this, item, true);
    }

    handleShareClick(item) {
        return handleShare(item);
    }

    /**
     * @method filterContent
     * @description Contraction of the visible sparks based on a keyword.
     */
    filterContent(query) {
        const q = query.toLowerCase();
        const matches = (item) => {
            const txt = (item.title || item.name || item.content || "").toLowerCase();
            return txt.includes(q);
        };

        const filtered = {
            posts: appState.currentContent.posts.filter(matches),
            subSeries: appState.currentContent.subSeries.filter(matches)
        };

        ui.renderContentGrids(filtered, this, appState);
    }
}
