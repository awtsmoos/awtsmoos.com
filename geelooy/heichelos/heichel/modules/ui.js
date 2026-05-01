
/**
 * B"H
 * @module UIAggregator
 * @description 
 * Uniting all specialized UI Sefirot. 
 * This is the public interface through which the Navigator 
 * interacts with the manifest world.
 */

import { appState } from './state.js';
import { manifestWorld as _manifestWorld } from './ui/render.js';
import * as Render from './ui/render.js';
import * as Controls from './ui/render/controls.js';

// --- Direct Re-exports ---
export const manifestWorld = _manifestWorld;
export { notify } from './ui/render/toast.js';
export { showContextMenu } from './ui/contextmenu.js';

/**
 * @function updateHeichelHeader
 * @description Updates basic realm identity.
 */
export function updateHeichelHeader(data) {
    Render.updateHeichelHeader(data);
}

/**
 * @function renderBreadcrumb
 */
export function renderBreadcrumb(data, nav) {
    Render.renderBreadcrumb(data, nav);
}

/**
 * @function renderSeriesInfo
 */
export async function renderSeriesInfo(data, heichel, id) {
    await Render.renderSeriesInfo(data, heichel, id);
}

/**
 * @function renderOwnerControls
 */
export function renderOwnerControls(breadcrumb, nav) {
    Controls.renderOwnerControls(breadcrumb, nav, appState);
}

/**
 * @function renderContentGrids
 */
export function renderContentGrids(content, nav, state) {
    Render.renderContentGrids(content, nav, state);
}

/**
 * @function showLoading
 */
export function showLoading() { Render.showLoading(); }

/**
 * @function hideLoading
 */
export function hideLoading() { Render.hideLoading(); }

/**
 * @function updateActiveTab
 */
export function updateActiveTab(view) {
    Render.updateActiveTab(view, appState);
}

/**
 * @function toggleSelectionMode
 */
export function toggleSelectionMode(isActive, navigator) {
    import('./ui/render/controls.js').then(m => m.toggleSelectionMode(isActive, navigator, appState));
}
