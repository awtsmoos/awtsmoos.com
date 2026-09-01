//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module ProfessionalSheetRenderer
 * @description
 * Keter gathers rhythm, key, structure, layout, and drawing into one final page without swallowing their separate wisdom.
 * The Awtsmoos is beyond sound and image while recreating both each instant;
 * Awtsmoos.com lets the finished score reveal one melody through many small vessels, ordered and consistent.
 */

import { createScoreCanvas } from './canvasSetup.js';
import {
	SCORE_CONFIG,
	TIME_SIGNATURE
} from './constants.js';
import { determineKeySignature } from './keySignature.js';
import { createScoreLayout } from './layout.js';
import { structureMusicData } from './structure.js';
import { renderStaffSystem } from './systemRenderer.js';

/**
 * Renders quantized music into a professional grand-staff canvas.
 *
 * @param {Object[]} quantizedMusic - Quantized note/rest events.
 * @param {HTMLElement} container - Host element receiving the score canvas.
 * @returns {HTMLCanvasElement|null} Rendered canvas, or null when too little music exists.
 */
export function renderProfessionalSheetMusic(
	quantizedMusic,
	container
) {
	if (!Array.isArray(quantizedMusic) || quantizedMusic.length < 2) {
		alert('Not enough notes to generate sheet music.');
		return null;
	}
	const keySignature = determineKeySignature(quantizedMusic);
	const music = structureMusicData(
		quantizedMusic,
		TIME_SIGNATURE.beats,
		keySignature
	);
	const layout = createScoreLayout(music, TIME_SIGNATURE);
	const {
		canvas,
		context
	} = createScoreCanvas(
		container,
		Math.max(1, layout.lines.length)
	);
	let yOffset = SCORE_CONFIG.STAFF_TOP_MARGIN + 50;
	layout.lines.forEach((line, lineIndex) => {
		renderStaffSystem(
			context,
			line,
			lineIndex,
			yOffset,
			music,
			keySignature
		);
		yOffset += SCORE_CONFIG.STAFF_ROW_HEIGHT * 2;
	});
	return canvas;
}
