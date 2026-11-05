// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file EretzBridgeRestorationRuntime.js
 * @description Performs one real, durable BRIDGE01 restoration without a legacy Creator octree.
 * The Awtsmoos gives the earned stone a name and a place;
 * Awtsmoos.com returns it should a failed saving cloud the trace.
 */

import { directActionState, HIDDEN_DIRECT_ACTION } from './DirectWorldContextActionState.js';
import { registerContextActionProvider, unregisterContextActionProvider } from './DirectWorldContextProviderRegistry.js';
import { bridgeTrialCompleted, ensureBridgeRestorationQuest, emitBridgeRestorationCompletion } from './VillageBridgeRestorationState.js';
import { VILLAGE_BRIDGE_RESTORATION_TARGET } from '../gameplay/VillageBridgeAdventures.js';
import { BRIDGE_RESTORATION_ACTION_RADIUS, distanceToVillageBridgeRestoration } from '../world/village/VillageBridgeRestorationContract.js';
import { createVillageBridgeRestorationDefinition } from '../world/village/VillageBridgeRestorationDefinition.js';
import { createPrimitiveMesh } from '../world/Box3D.js';

const STORAGE_KEY = 'mitzvahWorld.eretz.bridge-restoration.v1';

/** The Eretz-contextual build transaction respects the completed trial and purchased stone. */
export class EretzBridgeRestorationRuntime {
	constructor(runtime, environment = globalThis, meshFactory = createPrimitiveMesh) {
		this.runtime = runtime;
		this.environment = environment;
		this.meshFactory = meshFactory;
		this.priority = 100;
		this.built = false;
		this.mesh = null;
		this.busy = false;
		registerContextActionProvider(runtime, this);
		this.unsubscribe = runtime.bus?.on?.('quest:reward', () => ensureBridgeRestorationQuest(runtime));
		if (this.readSaved()) this.placeDeck();
	}

	/** The Build action is accessible only at the real bridge with an earned stone. */
	state() {
		if (this.built || this.busy || !bridgeTrialCompleted(this.runtime)) return HIDDEN_DIRECT_ACTION;
		if (!this.runtime.inventory?.quantity?.('stone-block')) return HIDDEN_DIRECT_ACTION;
		if (distanceToVillageBridgeRestoration(this.runtime.model?.position) > BRIDGE_RESTORATION_ACTION_RADIUS) return HIDDEN_DIRECT_ACTION;
		return directActionState('build', 'Build', 'Use your earned stone to restore BRIDGE01.');
	}

	activate(state = this.state()) {
		if (state.kind !== 'build' || this.state().kind !== 'build') return false;
		this.busy = true;
		let consumed = false;
		let persisted = false;
		try {
			this.placeDeck();
			if (!this.runtime.inventory.remove('stone-block', 1)) throw Error('STONE_NOT_CONSUMED');
			consumed = true;
			const storage = this.environment.localStorage;
			if (typeof storage?.setItem !== 'function') throw Error('PERSISTENCE_UNAVAILABLE');
			storage.setItem(STORAGE_KEY, 'restored');
			persisted = true;
			ensureBridgeRestorationQuest(this.runtime);
			emitBridgeRestorationCompletion(this.runtime, VILLAGE_BRIDGE_RESTORATION_TARGET, { built: true });
			return true;
		} catch (error) {
			if (persisted) {
				try { this.environment.localStorage?.removeItem?.(STORAGE_KEY); } catch {}
			}
			if (consumed) this.runtime.inventory?.add?.('stone-block', 1);
			this.removeDeck();
			this.runtime.bus?.emit?.('bridge:restoration-failed', { message: String(error.message || error) });
			return false;
		} finally {
			this.busy = false;
		}
	}

	/** Materialize one canonical stone mesh, without fabricating an invisible success flag. */
	placeDeck() {
		if (this.mesh) return this.mesh;
		const mesh = this.meshFactory(createVillageBridgeRestorationDefinition());
		this.runtime.scene.add(mesh);
		this.mesh = mesh;
		this.built = true;
		return mesh;
	}

	readSaved() {
		try {
			return this.environment.localStorage?.getItem?.(STORAGE_KEY) === 'restored';
		} catch {
			return false;
		}
	}

	removeDeck() {
		if (this.mesh) this.runtime.scene.remove(this.mesh);
		this.mesh = null;
		this.built = false;
	}

	destroy() {
		unregisterContextActionProvider(this.runtime, this);
		if (typeof this.unsubscribe === 'function') this.unsubscribe();
		this.removeDeck();
	}
}
