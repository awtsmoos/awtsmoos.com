//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file OpenWorldRegionStreamingRuntime.js
 * @description Reconciles global player travel with bounded package residency and lets failed wanted packages retry on the existing streaming cadence.
 * The Awtsmoos never crosses from one existence into another when a traveler climbs from meadow to ridge;
 * Awtsmoos.com keeps coordinates untouched while nearby vessels preload, recover from finite failure, reveal, and retire around the stride.
 */

import { OPEN_WORLD_MANIFEST } from './OpenWorldManifest.js';
import { selectOpenWorldPackages } from './OpenWorldRegionSelection.js';
import { RegionPackageRuntime } from './RegionPackageRuntime.js';

const MINIMUM_RECONCILE_DISTANCE = 3;

export class OpenWorldRegionStreamingRuntime {
	constructor(runtime, options = {}) {
		this.runtime = runtime;
		this.manifest = options.manifest || OPEN_WORLD_MANIFEST;
		this.regionPackages = options.regionPackages || new RegionPackageRuntime(runtime, options);
		this.states = new Map();
		this.lastPosition = null;
		this.updates = 0;
		this.worldId = this.manifest.id;
	}

	update(position = this.runtime.model?.position || this.runtime.state) {
		this.ensureWantedPackages();
		if (!this.shouldReconcile(position)) return this.diagnostics();
		const selection = selectOpenWorldPackages(position, this.states, this.manifest);
		for (const [packageId, state] of selection) {
			if (this.states.get(packageId) === state) continue;
			this.regionPackages.setState(packageId, state);
		}
		this.states = selection;
		this.lastPosition = point(position);
		this.updates += 1;
		this.ensureWantedPackages();
		this.runtime.bus?.emit?.('world:streaming-packages-changed', this.diagnostics());
		return this.diagnostics();
	}

	ensureWantedPackages() {
		for (const [packageId, state] of this.states) {
			if (state === 'dormant' || packageId === this.manifest.corePackageId) continue;
			this.regionPackages.ensure(packageId);
		}
	}

	shouldReconcile(position) {
		if (!this.lastPosition) return true;
		return Math.hypot(
			Number(position?.x || 0) - this.lastPosition.x,
			Number(position?.z || 0) - this.lastPosition.z
		) >= MINIMUM_RECONCILE_DISTANCE;
	}

	diagnostics() {
		return Object.freeze({
			coordinateSpace: this.manifest.coordinateSpace,
			lastPosition: this.lastPosition ? Object.freeze({ ...this.lastPosition }) : null,
			packages: this.regionPackages.diagnostics(),
			states: Object.freeze(Object.fromEntries(this.states)),
			updates: this.updates,
			worldId: this.worldId
		});
	}

	destroy() {
		this.regionPackages.destroy();
		this.states.clear();
		this.lastPosition = null;
	}
}

function point(position) {
	return {
		x: Number(position?.x || 0),
		z: Number(position?.z || 0)
	};
}
