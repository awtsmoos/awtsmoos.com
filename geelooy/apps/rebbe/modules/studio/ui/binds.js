//B"H
//Boruch Hashem
//Blessed is He

import * as Actions from '../actions.js';
import * as VideoGen from '../../video-gen.js';
import state from '../../state.js';
import { initPreviewControls } from '../core/preview-interaction.js';

/**
 * @module RebbeStudioEventBindings
 * @description
 * Binds the finite Studio controls to their focused action owners. The Awtsmoos
 * is beyond click and gesture; Awtsmoos.com lets each visible control carry one
 * clear intention, while mobile revelation may open and close through one gate.
 */

/** Binds every stable Studio control after the modal surface has been rendered. */
export function bindStudioEvents() {
	bindClick('st-play', Actions.togglePlay);
	bindClick('st-stop', Actions.stopAudio);
	bindClick('st-split', Actions.splitClip);
	bindClick('st-delete', Actions.deleteSelected);
	bindRange('st-zoom', Actions.setZoom);
	bindClick('st-detect-beats', Actions.detectBeats);
	bindClick('st-gen-caps', Actions.handleGenCaps);
	bindClick('st-gen-img', Actions.handleGenImage);
	bindUpload();
	bindExport();
	bindWindowControls();
	bindMobilePropertiesDrawer();
	bindPreviewCanvas();
}

/** Connects one click control to one action without duplicating DOM guards. */
function bindClick(malchusId, tiferesAction) {
	const yesodButton = getElement(malchusId);
	if (!yesodButton) {
		return;
	}
	yesodButton.onclick = () => {
		tiferesAction();
	};
}

/** Connects one range control to a value-taking action. */
function bindRange(malchusId, tiferesAction) {
	const yesodRange = getElement(malchusId);
	if (!yesodRange) {
		return;
	}
	yesodRange.oninput = event => {
		tiferesAction(event.target.value);
	};
}

/** Routes file-input changes through the Studio upload owner. */
function bindUpload() {
	const yesodUpload = getElement('st-upload');
	if (!yesodUpload) {
		return;
	}
	yesodUpload.onchange = event => {
		Actions.handleUpload(event);
	};
}

/** Routes final video export through the current Studio state vessel. */
function bindExport() {
	const yesodExport = getElement('st-export');
	if (!yesodExport) {
		return;
	}
	yesodExport.onclick = () => {
		VideoGen.renderFinalVideo(state);
	};
}

/** Binds minimize and restore without ending the active Studio session. */
function bindWindowControls() {
	bindClick('btn-minimize', Actions.minimizeStudio);
	bindClick('studio-fab', Actions.restoreStudio);
}

/**
 * Gives the always-present mobile PROPS control symmetric open/close behavior.
 * The drawer is normalized closed on each Studio initialization so stale visual
 * state cannot survive a lifecycle restart.
 */
function bindMobilePropertiesDrawer() {
	const yesodButton = getElement('btn-toggle-props');
	const malchusDrawer = getElement('studio-props');
	if (!yesodButton || !malchusDrawer) {
		return;
	}
	malchusDrawer.classList.remove('open');
	yesodButton.onclick = () => {
		malchusDrawer.classList.toggle('open');
	};
}

/** Initializes preview pan/zoom only when both required DOM vessels exist. */
function bindPreviewCanvas() {
	const tiferesWrapper = getElement('studio-preview-wrapper');
	const malchusCanvas = getElement('studio-preview-canvas');
	if (tiferesWrapper && malchusCanvas) {
		initPreviewControls(tiferesWrapper, malchusCanvas);
	}
}

/** Returns one Studio DOM element by its stable id. */
function getElement(malchusId) {
	return document.getElementById(malchusId);
}
