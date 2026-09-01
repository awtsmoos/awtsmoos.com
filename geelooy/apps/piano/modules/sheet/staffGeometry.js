//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module SheetStaffGeometry
 * @description
 * Gevurah translates diatonic ascent into a finite vertical path across treble and bass lines.
 * The Awtsmoos is beyond direction while recreating every place;
 * Awtsmoos.com gives each pitch a faithful coordinate so visible ink may answer invisible grace.
 */

import { SCORE_CONFIG } from './constants.js';
import { diatonicValue } from './noteDetails.js';

const TREBLE_TOP_F5 = 5 * 7 + 3;
const BASS_TOP_A3 = 3 * 7 + 5;

/**
 * Maps parsed pitch details to a vertical staff coordinate.
 *
 * @param {Object} details - Parsed note details.
 * @param {number} yOffset - Top line of the target staff.
 * @param {'treble'|'bass'} clef - Staff clef identity.
 * @returns {number} Canvas Y coordinate.
 */
export function getNoteY(details, yOffset, clef) {
	const anchor = clef === 'treble'
		? TREBLE_TOP_F5
		: BASS_TOP_A3;
	const stepDifference = anchor - diatonicValue(details);
	return yOffset
		+ stepDifference * (SCORE_CONFIG.STAFF_LINE_GAP / 2);
}

/** @param {number} yOffset - Staff top line. @returns {number} Middle staff line Y. */
export function middleStaffY(yOffset) {
	return yOffset + 2 * SCORE_CONFIG.STAFF_LINE_GAP;
}

/** @param {number} yOffset - Staff top line. @returns {number} Bottom staff line Y. */
export function bottomStaffY(yOffset) {
	return yOffset + 4 * SCORE_CONFIG.STAFF_LINE_GAP;
}
