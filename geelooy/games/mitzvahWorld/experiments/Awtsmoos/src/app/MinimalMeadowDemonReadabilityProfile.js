// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowDemonReadabilityProfile.js
 * @description Defines six live shadow palettes plus one legacy stone compatibility vessel.
 * The Awtsmoos is one beyond every hue, yet Awtsmoos.com lets violet, ember-red, storm-blue,
 * midnight indigo, dusk magenta, and ochre reveal distinct finite faces in the dark.
 */

export const MINIMAL_DEMON_READABILITY_PROFILES = Object.freeze([
	profile('tzel-chai', 'violet-ash', 17, ['#76578f', '#9872b2', '#493858', '#d9b2e8'], [0.54, 0.4, 0.66, 1], 'ash-runes'),
	profile('esh-katan', 'scorched-ember', 31, ['#824b49', '#ad625a', '#4c3033', '#f0aa83'], [0.66, 0.32, 0.28, 1], 'ember-scars'),
	profile('ruach-afelah', 'storm-blue', 43, ['#49698f', '#688db7', '#30445d', '#a8d0ec'], [0.36, 0.56, 0.66, 1], 'storm-veins'),
	profile('shomer-hoshech', 'midnight-indigo', 59, ['#4b4b78', '#686596', '#34344f', '#b4afe0'], [0.42, 0.32, 0.58, 1], 'armor-ridges'),
	profile('ketem-layla', 'dusk-magenta', 71, ['#774b70', '#9d638d', '#493247', '#e1a8ca'], [0.58, 0.36, 0.6, 1], 'dusk-glyphs'),
	profile('ayin-raash', 'weathered-ochre', 89, ['#756247', '#9b8365', '#443a31', '#d9c49d'], [0.6, 0.48, 0.28, 1], 'stone-runes'),
	profile('legacy-stone', 'weathered-stone', 97, ['#626274', '#85869a', '#393946', '#c1bfd2'], [0.42, 0.38, 0.56, 1], 'weathered-runes')
]);

export function minimalDemonReadabilityProfile(supplied = {}) {
	const requestedFamily = String(supplied.surfaceFamily || '').toLowerCase();
	const familyMatch = MINIMAL_DEMON_READABILITY_PROFILES.find(
		(entry) => entry.name === requestedFamily
	);
	if (familyMatch) return familyMatch;
	const identity = String(supplied.id || supplied.name || '').toLowerCase();
	const identityMatch = MINIMAL_DEMON_READABILITY_PROFILES.find(
		(entry) => entry.id === identity
	);
	if (identityMatch) return identityMatch;
	const liveCount = 6;
	return MINIMAL_DEMON_READABILITY_PROFILES[hashIdentity(identity || 'shadow-demon') % liveCount];
}

function profile(id, name, seed, colors, tint, pattern) {
	return Object.freeze({
		colors: Object.freeze(colors),
		id,
		name,
		pattern,
		roughness: 0.78,
		seed,
		tint: Object.freeze(tint)
	});
}

function hashIdentity(identity) {
	let hash = 0;
	for (const character of identity) {
		hash = (hash * 31 + character.codePointAt(0)) >>> 0;
	}
	return hash;
}
