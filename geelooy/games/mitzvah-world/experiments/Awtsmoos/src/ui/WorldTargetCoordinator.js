// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file WorldTargetCoordinator.js
 * @description Gives first click to study, second click to interaction, and drags to the camera.
 * The Awtsmoos separates knowing from speaking while holding both within one indivisible choice;
 * Awtsmoos.com lets friendly discussion, hostile confirmation, and corpse loot begin only in order.
 */

import { createWorldTargetPopulationAdapters } from './WorldTargetPopulationAdapter.js';
import { canOwnWorldTargetPointer, compareWorldTargetCandidates, createWorldTargetHandlers, resolveWorldTargetPopulations, stopWorldTargetPointerEvent } from './WorldTargetCoordinatorSupport.js';
import { WorldTargetPointerSession } from './WorldTargetPointerSession.js';
import { WorldTargetSelectionState } from './WorldTargetSelectionState.js';

export class WorldTargetCoordinator {
	constructor(options = {}) {
		this.canvas = options.canvas;
		this.adapters = createWorldTargetPopulationAdapters(
			resolveWorldTargetPopulations(options)
		);
		this.populations = this.adapters.map(adapter => adapter.population);
		this.enabled = canOwnWorldTargetPointer(this.canvas, this.adapters);
		this.pointer = new WorldTargetPointerSession();
		this.selection = new WorldTargetSelectionState();
		this.handlers = createWorldTargetHandlers(this);
		this.onPointerDown = this.handlers.pointerdown;
		if (this.enabled) this.bind();
	}

	bind() {
		for (const [name, handler] of Object.entries(this.handlers)) {
			this.canvas.addEventListener(name, handler);
		}
	}

	beginPointer(event) {
		return this.pointer.begin(event);
	}

	movePointer(event) {
		return this.pointer.move(event);
	}

	finishPointer(event) {
		if (this.pointer.finish(event)) this.selectFromPointer(event);
	}

	cancelPointer(event) {
		this.pointer.cancel(event);
	}

	onPointer(event) {
		return this.selectFromPointer(event);
	}

	selectFromPointer(event) {
		if (!this.enabled) return false;
		const candidate = this.nearestCandidate(event);
		if (!candidate) {
			this.clearAll();
			return false;
		}
		stopWorldTargetPointerEvent(event);
		this.clearOtherAdapters(candidate.adapter);
		const action = this.selection.actionFor(candidate);
		if (action === 'interact') {
			candidate.adapter.interactCandidate(candidate);
		} else {
			candidate.adapter.selectCandidate(candidate);
		}
		return true;
	}

	nearestCandidate(event) {
		return this.adapters
			.map(adapter => adapter.candidateFromPointer(event))
			.filter(Boolean)
			.sort(compareWorldTargetCandidates)[0] || null;
	}

	clearOtherAdapters(exception) {
		for (const adapter of this.adapters) {
			if (adapter !== exception) adapter.clearAll();
		}
	}

	entries() {
		return this.adapters.flatMap(adapter => adapter.entries());
	}

	clearAll(exception = null) {
		for (const adapter of this.adapters) adapter.clearAll(exception);
		this.selection.clear();
	}

	diagnostics() {
		return {
			contracts: this.adapters.map(adapter => adapter.diagnostics()),
			enabled: this.enabled,
			listenerCount: this.enabled ? Object.keys(this.handlers).length : 0,
			pointer: this.pointer.diagnostics(),
			populations: this.populations.length,
			selection: this.selection.diagnostics()
		};
	}

	destroy() {
		if (this.enabled) {
			for (const [name, handler] of Object.entries(this.handlers)) {
				this.canvas.removeEventListener(name, handler);
			}
		}
		this.pointer.cancel();
		this.selection.clear();
	}
}
