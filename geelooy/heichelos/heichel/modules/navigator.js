// B"H
/**
 * @module SovereignNavigator
 * @description
 * Chapter 6: The Navigator Reads The Address Written In Fire.
 *
 * The route `/heichelos/:heichelId/series/:seriesId` is not decorative; it is a
 * coordinate. The old navigator only trusted query parameters, so a real path
 * like `/heichelos/ikar/series/sotah` could awaken at `root` while the visible
 * address whispered `sotah`. That mismatch leaves the user inside a spinning
 * question. This module now reads both the path and the query, with query values
 * allowed to override path values only when explicitly present.
 *
 * The Awtsmoos creates every path from nothing every instant. This navigator
 * answers by refusing vagueness: path, view, series, state, URL, and render all
 * converge into one measured vessel.
 */

import { appState } from "./state.js";
import * as api from "../api.js";
import * as ui from "./ui.js";
import { loadContent } from "./navigator/loader.js";
import { handleDelete, handleShare } from "./navigator/actions.js";

/**
 * Controls Heichel navigation and content loading.
 */
export class HeichelNavigator {
    /**
     * @param {string} heichelId - Current Heichel id.
     */
    constructor(heichelId) {
        appState.heichelId = heichelId;
        this.currentView = "posts";
    }

    /**
     * Awakens identity, ownership, initial route coordinates, and first content.
     *
     * @returns {Promise<void>} Resolves after initial render attempt.
     */
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

    /**
     * Loads content for a series.
     *
     * @param {string} seriesId - Series id to load.
     * @returns {Promise<void>} Resolves after rendering.
     */
    async loadContent(seriesId) {
        return await loadContent(this, seriesId);
    }

    /**
     * Navigates to a child series.
     *
     * @param {string} seriesId - Target series id.
     * @returns {Promise<void>} Resolves after loading.
     */
    async navigateTo(seriesId) {
        const url = `${baseHeichelPath()}/series/${encodeURIComponent(seriesId)}?view=${encodeURIComponent(this.currentView)}`;
        window.history.pushState({ path: url }, "", url);
        await this.loadContent(seriesId);
    }

    /**
     * Switches between post and series grids.
     *
     * @param {string} newView - Target view.
     * @param {boolean} [force=false] - Force update even when already active.
     * @returns {void}
     */
    switchView(newView, force = false) {
        if (!force && this.currentView === newView) return;
        this.currentView = newView;
        ui.updateActiveTab(this.currentView);
        this.updateURL();
    }

    /**
     * Writes the current route to the address bar.
     *
     * @returns {void}
     */
    updateURL() {
        const seriesPath = appState.currentSeries && appState.currentSeries !== "root"
            ? `/series/${encodeURIComponent(appState.currentSeries)}`
            : "";
        const url = `${baseHeichelPath()}${seriesPath}?view=${encodeURIComponent(this.currentView)}`;
        window.history.replaceState({ path: url }, "", url);
    }

    /** @param {object} item - Item to delete. @returns {Promise<void>} */
    deleteSingleItem(item) {
        return handleDelete(this, item);
    }

    /** @param {object} item - Item to clear. @returns {Promise<void>} */
    clearSingleItem(item) {
        return handleDelete(this, item, true);
    }

    /** @param {object} item - Item to share. @returns {void} */
    handleShareClick(item) {
        return handleShare(item);
    }

    /**
     * Filters visible content by query.
     *
     * @param {string} query - Search input.
     * @returns {void}
     */
    filterContent(query) {
        const q = String(query || "").toLowerCase();
        const matches = item => {
            const txt = (item.title || item.name || item.content || "").toLowerCase();
            return txt.includes(q);
        };

        ui.renderContentGrids({
            posts: appState.currentContent.posts.filter(matches),
            subSeries: appState.currentContent.subSeries.filter(matches)
        }, this, appState);
    }
}

/**
 * Reads initial route state from path plus query.
 *
 * @returns {{view: string, seriesId: string}} Initial route.
 */
function readInitialRoute() {
    const params = new URLSearchParams(window.location.search);
    return {
        view: params.get("view") || "posts",
        seriesId: params.get("series") || seriesFromPath() || "root"
    };
}

/**
 * Extracts `/series/:seriesId` from the current path.
 *
 * @returns {string|null} Series id or null.
 */
function seriesFromPath() {
    const segments = window.location.pathname.split("/").filter(Boolean);
    const index = segments.indexOf("series");
    if (index === -1 || !segments[index + 1]) return null;
    return decodeURIComponent(segments[index + 1]);
}

/**
 * Builds `/heichelos/:heichelId` for stable URL updates.
 *
 * @returns {string} Base path.
 */
function baseHeichelPath() {
    return `/heichelos/${encodeURIComponent(appState.heichelId)}`;
}
