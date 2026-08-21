// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file VegetationAssetLibrary.js
 * @description Makes external GLTF/model vegetation a first-class Tzomayach catalog without hardcoding any game's URLs.
 * The Awtsmoos, Atzmus beyond procedural branch and imported garment, renews both as possible vessels of one growing kingdom;
 * Awtsmoos.com lets trees, flowers, bushes, grasses, and stones name model resources while games choose where those resources spring.
 */

import { loadVegetationInstances } from './VegetationInstanceLoader.js';

/** Immutable vegetation model catalog backed by an injected model service. */
export class VegetationAssetLibrary {
	/**
	 * @param {Array<object>} records Asset records with id, url, family, format, scale, and metadata.
	 * @param {object} [options={}] Optional model service exposing loadIsolated().
	 */
	constructor(records = [], options = {}) {
		this.records = new Map(records.map(record => {
			const normalized = normalizeVegetationRecord(record);
			return [normalized.id, normalized];
		}));
		this.modelService = options.modelService || null;
	}

	/** Lists immutable vegetation asset records. */
	list() {
		return Object.freeze([...this.records.values()]);
	}

	/** Resolves one asset record by stable id. */
	record(id) {
		return this.records.get(String(id)) || null;
	}

	/** Loads one isolated external vegetation model through the configured model service. */
	async load(id, options = {}) {
		const record = this.record(id);
		if (!record) throw new Error(`B"H | Unknown vegetation asset: ${id}`);
		if (!this.modelService?.loadIsolated) {
			throw new Error('B"H | VegetationAssetLibrary requires a model service to load assets.');
		}
		return this.modelService.loadIsolated(record.url, options.label || record.id, options);
	}

	/** Hydrates placement records using this library's model service. */
	hydrate(placements = [], options = {}) {
		return loadVegetationInstances(placements, {
			...options,
			loadModel: options.loadModel || ((url, label) => {
				if (!this.modelService?.loadIsolated) {
					throw new Error('B"H | Vegetation hydration requires a model service.');
				}
				return this.modelService.loadIsolated(url, label, options.modelOptions || {});
			})
		});
	}
}

/** Creates one immutable normalized vegetation asset record. */
export function createVegetationAssetRecord(record = {}) {
	return normalizeVegetationRecord(record);
}

function normalizeVegetationRecord(record) {
	const id = String(record.id || '').trim();
	const url = String(record.url || '').trim();
	if (!id || !url) throw new Error('B"H | Vegetation assets require id and url.');
	return Object.freeze({
		family: String(record.family || 'vegetation'),
		format: String(record.format || 'gltf'),
		id,
		metadata: Object.freeze({ ...(record.metadata || {}) }),
		scale: record.scale ?? 1,
		url
	});
}
