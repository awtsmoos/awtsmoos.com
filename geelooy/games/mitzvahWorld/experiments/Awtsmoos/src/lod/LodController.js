// B"H
import { qualityTier } from '../performance/QualityTier.js';
import {
	createInitialLodStats,
	desiredLodVisibility,
	finiteLodNumber,
	lodSphereDistance,
	lodTransitionPriority
} from './LodControllerMath.js';
import { lodMaximumDistance } from './LodPolicy.js';
import {
	lodSpatialKey,
	lodSpatialKeyString
} from './LodSpatialKey.js';
import { LodTransitionQueue } from './LodTransitionQueue.js';

/**
 * Reconsiders registered detail only after a spatial, camera-sector, or quality
 * event. Visibility changes then cross a bounded queue instead of one hard cut.
 */
export class LodController {
	constructor({ cellSize = 12, sectorCount = 16, hysteresis = 0.12 } = {}) {
		this.cellSize = cellSize;
		this.sectorCount = sectorCount;
		this.hysteresis = hysteresis;
		this.entries = new Map();
		this.queue = new LodTransitionQueue();
		this.previousEventKey = null;
		this.stats = createInitialLodStats();
	}

	register({ id, node, className, center, radius = 0, alwaysVisible = false }) {
		if (!id || !node || !center || this.entries.has(id)) return false;
		const originalVisible = node.visible !== false;
		this.entries.set(id, {
			id,
			node,
			className,
			center: { ...center },
			radius: Math.max(0, finiteLodNumber(radius)),
			alwaysVisible,
			originalVisible,
			desiredVisible: originalVisible
		});
		this.stats.registered = this.entries.size;
		return true;
	}

	update({ position, yaw = 0, tierName = 'high' }) {
		const eventKey = this.eventKey(position, yaw, tierName);
		if (eventKey !== this.previousEventKey) {
			this.previousEventKey = eventKey;
			this.stats.events += 1;
			this.stats.lastTier = tierName;
			this.stats.lastEventKey = eventKey;
			this.evaluateEntries(position, tierName);
		}
		const processed = this.queue.process({
			maximumTransitions: qualityTier(tierName).transitionBudget
		});
		this.stats.transitions += processed.results.filter((result) => result.ok).length;
		return {
			eventKey,
			processed,
			pending: this.queue.size,
			stats: { ...this.stats }
		};
	}

	eventKey(position, yaw, tierName) {
		const spatial = lodSpatialKey({
			position,
			yaw,
			cellSize: this.cellSize,
			sectorCount: this.sectorCount
		});
		return `${lodSpatialKeyString(spatial)}:${tierName}`;
	}

	evaluateEntries(position, tierName) {
		for (const entry of this.entries.values()) {
			this.stats.evaluations += 1;
			this.evaluateEntry(entry, position, tierName);
		}
	}

	evaluateEntry(entry, position, tierName) {
		const distance = lodSphereDistance(position, entry.center, entry.radius);
		const maximumDistance = lodMaximumDistance(entry.className, tierName);
		const visible = desiredLodVisibility({
			currentlyVisible: entry.desiredVisible,
			alwaysVisible: entry.alwaysVisible,
			distance,
			maximumDistance,
			hysteresis: this.hysteresis
		});
		if (visible === entry.desiredVisible) return;
		entry.desiredVisible = visible;
		this.queue.enqueue({
			id: entry.id,
			priority: lodTransitionPriority(visible, distance),
			apply: () => { entry.node.visible = visible; },
			metadata: { visible, distance, maximumDistance }
		});
	}

	restore() {
		this.queue.clear();
		for (const entry of this.entries.values()) {
			entry.node.visible = entry.originalVisible;
			entry.desiredVisible = entry.originalVisible;
		}
		this.previousEventKey = null;
	}
}
