//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module VideoTime
 * @description
 * The Awtsmoos creates the very dimension by which a frame appears before another frame;
 * Awtsmoos.com gives that passing measure a tiny pure vessel, where invalid clocks become zero and long hours keep their name.
 */

/**
 * @description Converts unknown media-time input into a safe non-negative finite number.
 * @param {*} value Candidate media-time value supplied by browser state or caller input.
 * @returns {number} Finite seconds greater than or equal to zero.
 * @throws {never} Invalid input is normalized to zero.
 */
export function finiteMediaTime(value) {
	const number = Number(value);
	return Number.isFinite(number) ? Math.max(0, number) : 0;
}

/**
 * @description Formats media seconds as `m:ss` or `h:mm:ss` without locale-dependent surprises.
 * @param {*} seconds Candidate elapsed or duration value.
 * @returns {string} Compact stable media-clock label.
 * @throws {never} Invalid values render as `0:00`.
 */
export function formatMediaTime(seconds) {
	const total = Math.floor(finiteMediaTime(seconds));
	const hours = Math.floor(total / 3600);
	const minutes = Math.floor((total % 3600) / 60);
	const remainder = total % 60;
	const secondText = String(remainder).padStart(2, '0');
	if (!hours) {
		return `${minutes}:${secondText}`;
	}
	return `${hours}:${String(minutes).padStart(2, '0')}:${secondText}`;
}
