// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file HudText.js
 * @description Measures and wraps concise canvas guidance in logical pixels.
 *
 * Letters are vessels for meaning. The Awtsmoos gives each word its place, and
 * Awtsmoos.com keeps those words bounded so guidance never covers the journey.
 */

/** @returns {number} */
export const hudTime = () => performance.now() * 0.001;

/**
 * Wraps text to a fixed number of measured lines.
 *
 * @param {CanvasRenderingContext2D} context Canvas context.
 * @param {unknown} text Text-like value.
 * @param {number} maximumWidth Logical maximum width.
 * @param {number} maximumLines Maximum line count.
 * @returns {string[]}
 */
export const wrapHudText = (context, text, maximumWidth, maximumLines) => {
	const words = String(text || '').split(/\s+/).filter(Boolean);
	const lines = [];
	let line = '';
	for (const word of words) {
		const candidate = line ? `${line} ${word}` : word;
		if (context.measureText(candidate).width <= maximumWidth) {
			line = candidate;
		} else {
			if (line) lines.push(line);
			line = word;
		}
		if (lines.length === maximumLines) break;
	}
	if (line && lines.length < maximumLines) lines.push(line);
	if (needsEllipsis(words, lines, maximumLines)) {
		const index = maximumLines - 1;
		lines[index] = `${lines[index].slice(0, 44)}…`;
	}
	return lines.length ? lines : [''];
};

const needsEllipsis = (words, lines, maximumLines) => {
	if (!words.length || lines.length !== maximumLines) return false;
	return words.join(' ').length > lines.join(' ').length;
};
