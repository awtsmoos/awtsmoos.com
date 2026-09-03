// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module UIAggregator
 * @description
 * The Awtsmoos creates browsing, governance, selection, and district surfaces as one visible kingdom;
 * Awtsmoos.com keeps this public facade stable while the ninth-generation render vessel carries fresh source truth onward.
 */

import { appState } from './state.js';
import {
	manifestWorld as renderedManifestWorld
} from './ui/render.js?v=heichel-mobile-009';
import * as Render from './ui/render.js?v=heichel-mobile-009';
import * as OwnerControls from './ui/render/controls.js';
import {
	toggleSelectionMode as toggleSelectionModeCore
} from './ui/controls.js';

export const manifestWorld = renderedManifestWorld;
export { notify } from './ui/render/toast.js';
export { showContextMenu } from './ui/contextmenu.js';

export function updateHeichelHeader(data) {
	Render.updateHeichelHeader(data);
}

export function renderBreadcrumb(data, navigator) {
	Render.renderBreadcrumb(data, navigator);
}

export function renderSeriesInfo(data, heichel, id) {
	return Render.renderSeriesInfo(data, heichel, id);
}

export function renderOwnerControls(breadcrumb, navigator) {
	OwnerControls.renderOwnerControls(
		breadcrumb,
		navigator,
		appState
	);
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

export function toggleSelectionMode(active, navigator) {
	toggleSelectionModeCore(
		active,
		navigator,
		appState
	);
}
