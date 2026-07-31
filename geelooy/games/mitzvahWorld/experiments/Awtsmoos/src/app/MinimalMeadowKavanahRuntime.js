// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowKavanahRuntime.js
 * @description Coordinates predictive Kavanah state while focused lifecycle law owns mutation.
 * The Awtsmoos renews intention while this vessel preserves one readable public contract;
 * Awtsmoos.com exposes start, update, release, cancel, support, harm, snapshot, and teardown.
 */

import {
	cancelMinimalMeadowKavanah,
	disruptMinimalMeadowKavanah,
	releaseMinimalMeadowKavanah,
	stabilizeMinimalMeadowKavanah,
	startMinimalMeadowKavanah,
	updateMinimalMeadowKavanah
} from './MinimalMeadowKavanahLifecycle.js';
import {
	minimalMeadowKavanahSnapshot
} from './MinimalMeadowKavanahState.js';

export class MinimalMeadowKavanahRuntime {
	constructor(runtime) {
		this.runtime = runtime;
		this.active = null;
		this.sequence = 0;
		this.unsubscribers = [
			runtime.bus.on('enemy:impact', receipt => {
				this.disrupt(receipt);
			}),
			runtime.bus.on('combat:kavanah-stabilize', receipt => {
				this.stabilize(receipt);
			})
		];
	}

	start(cast) {
		return startMinimalMeadowKavanah(this, cast);
	}

	update(cast, deltaSeconds) {
		return updateMinimalMeadowKavanah(
			this,
			cast,
			deltaSeconds
		);
	}

	release(cast, reason = 'manual') {
		return releaseMinimalMeadowKavanah(
			this,
			cast,
			reason
		);
	}

	cancel(reason = 'cancelled') {
		return cancelMinimalMeadowKavanah(this, reason);
	}

	disrupt(receipt = {}) {
		disruptMinimalMeadowKavanah(this, receipt);
	}

	stabilize(receipt = {}) {
		stabilizeMinimalMeadowKavanah(this, receipt);
	}

	snapshot() {
		return minimalMeadowKavanahSnapshot(
			this.active,
			this.elapsed()
		);
	}

	elapsed() {
		return this.active
			? Math.max(
				0,
				this.now() - this.active.startedAtMilliseconds
			)
			: 0;
	}

	now() {
		return Math.round(
			Number(this.runtime.combat?.clock || 0) * 1000
		);
	}

	accessibilityMultiplier() {
		return Number(
			this.runtime.accessibility?.timingWindowMultiplier || 1
		);
	}

	destroy() {
		this.cancel('destroyed');
		for (const unsubscribe of this.unsubscribers) unsubscribe();
		this.unsubscribers = [];
	}
}
