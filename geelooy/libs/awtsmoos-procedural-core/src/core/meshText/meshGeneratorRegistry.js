// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file meshGeneratorRegistry.js
 * @description A registry lets new families enter without a central switch
 * becoming an idol of complexity. Distinct vessels serve one intention, as the
 * Awtsmoos gives each generator its place without surrendering deterministic order.
 */

import { BOX_MESH_GENERATORS } from './boxMeshGenerator.js';

export class MeshGeneratorRegistry {
	constructor() {
		this.generators = new Map();
	}

	/** @param {object} generator Generator contract. @returns {MeshGeneratorRegistry} Registry. */
	register(generator) {
		if (!generator?.id || typeof generator.generate !== 'function') {
			throw new TypeError('Mesh generators require an id and generate function.');
		}

		if (this.generators.has(generator.id)) {
			throw new Error(`Mesh generator already registered: ${generator.id}`);
		}

		this.generators.set(generator.id, generator);
		return this;
	}

	/** @param {object} recipe Normalized recipe. @returns {object} Winning generator. */
	resolve(recipe) {
		const candidates = [...this.generators.values()]
			.filter(generator => generator.supports?.(recipe))
			.sort((left, right) => (right.rank || 0) - (left.rank || 0) || left.id.localeCompare(right.id));

		if (!candidates.length) {
			throw new Error(`No mesh generator supports recipe generator ${recipe.generator}.`);
		}

		return candidates[0];
	}

	/** @returns {Array<{id:string, version:string, rank:number}>} Generator metadata. */
	list() {
		return [...this.generators.values()]
			.map(generator => ({ id: generator.id, version: generator.version, rank: generator.rank || 0 }))
			.sort((left, right) => left.id.localeCompare(right.id));
	}
}

export const meshGeneratorRegistry = new MeshGeneratorRegistry();

for (const generator of BOX_MESH_GENERATORS) {
	meshGeneratorRegistry.register(generator);
}

/** @param {object} generator Generator contract. @returns {MeshGeneratorRegistry} Registry. */
export function registerMeshGenerator(generator) {
	return meshGeneratorRegistry.register(generator);
}

/** @returns {Array<{id:string, version:string, rank:number}>} Registered generators. */
export function listMeshGenerators() {
	return meshGeneratorRegistry.list();
}

/** @param {object} recipe Normalized recipe. @returns {object} Winning generator. */
export function resolveMeshGenerator(recipe) {
	return meshGeneratorRegistry.resolve(recipe);
}
