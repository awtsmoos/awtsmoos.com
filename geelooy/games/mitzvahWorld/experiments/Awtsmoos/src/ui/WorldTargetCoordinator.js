// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file WorldTargetCoordinator.js
 * @description Distinguishes a world click from a camera drag across compatible populations.
 * The Awtsmoos separates a finite point of choice from a journey across the valley;
 * Awtsmoos.com waits for movement evidence before selecting, clearing, or stopping propagation.
 */

import { createWorldTargetPopulationAdapters } from './WorldTargetPopulationAdapter.js';

const DRAG_THRESHOLD = 6;

export class WorldTargetCoordinator {
	constructor(options = {}) {
		this.canvas = options.canvas;
		this.adapters = createWorldTargetPopulationAdapters(resolvePopulations(options));
		this.populations = this.adapters.map(adapter => adapter.population);
		this.enabled = canOwnPointer(this.canvas, this.adapters);
		this.pointer = null;
		this.handlers = {
			pointercancel: event => this.cancelPointer(event),
			pointerdown: event => this.beginPointer(event),
			pointermove: event => this.movePointer(event),
			pointerup: event => this.finishPointer(event)
		};
		this.onPointerDown = this.handlers.pointerdown;
		if (this.enabled) {
			for (const [name, handler] of Object.entries(this.handlers)) {
				this.canvas.addEventListener(name, handler);
			}
		}
	}

	beginPointer(event) {
		if (this.pointer || event.button > 0) {
			return;
		}
		this.pointer = {
			dragging: false,
			id: event.pointerId,
			startX: event.clientX,
			startY: event.clientY
		};
	}

	movePointer(event) {
		if (!this.pointer || event.pointerId !== this.pointer.id) {
			return;
		}
		const distance = Math.hypot(
			event.clientX - this.pointer.startX,
			event.clientY - this.pointer.startY
		);
		if (distance >= DRAG_THRESHOLD) {
			this.pointer.dragging = true;
		}
	}

	finishPointer(event) {
		if (!this.pointer || event.pointerId !== this.pointer.id) {
			return;
		}
		const shouldSelect = !this.pointer.dragging;
		this.pointer = null;
		if (shouldSelect) {
			this.selectFromPointer(event);
		}
	}

	cancelPointer(event) {
		if (this.pointer && event.pointerId === this.pointer.id) {
			this.pointer = null;
		}
	}

	onPointer(event) {
		return this.selectFromPointer(event);
	}

	selectFromPointer(event) {
		if (!this.enabled) {
			return false;
		}
		const candidate = this.nearestCandidate(event);
		if (!candidate) {
			this.clearAll();
			return false;
		}
		stopPointerEvent(event);
		for (const adapter of this.adapters) {
			if (adapter !== candidate.adapter) {
				adapter.clearAll();
			}
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
		for (const adapter of this.adapters) {
			adapter.clearAll(exception);
		}
	}

	diagnostics() {
		return {
			contracts: this.adapters.map(adapter => adapter.diagnostics()),
			dragThreshold: DRAG_THRESHOLD,
			enabled: this.enabled,
			listenerCount: this.enabled ? Object.keys(this.handlers).length : 0,
			pointerActive: Boolean(this.pointer),
			populations: this.populations.length
		};
	}

	destroy() {
		if (!this.enabled) {
			return;
		}
		for (const [name, handler] of Object.entries(this.handlers)) {
			this.canvas.removeEventListener(name, handler);
		}
		this.pointer = null;
	}
}

function resolvePopulations(options) {
	const supplied = Array.isArray(options.populations) ? options.populations : [];
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
