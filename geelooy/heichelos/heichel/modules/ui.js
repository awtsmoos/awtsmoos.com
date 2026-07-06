// B"H
/**
 * @module UIAggregator
 * @description
 * The public mouth of the Heichel UI: browsing, owner controls, selection, and
 * the OS world panel all flow through one explicit surface.
 */
import { appState } from './state.js';
import { manifestWorld as renderedManifestWorld } from './ui/render.js';
import * as Render from './ui/render.js';
import * as OwnerControls from './ui/render/controls.js';
import { toggleSelectionMode as toggleSelectionModeCore } from './ui/controls.js';

export const manifestWorld = renderedManifestWorld;
export { notify } from './ui/render/toast.js';
export { showContextMenu } from './ui/contextmenu.js';

export function updateHeichelHeader(data) {
    Render.updateHeichelHeader(data);
}

export function renderBreadcrumb(data, navigator) {
    Render.renderBreadcrumb(data, navigator);
}

export async function renderSeriesInfo(data, heichel, id) {
    await Render.renderSeriesInfo(data, heichel, id);
}

export function renderOwnerControls(breadcrumb, navigator) {
    OwnerControls.renderOwnerControls(breadcrumb, navigator, appState);
}

export function renderContentGrids(content, navigator, state) {
    Render.renderContentGrids(content, navigator, state);
}

export function renderHeichelWorldState(state) {
    Render.renderHeichelWorldState(state);
}

export function activateDistrict(name) {
    Render.activateDistrict(name);
}

export function showLoading() {
    Render.showLoading();
}

export function hideLoading() {
    Render.hideLoading();
}

export function updateActiveTab(view) {
    Render.updateActiveTab(view, appState);
}

export function toggleSelectionMode(isActive, navigator) {
    toggleSelectionModeCore(isActive, navigator, appState);
}
