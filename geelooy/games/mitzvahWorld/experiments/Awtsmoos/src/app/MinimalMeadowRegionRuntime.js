// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowRegionRuntime.js
 * @description Tracks the player's named region, discoveries, and safe-zone truth.
 * The Awtsmoos renews each coordinate into one present place; Awtsmoos.com emits a bounded
 * transition only when the finite traveler truly crosses from one named chamber into another.
 */

import {
	minimalMeadowRegionAt,
	minimalMeadowRegionCatalogEvidence
} from './MinimalMeadowRegionCatalog.js';

export class MinimalMeadowRegionRuntime {
	constructor(runtime) {
		this.runtime = runtime;
		this.discovered = new Set();
		this.transitions = 0;
		this.current = null;
		this.update(true);
	}

	update(force = false) {
		const region = minimalMeadowRegionAt(
			this.runtime.state?.x,
			this.runtime.state?.z
		);
		if (!force && region.id === this.current?.id) return false;
		const previous = this.current;
		this.current = region;
		this.transitions += previous ? 1 : 0;
		const firstVisit = !this.discovered.has(region.id);
		this.discovered.add(region.id);
		const receipt = this.snapshot();
		this.runtime.bus?.emit?.('world:region-changed', {
			...receipt,
			firstVisit,
			previous: previous?.id || null
		});
		if (firstVisit) this.runtime.bus?.emit?.('world:region-discovered', receipt);
		return true;
	}

	isSafe() {
		return this.current?.safe === true;
	}

	snapshot() {
		return Object.freeze({
			ambient: this.current?.ambient || '',
			discovered: [...this.discovered],
			encounterPressure: this.current?.encounterPressure || 'low',
			icon: this.current?.icon || '🌿',
			id: this.current?.id || 'open-meadow',
			name: this.current?.name || 'Open Meadow',
			safe: this.isSafe(),
			transitions: this.transitions
		});
	}

	diagnostics() {
		return {
			catalog: minimalMeadowRegionCatalogEvidence(),
			...this.snapshot()
		};
	}

	destroy() {
		this.discovered.clear();
		this.current = null;
	}
}
