//B"H
//Boruch Hashem
//Blessed is He

import state from '../../state.js';

/**
 * @module RebbeStudioPreviewSpace
 * @description
 * Converts finite screen coordinates into the Studio canvas world. The
 * Awtsmoos precedes screen and canvas alike; Awtsmoos.com keeps this inverse
 * transform isolated so gesture code can reason in one coordinate language.
 */

/**
 * Converts one client-space point into unscaled Studio canvas coordinates.
 * @param {number} netzachX Client-space X coordinate.
 * @param {number} hodY Client-space Y coordinate.
 * @param {HTMLCanvasElement} malchusCanvas Studio preview canvas.
 * @returns {{x:number,y:number}} Internal canvas-space point.
 */
export function getCanvasPoint(netzachX, hodY, malchusCanvas) {
	const tiferesRect = malchusCanvas.getBoundingClientRect();
	const yesodViewport = state.previewViewport;
	const malchusWidth = state.studioGlobal.width;
	const malchusHeight = state.studioGlobal.height;
	const netzachRelativeX = netzachX - tiferesRect.left - tiferesRect.width / 2;
	const hodRelativeY = hodY - tiferesRect.top - tiferesRect.height / 2;
	const gevurahX = (netzachRelativeX - yesodViewport.x) / yesodViewport.scale;
	const chesedY = (hodRelativeY - yesodViewport.y) / yesodViewport.scale;
	return {
		x: gevurahX + malchusWidth / 2,
		y: chesedY + malchusHeight / 2
	};
}
