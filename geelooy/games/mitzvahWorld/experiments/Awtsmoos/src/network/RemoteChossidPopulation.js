// B"H
// Boruch Hashem
// Blessed is He
/**
	* @file RemoteChossidPopulation.js
	* @description Reconciles bounded participants into real Mitzvah World Chossid assets.
	* The Awtsmoos creates every distant form in its newest network instant;
	* Awtsmoos.com cancels departed loads, retries with measure, and never invents position.
	*/
import { Group } from '../../../light-three-gltf/tiny-runtime.js';
import { applyChossidOutfit } from '../assets/ChossidOutfitPalette.js';
import { consolidateChossidMeshes } from '../assets/ChossidMeshConsolidator.js';
import { loadIsolatedGltf } from '../assets/ModelAssetLoader.js';
import { PLAYER_MODEL_URL } from '../app/EretzConstants.js';
import { RemoteChossidActor } from './RemoteChossidActor.js';
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
		options.scene.add(this.group);
	}
	sync(players = []) {
		const visible = players
			.filter(player => isRemoteChossidPlayer(player, this.localPlayerId))
			.slice(0, this.limit);
		this.wanted = new Map(visible.map(player => [player.id, player]));
		this.removeDepartedActors();
		this.retryPolicy.retain(new Set(this.wanted.keys()));
		for (const player of visible) {
			const actor = this.actors.get(player.id);
			if (actor) {
				actor.applySnapshot(player);
			} else if (this.retryReady(player.id)) {
				this.spawn(player.id);
			}
		}
	}
	async spawn(remoteId) {
		if (this.pending.has(remoteId) || this.actors.has(remoteId)) {
			return;
		}
		this.pending.add(remoteId);
		try {
			const gltf = await this.loadGltf(this.assetUrl, `remote-player-${remoteId}`);
			const latest = this.wanted.get(remoteId);
			if (!latest || this.actors.has(remoteId)) {
				return;
			}
			applyChossidOutfit(gltf.scene, {});
			consolidateChossidMeshes(gltf.scene);
			const actor = new RemoteChossidActor(gltf, latest, this.ground);
			this.actors.set(remoteId, actor);
			this.retryPolicy.clear(remoteId);
			this.group.add(actor.model);
		} catch (error) {
			this.retryPolicy.record(remoteId, error);
			console.warn(`[MitzvahWorld] Remote Chossid ${remoteId} could not load.`, error);
		} finally {
			this.pending.delete(remoteId);
		}
	}
	retryReady(remoteId) {
		return this.retryPolicy.ready(remoteId);
	}
	update(deltaTime) {
		for (const actor of this.actors.values()) {
			actor.update(deltaTime);
		}
	}
	dispose() {
		this.wanted.clear();
		for (const actor of this.actors.values()) {
			this.group.remove(actor.model);
		}
		this.actors.clear();
		this.retryPolicy.reset();
		this.pending.clear();
		this.group.parent?.remove(this.group);
	}
	get size() {
		return this.actors.size;
	}
	removeDepartedActors() {
		for (const [remoteId, actor] of this.actors) {
			if (!this.wanted.has(remoteId)) {
				this.group.remove(actor.model);
				this.actors.delete(remoteId);
			}
		}
	}
}
function isRemoteChossidPlayer(player, localPlayerId) {
	return Boolean(
		player?.id
		&& player.id !== localPlayerId
		&& player.displayName
		&& (player.kind === 'human' || player.kind === 'bot' || !player.kind)
		&& (player.kind === 'bot' || player.connected !== false)
	);
}
