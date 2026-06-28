// B"H
/**
 * @module SovereignNavigator
 * @description Chapter 644: the navigator canonizes broken root/error URLs back
 * into the living root series. It reads old query routes and new path routes but
 * refuses to preserve stray error/index fragments as fake content.
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
            await this.loadContent(route.seriesId);
        } catch (error) {
            console.error("B\"H - Initialization Failed:", error);
            document.body.innerHTML = `<div class="void-error">FATAL: ${error.message}</div>`;
        }
    }
    async loadContent(seriesId) { return await loadContent(this, canonicalSeries(seriesId)); }
    async navigateTo(seriesId) {
        const safeSeries = canonicalSeries(seriesId);
        const url = safeSeries === "root" ? `${baseHeichelPath()}?view=${encodeURIComponent(this.currentView)}` : `${baseHeichelPath()}/series/${encodeURIComponent(safeSeries)}?view=${encodeURIComponent(this.currentView)}`;
        window.history.pushState({ path: url }, "", url);
        await this.loadContent(safeSeries);
    }
    switchView(newView, force = false) {
        if (!force && this.currentView === newView) return;
        this.currentView = newView === "series" ? "series" : "posts";
        ui.updateActiveTab(this.currentView);
        this.updateURL();
    }
    updateURL() {
        const series = canonicalSeries(appState.currentSeries);
        const seriesPath = series !== "root" ? `/series/${encodeURIComponent(series)}` : "";
        window.history.replaceState({ path: `${baseHeichelPath()}${seriesPath}` }, "", `${baseHeichelPath()}${seriesPath}?view=${encodeURIComponent(this.currentView)}`);
    }
    deleteSingleItem(item) { return handleDelete(this, item); }
    clearSingleItem(item) { return handleDelete(this, item, true); }
    handleShareClick(item) { return handleShare(item); }
    filterContent(query) { ui.renderContentGrids(filterLoadedContent(appState.currentContent || { posts: [], subSeries: [] }, query), this, appState); }
}
function readInitialRoute() {
    const params = new URLSearchParams(window.location.search);
    return { view: params.get("view") === "series" ? "series" : "posts", seriesId: canonicalSeries(params.get("series") || seriesFromPath() || "root") };
}
function seriesFromPath() {
    const segments = window.location.pathname.split("/").filter(Boolean);
    const index = segments.indexOf("series");
    if (index === -1 || !segments[index + 1]) return null;
    const seriesId = decodeURIComponent(segments[index + 1]);
    const tail = decodeURIComponent(segments[index + 2] || "");
    if (seriesId === "root" && (tail === "error" || tail === "undefined" || tail === "null")) return "root";
    return seriesId;
}
function canonicalSeries(seriesId) {
    const text = String(seriesId || "root").trim();
    if (!text || text === "error" || text === "undefined" || text === "null") return "root";
    return text;
}
function baseHeichelPath() { return `/heichelos/${encodeURIComponent(appState.heichelId)}`; }
