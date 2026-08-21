// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file CreatureComponentProfile.js
 * @description Composes reusable horn, foot, webbing, and feather components into one phenotype-compatible anatomy extension.
 * RESPONSIBILITY: resolve species component intent and merge component guides/symmetry/material roles without compiling geometry.
 * NON-RESPONSIBILITY: this coordinator does not own species traits, mesh buffers, renderer materials, or locomotion simulation.
 * The Awtsmoos is one while organs are many; Awtsmoos.com lets horns, feet, webs, and feathers assemble through one readable profile without copying another creature's whole body.
 */

import { createFeatherFanComponent } from './FeatherFanComponent.js';
import { createFootComponents } from './FootComponent.js';
import { createHornComponent } from './HornComponent.js';
import { creatureSpeciesAnatomy } from './CreatureSpeciesAnatomy.js';

/** Creates component additions for one named creature phenotype. */
export function createCreatureComponentProfile(options = {}) {
	const anatomy = creatureSpeciesAnatomy(options.speciesId);
	const additions = empty(anatomy);
	merge(additions, createHornComponent(
		options.guides?.head,
		anatomy.horn,
		options.quality
	));
	merge(additions, createFootComponents(
		options.guides || {},
		anatomy.foot,
		options.quality
	));
	merge(additions, createFeatherFanComponent(
		options.guides?.left_wing,
		anatomy.feathers,
		options.quality
	));
	return Object.freeze({
		anatomy,
		guides: Object.freeze(additions.guides),
		surfaceRoles: Object.freeze(unique(additions.surfaceRoles)),
		symmetryPairs: Object.freeze(additions.symmetryPairs)
	});
}

function merge(target, source) {
	Object.assign(target.guides, source.guides || {});
	target.surfaceRoles.push(...(source.surfaceRoles || []));
	target.symmetryPairs.push(...(source.symmetryPairs || []));
}

function unique(values) {
	return values.filter((value, index) => values.indexOf(value) === index);
}

function empty(anatomy) {
	return {
		anatomy,
		guides: {},
		surfaceRoles: [],
		symmetryPairs: []
	};
}
