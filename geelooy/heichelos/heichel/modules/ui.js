// /heichelos/heichel/modules/ui.js
// B"H 
//- Main UI aggregator. Delegates to specialized sub-modules.

import { DOMElements } from './dom.js';
import { appState } from '../state.js';
import * as api from '../api.js';
import {
    AwtsmoosPrompt
} from "/scripts/awtsmoos/api/utils.js";

// -- Imports from new sub-modules --
import * as Render from './ui/render.js';
import * as Controls from './ui/controls.js';

// Re-export context menu for others if needed
export { showContextMenu } from './contextmenu.js';
// Re-export specific UI functions if other modules import them from here
export { notify } from './ui/render.js'; 

window.AwtsmoosPrompt = AwtsmoosPrompt;
let navigatorInstance;
var heichelGlobal;
var global = {};

export function updateStaticHeichelInfo(heichelData) {
    heichelGlobal = heichelData;
    Render.updateHeichelHeader(heichelData);
}

export function renderBreadcrumb(breadcrumbData, navigator) {
    if (!navigatorInstance) navigatorInstance = navigator;
    Render.renderBreadcrumb(breadcrumbData, navigatorInstance);
}

export async function renderSeriesInfo(seriesData) {
    await Render.renderSeriesInfo(seriesData, heichelGlobal, appState.currentSeries);
}

export function renderOwnerControls(breadcrumb, navigator) {
    if (!navigatorInstance) navigatorInstance = navigator;
    Controls.renderOwnerControls(breadcrumb, navigator, appState);
}

export function renderContentGrids(seriesDetails, navigator) {
    if (!navigatorInstance) navigatorInstance = navigator;
    Render.renderContentGrids(seriesDetails, navigator, appState);
}

export function showLoading() { Render.showLoading(); }
export function hideLoading() { Render.hideLoading(); }

export function updateActiveTab(view) {
    Render.updateActiveTab(view, appState);
}

// Selection Mode delegation
export function toggleSelectionMode(isActive, navigator) {
    Controls.toggleSelectionMode(isActive, navigator, appState);
}
