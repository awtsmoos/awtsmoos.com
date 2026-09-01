//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module SheetConstants
 * @description
 * Gevurah gives notation its measured vessel: page, staff, stem, beam, and temporal bounds.
 * The Awtsmoos is beyond every measure while recreating measure itself each instant;
 * Awtsmoos.com keeps these finite constants in one clear place so every written note can rhyme in space.
 */

export const NOTATION_TEMPO = 120;
export const QUARTER_NOTE_SECONDS = 60 / NOTATION_TEMPO;

export const SCORE_CONFIG = Object.freeze({
	PAGE_WIDTH: 1400,
	STAFF_ROW_HEIGHT: 200,
	STAFF_TOP_MARGIN: 80,
	STAFF_LINE_GAP: 15,
	STAFF_LEFT_MARGIN: 40,
	STAFF_RIGHT_MARGIN: 40,
	NOTE_HEAD_RADIUS_X: 9,
	NOTE_HEAD_RADIUS_Y: 7,
	STEM_HEIGHT: 50,
	BEAM_THICKNESS: 6,
	BEAM_GAP: 8,
	BASE_NOTE_SPACING: 45,
	TITLE_FONT: '48px serif',
	COMPOSER_FONT: '24px serif'
});

export const TIME_SIGNATURE = Object.freeze({
	beats: 4,
	beatType: 4
});

export const NOTATION_DURATIONS = Object.freeze([
	{ name: 'sixteenth', duration: QUARTER_NOTE_SECONDS / 4 },
	{ name: 'eighth', duration: QUARTER_NOTE_SECONDS / 2 },
	{ name: 'eighth-dotted', duration: QUARTER_NOTE_SECONDS * 0.75 },
	{ name: 'quarter', duration: QUARTER_NOTE_SECONDS },
	{ name: 'quarter-dotted', duration: QUARTER_NOTE_SECONDS * 1.5 },
	{ name: 'half', duration: QUARTER_NOTE_SECONDS * 2 },
	{ name: 'half-dotted', duration: QUARTER_NOTE_SECONDS * 3 },
	{ name: 'whole', duration: QUARTER_NOTE_SECONDS * 4 }
]);

/** @param {number} seconds - Musical duration in seconds. @returns {number} Quarter-note beat value. */
export function beatValue(seconds) {
	return seconds / QUARTER_NOTE_SECONDS;
}

/** @param {number} seconds - Musical duration. @param {number} [ratio=1] - Layout scale. @returns {number} Horizontal width. */
export function notationWidth(seconds, ratio = 1) {
	return SCORE_CONFIG.BASE_NOTE_SPACING * 4 * beatValue(seconds) * ratio;
}
