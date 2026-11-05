// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieGenerationIntent.js
 * @description Normalizes explicit AI-authored JSON for deterministic procedural movie planning without interpreting prose.
 * The Awtsmoos is beyond intention and number, yet finite cinema needs declared measures before a frame can shine;
 * Awtsmoos.com keeps duration, tone, themes, characters, and world choices explicit so no hidden English oracle draws the line.
 */

import { createMovieProjectSnapshot } from './MovieProjectSnapshot.js';
import { hashMovieProceduralText } from './MovieProceduralSeed.js';

const DEFAULT_CHARACTERS = Object.freeze(['Ari', 'Miriam']);

export function normalizeMovieGenerationIntent(source = {}, options = {}) {
	if (!source || typeof source !== 'object' || Array.isArray(source)) {
		throw new TypeError('Procedural movie generation requires structured JSON object input.');
	}
	const value = { ...source, ...options };
	const duration = boundedNumber(value.duration, 6, 300, 60);
	const sceneCount = boundedInteger(
		value.sceneCount,
		1,
		12,
		Math.max(1, Math.min(8, Math.round(duration / 12)))
	);
	const identity = JSON.stringify({
		duration,
		genre: value.genre || 'parable',
		themes: value.themes || ['mitzvah', 'hope'],
		title: value.title || 'Awtsmoos Movie',
		tone: value.tone || 'hopeful',
		world: value.world || null,
		worlds: value.worlds || []
	});
	return createMovieProjectSnapshot({
		characters: normalizeCharacters(value.characters),
		duration,
		genre: String(value.genre || 'parable'),
		sceneCount,
		seed: finiteSeed(value.seed ?? hashMovieProceduralText(identity)),
		themes: normalizeThemes(value.themes),
		title: String(value.title || 'Awtsmoos Movie'),
		tone: String(value.tone || 'hopeful'),
		world: normalizeWorld(value.world),
		worlds: normalizeWorlds(value.worlds)
	});
}

function normalizeCharacters(source) {
	const values = Array.isArray(source) && source.length ? source : DEFAULT_CHARACTERS;
	return values.slice(0, 12).map((value, index) => {
		if (typeof value === 'string') {
			return { id: slug(value, index), name: value, role: index ? 'companion' : 'protagonist' };
		}
		return {
			id: String(value?.id || slug(value?.name, index)),
			name: String(value?.name || `Character ${index + 1}`),
			role: String(value?.role || 'supporting')
		};
	});
}

function normalizeThemes(source) {
	return Array.isArray(source) && source.length
		? source.map(String).filter(Boolean)
		: ['mitzvah', 'hope'];
}

function normalizeWorld(source) {
	return source && typeof source === 'object' && !Array.isArray(source)
		? JSON.parse(JSON.stringify(source))
		: { regionId: 'village-heart' };
}

function normalizeWorlds(source) {
	return Array.isArray(source)
		? source.filter(isObject).map(value => JSON.parse(JSON.stringify(value)))
		: [];
}

function isObject(value) {
	return Boolean(value && typeof value === 'object' && !Array.isArray(value));
}

function slug(value, index) {
	return String(value || `character-${index + 1}`).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function boundedNumber(value, minimum, maximum, fallback) {
	const number = Number(value);
	return Number.isFinite(number) ? Math.max(minimum, Math.min(maximum, number)) : fallback;
}

function boundedInteger(value, minimum, maximum, fallback) {
	return Math.round(boundedNumber(value, minimum, maximum, fallback));
}

function finiteSeed(value) {
	const number = Number(value);
	return (Number.isFinite(number) ? Math.floor(number) : 1) >>> 0 || 1;
}
