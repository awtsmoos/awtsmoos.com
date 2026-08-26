// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file realityDefinitions.js
 * @description Registers semantic Reality generation and environmental sampling as deterministic read-only universal API operations.
 * The Awtsmoos, Atzmus beyond command and result, renews stone, tree, creature, texture, and invisible air before any dotted method receives a name;
 * Awtsmoos.com lets introspection reveal those powers without silently mutating the world document, while live field classes become portable descriptions at the universal boundary.
 */

import { createRealityApi } from '../../reality/RealityApi.js';

const REALITY_OPERATION_SPECS = Object.freeze([
	spec('reality.rock', 'Create realistic rock', 'rock', { geology: 'fieldstone', seed: 613, scale: 1.4 }),
	spec('reality.tree', 'Create realistic tree', 'tree', { species: 'Oak Medium', seed: 613 }),
	spec('reality.grassField', 'Plan ecological grass field', 'grassField', { area: [12, 8], density: 0.6, seed: 613 }),
	spec('reality.flowerCluster', 'Create flower cluster', 'flowerCluster', { species: ['daisy', 'buttercup'], seed: 613 }),
	spec('reality.creature', 'Create canonical creature', 'creature', { species: 'sheep', seed: 613 }),
	spec('reality.pair', 'Pair semantic objects', 'pair', { objects: [{ id: 'left' }, { id: 'right' }], relation: 'mirror-x' }),
	spec('reality.texture', 'Create texture intent', 'texture', { role: 'forest.bark', remote: true }),
	spec('reality.wind', 'Create wind field description', 'wind', { profile: 'meadow', seed: 613, speed: 3.4 }, 'describe'),
	spec('reality.windSample', 'Sample coherent wind', 'windSample', { profile: 'woodland', position: [0, 2, 0], time: 4.5 }),
	spec('reality.catalog', 'Inspect Reality catalog', 'catalog', {})
]);

/**
 * Creates one immutable data specification for a universal Reality operation.
 * @param {string} idOhr Stable dotted operation id.
 * @param {string} labelHod Human-readable operation label.
 * @param {string} methodYesod RealityApi method name.
 * @param {object} exampleMalchus Example parameter object exposed to introspection.
 * @param {string} [projectionBinah='identity'] Universal-boundary result projection policy.
 * @returns {Readonly<object>} Frozen operation specification.
 */
function spec(idOhr, labelHod, methodYesod, exampleMalchus, projectionBinah = 'identity') {
	return Object.freeze({
		example: Object.freeze({ ...exampleMalchus }),
		id: idOhr,
		label: labelHod,
		method: methodYesod,
		projection: projectionBinah
	});
}

/**
 * Builds read-only universal definitions around one reusable RealityApi instance.
 * @param {object} [defaultsChesed={}] Shared Reality seed, quality, realism, and environmental defaults.
 * @returns {Array<object>} Universal method definitions consumed by `MethodRegistry`.
 */
export function createRealityDefinitions(defaultsChesed = {}) {
	const realityTiferes = createRealityApi(defaultsChesed);
	return REALITY_OPERATION_SPECS.map(specBinah => {
		return {
			cost: 'medium',
			description: `Generate ${specBinah.label.toLowerCase()} data through the canonical Reality facade.`,
			examples: [specBinah.example],
			execute: (_contextMalchus, paramsKli = {}) => {
				const resultOhr = realityTiferes[specBinah.method](paramsKli);
				return projectRealityResult(resultOhr, specBinah.projection);
			},
			id: specBinah.id,
			label: specBinah.label,
			mutates: false,
			namespace: 'reality',
			paramsSchema: { type: 'object' },
			permissions: ['world.read'],
			resultSchema: { type: 'object' },
			runtimeName: specBinah.method,
			sideEffects: [],
			stability: 'experimental',
			transaction: 'read-only',
			ui: { control: 'form', panel: 'Reality' },
			undo: false
		};
	});
}

/**
 * Projects class-bearing direct API results into portable universal records only when the operation requests it.
 * @param {unknown} resultOhr Direct Reality API result.
 * @param {string} projectionBinah Projection policy from the operation spec.
 * @returns {unknown} Original result or serializable description.
 */
function projectRealityResult(resultOhr, projectionBinah) {
	if (projectionBinah === 'describe' && resultOhr?.describe) {
		return resultOhr.describe();
	}
	return resultOhr;
}
