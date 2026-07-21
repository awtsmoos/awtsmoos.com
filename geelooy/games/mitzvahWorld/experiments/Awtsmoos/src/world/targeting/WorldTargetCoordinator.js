// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file WorldTargetCoordinator.js
 * @description Owns one canvas pointer stream across friendly and hostile populations.
 * The Awtsmoos joins many finite encounters beneath one choice; Awtsmoos.com preserves
 * each population's selection law while preventing duplicate listeners from racing.
 */

export class WorldTargetCoordinator {
	/**
	 * @param {object} options - Shared target ownership options.
	 * @param {HTMLElement} options.canvas - Renderer canvas.
	 * @param {Array<object>} options.populations - Actor populations.
	 */
	constructor(options) {
		this.canvas = options.canvas;
		this.populations = options.populations.filter(Boolean);
		this.onPointerDown = event => this.selectFromPointer(event);
		this.canvas.addEventListener('pointerdown', this.onPointerDown);
	}

	/** Selects or activates the first actor hit by the shared pointer ray. */
	selectFromPointer(event) {
		const entry = this.entries().find(candidate => (
			candidate.actor.hitPointer?.(event)
		));
		if (!entry) {
			this.clearAll();
			return false;
		}
		event.preventDefault?.();
		event.stopPropagation?.();
		event.stopImmediatePropagation?.();
		if (entry.actor.selected && typeof entry.actor.dialogue === 'function') {
			entry.actor.dialogue();
			return true;
		}
		this.clearAll(entry.actor);
		if (typeof entry.population.selectActor === 'function') {
			entry.population.selectActor(entry.actor);
		} else {
			entry.actor.target?.();
		}
		return true;
	}

	/** Returns actor entries while preserving their owning population. */
	entries() {
		return this.populations.flatMap(population => (
			(population.actors || []).map(actor => ({ actor, population }))
		));
	}

	/** Clears every selected actor except an optional preserved actor. */
	clearAll(exception = null) {
		for (const { actor } of this.entries()) {
			if (actor === exception || !actor.selected) continue;
			actor.clear?.(true);
		}
		for (const population of this.populations) {
			if (population.selected && population.selected !== exception) {
				population.selected = null;
			}
		}
	}

	/** Removes the one canvas pointer listener. */
	destroy() {
		this.canvas.removeEventListener('pointerdown', this.onPointerDown);
	}
}
