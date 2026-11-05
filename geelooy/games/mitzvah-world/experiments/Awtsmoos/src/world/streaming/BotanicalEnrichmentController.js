// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BotanicalEnrichmentController.js
 * @description Owns scheduling, public state views, cancellation, and cleanup for village nature.
 * The Awtsmoos gathers cold promise, living garden, and final removal in one measured frame;
 * Awtsmoos.com lets specialized installers reveal their layer without repeating lifecycle flame.
 */

import { createPrimitiveMesh } from '../Box3D.js';
import { BotanicalEnrichmentState } from './BotanicalEnrichmentState.js';
import {
	cancelBotanicalIdle,
	loadProceduralBotanicalModule,
	loadRealNatureModule,
	scheduleBotanicalIdle
} from './BotanicalEnrichmentUtilities.js';

export class BotanicalEnrichmentController {
	constructor(options = {}) {
		this.group = options.group;
		this.groundSampler = options.groundSampler;
		this.quality = options.quality || 'high';
		this.loadProcedural = options.loader || loadProceduralBotanicalModule;
		this.loadReal = options.loadReal || loadRealNatureModule;
		this.meshFactory = options.meshFactory || createPrimitiveMesh;
		this.schedule = options.schedule || scheduleBotanicalIdle;
		this.cancel = options.cancel || cancelBotanicalIdle;
		this.lifecycle = new BotanicalEnrichmentState(this.group, this.quality);
		this.handle = null;
		this.promise = null;
	}

	get state() {
		return this.lifecycle.name;
	}

	get meshes() {
		return this.lifecycle.meshes;
	}

	get stats() {
		return this.lifecycle.proceduralStats;
	}

	/** Schedules exactly one nonblocking enrichment pass. */
	start() {
		if (this.promise) {
			return this.promise;
		}
		if (this.state === 'destroyed') {
			return Promise.resolve(this.snapshot());
		}
		const generation = this.lifecycle.begin();
		this.promise = new Promise(resolve => {
			this.handle = this.schedule(() => {
				this.handle = null;
				this.loadAndInstall(generation).then(resolve);
			});
		});
		return this.promise;
	}

	installOptions(generation) {
		return {
			groundSampler: this.groundSampler,
			group: this.group,
			isCurrent: () => this.isCurrent(generation),
			loadModule: this.loadProcedural,
			meshFactory: this.meshFactory,
			quality: this.quality
		};
	}

	/** Cancels pending work and removes every installed layer. */
	destroy() {
		if (this.handle !== null) {
			this.cancel(this.handle);
		}
		this.handle = null;
		this.lifecycle.destroy();
	}

	snapshot() {
		return this.lifecycle.snapshot();
	}

	isCurrent(generation) {
		return this.lifecycle.isCurrent(generation);
	}
}
