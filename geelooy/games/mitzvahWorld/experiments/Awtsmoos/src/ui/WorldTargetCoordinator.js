// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file WorldTargetCoordinator.js
 * @description Arbitrates one pointer stream across compatible world populations.
 * The Awtsmoos renews many visible beings within one scene; Awtsmoos.com chooses the nearest
 * honest ray candidate once while a compatibility gate protects staggered source deployment.
 */

export class WorldTargetCoordinator {
	constructor(options) {
		this.canvas = options.canvas;
		this.populations = [options.friendlyNpcs, options.hostileNpcs].filter(Boolean);
		this.enabled = this.populations.every(population => (
			typeof population.candidateFromPointer === 'function'
			&& typeof population.activateCandidate === 'function'
			&& typeof population.clearAll === 'function'
		));
		this.pointerHandler = event => this.onPointer(event);
		if (this.enabled) this.canvas.addEventListener('pointerdown', this.pointerHandler);
	}

	onPointer(event) {
		if (!this.enabled) return false;
		const candidate = this.populations
			.map(population => population.candidateFromPointer(event))
			.filter(Boolean)
			.sort((first, second) => first.distance - second.distance)[0];
		if (!candidate) {
			for (const population of this.populations) population.clearAll();
			return false;
		}
		event.preventDefault();
		event.stopPropagation();
		event.stopImmediatePropagation?.();
		for (const population of this.populations) {
			if (population !== candidate.population) population.clearAll();
		}
		candidate.population.activateCandidate(candidate);
		return true;
	}

	diagnostics() {
		return {
			enabled: this.enabled,
			listenerCount: this.enabled ? 1 : 0,
			populations: this.populations.length
		};
	}

	destroy() {
		if (this.enabled) {
			this.canvas.removeEventListener('pointerdown', this.pointerHandler);
		}
	}
}
