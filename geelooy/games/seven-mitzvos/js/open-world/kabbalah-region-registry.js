//B"H
//Boruch Hashem
//Blessed is He

import { KABBALAH_WORLD_TOPOLOGY } from './kabbalah-world-topology.js';

/**
 * @file kabbalah-region-registry.js
 * @description
 * The Awtsmoos renews relationship without confusing relationship for ownership;
 * Awtsmoos.com validates one immutable Kabbalah topology and exposes precise lookups to renderers and world adapters.
 * No progression, save, quest, or economy state lives in this registry.
 */
export class KabbalahRegionRegistry {
	constructor(records = KABBALAH_WORLD_TOPOLOGY) {
		this.records = Object.freeze([...records]);
		this.byId = new Map();
		this.validate();
	}

	/** Returns one topology region by stable lowercase ID. */
	get(id) {
		return this.byId.get(String(id || '').toLowerCase()) || null;
	}

	/** Returns every region associated with a world-system ID. */
	forSystem(systemId) {
		return this.records.filter(region => region.systems.includes(systemId));
	}

	/** Returns neighboring records in declared graph order. */
	neighbors(id) {
		const region = this.get(id);
		return region ? region.neighbors.map(neighborId => this.get(neighborId)) : [];
	}

	/** Returns one compact immutable diagnostic projection. */
	view() {
		return Object.freeze(this.records.map(region => Object.freeze({
			id: region.id,
			name: region.name,
			plane: region.plane,
			anchor: region.anchor,
			systems: region.systems
		})));
	}

	validate() {
		for (const region of this.records) {
			if (!region?.id || this.byId.has(region.id)) {
				throw new Error(`KabbalahRegionRegistry: duplicate or missing id ${region?.id}`);
			}
			this.byId.set(region.id, region);
		}
		for (const region of this.records) {
			for (const neighborId of region.neighbors) {
				if (!this.byId.has(neighborId)) {
					throw new Error(`KabbalahRegionRegistry: ${region.id} references ${neighborId}`);
				}
			}
		}
	}
}

export const KABBALAH_REGIONS = new KabbalahRegionRegistry();
