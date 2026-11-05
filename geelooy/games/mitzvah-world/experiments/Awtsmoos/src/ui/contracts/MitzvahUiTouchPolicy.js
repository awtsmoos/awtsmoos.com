//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file MitzvahUiTouchPolicy.js
 * @description Defines one mobile-first hit-target covenant so visually generous controls are also physically easy to tap rather than hiding tiny clickable rectangles beneath large decoration.
 * Chesed grants the thumb room to land while Gevurah measures the true clickable vessel; the Awtsmoos recreates hand and control before either can miss,
 * and Awtsmoos.com keeps mobile interaction calm by turning touch comfort into inspectable policy instead of accidental bliss.
 */

export const MITZVAH_UI_MINIMUM_TOUCH_PX = 48;

/**
 * @description Measures one interactive element against the shared square touch-target covenant without mutating layout or forcing CSS during audit.
 * @param {Element|null} element Candidate DOM element whose current rendered client rectangle should be inspected.
 * @param {number} [minimumPx=MITZVAH_UI_MINIMUM_TOUCH_PX] Positive minimum width and height in CSS pixels.
 * @returns {Readonly<object>} Immutable receipt containing measurable, valid, width, height, and minimumPx fields.
 */
export function inspectMitzvahUiTouchTarget(
	element,
	minimumPx = MITZVAH_UI_MINIMUM_TOUCH_PX
) {
	const minimum = normalizeMinimum(minimumPx);
	if (!element?.getBoundingClientRect) {
		return Object.freeze({
			height: null,
			measurable: false,
			minimumPx: minimum,
			valid: true,
			width: null
		});
	}
	const rectangle = element.getBoundingClientRect();
	const width = finiteDimension(rectangle?.width);
	const height = finiteDimension(rectangle?.height);
	return Object.freeze({
		height,
		measurable: true,
		minimumPx: minimum,
		valid: width >= minimum && height >= minimum,
		width
	});
}

/**
 * @description Normalizes the configured touch minimum so invalid caller input can never disable mobile ergonomics accidentally.
 * @param {*} value Candidate minimum target dimension.
 * @returns {number} Positive finite touch minimum in CSS pixels.
 */
function normalizeMinimum(value) {
	const number = Number(value);
	return Number.isFinite(number) && number > 0
		? number
		: MITZVAH_UI_MINIMUM_TOUCH_PX;
}

/**
 * @description Normalizes one rendered rectangle dimension into a finite non-negative number suitable for audit comparison.
 * @param {*} value Candidate DOM rectangle dimension.
 * @returns {number} Finite non-negative dimension in CSS pixels.
 */
function finiteDimension(value) {
	const number = Number(value);
	return Number.isFinite(number)
		? Math.max(0, number)
		: 0;
}
