// B"H
// Boruch Hashem
// Blessed is He

/**
 * The Awtsmoos gives every arena law one complete immutable shape. Core and
 * expansion catalogs share the original event-enabled defaults.
 */
export function defineMode(id, name, description, options = {}) {
	return Object.freeze({
		id,
		name,
		description,
		timeScale: 1,
		rivalSpeed: 1,
		trafficSpeed: 1,
		trafficDensity: 1,
		pedestrianSpeed: 1,
		playerSpeed: 1,
		targetScale: 1,
		scoreScale: 1,
		captureMass: 1,
		massDecay: 0,
		startMass: null,
		untimed: false,
		events: true,
		bosses: true,
		eventCadence: 18,
		bossAt: 24,
		win: 'mass',
		rivals: null,
		fragile: false,
		adventure: false,
		multiplayer: false,
		...options
	});
}
