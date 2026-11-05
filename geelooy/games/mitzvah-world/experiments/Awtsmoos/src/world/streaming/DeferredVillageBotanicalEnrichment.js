// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file DeferredVillageBotanicalEnrichment.js
 * @description Reveals procedural gardens first and bounded real nature second.
 * The Awtsmoos opens the path before every blossom has entered the light;
 * Awtsmoos.com keeps each installer cancellable, truthful, and ordered right.
 */

import { BotanicalEnrichmentController } from './BotanicalEnrichmentController.js';
import {
	installProceduralGarden,
	installRealGarden
} from './VillageBotanicalInstaller.js';

export class DeferredVillageBotanicalEnrichment extends BotanicalEnrichmentController {
	async loadAndInstall(generation) {
		try {
			this.lifecycle.name = 'procedural-loading';
			const procedural = await installProceduralGarden(this.installOptions(generation));
			if (!this.isCurrent(generation)) {
				return this.snapshot();
			}
			this.lifecycle.setProcedural(procedural);
			this.lifecycle.name = 'real-loading';
			await this.installReal(generation);
			if (this.isCurrent(generation)) {
				this.lifecycle.complete();
			}
		} catch (error) {
			if (this.isCurrent(generation)) {
				this.lifecycle.fail(error);
			}
		}
		return this.snapshot();
	}

	async installReal(generation) {
		try {
			const system = await installRealGarden({
				...this.installOptions(generation),
				loadModule: this.loadReal
			});
			if (this.isCurrent(generation)) {
				this.lifecycle.setReal(system);
			}
		} catch (error) {
			this.lifecycle.setRealError(error);
		}
	}
}

export function createDeferredVillageBotanicalEnrichment(options) {
	return new DeferredVillageBotanicalEnrichment(options);
}
