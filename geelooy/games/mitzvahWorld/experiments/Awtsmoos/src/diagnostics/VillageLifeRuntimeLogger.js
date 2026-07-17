// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file VillageLifeRuntimeLogger.js
 * @description Publishes bounded material, light, texture, batching, and frame evidence.
 * The Awtsmoos renews the village beyond visual guesswork; Awtsmoos.com gives every
 * white wall, dark surface, stalled texture, and costly draw a structured name in the log.
 */

import { publicMaterialCacheStats } from '../assets/PublicMaterialCache.js';
import { inspectVillageLighting } from './VillageLightingDiagnostics.js';
import { inspectVillageMaterials } from './VillageMaterialDiagnostics.js';

const HISTORY_LIMIT = 20;
const HEARTBEAT_MS = 10000;

export class VillageLifeRuntimeLogger {
	constructor(options = {}) {
		this.console = options.console || globalThis.console;
		this.history = [];
		this.lastKey = '';
		this.lastPublishedAt = -Infinity;
	}

	update(runtime, now = performance.now()) {
		const snapshot = createSnapshot(runtime, now, 'cadence');
		const key = snapshotKey(snapshot);
		if (key !== this.lastKey || now - this.lastPublishedAt >= HEARTBEAT_MS) {
			this.publish(snapshot);
			this.lastKey = key;
			this.lastPublishedAt = now;
		}
		return snapshot;
	}

	force(runtime, label = 'manual-probe') {
		const now = globalThis.performance?.now?.() ?? Date.now();
		const snapshot = createSnapshot(runtime, now, label);
		this.publish(snapshot);
		this.lastKey = snapshotKey(snapshot);
		this.lastPublishedAt = now;
		return snapshot;
	}

	snapshot() {
		return {
			history: this.history.map(entry => structuredCloneSafe(entry)),
			latest: this.history.at(-1) || null
		};
	}

	publish(snapshot) {
		this.history.push(snapshot);
		if (this.history.length > HISTORY_LIMIT) this.history.shift();
		const prefix = 'B"H [MitzvahWorld][VillageLife]';
		this.console?.log?.(prefix, snapshot);
		if (snapshot.materials.summary.cottagePending > 0) {
			this.console?.warn?.(`${prefix}[UnresolvedCottages]`, snapshot.materials.unresolved);
		}
		if (!snapshot.lighting.readable) {
			this.console?.warn?.(`${prefix}[LightingGate]`, snapshot.lighting);
		}
	}
}

function createSnapshot(runtime, now, label) {
	return {
		atMilliseconds: Math.round(now),
		cache: publicMaterialCacheStats(),
		hydration: runtime.materialHydrationStats || null,
		label,
		lighting: inspectVillageLighting(runtime.renderer),
		materials: inspectVillageMaterials(runtime.scene),
		performance: runtime.performanceMonitor?.diagnostics?.() || null,
		renderer: runtime.renderer?.stats || null,
		textureGpu: runtime.renderer?.textures?.diagnostics?.() || null
	};
}

function snapshotKey(snapshot) {
	const materials = snapshot.materials.summary;
	const hydration = snapshot.hydration || {};
	const renderer = snapshot.renderer || {};
	return [
		materials.cottagePending,
		materials.whiteUntextured,
		materials.pendingPhysicalMaps,
		hydration.active,
		hydration.completed,
		hydration.failed,
		renderer.draws,
		renderer.triangles
	].join('|');
}

function structuredCloneSafe(value) {
	try {
		return globalThis.structuredClone ? structuredClone(value) : JSON.parse(JSON.stringify(value));
	} catch {
		return value;
	}
}
