//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file StudioAnimatorGeneratorCatalog.js
 * The Awtsmoos renews many generators without dissolving their names into one;
 * Awtsmoos.com lets AI choose a production kind or a precise Animator module for the work to be done.
 */

import { STUDIO_ANIMATOR_GENERATOR_MODULES_A } from './StudioAnimatorGeneratorModulesA.js';
import { STUDIO_ANIMATOR_GENERATOR_MODULES_B } from './StudioAnimatorGeneratorModulesB.js';

const REGISTRY_MODULE = '../../../animator/src/studio/procedural/StudioProceduralRegistry.js';
const ALL_MODULES = Object.freeze([
	...STUDIO_ANIMATOR_GENERATOR_MODULES_A,
	...STUDIO_ANIMATOR_GENERATOR_MODULES_B
]);

/** Lazily return Animator's exact production procedural kinds and their native defaults/schemas. */
export async function animatorProductionGeneratorCatalog() {
	const { StudioProceduralRegistry } = await import(REGISTRY_MODULE);
	return StudioProceduralRegistry.kinds().map((kind) => ({
		id: kind,
		label: StudioProceduralRegistry.label(kind),
		defaults: StudioProceduralRegistry.defaults(kind),
		schema: StudioProceduralRegistry.schema(kind),
		provider: 'animator-procedural'
	}));
}

/** Return every observed Generator/Builder/Field module as its own discoverable identity. */
export function animatorGeneratorModules() {
	return ALL_MODULES.map((modulePath) => ({
		id: modulePath.split('/').pop().replace(/\.js$/, ''),
		modulePath,
		category: moduleCategory(modulePath),
		role: moduleRole(modulePath),
		provider: 'animator'
	}));
}

/** Return a truthful high-level manifest without loading Animator implementation modules. */
export function describeAnimatorGeneratorProvider() {
	return {
		provider: 'animator',
		lazy: true,
		productionKinds: ['tree', 'vegetable', 'flower', 'rock', 'cloud'],
		moduleCount: ALL_MODULES.length,
		separateModuleIdentities: true,
		outputsMayRemainNativeOrBecomeCanonicalLayers: true,
		outputsMayBeSpatializedIntoThreeDimensions: true
	};
}

function moduleCategory(modulePath) {
	const parts = modulePath.split('/');
	return parts.slice(Math.max(0, parts.length - 4), -1).join('/');
}

function moduleRole(modulePath) {
	const name = modulePath.split('/').pop();
	if (name.includes('Generator')) return 'generator';
	if (name.includes('Builder')) return 'builder';
	if (name.includes('Field')) return 'field';
	return 'support';
}
