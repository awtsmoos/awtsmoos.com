//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file RegionPackageRuntime.js
 * @description Governs semantic active, preloaded, and dormant package state while residency owns physical loading and measured retry.
 * The Awtsmoos keeps all districts in one world even while finite packages conceal or shine;
 * Awtsmoos.com preserves old transition doors yet lets ordinary travel choose residency from one global coordinate line.
 */

import { canonicalRegionId } from '../gameplay/expansion/RegionIdentity.js';
import { DEFAULT_OPEN_WORLD_PACKAGE_LOADERS } from './OpenWorldPackageLoaders.js';
import { OPEN_WORLD_PACKAGE_STATES } from './OpenWorldRegionSelection.js';
import { RegionPackageResidency } from './RegionPackageResidency.js';

export class RegionPackageRuntime {
	constructor(runtime, options = {}) {
		this.runtime = runtime;
		this.activeId = 'lower-meadow';
		this.states = new Map([['lower-meadow', OPEN_WORLD_PACKAGE_STATES.ACTIVE]]);
		this.residency = new RegionPackageResidency(
			runtime,
			packageId => this.states.get(packageId) || OPEN_WORLD_PACKAGE_STATES.DORMANT,
			{
				factories: options.factories,
				loaders: { ...DEFAULT_OPEN_WORLD_PACKAGE_LOADERS, ...(options.loaders || {}) },
				now: options.now,
				retryDelayMs: options.retryDelayMs
			}
		);
	}

	setState(packageId, requestedState) {
		const id = canonicalRegionId(packageId);
		const state = id === 'lower-meadow'
			? OPEN_WORLD_PACKAGE_STATES.ACTIVE
			: requestedState || OPEN_WORLD_PACKAGE_STATES.DORMANT;
		this.states.set(id, state);
		if (id !== 'lower-meadow') this.reconcileResidency(id, state);
		this.refreshActiveId(id, state);
		return this.diagnostics();
	}

	ensure(packageId) {
		const id = canonicalRegionId(packageId);
		if (this.states.get(id) === OPEN_WORLD_PACKAGE_STATES.DORMANT) {
			return Promise.resolve(null);
		}
		return this.residency.request(id);
	}

	async transition(requestedRegionId) {
		const id = canonicalRegionId(requestedRegionId);
		if (id === 'kedem-highlands') {
			this.setState(id, OPEN_WORLD_PACKAGE_STATES.ACTIVE);
			await this.ensure(id);
			return this.diagnostics();
		}
		if (this.residency.packages.has('kedem-highlands')) {
			this.setState('kedem-highlands', OPEN_WORLD_PACKAGE_STATES.PRELOADED);
		}
		this.activeId = id;
		return this.diagnostics();
	}

	reconcileResidency(packageId, state) {
		if (state === OPEN_WORLD_PACKAGE_STATES.DORMANT) {
			this.residency.release(packageId);
			return;
		}
		this.ensure(packageId);
		this.residency.applyVisibility(packageId);
	}

	refreshActiveId(packageId, state) {
		if (state === OPEN_WORLD_PACKAGE_STATES.ACTIVE) this.activeId = packageId;
		if (state !== OPEN_WORLD_PACKAGE_STATES.ACTIVE && this.activeId === packageId) {
			this.activeId = 'lower-meadow';
		}
	}

	get highlands() {
		return this.residency.packages.get('kedem-highlands') || null;
	}

	get loads() {
		return this.residency.loads;
	}

	get unloads() {
		return this.residency.unloads;
	}

	get packages() {
		return this.residency.packages;
	}

	diagnostics() {
		return Object.freeze({
			activeId: this.activeId,
			highlandsLoaded: Boolean(this.highlands),
			...this.residency.diagnostics(),
			states: Object.freeze(Object.fromEntries(this.states)),
			worldMode: 'seamless-streamed'
		});
	}

	destroy() {
		this.residency.destroy();
		this.states.clear();
	}
}
