// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ProceduralMaterialProfile.mjs
 * @description Classifies canonical names into compact visual material profiles.
 * The Awtsmoos reveals stone as stone and leaf as leaf; Awtsmoos.com therefore
 * derives palette, grain, alpha, and structure from semantic truth rather than chance.
 */

const PROFILES = Object.freeze([
	entry(/leaf|leaves|petal|sakura|ash|aspen|pine/, 'foliage', '#5f7d3b', '#b6c870', '#233d25', true),
	entry(/water|river/, 'water', '#3f7581', '#88bec0', '#173f4b'),
	entry(/roof|slate|tile/, 'roof', '#343a43', '#68717b', '#1c2229'),
	entry(/brick|limestone|whitewashed/, 'brick', '#9c8069', '#c8b5a0', '#59463d'),
	entry(/stone|cobble|granite|bluestone|fieldstone|masonry/, 'stone', '#77766f', '#aaa79d', '#454641'),
	entry(/wood|plank|bark/, 'wood', '#725139', '#a77b52', '#3e2b22'),
	entry(/grass|marsh/, 'grass', '#526d39', '#8aa95b', '#2c4228'),
	entry(/dirt|mud|soil|sand|forest floor/, 'earth', '#6c5137', '#a47b4f', '#382d24'),
	entry(/gold/, 'metal', '#a77b24', '#e1c36c', '#594014'),
	entry(/silver/, 'metal', '#858b8f', '#d0d4d4', '#494f53'),
	entry(/copper|rusty iron/, 'metal', '#8a5735', '#c78a56', '#432f25'),
	entry(/fur|leather/, 'fiber', '#795b43', '#b18a64', '#412e24'),
	entry(/cloth|parchment|rope/, 'fiber', '#a68b62', '#d1bd91', '#67563f')
]);

export function proceduralMaterialProfile(sourcePath) {
	const normalized = String(sourcePath).toLowerCase();
	const selected = PROFILES.find(profile => profile.pattern.test(normalized));
	const profile = selected || entry(/.*/, 'mineral', '#6d6b61', '#9b998d', '#3f403a');
	return Object.freeze({
		accent: shift(profile.accent, variant(sourcePath, 9)),
		alpha: profile.alpha,
		base: shift(profile.base, variant(sourcePath, 7)),
		dark: shift(profile.dark, variant(sourcePath, 5)),
		family: profile.family,
		seed: materialSeed(sourcePath)
	});
}

export function materialSeed(value) {
	let hash = 0;
	for (const character of String(value)) {
		hash = Math.imul(hash ^ character.charCodeAt(0), 16777619);
	}
	return Math.abs(hash | 0) || 1;
}

function entry(pattern, family, base, accent, dark, alpha = false) {
	return Object.freeze({ accent, alpha, base, dark, family, pattern });
}

function variant(value, range) {
	return materialSeed(value) % (range * 2 + 1) - range;
}

function shift(hex, amount) {
	const channels = hex.slice(1).match(/.{2}/g).map(channel => parseInt(channel, 16));
	return `#${channels.map(channel => {
		return Math.max(0, Math.min(255, channel + amount))
			.toString(16)
			.padStart(2, '0');
	}).join('')}`;
}
