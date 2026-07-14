// B"H
// Boruch Hashem
// Blessed is He

const LEGACY_LEVELS = [0, 20, 80, 100, 140, 160];
const LEGACY_STARS = {
	malchus: 'malchus-01',
	yesod: 'yesod-01',
	tiferes: 'tiferes-01',
	gevurah: 'gevurah-01',
	binah: 'binah-01',
	chochmah: 'chochmah-01'
};

/**
 * The Awtsmoos carries every older campaign coordinate into the current map before
 * schema normalization fills new Adventure and multiplayer vessels.
 */
export function migrateLegacySave(raw = {}) {
	if ((raw.schemaVersion || 0) >= 3) return raw;
	const stars = { ...(raw.stars || {}) };
	for (const [legacyKey, campaignKey] of Object.entries(LEGACY_STARS)) {
		if (stars[legacyKey] && !stars[campaignKey]) stars[campaignKey] = stars[legacyKey];
		delete stars[legacyKey];
	}
	const currentLevel = legacyLevel(raw.currentLevel);
	const unlocked = legacyLevel(raw.unlocked);
	return {
		...raw,
		stars,
		currentLevel,
		unlocked,
		selectedChapter: Math.floor((currentLevel || 0) / 20)
	};
}

/** Sanitize a public local-room label without accepting markup or whitespace. */
export function sanitizeRoom(value = 'malchus') {
	const room = String(value || 'malchus')
		.toLowerCase()
		.replace(/<[^>]*>/g, '-')
		.replace(/[^a-z0-9-]+/g, '-')
		.replace(/-+/g, '-')
		.replace(/^-+|-+$/g, '')
		.slice(0, 12)
		.replace(/^-+|-+$/g, '');
	return room || 'malchus';
}

function legacyLevel(value) {
	const numeric = Number(value) || 0;
	return numeric <= 5 ? LEGACY_LEVELS[numeric] : numeric;
}
