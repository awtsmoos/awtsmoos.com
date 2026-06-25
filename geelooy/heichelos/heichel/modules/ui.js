// B"H
/**
 * @module UIAggregator
 * @description
 * Chapter 5: The Public Mouth Of The Library.
 *
 * The Heichel has many hands: renderers, controls, toasts, context menus,
 * selection tools. This file is the mouth that speaks one stable API to the
 * Navigator. A previous path tried to summon selection behavior from the owner
 * render controls, but selection lives in `ui/controls.js`. Wrong chambers can
 * make the browser ask for a scroll that is not there, and the server may dress
 * absence as JSON. Here the map is explicit.
 *
 * The Awtsmoos has no body and no form, yet every finite vessel must know its
 * gate. Render controls reveal ownership. Legacy controls keep selection. The
 * aggregator unites them without pretending they are the same organ.
 */

import { appState } from "./state.js";
import { manifestWorld as renderedManifestWorld } from "./ui/render.js";
import * as Render from "./ui/render.js";
import * as OwnerControls from "./ui/render/controls.js";
import { toggleSelectionMode as toggleSelectionModeCore } from "./ui/controls.js";

export const manifestWorld = renderedManifestWorld;
export { notify } from "./ui/render/toast.js";
export { showContextMenu } from "./ui/contextmenu.js";

/**
 * Updates the Heichel identity header.
 *
 * @param {object} data - Heichel details payload.
 * @returns {void}
 */
export function updateHeichelHeader(data) {
    Render.updateHeichelHeader(data);
}

/**
 * Renders breadcrumb navigation.
 *
 * @param {Array<object>} data - Breadcrumb path.
 * @param {object} navigator - Heichel navigator.
 * @returns {void}
 */
export function renderBreadcrumb(data, navigator) {
    Render.renderBreadcrumb(data, navigator);
}

/**
 * Renders series title and description.
 *
 * @param {object} data - Series payload.
 * @param {object} heichel - Current Heichel payload.
 * @param {string} id - Current series id.
 * @returns {Promise<void>} Resolves after render.
 */
export async function renderSeriesInfo(data, heichel, id) {
    await Render.renderSeriesInfo(data, heichel, id);
}

/**
 * Renders owner-only controls.
 *
 * @param {Array<object>} breadcrumb - Breadcrumb path.
 * @param {object} navigator - Heichel navigator.
 * @returns {void}
 */
export function renderOwnerControls(breadcrumb, navigator) {
    OwnerControls.renderOwnerControls(breadcrumb, navigator, appState);
}

/**
 * Renders posts and sub-series grids.
 *
 * @param {object} content - Content grouped by posts and subSeries.
 * @param {object} navigator - Heichel navigator.
 * @param {object} state - Current app state.
 * @returns {void}
 */
export function renderContentGrids(content, navigator, state) {
    Render.renderContentGrids(content, navigator, state);
}

/**
 * Renders the Phase 6 Heichel OS district state.
 *
 * @param {object} payload - Heichel, content, access, and series state.
 * @returns {void}
 */
export function renderHeichelWorldState(payload) {
    Render.renderHeichelWorldState(payload);
}

/** @returns {void} Shows all loading vessels. */
export function showLoading() {
    Render.showLoading();
}

/** @returns {void} Hides all loading vessels. */
export function hideLoading() {
    Render.hideLoading();
}

/**
 * Updates active content tab.
 *
 * @param {string} view - Either `posts` or `series`.
 * @returns {void}
 */
export function updateActiveTab(view) {
    Render.updateActiveTab(view, appState);
}

/**
 * Toggles bulk selection behavior from the correct legacy control module.
 *
 * @param {boolean} isActive - Whether selection mode should be active.
 * @param {object} navigator - Heichel navigator.
 * @returns {void}
 */
export function toggleSelectionMode(isActive, navigator) {
    toggleSelectionModeCore(isActive, navigator, appState);
}
