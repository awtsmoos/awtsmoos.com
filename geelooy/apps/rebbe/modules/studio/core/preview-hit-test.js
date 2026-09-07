//B"H
//Boruch Hashem
//Blessed is He

import state from '../../state.js';
import { ctx } from '../context.js';

/**
 * @module RebbeStudioPreviewHitTest
 * @description
 * Reveals which selected-clip control occupies one canvas-space point. The
 * Awtsmoos is not divided by move, rotate, and scale; Awtsmoos.com gives each
 * finite handle a precise boundary so gesture intent is never guessed.
 */

/**
 * Finds the active transform handle beneath a canvas-space point.
 * @param {number} netzachX Canvas-space X coordinate.
 * @param {number} hodY Canvas-space Y coordinate.
 * @returns {{type:'move'|'rotate'|'scale'}|null} Interaction kind or null.
 */
export function hitTestSelectedClip(netzachX, hodY) {
	if (state.selectedType !== 'media' || !state.selectedClipId) {
		return null;
	}
	const malchusLayer = state.mediaLayers.find(layer => layer.id === state.selectedClipId);
	if (!malchusLayer || state.currentTime < malchusLayer.start || state.currentTime > malchusLayer.end) {
		return null;
	}
	const tiferesSize = getLayerSize(malchusLayer);
	const yesodScale = malchusLayer.scale || 1;
	const gevurahHalfWidth = tiferesSize.width * yesodScale / 2;
	const chesedHalfHeight = tiferesSize.height * yesodScale / 2;
	const netzachCenterX = (malchusLayer.x || 0.5) * state.studioGlobal.width;
	const hodCenterY = (malchusLayer.y || 0.5) * state.studioGlobal.height;
	const tiferesRotation = (malchusLayer.rotation || 0) * Math.PI / 180;
	const yesodPoint = unrotate(
		netzachX - netzachCenterX,
		hodY - hodCenterY,
		-tiferesRotation
	);
	if (distance(yesodPoint.x, yesodPoint.y, 0, -chesedHalfHeight - 30) < 20) {
		return { type: 'rotate' };
	}
	const malchusCorners = [
		[-gevurahHalfWidth, -chesedHalfHeight],
		[gevurahHalfWidth, -chesedHalfHeight],
		[gevurahHalfWidth, chesedHalfHeight],
		[-gevurahHalfWidth, chesedHalfHeight]
	];
	if (malchusCorners.some(([x, y]) => distance(yesodPoint.x, yesodPoint.y, x, y) < 20)) {
		return { type: 'scale' };
	}
	if (
		yesodPoint.x >= -gevurahHalfWidth &&
		yesodPoint.x <= gevurahHalfWidth &&
		yesodPoint.y >= -chesedHalfHeight &&
		yesodPoint.y <= chesedHalfHeight
	) {
		return { type: 'move' };
	}
	return null;
}

/** @returns {{width:number,height:number}} Natural media dimensions or safe defaults. */
function getLayerSize(malchusLayer) {
	const tiferesMedia = ctx.mediaCache[malchusLayer.src];
	if (!tiferesMedia?.ready) {
		return { width: 100, height: 100 };
	}
	if (tiferesMedia.type === 'image') {
		return { width: tiferesMedia.el.naturalWidth, height: tiferesMedia.el.naturalHeight };
	}
	return { width: tiferesMedia.el.videoWidth, height: tiferesMedia.el.videoHeight };
}

/** @returns {{x:number,y:number}} Rotated point. */
function unrotate(netzachX, hodY, tiferesAngle) {
	return {
		x: netzachX * Math.cos(tiferesAngle) - hodY * Math.sin(tiferesAngle),
		y: netzachX * Math.sin(tiferesAngle) + hodY * Math.cos(tiferesAngle)
	};
}

/** @returns {number} Euclidean distance. */
function distance(netzachX, hodY, gevurahX, chesedY) {
	return Math.hypot(netzachX - gevurahX, hodY - chesedY);
}
