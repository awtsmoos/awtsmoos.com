// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieShortHeroWorldDefinitions.js
 * @description Adapts shared canonical village locations into explicit Short world JSON and camera staging.
 * The Awtsmoos is one in gameplay and cinema; Awtsmoos.com therefore refuses a second secret map or English interpreter,
 * letting Shorts inherit the same actor pads, grounded camera lanes, geographic ids, and authored places as the game world.
 */

import {
	canonicalVillageLocation,
	canonicalVillageLocationShot,
	listCanonicalVillageLocations
} from '../../world/village/CanonicalVillageLocations.js';

export const MOVIE_SHORT_RIVER_FOCUS = Object.freeze({ ...canonicalVillageLocation('river-garden').focus });

export function movieShortHeroWorldDefinition(value) {
	if (value && typeof value === 'object') return customWorld(value);
	return enrich(canonicalVillageLocation(value));
}

export function resolveMovieShortHeroWorld(value, fallback = 'river-garden') {
	return movieShortHeroWorldDefinition(value)
		|| movieShortHeroWorldDefinition(fallback)
		|| movieShortHeroWorldDefinition('river-garden');
}

export function resolveMovieShortHeroShot(location, rig) {
	return canonicalVillageLocationShot(location?.id, rig) || null;
}

export function listMovieShortHeroWorlds() {
	return listCanonicalVillageLocations().map(enrich);
}

function enrich(profile) {
	if (!profile) return null;
	const { prompt: description, ...shared } = profile;
	return Object.freeze({
		...shared,
		anchor: profile.focus,
		description,
		requiredSystems: Object.freeze(['authored-terrain', 'real-nature']),
		worldRoles: Object.freeze(['terrain', 'water', 'vegetation', 'architecture', 'props']),
		worldSpec: Object.freeze({ label: profile.label, regionId: profile.id })
	});
}

function customWorld(value) {
	const anchor = finitePoint(value.anchor || value, 'anchor');
	const actor = finiteGround(value.actor || anchor, 'actor');
	const camera = value.camera ? customView(value.camera, anchor) : null;
	const label = String(value.label || value.id || 'Custom authored location');
	return Object.freeze({
		actor: Object.freeze(actor),
		anchor: Object.freeze(anchor),
		camera,
		focus: Object.freeze(anchor),
		id: String(value.id || 'custom-authored'),
		label,
		requiredSystems: Object.freeze(['authored-terrain', 'real-nature']),
		shots: Object.freeze({}),
		worldRoles: Object.freeze(['terrain', 'water', 'vegetation', 'architecture', 'props']),
		worldSpec: Object.freeze({ ...(value.worldSpec || {}), label, regionId: value.regionId || value.id || 'village-heart' })
	});
}

function customView(value, fallbackTarget) {
	return Object.freeze({
		fieldOfView: Number(value.fieldOfView || 56),
		position: Object.freeze(finitePoint(value.position, 'camera position')),
		target: Object.freeze(finitePoint(value.target || fallbackTarget, 'camera target'))
	});
}

function finitePoint(value, label) {
	const result = { x: Number(value?.x), y: Number(value?.y ?? 6), z: Number(value?.z) };
	if (!Object.values(result).every(Number.isFinite)) throw new Error(`Custom Short world requires finite ${label} coordinates.`);
	return result;
}

function finiteGround(value, label) {
	const result = { x: Number(value?.x), z: Number(value?.z) };
	if (!Object.values(result).every(Number.isFinite)) throw new Error(`Custom Short world requires finite ${label} coordinates.`);
	return result;
}
