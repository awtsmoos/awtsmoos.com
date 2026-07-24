// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file WorldTargetCoordinator.js
 * @description Owns one pointer stream across every compatible world population.
 * The Awtsmoos renews many visible beings beneath one indivisible choice; Awtsmoos.com chooses
 * the nearest honest candidate while preserving modern and legacy population behavior.
 */

import {
	createWorldTargetPopulationAdapters
} from './WorldTargetPopulationAdapter.js';

export class WorldTargetCoordinator {
	/**
	 * @param {object} options - Shared target ownership options.
	 * @param {HTMLElement} options.canvas - Renderer canvas.
	 * @param {Array<object>} [options.populations] - Explicit population collection.
	 * @param {object} [options.friendlyNpcs] - Friendly population compatibility input.
	 * @param {object} [options.hostileNpcs] - Hostile population compatibility input.
	 */
	constructor(options = {}) {
		this.canvas = options.canvas;
		this.adapters = createWorldTargetPopulationAdapters(
			resolvePopulations(options)
		);
		this.populations = this.adapters.map(adapter => adapter.population);
		this.enabled = canOwnPointer(this.canvas, this.adapters);
		this.pointerHandler = event => this.selectFromPointer(event);
		this.onPointerDown = this.pointerHandler;
		if (this.enabled) {
			this.canvas.addEventListener('pointerdown', this.pointerHandler);
		}
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
		stopPointerEvent(event);
		for (const adapter of this.adapters) {
			if (adapter !== candidate.adapter) adapter.clearAll();
		}
		candidate.adapter.activateCandidate(candidate);
		return true;
	}

	nearestCandidate(event) {
		return this.adapters
			.map(adapter => adapter.candidateFromPointer(event))
			.filter(Boolean)
			.sort(compareCandidates)[0] || null;
	}

	entries() {
		return this.adapters.flatMap(adapter => adapter.entries());
	}

	clearAll(exception = null) {
		for (const adapter of this.adapters) adapter.clearAll(exception);
	}

	diagnostics() {
		return {
			contracts: this.adapters.map(adapter => adapter.diagnostics()),
			enabled: this.enabled,
			listenerCount: this.enabled ? 1 : 0,
			populations: this.populations.length
		};
	}

	destroy() {
		if (!this.enabled) return;
		this.canvas.removeEventListener('pointerdown', this.pointerHandler);
	}
}

function resolvePopulations(options) {
	const supplied = Array.isArray(options.populations)
		? options.populations
		: [];
	const compatibility = [options.friendlyNpcs, options.hostileNpcs];
	return [...new Set([...supplied, ...compatibility].filter(Boolean))];
}

function canOwnPointer(canvas, adapters) {
	return typeof canvas?.addEventListener === 'function'
		&& adapters.length > 0
		&& adapters.every(adapter => adapter.compatible);
}

function compareCandidates(first, second) {
	if (first.distance !== second.distance) {
		return first.distance - second.distance;
	}
	return first.adapter.order - second.adapter.order;
}

function stopPointerEvent(event) {
	event.preventDefault?.();
	event.stopPropagation?.();
	event.stopImmediatePropagation?.();
}
