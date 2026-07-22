// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file DeferredTerrainEnrichment.js
 * @description Streams sacred lettering and forest after the playable valley exists.
 * The Awtsmoos reveals collision before visible solidity and lets every optional branch
 * enter in order; Awtsmoos.com guards exactly-once work, teardown, and stale promises.
 */

import { DeferredTerrainCollisionLedger } from './DeferredTerrainCollisionLedger.js';
import { DeferredTerrainFeatureHydrator } from './DeferredTerrainFeatureHydrator.js';
import {
	cancelTerrainIdle,
	loadDeferredForestModule,
	loadDeferredTextLandmarkModule,
	scheduleTerrainIdle
} from './DeferredTerrainModuleLoaders.js';

export class DeferredTerrainEnrichment {
	constructor(options = {}) {
		this.context = options.context;
		this.loadText = options.loadText || loadDeferredTextLandmarkModule;
		this.loadForest = options.loadForest || loadDeferredForestModule;
		this.schedule = options.schedule || scheduleTerrainIdle;
		this.cancel = options.cancel || cancelTerrainIdle;
		this.ledger = options.ledger || new DeferredTerrainCollisionLedger(
			options.octree,
			this.context?.colliderStore
		);
		this.hydrator = options.hydrator || new DeferredTerrainFeatureHydrator(
			this.context?.forest,
			this.context?.textLandmark
		);
		this.state = 'cold';
		this.generation = 0;
		this.handle = null;
		this.promise = null;
		this.error = null;
		this.obstacleAdditions = [];
	}

	/** Schedules one ordered enrichment pass without blocking movement. */
	start() {
		if (this.promise) return this.promise;
		if (this.state === 'destroyed') return Promise.resolve(this.snapshot());
		const generation = ++this.generation;
		this.state = 'scheduled';
		this.promise = new Promise((resolve) => {
			this.handle = this.schedule(() => {
				this.handle = null;
				this.run(generation).then(resolve);
			});
		});
		return this.promise;
	}

	async run(generation) {
		try {
			await this.installText(generation);
			await this.installForest(generation);
			if (this.isCurrent(generation)) this.state = 'complete';
		} catch (error) {
			if (this.isCurrent(generation)) {
				this.state = 'failed';
				this.error = error?.message || String(error);
			}
		}
		return this.snapshot();
	}

	async installText(generation) {
		if (!this.isCurrent(generation)) return;
		this.state = 'text-loading';
		const module = await this.loadText();
		if (!this.isCurrent(generation)) return;
		const packageValue = await module.createProceduralTextLandmark(
			this.context.groundSampler
		);
		if (!this.isCurrent(generation)) return;
		const colliders = this.ledger.insertAll(packageValue.colliders);
		this.context.obstacleTriangles.push(...colliders);
		this.obstacleAdditions.push(...colliders);
		this.hydrator.installText(packageValue);
	}

	async installForest(generation) {
		if (!this.isCurrent(generation)) return;
		this.state = 'forest-loading';
		const module = await this.loadForest();
		if (!this.isCurrent(generation)) return;
		const packageValue = module.createProceduralForest({
			groundSampler: this.context.groundSampler,
			halfSize: this.context.halfSize,
			obstacleTriangles: this.context.obstacleTriangles,
			quality: this.context.quality,
			roadTriangles: this.context.roadTriangles
		});
		if (!this.isCurrent(generation)) return;
		this.ledger.insertAll(packageValue.colliders);
		this.hydrator.installForest(packageValue);
	}

	/** Cancels stale work and removes every manifested visual and collider. */
	destroy() {
		this.generation += 1;
		if (this.handle !== null) this.cancel(this.handle);
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
	if (index >= 0) items.splice(index, 1);
}

export default createDeferredTerrainEnrichment;
