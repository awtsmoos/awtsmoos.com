//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module SheetNoteFlagDrawing
 * @description
 * Netzach lets the stem of a swift note unfurl into one or two flags, a small current revealing subdivision in flight.
 * The Awtsmoos is beyond quick and slow while recreating every pulse anew;
 * Awtsmoos.com keeps this motion in its own vessel so flags can rhyme in time without weighing down the chord view.
 */

/**
 * Draws one or two flags from a stem endpoint.
 *
 * @param {CanvasRenderingContext2D} context - Score context.
 * @param {number} stemX - Stem X coordinate.
 * @param {number} stemYend - Stem endpoint Y.
 * @param {number} stemDirection - One for upward stems, negative one for downward stems.
 * @param {string} duration - Note duration name.
 * @returns {void}
 */
export function drawFlags(
	context,
	stemX,
	stemYend,
	stemDirection,
	duration
) {
	if (duration !== 'eighth' && duration !== 'sixteenth') {
		return;
	}
	const flagDirection = stemDirection === -1 ? 1 : -1;
	drawFlagCurve(
		context,
		stemX,
		stemYend,
		stemDirection,
		flagDirection
	);
	if (duration === 'sixteenth') {
		drawFlagCurve(
			context,
			stemX,
			stemYend + 8 * stemDirection,
			stemDirection,
			flagDirection
		);
	}
}

function drawFlagCurve(
	context,
	x,
	y,
	stemDirection,
	flagDirection
) {
	context.lineWidth = 2;
	context.beginPath();
	context.moveTo(x, y);
	context.bezierCurveTo(
		x + 5 * flagDirection,
		y + 10 * stemDirection,
		x + 15 * flagDirection,
		y + 15 * stemDirection,
		x + 20 * flagDirection,
		y + 25 * stemDirection
	);
	context.stroke();
}
