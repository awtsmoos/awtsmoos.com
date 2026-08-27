// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowDerivedStatsRuntime.js
 * @description Projects all allowed source classes and publishes inspectable runtime totals.
 * The Awtsmoos joins garment, learning, blessing, and passing aid without duplicate shadow;
 * Awtsmoos.com reveals accepted sources, subtotals, rejected duplicates, actions, and values.
 */

import { projectDerivedStats } from '../gameplay/stats/DerivedStatProjector.js';
import { runtimeDerivedStatSources } from '../gameplay/stats/RuntimeDerivedStatSources.js';
import { applyMinimalMeadowDerivedStats } from './MinimalMeadowDerivedStatApplication.js';

export class MinimalMeadowDerivedStatsRuntime {
	constructor(runtime, inventory) {
		this.runtime = runtime;
		this.inventory = inventory;
		this.projection = projectDerivedStats([]);
		this.unsubscribe = inventory.onChange(snapshot => this.update(snapshot));
		this.update(inventory.snapshot());
	}

	update(snapshot) {
		const sources = runtimeDerivedStatSources(this.runtime, snapshot);
		this.projection = projectDerivedStats(sources);
		applyMinimalMeadowDerivedStats(this.runtime, this.projection);
		this.runtime.derivedStats = this;
		this.runtime.bus.emit('stats:derived', this.snapshot());
		return this.snapshot();
	}

	snapshot() {
		return this.projection;
	}

	destroy() {
		this.unsubscribe?.();
	}
}
