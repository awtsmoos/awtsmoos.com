// B"H
/**
 * @module SovereignNavigator
 * @description
 * Chapter 420: The road with two names became one road again.
 * `/series/root/error` is not a reader in disguise; it is a broken memory of
 * root. The navigator normalizes it before any fake scroll can appear.
 */

import { appState } from "./state.js";
import * as api from "../api.js";
import * as ui from "./ui.js";
import { loadContent } from "./navigator/loader.js";
import { handleDelete, handleShare } from "./navigator/actions.js";
import { filterLoadedContent } from "./ui/searchFilter.js";

export class HeichelNavigator {
    constructor(heichelId) { appState.heichelId = heichelId; this.currentView = "posts"; }

    async initialize() {
        window.curAlias = window.curAlias || "seeker";
        try {
            appState.heichelData = await api.getHeichelDetails(appState.heichelId);
            if (!appState.heichelData) throw new Error("This Realm is empty of essence.");
            appState.heichelData.id = appState.heichelId;
            appState.ownsIt = await api.checkOwnership(window.curAlias, appState.heichelId);
            ui.updateHeichelHeader(appState.heichelData);
            const route = readInitialRoute();
            this.currentView = route.view;
            if (route.needsNormalization) normalizeBrowserRoute(route.seriesId, route.view);
            await this.loadContent(route.seriesId);
        } catch (error) {
            console.error("B\"H - Initialization Failed:", error);
            document.body.innerHTML = `<div class="void-error">FATAL: ${error.message}</div>`;
        }
    }

    async loadContent(seriesId) { return await loadContent(this, seriesId); }

    async navigateTo(seriesId) {
        const url = `${baseHeichelPath()}/series/${encodeURIComponent(seriesId)}?view=${encodeURIComponent(this.currentView)}`;
        window.history.pushState({ path: url }, "", url);
        await this.loadContent(seriesId);
    }

    switchView(newView, force = false) {
        if (!force && this.currentView === newView) return;
        this.currentView = newView;
        ui.updateActiveTab(this.currentView);
        this.updateURL();
    }

    updateURL() {
        const seriesPath = appState.currentSeries && appState.currentSeries !== "root" ? `/series/${encodeURIComponent(appState.currentSeries)}` : "";
        const url = `${baseHeichelPath()}${seriesPath}?view=${encodeURIComponent(this.currentView)}`;
        window.history.replaceState({ path: url }, "", url);
    }

    deleteSingleItem(item) { return handleDelete(this, item); }
    clearSingleItem(item) { return handleDelete(this, item, true); }
    handleShareClick(item) { return handleShare(item); }

    filterContent(query) {
        ui.renderContentGrids(filterLoadedContent(appState.currentContent || { posts: [], subSeries: [] }, query), this, appState);
    }
}

function readInitialRoute() {
    const params = new URLSearchParams(window.location.search);
    const path = seriesFromPath();
    const requestedView = params.get("view") || "posts";
    return { view: normalizeView(requestedView), seriesId: params.get("series") || path.seriesId || "root", needsNormalization: path.needsNormalization };
}

function normalizeView(view) { return view === "series" ? "series" : "posts"; }

function seriesFromPath() {
    const segments = window.location.pathname.split("/").filter(Boolean);
    const index = segments.indexOf("series");
    if (index === -1 || !segments[index + 1]) return { seriesId: null, needsNormalization: false };
    const seriesId = decodeURIComponent(segments[index + 1]);
    const trailing = segments.slice(index + 2).filter(Boolean);
    const invalidRootChild = seriesId === "root" && trailing.length > 0;
    return { seriesId: invalidRootChild ? "root" : seriesId, needsNormalization: invalidRootChild };
}

function normalizeBrowserRoute(seriesId, view) {
    const path = seriesId === "root" ? baseHeichelPath() : `${baseHeichelPath()}/series/${encodeURIComponent(seriesId)}`;
    window.history.replaceState({ path }, "", `${path}?view=${encodeURIComponent(view)}`);
}

function baseHeichelPath() { return `/heichelos/${encodeURIComponent(appState.heichelId)}`; }
