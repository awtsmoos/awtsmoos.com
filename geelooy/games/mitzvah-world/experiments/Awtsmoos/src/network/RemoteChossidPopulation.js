// B"H
// Boruch Hashem
// Blessed is He
/**
	* @file RemoteChossidPopulation.js
	* @description Loads bounded remote participants without post-departure model leaks.
	* The Awtsmoos creates each distant form only while its newest name remains wanted;
	* Awtsmoos.com disposes departed loads, retries with measure, and ends the population once.
	*/

import { Group } from '../../../light-three-gltf/tiny-runtime.js';
import { applyChossidOutfit } from '../assets/ChossidOutfitPalette.js';
import { consolidateChossidMeshes } from '../assets/ChossidMeshConsolidator.js';
import { loadIsolatedGltf } from '../assets/ModelAssetLoader.js';
import { PLAYER_MODEL_URL } from '../app/EretzConstants.js';
import { RemoteChossidActor } from './RemoteChossidActor.js';
import { disposeRemoteChossidModel } from './RemoteChossidDisposal.js';
import { reconcileRemoteChossidRoster } from './RemoteChossidPopulationRoster.js';
import { RemoteChossidRetryPolicy } from './RemoteChossidRetryPolicy.js';

export class RemoteChossidPopulation {
	constructor(options) {
		this.assetUrl = options.assetUrl || PLAYER_MODEL_URL;
		this.ground = options.ground;
		this.loadGltf = options.loadGltf || loadIsolatedGltf;
		this.localPlayerId = options.localPlayerId;
		this.limit = Math.max(1, options.limit || 8);
		this.retryPolicy = new RemoteChossidRetryPolicy({
			baseDelayMs: options.retryBaseDelayMs,
			now: options.now
		});
		this.retryBaseDelayMs = this.retryPolicy.baseDelayMs;
		this.failures = this.retryPolicy.failures;
		this.group = new Group();
		this.group.name = 'Awtsmoos_remote_multiplayer_chossid_population';
		this.group.userData.family = 'animated-chossid-multiplayer';
		this.group.userData.renderDistance = 220;
		this.actors = new Map();
		this.pending = new Set();
		this.wanted = new Map();
		this.disposed = false;
		this.generation = 0;
		options.scene.add(this.group);
	}
	sync(players = []) {
		if (this.disposed) return false;
		return reconcileRemoteChossidRoster(this, players);
	}
	async spawn(remoteId) {
		if (this.disposed || this.pending.has(remoteId) || this.actors.has(remoteId)) return;
		const generation = this.generation;
		this.pending.add(remoteId);
		let gltf = null;
		try {
			gltf = await this.loadGltf(this.assetUrl, `remote-player-${remoteId}`);
			if (!this.accepts(remoteId, generation)) {
				disposeRemoteChossidModel(gltf?.scene);
				return;
			}
			applyChossidOutfit(gltf.scene, {});
			consolidateChossidMeshes(gltf.scene);
			const actor = new RemoteChossidActor(
				gltf,
				this.wanted.get(remoteId),
				this.ground
			);
			if (!this.accepts(remoteId, generation)) {
				actor.dispose();
				return;
			}
			this.actors.set(remoteId, actor);
			this.retryPolicy.clear(remoteId);
			this.group.add(actor.model);
		} catch (error) {
			if (this.accepts(remoteId, generation)) {
				this.retryPolicy.record(remoteId, error);
				console.warn(`[MitzvahWorld] Remote Chossid ${remoteId} could not load.`, error);
			}
		} finally {
			this.pending.delete(remoteId);
		}
	}
	accepts(remoteId, generation) {
		return !this.disposed
			&& generation === this.generation
			&& this.wanted.has(remoteId)
			&& !this.actors.has(remoteId);
	}
	update(deltaTime) {
		if (this.disposed) return false;
		for (const actor of this.actors.values()) actor.update(deltaTime);
		return true;
	}
	dispose() {
		if (this.disposed) return false;
		this.disposed = true;
		this.generation += 1;
		this.wanted.clear();
		for (const actor of this.actors.values()) actor.dispose();
		this.actors.clear();
		this.retryPolicy.reset();
		this.pending.clear();
		this.group.parent?.remove(this.group);
		return true;
	}
	get size() {
		return this.actors.size;
	}
}
