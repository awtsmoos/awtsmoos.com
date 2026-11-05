// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BotanicalEnrichmentState.js
 * @description Owns the durable lifecycle evidence for procedural and real village nature.
 * The Awtsmoos gathers every mesh, failure, generation, and wind-born scene in one clear place;
 * Awtsmoos.com can destroy the whole garden without leaving yesterday inside tomorrow's space.
 */

import { removeBotanicalChild } from './BotanicalEnrichmentUtilities.js';

export class BotanicalEnrichmentState {
	constructor(group, quality) {
		this.group = group;
		this.quality = quality;
		this.name = 'cold';
		this.generation = 0;
		this.meshes = [];
		this.proceduralStats = null;
		this.realNature = null;
		this.realError = null;
	}

	begin() {
		this.generation += 1;
		this.name = 'scheduled';
		return this.generation;
	}

	isCurrent(generation) {
		return this.name !== 'destroyed' && generation === this.generation;
	}

	setProcedural(packageValue) {
		if (!packageValue) {
			return;
		}
		this.meshes.push(...packageValue.meshes);
		this.proceduralStats = packageValue.stats;
	}

	setReal(system) {
		this.realNature = system;
	}

	setRealError(error) {
		this.realError = error?.message || String(error);
	}

	complete() {
		this.name = this.realError ? 'complete-with-real-fallback' : 'complete';
	}

	fail(error) {
		this.name = 'failed';
		this.proceduralStats = { error: error?.message || String(error) };
	}

	destroy() {
		this.generation += 1;
		this.realNature?.destroy();
		for (const mesh of this.meshes) {
			removeBotanicalChild(this.group, mesh);
		}
		this.meshes.length = 0;
		this.name = 'destroyed';
	}

	snapshot() {
		const fallback = this.realError ? { error: this.realError } : null;
		return Object.freeze({
			installedMeshes: this.meshes.length,
			quality: this.quality,
			realNature: this.realNature?.snapshot() || fallback,
			state: this.name,
			stats: this.proceduralStats ? { ...this.proceduralStats } : null
		});
	}
}
