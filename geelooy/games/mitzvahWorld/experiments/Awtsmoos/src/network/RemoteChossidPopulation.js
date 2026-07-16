// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RemoteChossidPopulation.js
 * @description Reconciles a bounded set of exact remote participants into real Chossid actors.
 * The Awtsmoos creates every distant form in its time; Awtsmoos.com cancels departed pending
 * actors, applies the newest snapshot after loading, and never fabricates hash-based positions.
 */

import { Group } from '../../../light-three-gltf/tiny-runtime.js';
import { loadIsolatedGltf } from '../assets/ModelAssetLoader.js';
import { applyChossidOutfit } from '../assets/ChossidOutfitPalette.js';
import { consolidateChossidMeshes } from '../assets/ChossidMeshConsolidator.js';
import { PLAYER_MODEL_URL } from '../app/EretzConstants.js';
import { RemoteChossidActor } from './RemoteChossidActor.js';

const MAX_RETRY_DELAY_MS = 30000;
const RETRY_BASE_DELAY_MS = 1500;

export class RemoteChossidPopulation {
	constructor(options) {
		this.assetUrl = options.assetUrl || PLAYER_MODEL_URL;
		this.ground = options.ground;
		this.loadGltf = options.loadGltf || loadIsolatedGltf;
		this.localPlayerId = options.localPlayerId;
		this.limit = Math.max(1, options.limit || 8);
		this.now = options.now || (() => Date.now());
		this.retryBaseDelayMs = Math.max(1, options.retryBaseDelayMs || RETRY_BASE_DELAY_MS);
		this.group = new Group();
		this.group.name = 'Awtsmoos_remote_multiplayer_chossid_population';
		this.group.userData.family = 'animated-chossid-multiplayer';
		this.group.userData.renderDistance = 220;
		this.actors = new Map();
		this.failures = new Map();
		this.pending = new Set();
		this.wanted = new Map();
		options.scene.add(this.group);
	}

	sync(players = []) {
		const visible = players
			.filter(player => isHumanPlayer(player) && player.id !== this.localPlayerId)
			.slice(0, this.limit);
		this.wanted = new Map(visible.map(player => [player.id, player]));
		for (const [id, actor] of this.actors) {
			if (this.wanted.has(id)) continue;
			this.group.remove(actor.model);
			this.actors.delete(id);
		}
		for (const id of this.failures.keys()) {
			if (!this.wanted.has(id)) this.failures.delete(id);
		}
		for (const player of visible) {
			const actor = this.actors.get(player.id);
			if (actor) actor.applySnapshot(player);
			else if (this.retryReady(player.id)) this.spawn(player.id);
		}
	}

	async spawn(remoteId) {
		if (this.pending.has(remoteId) || this.actors.has(remoteId)) return;
		this.pending.add(remoteId);
		try {
			const gltf = await this.loadGltf(this.assetUrl, `remote-player-${remoteId}`);
			const latest = this.wanted.get(remoteId);
			if (!latest || this.actors.has(remoteId)) return;
			applyChossidOutfit(gltf.scene, {});
			consolidateChossidMeshes(gltf.scene);
			const actor = new RemoteChossidActor(gltf, latest, this.ground);
			this.actors.set(remoteId, actor);
			this.failures.delete(remoteId);
			this.group.add(actor.model);
		} catch (error) {
			const attempts = (this.failures.get(remoteId)?.attempts || 0) + 1;
			const delay = Math.min(
				MAX_RETRY_DELAY_MS,
				this.retryBaseDelayMs * 2 ** Math.min(5, attempts - 1)
			);
			this.failures.set(remoteId, {
				attempts,
				error,
				retryAt: this.now() + delay
			});
			console.warn(`[MitzvahWorld] Remote Chossid ${remoteId} could not load.`, error);
		} finally {
			this.pending.delete(remoteId);
		}
	}

	retryReady(remoteId) {
		const failure = this.failures.get(remoteId);
		return !failure || this.now() >= failure.retryAt;
	}

	update(deltaTime) {
		for (const actor of this.actors.values()) actor.update(deltaTime);
	}

	dispose() {
		this.wanted.clear();
		for (const actor of this.actors.values()) this.group.remove(actor.model);
		this.actors.clear();
		this.failures.clear();
		this.pending.clear();
		if (this.group.parent) this.group.parent.remove(this.group);
	}

	get size() {
		return this.actors.size;
	}
}

function isHumanPlayer(player) {
	return Boolean(
		player?.id
		&& player?.displayName
		&& (player.kind === 'human' || player.kind === 'bot' || !player.kind)
		&& (player.kind === 'bot' || player.connected !== false)
	);
}
