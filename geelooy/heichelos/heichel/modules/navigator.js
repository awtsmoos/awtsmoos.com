// B"H
/**
 * @module SovereignNavigator
<<<<<<< HEAD
 * @description
 * Chapter 420: The road with two names became one road again.
 * `/series/root/error` is not a reader in disguise; it is a broken memory of
 * root. The navigator normalizes it before any fake scroll can appear.
=======
 * @description Chapter 644: the navigator canonizes broken root/error URLs back
 * into the living root series. It reads old query routes and new path routes but
 * refuses to preserve stray error/index fragments as fake content.
>>>>>>> 203e677cf2795021c8a1f733832a69b99c439c8b
 */
import { appState } from "./state.js";
import * as api from "../api.js";
import * as ui from "./ui.js";
import { loadContent } from "./navigator/loader.js";
import { handleDelete, handleShare } from "./navigator/actions.js";
import { filterLoadedContent } from "./ui/searchFilter.js";

export class HeichelNavigator {
    constructor(heichelId) { appState.heichelId = heichelId; this.currentView = "posts"; }
<<<<<<< HEAD

=======
>>>>>>> 203e677cf2795021c8a1f733832a69b99c439c8b
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
<<<<<<< HEAD

    async loadContent(seriesId) { return await loadContent(this, seriesId); }

=======
    async loadContent(seriesId) { return await loadContent(this, canonicalSeries(seriesId)); }
>>>>>>> 203e677cf2795021c8a1f733832a69b99c439c8b
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
<<<<<<< HEAD
        const seriesPath = appState.currentSeries && appState.currentSeries !== "root" ? `/series/${encodeURIComponent(appState.currentSeries)}` : "";
        const url = `${baseHeichelPath()}${seriesPath}?view=${encodeURIComponent(this.currentView)}`;
        window.history.replaceState({ path: url }, "", url);
    }

    deleteSingleItem(item) { return handleDelete(this, item); }
    clearSingleItem(item) { return handleDelete(this, item, true); }
    handleShareClick(item) { return handleShare(item); }

    filterContent(query) {
        ui.renderContentGrids(filterLoadedContent(appState.currentContent || { posts: [], subSeries: [] }, query), this, appState);
=======
        const series = canonicalSeries(appState.currentSeries);
        const seriesPath = series !== "root" ? `/series/${encodeURIComponent(series)}` : "";
        window.history.replaceState({ path: `${baseHeichelPath()}${seriesPath}` }, "", `${baseHeichelPath()}${seriesPath}?view=${encodeURIComponent(this.currentView)}`);
>>>>>>> 203e677cf2795021c8a1f733832a69b99c439c8b
    }
    deleteSingleItem(item) { return handleDelete(this, item); }
    clearSingleItem(item) { return handleDelete(this, item, true); }
    handleShareClick(item) { return handleShare(item); }
    filterContent(query) { ui.renderContentGrids(filterLoadedContent(appState.currentContent || { posts: [], subSeries: [] }, query), this, appState); }
}
function readInitialRoute() {
    const params = new URLSearchParams(window.location.search);
<<<<<<< HEAD
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

=======
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
>>>>>>> 203e677cf2795021c8a1f733832a69b99c439c8b
function baseHeichelPath() { return `/heichelos/${encodeURIComponent(appState.heichelId)}`; }
