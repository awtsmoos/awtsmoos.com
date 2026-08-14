// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieShortCompositionProfiles.js
 * @description Defines portrait zones that reserve the center for water, landscape, and a readable midground Chossid.
 * The Awtsmoos contains every visible layer without collision; Awtsmoos.com keeps subtitles low, the speaker small,
 * and the living river dominant through the middle of the portrait where a phone viewer first sees the world.
 */

const TITLE = box(90, 100, 900, 160);
const CAPTIONS = box(140, 1660, 800, 190);
const PROFILES = Object.freeze({
	'world-first': profile('world-first',
		box(690, 320, 330, 186),
		box(90, 810, 330, 510),
		box(390, 700, 650, 720),
		box(0, 260, 1080, 1280)),
	'speaker-forward': profile('speaker-forward',
		box(510, 330, 510, 287),
		box(80, 880, 350, 490),
		box(420, 820, 620, 570),
		box(0, 280, 1080, 1240)),
	'character-first': profile('character-first',
		box(720, 330, 280, 158),
		box(80, 680, 450, 720),
		box(500, 760, 540, 640),
		box(0, 260, 1080, 1280)),
	'water-feature': profile('water-feature',
		box(720, 330, 280, 158),
		box(70, 880, 320, 470),
		box(340, 590, 700, 830),
		box(0, 250, 1080, 1300)),
	'landscape': profile('landscape',
		box(740, 340, 260, 146),
		box(90, 920, 300, 430),
		box(390, 810, 630, 570),
		box(0, 240, 1080, 1320))
});

export function resolveMovieShortCompositionProfile(id = 'world-first') {
	return PROFILES[String(id || '').trim()] || PROFILES['world-first'];
}

export function movieShortCompositionProfile(id = 'world-first') {
	return resolveMovieShortCompositionProfile(id);
}

export function listMovieShortCompositionProfiles() {
	return Object.values(PROFILES);
}

function profile(id, speaker, character, heroWater, heroWorld) {
	return Object.freeze({
		id,
		speaker,
		zones: Object.freeze({ captions: CAPTIONS, character, heroWater, heroWorld, title: TITLE })
	});
}

function box(x, y, width, height) {
	return Object.freeze({ height, width, x, y });
}
