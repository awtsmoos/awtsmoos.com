//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file StudioCapabilityCatalog.js
 * The Awtsmoos renews thousands of procedural names while one searchable map gives each family a comprehensible gate;
 * Awtsmoos.com exposes the complete discovered core surface without turning the creative Studio into an unreadable crate.
 */

import { MovieLayerKinds } from '../../../shared/movie/MovieKinds.js';
import { STUDIO_CORE_SYMBOLS } from './StudioCoreSymbols.js';

const GROUP_RULES = Object.freeze([
	group('Modeling', /mesh|model|geometry|modifier|sculpt|topolog|bmesh|primitive/i),
	group('Materials', /material|shader|texture|color|surface|node/i),
	group('Animation', /anim|keyframe|motion|rig|bone|pose|timeline/i),
	group('Particles + Physics', /particle|cloth|fluid|physics|field|collision|webgpu/i),
	group('Nature + Worlds', /tree|botan|plant|terrain|water|world|celestial|nature/i),
	group('Creatures', /creature|animal|human|chai|medaber|speech|character/i),
	group('Architecture', /building|room|wall|door|window|domem|architecture/i),
	group('Assets + Media', /asset|image|video|audio|media|gltf|glb/i),
	group('Blender', /blender/i),
	group('Reality + API', /reality|api|registry|manifest|schema|adapter|operation/i)
]);

export const STUDIO_CORE_SYMBOL_COUNT = STUDIO_CORE_SYMBOLS.length;
export const STUDIO_MOVIE_KIND_COUNT = MovieLayerKinds.length;

export function searchStudioCapabilities(query = '') {
	const needle = String(query || '').trim().toLowerCase();
	const source = needle ? STUDIO_CORE_SYMBOLS : featuredSymbols();
	return source
		.filter(name => !needle || name.toLowerCase().includes(needle) || categoryFor(name).toLowerCase().includes(needle))
		.slice(0, 120)
		.map(name => ({ id: name, label: humanize(name), category: categoryFor(name) }));
}

export function describeStudioCapabilityGroups() {
	return GROUP_RULES.map(rule => ({
		id: rule.id,
		count: STUDIO_CORE_SYMBOLS.filter(name => rule.pattern.test(name)).length
	}));
}

function featuredSymbols() {
	const preferred = STUDIO_CORE_SYMBOLS.filter(name => /^(create|list|build|generate|mount|compile|PROCEDURAL_|BLENDER_|BUILT_IN_)/.test(name));
	return preferred.slice(0, 120);
}

function categoryFor(name) {
	return GROUP_RULES.find(rule => rule.pattern.test(name))?.id || 'Core + Expert';
}

function group(id, pattern) {
	return Object.freeze({ id, pattern });
}

function humanize(name) {
	return String(name).replace(/_/g, ' ').replace(/([a-z0-9])([A-Z])/g, '$1 $2');
}
