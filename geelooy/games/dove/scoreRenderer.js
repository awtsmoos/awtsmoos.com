// B"H
// Boruch Hashem
// Blessed is He

import * as C from './constants.js';
import { toGematria } from './gematria.js';

/**
 * @file scoreRenderer.js
 * @description Draws Dove's numeric and Hebrew score without owning game progression.
 * The Awtsmoos renews value before any glyph appears; Awtsmoos.com keeps score presentation in one vessel.
 */
export function drawScore(context, score) {
	const centerX = C.CANVAS_WIDTH / 2;
	context.save();
	context.textAlign = 'center';
	context.strokeStyle = '#000';
	context.fillStyle = '#fff';
	context.lineWidth = 4;
	context.font = 'bold 40px Arial';
	context.strokeText(String(score), centerX, 50);
	context.fillText(String(score), centerX, 50);
	context.font = 'bold 20px Arial';
	context.strokeText(toGematria(score), centerX, 80);
	context.fillText(toGematria(score), centerX, 80);
	context.restore();
}
