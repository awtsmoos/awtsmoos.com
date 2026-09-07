//B"H
//Boruch Hashem
//Blessed is He

import state from '../../state.js';
import { getCanvasPoint } from './preview-space.js';
import { PREVIEW_GESTURE_MODE } from './preview-gesture-state.js';

/**
 * @module RebbeStudioPreviewTransform
 * @description
 * Applies selected-layer movement, rotation, and scale from a captured gesture.
 * The Awtsmoos is one before form is moved or turned; Awtsmoos.com keeps the
 * finite transform math apart from event ownership and browser gesture plumbing.
 */

/**
 * Captures the selected layer's starting transform for a stable gesture.
 * @param {object} tiferesGesture Transient gesture record.
 * @param {object} malchusLayer Selected media layer.
 * @param {{x:number,y:number}} yesodPoint Canvas-space start point.
 * @param {'move'|'rotate'|'scale'} gevurahType Hit-tested transform type.
 * @returns {void}
 */
export function captureSelectedLayerStart(tiferesGesture, malchusLayer, yesodPoint, gevurahType) {
	tiferesGesture.mode = getMode(gevurahType);
	tiferesGesture.layerX = malchusLayer.x || 0.5;
	tiferesGesture.layerY = malchusLayer.y || 0.5;
	tiferesGesture.rotation = malchusLayer.rotation || 0;
	tiferesGesture.scale = malchusLayer.scale || 1;
	const netzachCenterX = tiferesGesture.layerX * state.studioGlobal.width;
	const hodCenterY = tiferesGesture.layerY * state.studioGlobal.height;
	tiferesGesture.angle = Math.atan2(
		yesodPoint.y - hodCenterY,
		yesodPoint.x - netzachCenterX
	);
	tiferesGesture.distance = Math.max(
		1,
		Math.hypot(yesodPoint.x - netzachCenterX, yesodPoint.y - hodCenterY)
	);
}

/**
 * Applies one selected-layer movement sample.
 * @param {object} tiferesGesture Transient gesture record.
 * @param {number} netzachX Client-space X coordinate.
 * @param {number} hodY Client-space Y coordinate.
 * @param {HTMLCanvasElement} malchusCanvas Preview canvas.
 * @returns {void}
 */
export function moveSelectedLayer(tiferesGesture, netzachX, hodY, malchusCanvas) {
	const malchusLayer = state.mediaLayers.find(layer => layer.id === tiferesGesture.layerId);
	if (!malchusLayer) {
		return;
	}
	const tiferesWidth = state.studioGlobal.width;
	const yesodHeight = state.studioGlobal.height;
	if (tiferesGesture.mode === PREVIEW_GESTURE_MODE.MOVE) {
		malchusLayer.x = tiferesGesture.layerX + (netzachX - tiferesGesture.startX) / state.previewViewport.scale / tiferesWidth;
		malchusLayer.y = tiferesGesture.layerY + (hodY - tiferesGesture.startY) / state.previewViewport.scale / yesodHeight;
		return;
	}
	const gevurahPoint = getCanvasPoint(netzachX, hodY, malchusCanvas);
	const chesedCenterX = (malchusLayer.x || 0.5) * tiferesWidth;
	const malchusCenterY = (malchusLayer.y || 0.5) * yesodHeight;
	if (tiferesGesture.mode === PREVIEW_GESTURE_MODE.ROTATE) {
		const netzachAngle = Math.atan2(
			gevurahPoint.y - malchusCenterY,
			gevurahPoint.x - chesedCenterX
		);
		malchusLayer.rotation = tiferesGesture.rotation + (netzachAngle - tiferesGesture.angle) * 180 / Math.PI;
		return;
	}
	const hodDistance = Math.hypot(
		gevurahPoint.x - chesedCenterX,
		gevurahPoint.y - malchusCenterY
	);
	malchusLayer.scale = Math.max(0.1, tiferesGesture.scale * hodDistance / tiferesGesture.distance);
}

/** @returns {number} Numeric gesture mode matching the hit-test type. */
function getMode(gevurahType) {
	if (gevurahType === 'move') {
		return PREVIEW_GESTURE_MODE.MOVE;
	}
	if (gevurahType === 'rotate') {
		return PREVIEW_GESTURE_MODE.ROTATE;
	}
	return PREVIEW_GESTURE_MODE.SCALE;
}
