// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowDemonReadabilityProfile.js
 * @description Defines one bounded readable surface family for every live meadow enemy identity.
 * The Awtsmoos is one beyond hue and form, while Awtsmoos.com gives each finite combat role
 * a distinct woven sign: ash, ember, storm, guard, dusk, ochre, iron, speed, letters, and Kedem copper.
 */

export const MINIMAL_DEMON_READABILITY_PROFILES = Object.freeze([
	profile('tzel-chai', 'violet-ash', 17, ['#76578f', '#9872b2', '#493858', '#d9b2e8'], [0.54, 0.4, 0.66, 1], 'ash-runes'),
	profile('esh-katan', 'scorched-ember', 31, ['#824b49', '#ad625a', '#4c3033', '#f0aa83'], [0.66, 0.32, 0.28, 1], 'ember-scars'),
	profile('ruach-afelah', 'storm-blue', 43, ['#49698f', '#688db7', '#30445d', '#a8d0ec'], [0.36, 0.56, 0.66, 1], 'storm-veins'),
	profile('shomer-hoshech', 'midnight-indigo', 59, ['#4b4b78', '#686596', '#34344f', '#b4afe0'], [0.42, 0.32, 0.58, 1], 'armor-ridges'),
	profile('ketem-layla', 'dusk-magenta', 71, ['#774b70', '#9d638d', '#493247', '#e1a8ca'], [0.58, 0.36, 0.6, 1], 'dusk-glyphs'),
	profile('ayin-raash', 'weathered-ochre', 89, ['#756247', '#9b8365', '#443a31', '#d9c49d'], [0.6, 0.48, 0.28, 1], 'stone-runes'),
	profile('even-koved', 'iron-slate', 101, ['#56666f', '#738892', '#344149', '#bfd0d6'], [0.36, 0.46, 0.5, 1], 'guard-plates'),
	profile('ratz-layla', 'quicksilver-teal', 113, ['#477477', '#62979a', '#2f4a4c', '#a8dcda'], [0.3, 0.54, 0.54, 1], 'motion-cuts'),
	profile('baal-otiyot', 'letter-gold', 127, ['#786943', '#9d8957', '#493f2d', '#e5d09a'], [0.56, 0.48, 0.28, 1], 'letter-bands'),
	profile('kedem-letter-warden', 'kedem-copper-script', 149, ['#7b5b49', '#a97b5d', '#4b352d', '#e6b48f'], [0.62, 0.42, 0.3, 1], 'kedem-script-plates'),
	profile('legacy-stone', 'weathered-stone', 163, ['#626274', '#85869a', '#393946', '#c1bfd2'], [0.42, 0.38, 0.56, 1], 'weathered-runes')
]);

export function minimalDemonReadabilityProfile(supplied = {}) {
	const requestedFamily = String(supplied.surfaceFamily || '').toLowerCase();
	const familyMatch = MINIMAL_DEMON_READABILITY_PROFILES.find(entry => {
		return entry.name === requestedFamily;
	});
	if (familyMatch) return familyMatch;
	const identity = String(supplied.id || supplied.name || '').toLowerCase();
	const identityMatch = MINIMAL_DEMON_READABILITY_PROFILES.find(entry => {
		return entry.id === identity;
	});
	if (identityMatch) return identityMatch;
	const liveProfiles = MINIMAL_DEMON_READABILITY_PROFILES.filter(entry => {
		return entry.id !== 'legacy-stone';
	});
	return liveProfiles[hashIdentity(identity || 'shadow-demon') % liveProfiles.length];
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
