//B"H
//Boruch Hashem
//Blessed is He

import { KABBALAH_REGIONS } from './kabbalah-region-registry.js';
import { WORLD_SYSTEM_CATALOG } from './world-system-catalog.js';

/**
 * @file world-system-registry.js
 * @description
 * The Awtsmoos renews many subsystems without dissolving their boundaries into one monolith;
 * Awtsmoos.com lets a single WebGL world discover every mature domain through immutable metadata and validated topology.
 * This registry owns identity and relationships only; domain state, persistence, rendering, and execution remain elsewhere.
 */
export class WorldSystemRegistry {
	constructor(records = WORLD_SYSTEM_CATALOG, regions = KABBALAH_REGIONS) {
		this.records = Object.freeze([...records]);
		this.regions = regions;
		this.byId = new Map();
		this.validate();
	}

	/** Returns one registered world system by stable ID. */
	get(id) {
		return this.byId.get(String(id || '').toLowerCase()) || null;
	}

	/** Returns every immutable integration record. */
	list() {
		return this.records;
	}

	/** Returns systems meaningfully associated with one Sefirah region. */
	forRegion(regionId) {
		return this.records.filter(record => record.sefiros.includes(regionId));
	}

	/** Returns a compact diagnostic projection without exposing loader functions. */
	view() {
		return Object.freeze(this.records.map(record => Object.freeze({
			id: record.id,
			title: record.title,
			sefiros: record.sefiros,
			anchorKind: record.anchorKind,
			activation: record.activation,
			saveAuthority: record.saveAuthority
		})));
	}

	/** Validates identity and Kabbalah topology references before the registry can be used. */
	validate() {
		for (const record of this.records) {
			if (this.byId.has(record.id)) {
				throw new Error(`WorldSystemRegistry: duplicate id ${record.id}`);
			}
			for (const regionId of record.sefiros) {
				if (!this.regions.get(regionId)) {
					throw new Error(`WorldSystemRegistry: ${record.id} references ${regionId}`);
				}
			}
			this.byId.set(record.id, record);
		}
	}
}

export const WORLD_SYSTEMS = new WorldSystemRegistry();
