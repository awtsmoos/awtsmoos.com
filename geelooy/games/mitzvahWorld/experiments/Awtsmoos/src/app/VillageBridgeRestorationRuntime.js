// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file VillageBridgeRestorationRuntime.js
 * @description Exposes BRIDGE01 repair as one lazy high-priority contextual Build provider.
 * The Awtsmoos joins earned stone and durable passage only after saved truth has hydrated;
 * Awtsmoos.com retains one Creator session promise so startup, double taps, and reload cannot duplicate repair.
 */

import { directActionState, HIDDEN_DIRECT_ACTION } from './DirectWorldContextActionState.js';
import {
	registerContextActionProvider,
	unregisterContextActionProvider
} from './DirectWorldContextProviderRegistry.js';
import { VILLAGE_BRIDGE_RESTORATION_TARGET, VILLAGE_BRIDGE_TRIAL_QUEST_ID } from '../gameplay/VillageBridgeAdventures.js';
import { BRIDGE_RESTORATION_ACTION_RADIUS, distanceToVillageBridgeRestoration } from '../world/village/VillageBridgeRestorationContract.js';
import {
	bridgeRestorationInventory,
	bridgeTrialCompleted,
	emitBridgeRestorationCompletion,
	emitBridgeRestorationFailure,
	ensureBridgeRestorationQuest,
	hasBridgeRestorationStorage
} from './VillageBridgeRestorationState.js';

/** High-priority Build provider and durable bridge-restoration coordinator. */
export class VillageBridgeRestorationRuntime {
	constructor(runtime, environment = globalThis) {
		this.runtime = runtime;
		this.environment = environment;
		this.priority = 100;
		this.built = false;
		this.inflight = null;
		this.session = null;
		this.sessionPromise = null;
		this.restoring = true;
		registerContextActionProvider(runtime, this);
		this.unsubscribeReward = runtime.bus?.on?.('quest:reward', grant => {
			if (grant?.questId === VILLAGE_BRIDGE_TRIAL_QUEST_ID) ensureBridgeRestorationQuest(runtime);
		}) || null;
		ensureBridgeRestorationQuest(runtime);
		this.restorePromise = this.restorePersisted().finally(() => {
			this.restoring = false;
			runtime.bootstrapHud?.refresh?.();
		});
	}

	/** Returns Build only near the gap after reward ownership and restore hydration are settled. */
	state() {
		if (this.built || this.inflight || this.restoring || !bridgeTrialCompleted(this.runtime)) return HIDDEN_DIRECT_ACTION;
		if (bridgeRestorationInventory(this.runtime)?.quantity?.('stone-block') < 1) return HIDDEN_DIRECT_ACTION;
		if (distanceToVillageBridgeRestoration(this.runtime.model?.position) > BRIDGE_RESTORATION_ACTION_RADIUS) return HIDDEN_DIRECT_ACTION;
		return directActionState('build', 'Build', 'Restore the missing center span of BRIDGE01.');
	}

	activate(state = this.state()) {
		return state.kind === 'build' ? this.build() : false;
	}

	/** Retains one in-flight build promise so double activation cannot duplicate geometry. */
	build() {
		if (this.inflight) return this.inflight;
		if (this.state().kind !== 'build') return false;
		this.inflight = this.commitBuild().finally(() => {
			this.inflight = null;
			this.runtime.bootstrapHud?.refresh?.();
		});
		return this.inflight;
	}

	async commitBuild() {
		try {
			const receipt = await (await this.sessionForUse()).build();
			this.built = true;
			ensureBridgeRestorationQuest(this.runtime);
			emitBridgeRestorationCompletion(this.runtime, VILLAGE_BRIDGE_RESTORATION_TARGET, receipt);
			return receipt;
		} catch (error) {
			emitBridgeRestorationFailure(this.runtime, error, 'build');
			return false;
		}
	}

	/** Loads Creator code once and shares the same pending import/session across all callers. */
	async sessionForUse() {
		if (this.session) return this.session;
		if (this.sessionPromise) return this.sessionPromise;
		this.sessionPromise = import('./VillageBridgeRestorationSession.js').then(module => {
			this.session = new module.VillageBridgeRestorationSession(
				this.runtime, bridgeRestorationInventory(this.runtime), this.environment
			);
			return this.session;
		}).finally(() => {
			this.sessionPromise = null;
		});
		return this.sessionPromise;
	}

	async restorePersisted() {
		if (!hasBridgeRestorationStorage(this.environment)) return false;
		try {
			this.built = Boolean(await (await this.sessionForUse()).restore());
			if (this.built) {
				ensureBridgeRestorationQuest(this.runtime);
				emitBridgeRestorationCompletion(this.runtime, VILLAGE_BRIDGE_RESTORATION_TARGET, { restored: true });
			}
			return this.built;
		} catch (error) {
			emitBridgeRestorationFailure(this.runtime, error, 'restore');
			return false;
		}
	}
	destroy() {
		this.unsubscribeReward?.();
		this.session?.destroy?.();
		unregisterContextActionProvider(this.runtime, this);
	}
}
