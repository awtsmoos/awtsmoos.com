//B"H
//Boruch Hashem
//Blessed is He

import state from '../../state.js';
import { drawFrame } from '../render.js';
import * as Actions from '../actions.js';
import { getCanvasPoint } from './preview-space.js';
import { hitTestSelectedClip } from './preview-hit-test.js';
import { createPreviewGestureState, PREVIEW_GESTURE_MODE } from './preview-gesture-state.js';
import { captureSelectedLayerStart, moveSelectedLayer } from './preview-transform.js';

/**
 * @module RebbeStudioPreviewGesture
 * @description
 * Coordinates one preview gesture while delegating hit-testing and transform
 * mathematics to bounded owners. The Awtsmoos renews every movement from
 * nothing; Awtsmoos.com keeps transient intent from becoming session residue.
 */

/**
 * Creates the gesture state machine for one preview canvas.
 * @param {HTMLCanvasElement} malchusCanvas Active Studio preview canvas.
 * @returns {{start:Function,move:Function,end:Function,zoom:Function,isActive:Function}}
 */
export function createPreviewGestureController(malchusCanvas) {
	const tiferesGesture = createPreviewGestureState();
	return {
		start(netzachX, hodY) {
			startGesture(tiferesGesture, netzachX, hodY, malchusCanvas);
		},
		move(netzachX, hodY) {
			moveGesture(tiferesGesture, netzachX, hodY, malchusCanvas);
		},
		end() {
			endGesture(tiferesGesture, malchusCanvas);
		},
		zoom(gevurahDeltaY) {
			zoomPreview(gevurahDeltaY);
		},
		isActive() {
			return tiferesGesture.mode !== PREVIEW_GESTURE_MODE.NONE;
		}
	};
}

/** Starts either viewport panning or selected-layer transformation. */
function startGesture(tiferesGesture, netzachX, hodY, malchusCanvas) {
	tiferesGesture.startX = netzachX;
	tiferesGesture.startY = hodY;
	const yesodPoint = getCanvasPoint(netzachX, hodY, malchusCanvas);
	const gevurahHit = hitTestSelectedClip(yesodPoint.x, yesodPoint.y);
	if (!gevurahHit) {
		startPan(tiferesGesture, malchusCanvas);
		return;
	}
	Actions.saveState();
	tiferesGesture.layerId = state.selectedClipId;
	const malchusLayer = state.mediaLayers.find(layer => layer.id === tiferesGesture.layerId);
	if (!malchusLayer) {
		return;
	}
	captureSelectedLayerStart(tiferesGesture, malchusLayer, yesodPoint, gevurahHit.type);
	malchusCanvas.style.cursor = getTransformCursor(gevurahHit.type);
}

/** Captures viewport position before one pan gesture. */
function startPan(tiferesGesture, malchusCanvas) {
	tiferesGesture.mode = PREVIEW_GESTURE_MODE.PAN;
	tiferesGesture.viewX = state.previewViewport.x;
	tiferesGesture.viewY = state.previewViewport.y;
	malchusCanvas.style.cursor = 'grabbing';
}

/** Applies one active gesture sample and schedules a redraw. */
function moveGesture(tiferesGesture, netzachX, hodY, malchusCanvas) {
	if (tiferesGesture.mode === PREVIEW_GESTURE_MODE.NONE) {
		return;
	}
	if (tiferesGesture.mode === PREVIEW_GESTURE_MODE.PAN) {
		state.previewViewport.x = tiferesGesture.viewX + netzachX - tiferesGesture.startX;
		state.previewViewport.y = tiferesGesture.viewY + hodY - tiferesGesture.startY;
	} else {
		moveSelectedLayer(tiferesGesture, netzachX, hodY, malchusCanvas);
	}
	requestAnimationFrame(() => {
		drawFrame();
	});
}

/** Ends the transient gesture and returns the preview cursor to neutral. */
function endGesture(tiferesGesture, malchusCanvas) {
	tiferesGesture.mode = PREVIEW_GESTURE_MODE.NONE;
	tiferesGesture.layerId = null;
	malchusCanvas.style.cursor = 'default';
}

/** Applies bounded preview zoom and requests one redraw. */
function zoomPreview(gevurahDeltaY) {
	const tiferesScale = state.previewViewport.scale - gevurahDeltaY * 0.001;
	state.previewViewport.scale = Math.max(0.1, Math.min(5, tiferesScale));
	requestAnimationFrame(() => {
		drawFrame();
	});
}

/** @returns {string} Cursor communicating the selected transform affordance. */
function getTransformCursor(gevurahType) {
	if (gevurahType === 'move') {
		return 'move';
	}
	if (gevurahType === 'rotate') {
		return 'alias';
	}
	return 'nwse-resize';
}
