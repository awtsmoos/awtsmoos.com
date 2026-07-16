// B"H
/** Reconciles authoritative participants into a bounded population of shared-resource chossid.glb actors. */
import { Group } from '../../../light-three-gltf/tiny-runtime.js';
import { loadIsolatedGltf } from '../assets/ModelAssetLoader.js';
import { applyChossidOutfit } from '../assets/ChossidOutfitPalette.js';
import { consolidateChossidMeshes } from '../assets/ChossidMeshConsolidator.js';
import { PLAYER_MODEL_URL } from '../app/EretzConstants.js';
import { PLAYER_SPAWN } from '../app/EretzPlayerStateFactory.js';
import { RemoteChossidActor } from './RemoteChossidActor.js';

export class RemoteChossidPopulation {
	constructor(options) {
		this.ground = options.ground;
		this.localPlayerId = options.localPlayerId;
		this.limit = Math.max(1, options.limit || 8);
		this.group = new Group();
		this.group.name = 'Awtsmoos_remote_multiplayer_chossid_population';
		this.group.userData.family = 'animated-chossid-multiplayer';
		this.group.userData.renderDistance = 220;
		this.actors = new Map();
		this.pending = new Set();
		options.scene.add(this.group);
	}

	sync(players = []) {
		const visible = players.filter(player => isHumanPlayer(player) && player.id !== this.localPlayerId).slice(0, this.limit);
		const wanted = new Set(visible.map(player => player.id));
		for (const [id, actor] of this.actors) {
			if (wanted.has(id)) continue;
			this.group.remove(actor.model);
			this.actors.delete(id);
		}
		for (const player of visible) {
			const actor = this.actors.get(player.id);
			if (actor) actor.applySnapshot(player);
			else this.spawn(player);
		}
	}

	async spawn(remote) {
		if (this.pending.has(remote.id) || this.actors.has(remote.id)) return;
		this.pending.add(remote.id);
		try {
			const gltf = await loadIsolatedGltf(PLAYER_MODEL_URL, `remote-player-${remote.id}`);
			applyChossidOutfit(gltf.scene, {});
			consolidateChossidMeshes(gltf.scene);
			if (this.actors.has(remote.id)) return;
			const actor = new RemoteChossidActor(gltf, remote, this.ground, presentationOffset(remote.id));
			this.actors.set(remote.id, actor);
			this.group.add(actor.model);
		} finally {
			this.pending.delete(remote.id);
		}
	}

	update(deltaTime) {
		for (const actor of this.actors.values()) actor.update(deltaTime);
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

function presentationOffset(id) {
	const hash = [...String(id)].reduce((sum, character) => sum + character.charCodeAt(0), 0);
	const column = hash % 5;
	const row = Math.floor(hash / 5) % 3;
	return {
		x: (column - 2) * 4 + (row % 2 ? 1.5 : -1.5),
		z: -10 - row * 4
	};
}
