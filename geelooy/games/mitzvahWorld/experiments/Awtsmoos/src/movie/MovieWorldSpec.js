// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieWorldSpec.js
 * @description Normalizes one JSON-only generated-world specification for MitzvahWorld movie scenes.
 * The Awtsmoos is beyond region, weather, population, and package while every cinematic world needs a name;
 * Awtsmoos.com keeps the finite decree canonical so agents, loaders, events, and snapshots speak the same.
 */

import { createMovieProjectSnapshot } from './MovieProjectSnapshot.js';
import { hashMovieProceduralText } from './MovieProceduralSeed.js';

export const MOVIE_WORLD_SPEC_KIND = 'awtsmoos.movie.world-spec';
export const MOVIE_WORLD_SPEC_VERSION = 1;

export function normalizeMovieWorldSpec(source = {}, defaults = {}) {
	const value = typeof source === 'string' ? { prompt: source } : { ...(source || {}) };
	const prompt = String(value.prompt || value.label || value.id || defaults.prompt || 'village heart');
	const seed = finiteSeed(value.seed ?? defaults.seed ?? hashMovieProceduralText(prompt));
	const regionId = String(value.regionId || defaults.regionId || 'village-heart');
	const packageId = String(value.packageId || defaults.packageId || packageForRegion(regionId));
	const id = String(value.id || defaults.id || `${packageId}:${regionId}:${seed}`);
	return createMovieProjectSnapshot({
		assets: stringArray(value.assets || defaults.assets),
		atmosphere: normalizeAtmosphere(value.atmosphere || defaults.atmosphere),
		camera: normalizeCamera(value.camera || defaults.camera),
		id,
		kind: MOVIE_WORLD_SPEC_KIND,
		label: String(value.label || defaults.label || humanize(regionId)),
		packageId,
		population: normalizePopulation(value.population || defaults.population),
		prompt,
		quest: normalizeQuest(value.quest ?? defaults.quest),
		regionId,
		seed,
		version: MOVIE_WORLD_SPEC_VERSION
	});
}

export function isMovieWorldSpec(value) {
	return Boolean(value && typeof value === 'object'
		&& value.kind === MOVIE_WORLD_SPEC_KIND
		&& Number(value.version) === MOVIE_WORLD_SPEC_VERSION);
}

export function movieWorldSpecIdentity(value) {
	return normalizeMovieWorldSpec(value).id;
}

function normalizeAtmosphere(value = {}) {
	return {
		ambience: String(value.ambience || 'meadow'),
		mood: String(value.mood || 'hopeful'),
		timeOfDay: String(value.timeOfDay || 'golden-hour'),
		weather: String(value.weather || 'clear')
	};
}

function normalizeCamera(value = {}) {
	return {
		energy: String(value.energy || 'measured'),
		preferredRigs: stringArray(value.preferredRigs),
		shotScale: String(value.shotScale || 'cinematic')
	};
}

function normalizePopulation(value = {}) {
	return {
		crowd: boundedInteger(value.crowd, 0, 96, 8),
		enemies: boundedInteger(value.enemies, 0, 24, 0),
		npcs: boundedInteger(value.npcs, 0, 48, 4),
		vegetation: String(value.vegetation || 'native')
	};
}

function normalizeQuest(value) {
	if (!value) return null;
	if (value === true) return { enabled: true, id: 'three-shadows-before-sunset' };
	return {
		enabled: value.enabled !== false,
		id: String(value.id || 'three-shadows-before-sunset')
	};
}

function packageForRegion(regionId) {
	return ['kedem-gate', 'cedar-terraces', 'letter-quarry', 'warden-summit']
		.includes(regionId) ? 'kedem-highlands' : 'lower-meadow';
}

function humanize(value) {
	return String(value).split('-').map(word => (
		word ? word[0].toUpperCase() + word.slice(1) : ''
	)).join(' ');
}

function stringArray(value) {
	return Array.isArray(value) ? value.map(String).filter(Boolean) : [];
}

function boundedInteger(value, minimum, maximum, fallback) {
	const number = Number(value);
	if (!Number.isFinite(number)) return fallback;
	return Math.max(minimum, Math.min(maximum, Math.round(number)));
}

function finiteSeed(value) {
	const number = Number(value);
	return (Number.isFinite(number) ? Math.floor(number) : 1) >>> 0 || 1;
}
