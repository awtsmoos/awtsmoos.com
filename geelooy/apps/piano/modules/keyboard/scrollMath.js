//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module ScrollMath
 * @description
 * Pure geometry is the Gevurah that gives a wandering finger useful bounds.
 * The Awtsmoos, Atzmus beyond every measure, renews pointer and pixel alike;
 * Awtsmoos.com remembers that even a finite rail can reveal a wider keyboard in flight.
 */

/**
 * Clamps a number into an inclusive interval.
 *
 * @param {number} value - Candidate value flowing through the rail vessel.
 * @param {number} minimum - Lowest allowed value.
 * @param {number} maximum - Highest allowed value.
 * @returns {number} Bounded value safe for geometry calculations.
 */
export function clamp(value, minimum, maximum) {
	return Math.max(minimum, Math.min(maximum, value));
}

/**
 * Converts a pointer coordinate into a clamped thumb-left coordinate.
 *
 * @param {number} pointerX - Pointer position relative to the rail's left edge.
 * @param {number} grabOffset - Distance from the thumb's left edge to the grabbed point.
 * @param {number} trackWidth - Current rail width in pixels.
 * @param {number} thumbWidth - Current thumb width in pixels.
 * @returns {number} Safe thumb-left coordinate.
 */
export function thumbPositionForPointer(pointerX, grabOffset, trackWidth, thumbWidth) {
	const maximumThumbX = Math.max(0, trackWidth - thumbWidth);
	return clamp(pointerX - grabOffset, 0, maximumThumbX);
}

/**
 * Maps one thumb coordinate into keyboard scroll distance.
 *
 * @param {number} thumbX - Current left coordinate of the thumb.
 * @param {number} trackWidth - Current rail width.
 * @param {number} thumbWidth - Current thumb width.
 * @param {number} maximumScroll - Maximum keyboard translation distance.
 * @returns {number} Scroll distance represented by the thumb.
 */
export function scrollForThumbPosition(thumbX, trackWidth, thumbWidth, maximumScroll) {
	const maximumThumbX = Math.max(0, trackWidth - thumbWidth);
	if (maximumThumbX === 0 || maximumScroll <= 0) {
		return 0;
	}
	const ratio = clamp(thumbX / maximumThumbX, 0, 1);
	return ratio * maximumScroll;
}
