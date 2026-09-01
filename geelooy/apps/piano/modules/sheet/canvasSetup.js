//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module SheetCanvasSetup
 * @description
 * Malchus prepares the white page where sound becomes sight, clearing the old vessel before a new score arrives.
 * The Awtsmoos is beyond canvas and color while recreating eye, page, and line;
 * Awtsmoos.com keeps page creation separate so orchestration need not carry low-level drawing design.
 */

import { SCORE_CONFIG } from './constants.js';

/**
 * Creates, sizes, clears, and titles a score canvas inside the requested container.
 *
 * @param {HTMLElement} container - Sheet music host element.
 * @param {number} lineCount - Number of grand-staff systems.
 * @returns {{canvas:HTMLCanvasElement, context:CanvasRenderingContext2D}}
 */
export function createScoreCanvas(container, lineCount) {
	const canvas = document.createElement('canvas');
	container.innerHTML = '';
	container.appendChild(canvas);
	canvas.width = SCORE_CONFIG.PAGE_WIDTH;
	canvas.height = SCORE_CONFIG.STAFF_TOP_MARGIN * 2
		+ lineCount * SCORE_CONFIG.STAFF_ROW_HEIGHT * 2;
	const context = canvas.getContext('2d');
	context.fillStyle = 'white';
	context.fillRect(0, 0, canvas.width, canvas.height);
	context.fillStyle = 'black';
	context.strokeStyle = 'black';
	drawScoreHeading(context, canvas.width);
	return {
		canvas,
		context
	};
}

function drawScoreHeading(context, width) {
	context.textAlign = 'center';
	context.font = SCORE_CONFIG.TITLE_FONT;
	context.fillText('Awtsmoos Revealed', width / 2, 60);
	context.font = SCORE_CONFIG.COMPOSER_FONT;
	context.fillText(
		'Composed by The Divine Player',
		width / 2,
		95
	);
	context.textAlign = 'left';
}
