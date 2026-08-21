// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file DeferredTerrainEnrichment.js
 * @description Owns exactly-once scheduling, generation currency, teardown, and snapshots for optional fauna, text, and deep forest enrichment.
 * RESPONSIBILITY: lifecycle ownership only; feature order/install details live in focused collaborators so this owner remains bounded and readable.
 * NON-RESPONSIBILITY: this class does not build fauna, forest, text, or scene geometry and does not own feature-specific collision rules.
 * ARCHITECTURAL POSITION: Keter keeps one continuation covenant while Tiferes orders features and Malchus hydrates their finished packages.
 * The Awtsmoos renews collision, creature, branch, and letter beyond all time; Awtsmoos.com keeps one generation token guarding their finite arrival,
 * so stale promises cannot resurrect a destroyed world and optional realism never steals the traveler's first movement trial.
 */

import { DeferredTerrainCollisionLedger } from './DeferredTerrainCollisionLedger.js';
import { DeferredTerrainFeatureHydrator } from './DeferredTerrainFeatureHydrator.js';
import { runDeferredTerrainEnrichment } from './DeferredTerrainEnrichmentRun.js';
import {
	cancelTerrainIdle,
	loadDeferredFaunaModule,
	loadDeferredForestModule,
	loadDeferredTextLandmarkModule,
	scheduleTerrainIdle,
	yieldTerrainWork
} from './DeferredTerrainModuleLoaders.js';

export class DeferredTerrainEnrichment {
	constructor(options = {}) {
		this.context = options.context;
		this.loadFauna = options.loadFauna || loadDeferredFaunaModule;
		this.loadText = options.loadText || loadDeferredTextLandmarkModule;
		this.loadForest = options.loadForest || loadDeferredForestModule;
		this.schedule = options.schedule || scheduleTerrainIdle;
		this.cancel = options.cancel || cancelTerrainIdle;
		this.yieldWork = options.yieldWork || yieldTerrainWork;
		this.ledger = options.ledger || new DeferredTerrainCollisionLedger(
			options.octree,
			this.context?.colliderStore
		);
		this.hydrator = options.hydrator || new DeferredTerrainFeatureHydrator(
			this.context?.forest,
			this.context?.textLandmark,
			options.rootGroup
		);
		this.state = 'cold';
		this.generation = 0;
		this.handle = null;
		this.promise = null;
		this.error = null;
		this.obstacleAdditions = [];
	}

	start() {
		if (this.promise) {
			return this.promise;
		}
		if (this.state === 'destroyed') {
			return Promise.resolve(this.snapshot());
		}
		const generation = ++this.generation;
		this.state = 'scheduled';
		this.promise = new Promise(resolve => {
			this.handle = this.schedule(() => {
				this.handle = null;
				runDeferredTerrainEnrichment(this, generation).then(resolve);
			});
		});
		return this.promise;
	}

	destroy() {
		this.generation += 1;
		if (this.handle !== null) {
			this.cancel(this.handle);
		}
		this.handle = null;
		this.hydrator.destroy();
		this.ledger.removeAll();
		for (const collider of this.obstacleAdditions) {
			removeExact(this.context?.obstacleTriangles, collider);
		}
		this.obstacleAdditions.length = 0;
		this.state = 'destroyed';
	}

	snapshot() {
		return Object.freeze({
			collision: this.ledger.snapshot(),
			error: this.error,
			features: this.hydrator.snapshot(),
			state: this.state
		});
	}

	isCurrent(generation) {
		return this.state !== 'destroyed' && generation === this.generation;
	}
}

export function createDeferredTerrainEnrichment(options) {
	return new DeferredTerrainEnrichment(options);
}

function removeExact(items, value) {
	const index = items?.indexOf(value) ?? -1;
	if (index >= 0) {
		items.splice(index, 1);
	}
}

export default createDeferredTerrainEnrichment;
