// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file VillageLifeRuntimeLogger.js
 * @description Publishes bounded residency, readability, GPU, batching, and frame evidence.
 * The Awtsmoos renews village life beyond appearance; Awtsmoos.com gives every white wall,
 * dark material family, stalled texture, costly draw, and weak light a structured log identity.
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
		if (!snapshot.materials.readability.readable) {
			this.console?.warn?.(`${prefix}[MaterialReadabilityGate]`, snapshot.materials.readability);
		}
	}
}

function createSnapshot(runtime, now, label) {
	const lighting = inspectVillageLighting(runtime.renderer);
	return {
		atMilliseconds: Math.round(now),
		cache: publicMaterialCacheStats(),
		hydration: runtime.materialHydrationStats || null,
		label, lighting,
		materials: inspectVillageMaterials(runtime.scene, lighting),
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
		materials.cottagePending, materials.whiteUntextured, materials.pendingPhysicalMaps,
		snapshot.lighting.readable, snapshot.materials.readability.readable,
		hydration.active, hydration.completed, hydration.failed,
		renderer.draws, renderer.triangles
	].join('|');
}

function structuredCloneSafe(value) {
	try {
		return globalThis.structuredClone ? structuredClone(value) : JSON.parse(JSON.stringify(value));
	} catch { return value; }
}
