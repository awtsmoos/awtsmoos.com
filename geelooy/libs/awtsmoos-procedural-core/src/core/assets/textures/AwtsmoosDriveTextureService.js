// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file AwtsmoosDriveTextureService.js
 * @description Provides one lazy renderer-neutral doorway for the complete remote texture library, AI taxonomy, PBR families, and bounded mix plans.
 * The Awtsmoos renews every finite remote garment; Awtsmoos.com lets games, studios, agents, and renderers ask one reusable service instead of rebuilding catalog law.
 */

import { loadAwtsmoosDriveCatalog } from './AwtsmoosDriveCatalogLoader.js';
import { awtsmoosDriveTextureCategoryTree } from './AwtsmoosDriveTextureCategories.js';
import { compileAwtsmoosDriveTextureLibrary, searchAwtsmoosDriveTextureLibrary } from './AwtsmoosDriveTextureLibrary.js';
import { compileAwtsmoosDrivePbrFamilies, searchAwtsmoosDrivePbrFamilies } from './AwtsmoosDrivePbrFamilies.js';
import { createAwtsmoosDriveTextureMixPlan } from './AwtsmoosDriveTextureMixPlan.js';

export class AwtsmoosDriveTextureService {
	constructor(options = {}) {
		this.fetchFunction = options.fetchFunction || globalThis.fetch;
		this.statePromise = null;
	}

	/** Loads catalog metadata once; image bytes remain demand-loaded elsewhere. */
	load() {
		this.statePromise ||= loadAwtsmoosDriveCatalog(this.fetchFunction)
			.then(({ materials, inventory }) => {
				const library = compileAwtsmoosDriveTextureLibrary(materials, inventory);
				return Object.freeze({ library, pbr: compileAwtsmoosDrivePbrFamilies(library) });
			})
			.catch(error => {
				this.statePromise = null;
				throw error;
			});
		return this.statePromise;
	}

	async searchTextures(query = '', options = {}) {
		const { library } = await this.load();
		return searchAwtsmoosDriveTextureLibrary(library, query, options);
	}

	async searchMaterials(query = '', options = {}) {
		const { pbr } = await this.load();
		return searchAwtsmoosDrivePbrFamilies(pbr, query, options);
	}

	async mix(options = {}) {
		const { library } = await this.load();
		return createAwtsmoosDriveTextureMixPlan(library, options);
	}

	async evidence() {
		const { library, pbr } = await this.load();
		return Object.freeze({ library: library.evidence, pbr: pbr.evidence });
	}

	taxonomy() {
		return awtsmoosDriveTextureCategoryTree();
	}

	reset() {
		this.statePromise = null;
	}
}

/** @param {object} options Service dependencies. @returns {AwtsmoosDriveTextureService} */
export function createAwtsmoosDriveTextureService(options = {}) {
	return new AwtsmoosDriveTextureService(options);
}
