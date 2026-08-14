// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieWorldSpec.js
 * @description Normalizes explicit JSON world specifications without interpreting prose.
 * The Awtsmoos is beyond region, weather, texture, and road, while each finite world needs a declared vessel to show;
 * Awtsmoos.com keeps that vessel deterministic and portable so gameplay and Movie Studio share one reality as they grow.
 */

import { createMovieProjectSnapshot } from './MovieProjectSnapshot.js';
import { hashMovieProceduralText } from './MovieProceduralSeed.js';
import { normalizeMovieWorldDomains } from './MovieWorldSpecDomains.js';

export const MOVIE_WORLD_SPEC_KIND = 'awtsmoos.movie.world-spec';
export const MOVIE_WORLD_SPEC_VERSION = 2;

export function normalizeMovieWorldSpec(source = {}, defaults = {}) {
	const value = normalizeSource(source);
	const fallback = normalizeSource(defaults);
	const regionId = String(value.regionId || fallback.regionId || 'village-heart');
	const packageId = String(value.packageId || fallback.packageId || packageForRegion(regionId));
	const domains = normalizeMovieWorldDomains(value, fallback);
	const identity = JSON.stringify({
		assets: value.assets || fallback.assets || [],
		domains,
		packageId,
		population: value.population || fallback.population || {},
		quest: value.quest ?? fallback.quest ?? null,
		regionId
	});
	const seed = finiteSeed(value.seed ?? fallback.seed ?? hashMovieProceduralText(identity));
	const id = String(value.id || fallback.id || `${packageId}:${regionId}:${seed}`);
	return createMovieProjectSnapshot({
		assets: stringArray(value.assets || fallback.assets),
		atmosphere: normalizeAtmosphere(value.atmosphere || fallback.atmosphere),
		camera: normalizeCamera(value.camera || fallback.camera),
		...domains,
		id,
		kind: MOVIE_WORLD_SPEC_KIND,
		label: String(value.label || fallback.label || regionId),
		packageId,
		population: normalizePopulation(value.population || fallback.population),
		quest: normalizeQuest(value.quest ?? fallback.quest),
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

function normalizeSource(value) {
	if (typeof value === 'string') {
		return { id: value, label: value, regionId: value };
	}
	return value && typeof value === 'object' && !Array.isArray(value) ? { ...value } : {};
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
	return { enabled: value.enabled !== false, id: String(value.id || 'three-shadows-before-sunset') };
}

function packageForRegion(regionId) {
	return ['kedem-gate', 'cedar-terraces', 'letter-quarry', 'warden-summit'].includes(regionId)
		? 'kedem-highlands'
		: 'lower-meadow';
}

function stringArray(value) {
	return Array.isArray(value) ? value.map(String).filter(Boolean) : [];
}

function boundedInteger(value, minimum, maximum, fallback) {
	const number = Number(value);
	return Number.isFinite(number) ? Math.max(minimum, Math.min(maximum, Math.round(number))) : fallback;
}

function finiteSeed(value) {
	const number = Number(value);
	return (Number.isFinite(number) ? Math.floor(number) : 1) >>> 0 || 1;
}
