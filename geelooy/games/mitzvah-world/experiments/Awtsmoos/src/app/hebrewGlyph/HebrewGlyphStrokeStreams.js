//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file HebrewGlyphStrokeStreams.js
 * @description Converts explicit Hebrew stroke definitions into portable indexed world-space geometry streams.
 * This module owns numeric phrase layout only. It imports no renderer, creates no materials, performs no network work,
 * and therefore remains deterministic, worker-friendly, and reusable before Procedural Core native materialization.
 */

import { hebrewStrokePattern } from '../MinimalMeadowHebrewStrokeAlphabet.js';

/**
 * Builds one phrase from explicit letter strokes into portable position, normal, and index arrays.
 * @param {string} letters Hebrew phrase whose characters already have explicit stroke definitions.
 * @returns {{indices:number[],normals:number[],positions:number[],strokeCount:number}} Portable phrase streams.
 */
export function createHebrewGlyphStrokeStreams(letters) {
	const positions = [];
	const normals = [];
	const indices = [];
	const phrase = [...letters];
	for (const [index, letter] of phrase.entries()) {
		const offset = ((phrase.length - 1) / 2 - index) * 0.92;
		for (const segment of hebrewStrokePattern(letter)) {
			appendStroke(positions, normals, indices, segment, offset);
		}
	}
	return {
		indices,
		normals,
		positions,
		strokeCount: indices.length / 6
	};
}

/**
 * Appends one thickened line segment as a four-vertex rectangle facing positive Z.
 * @param {number[]} positions Mutable XYZ stream.
 * @param {number[]} normals Mutable XYZ normal stream.
 * @param {number[]} indices Mutable triangle index stream.
 * @param {number[]} segment Explicit x1,y1,x2,y2 stroke definition.
 * @param {number} offset Horizontal phrase-layout translation.
 * @returns {void}
 */
function appendStroke(positions, normals, indices, segment, offset) {
	const [x1, y1, x2, y2] = segment;
	const dx = x2 - x1;
	const dy = y2 - y1;
	const length = Math.max(0.001, Math.hypot(dx, dy));
	const sideX = -dy / length * 0.055;
	const sideY = dx / length * 0.055;
	const base = positions.length / 3;
	positions.push(
		x1 + sideX + offset, y1 + sideY - 0.5, 0,
		x1 - sideX + offset, y1 - sideY - 0.5, 0,
		x2 - sideX + offset, y2 - sideY - 0.5, 0,
		x2 + sideX + offset, y2 + sideY - 0.5, 0
	);
	normals.push(0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1);
	indices.push(base, base + 1, base + 2, base, base + 2, base + 3);
}
