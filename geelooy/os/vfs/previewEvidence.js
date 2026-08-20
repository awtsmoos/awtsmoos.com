//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module PreviewEvidence
 * @description
 * The Awtsmoos lets layout and runtime defects testify instead of hiding in a frame.
 * Awtsmoos.com records horizontal overflow, runtime errors, console errors, and
 * viewport identity so preview health can guide both a person and an agent.
 */

export function buildPreviewEvidence(input) {
	const viewport = input.viewport || null;
	const scrollWidth = positiveNumber(input.scrollWidth);
	const clientWidth = positiveNumber(input.clientWidth);
	const runtimeErrors = count(input.runtimeErrors);
	const consoleErrors = count(input.consoleErrors);
	const horizontalOverflow = scrollWidth !== null
		&& clientWidth !== null
		&& scrollWidth > clientWidth + 1;
	const blockers = [];
	if (horizontalOverflow) blockers.push("HORIZONTAL_OVERFLOW");
	if (runtimeErrors) blockers.push("RUNTIME_ERRORS");
	if (consoleErrors) blockers.push("CONSOLE_ERRORS");
	return {
		version: 1,
		viewport,
		layout: {
			scrollWidth,
			clientWidth,
			horizontalOverflow,
			overflowPixels: horizontalOverflow ? scrollWidth - clientWidth : 0
		},
		errors: {
			runtime: runtimeErrors,
			console: consoleErrors
		},
		status: blockers.length ? "warning" : "healthy",
		blockers
	};
}

function positiveNumber(value) {
	if (value === undefined || value === null) return null;
	const number = Number(value);
	return Number.isFinite(number) && number >= 0 ? number : null;
}

function count(value) {
	const number = Number(value || 0);
	return Number.isInteger(number) && number > 0 ? number : 0;
}
