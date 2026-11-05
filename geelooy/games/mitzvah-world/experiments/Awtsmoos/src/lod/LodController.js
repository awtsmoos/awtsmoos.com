// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file LodController.js
 * @description Keeps generic LOD event-bounded while authored vegetation fades every frame at its truthful horizon.
 * The Awtsmoos renews each visible garment without multiplying matter; Awtsmoos.com lets grass become transparent before it leaves the scene,
 * while buildings and ordinary detail retain the older measured gate so smoothness does not turn into needless work between.
 */

import { qualityTier } from '../performance/QualityTier.js';
import { lodAuthoredOpacity } from './LodAuthoredRange.js';
import { createInitialLodStats } from './LodControllerMath.js';
import {
	createLodControllerEntry,
	evaluateLodControllerEntry
} from './LodControllerEntry.js';
import { lodControllerEventKey } from './LodControllerEvent.js';
import { LodMaterialFade } from './LodMaterialFade.js';
import { LodTransitionQueue } from './LodTransitionQueue.js';

export class LodController {
	constructor({ cellSize = 12, sectorCount = 16, hysteresis = 0.12 } = {}) {
		this.cellSize = cellSize;
		this.sectorCount = sectorCount;
		this.hysteresis = hysteresis;
		this.entries = new Map();
		this.authoredEntries = new Set();
		this.materialFade = new LodMaterialFade();
		this.queue = new LodTransitionQueue();
		this.previousEventKey = null;
		this.stats = { ...createInitialLodStats(), fadeUpdates: 0 };
	}

	/** Registers one static scene vessel without cloning geometry or material. */
	register(registration = {}) {
		const { id, node, center } = registration;
		if (!id || !node || !center || this.entries.has(id)) return false;
		const entry = createLodControllerEntry(registration);
		this.entries.set(id, entry);
		if (entry.authoredRange) {
			this.authoredEntries.add(id);
			this.materialFade.register(id, node);
		}
		this.stats.registered = this.entries.size;
		return true;
	}

	/** Forces the next event-bounded generic evaluation after streaming or quality changes. */
	invalidate() {
		this.previousEventKey = null;
	}

	update({ position, yaw = 0, tierName = 'high' }) {
		this.updateAuthoredEntries(position, tierName);
		const eventKey = lodControllerEventKey({
			position,
			yaw,
			tierName,
			cellSize: this.cellSize,
			sectorCount: this.sectorCount
		});
		if (eventKey !== this.previousEventKey) {
			this.previousEventKey = eventKey;
			this.stats.events += 1;
			this.stats.lastTier = tierName;
			this.stats.lastEventKey = eventKey;
			this.evaluateGenericEntries(position, tierName);
		}
		const processed = this.queue.process({
			maximumTransitions: qualityTier(tierName).transitionBudget
		});
		this.stats.transitions += processed.results.filter(result => result.ok).length;
		return { eventKey, processed, pending: this.queue.size, stats: { ...this.stats } };
	}

	updateAuthoredEntries(position, tierName) {
		for (const id of this.authoredEntries) {
			const entry = this.entries.get(id);
			if (!entry) continue;
			const evaluation = evaluateLodControllerEntry(entry, position, tierName, 0);
			const opacity = lodAuthoredOpacity(evaluation.distance, evaluation.resolvedRange);
			if (this.materialFade.apply(id, opacity)) this.stats.fadeUpdates += 1;
			this.scheduleVisibility(entry, evaluation);
		}
	}

	evaluateGenericEntries(position, tierName) {
		for (const entry of this.entries.values()) {
			if (entry.authoredRange) continue;
			this.stats.evaluations += 1;
			this.scheduleVisibility(
				entry,
				evaluateLodControllerEntry(entry, position, tierName, this.hysteresis)
			);
		}
	}

	scheduleVisibility(entry, evaluation) {
		if (evaluation.visible === entry.desiredVisible) return;
		entry.desiredVisible = evaluation.visible;
		this.queue.enqueue({
			id: entry.id,
			priority: evaluation.priority,
			apply: () => { entry.node.visible = evaluation.visible; },
			metadata: evaluation
		});
	}

	restore() {
		this.queue.clear();
		this.materialFade.restoreAll();
		for (const entry of this.entries.values()) {
			entry.node.visible = entry.originalVisible;
			entry.desiredVisible = entry.originalVisible;
		}
		this.invalidate();
	}
}
