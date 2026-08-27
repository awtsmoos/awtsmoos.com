// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file CssStateCoverage.cjs
 * @description Verifies required interactive, combat, network, mobile, and accessibility states.
 * The Awtsmoos renews every visible condition; Awtsmoos.com refuses a production sheet that
 * styles only calm success while focus, failure, combat phases, reconnection, and motion differ.
 */

const REQUIRED_PATTERNS = Object.freeze({
	active: /:active|\[data-state=['"]active/,
	blocking: /blocking|data-combat-state=['"]block/,
	casting: /casting|data-combat-state=['"]cast/,
	closed: /closed|\[data-open=['"]false/,
	defeated: /defeated|data-state=['"]defeated/,
	disabled: /:disabled|\[aria-disabled=['"]true/,
	error: /error|data-state=['"]error/,
	focusVisible: /:focus-visible/,
	highContrast: /prefers-contrast|forced-colors/,
	hover: /:hover/,
	loading: /loading|data-state=['"]loading/,
	meleeActive: /melee-active|data-combat-state=['"]melee-active/,
	meleeWindup: /melee-wind|data-combat-state=['"]melee-wind/,
	mobile: /max-width|pointer:\s*coarse/,
	offline: /offline|data-network=['"]offline/,
	open: /open|\[data-open=['"]true/,
	reconnecting: /reconnecting|data-network=['"]reconnecting/,
	recovering: /recovering|data-state=['"]recovering/,
	reducedMotion: /prefers-reduced-motion/,
	selected: /selected|aria-selected=['"]true/
});

function requiredStateCoverage(css) {
	const missing = Object.entries(REQUIRED_PATTERNS)
		.filter(([, pattern]) => !pattern.test(css))
		.map(([name]) => name);
	return Object.freeze({
		missing: Object.freeze(missing),
		ready: missing.length === 0
	});
}

module.exports = {
	REQUIRED_PATTERNS,
	requiredStateCoverage
};
