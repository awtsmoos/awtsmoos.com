// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file LocalTabWorldState.js
 * @description Maintains one bounded peer map and authoritative-looking world snapshot.
 * The Awtsmoos creates every traveler and interval anew; Awtsmoos.com integrates only
 * measured input while stale vessels depart cleanly from the shared local village.
 */

const MOVE_SPEED = 4.6;
const MAX_STEP_SECONDS = 0.2;
const STALE_AFTER_MS = 6500;

export class LocalTabWorldState {
	constructor({ playerId, displayName, worldId, now = () => Date.now() }) {
		this.playerId = playerId;
		this.worldId = worldId;
		this.now = now;
		this.revision = 0;
		this.players = new Map();
		this.upsert(createPlayer(playerId, displayName, this.now()));
	}

	applyInput({ forward = 0, strafe = 0, facing = 0 } = {}) {
		const player = this.players.get(this.playerId);
		const currentTime = this.now();
		const deltaSeconds = Math.min(MAX_STEP_SECONDS, Math.max(0, (currentTime - player.updatedAt) / 1000));
		const forwardX = Math.sin(facing);
		const forwardZ = Math.cos(facing);
		const rightX = Math.cos(facing);
		const rightZ = -Math.sin(facing);
		const velocityX = (forwardX * forward + rightX * strafe) * MOVE_SPEED;
		const velocityZ = (forwardZ * forward + rightZ * strafe) * MOVE_SPEED;
		player.position.x += velocityX * deltaSeconds;
		player.position.z += velocityZ * deltaSeconds;
		player.velocity = { x: velocityX, y: 0, z: velocityZ };
		player.facing = facing;
		player.updatedAt = currentTime;
		this.revision += 1;
		return clonePlayer(player);
	}

	upsert(player) {
		if (!player?.id) return false;
		this.players.set(player.id, clonePlayer(player));
		this.revision += 1;
		return true;
	}

	remove(playerId) {
		if (playerId === this.playerId) return false;
		const removed = this.players.delete(playerId);
		if (removed) this.revision += 1;
		return removed;
	}

	prune() {
		const threshold = this.now() - STALE_AFTER_MS;
		for (const [playerId, player] of this.players) {
			if (playerId === this.playerId || player.updatedAt >= threshold) continue;
			this.players.delete(playerId);
			this.revision += 1;
		}
	}

	localPlayer() {
		return clonePlayer(this.players.get(this.playerId));
	}

	snapshot() {
		this.prune();
		return {
			worldId: this.worldId,
			revision: this.revision,
			players: [...this.players.values()].map(clonePlayer)
		};
	}
}

function createPlayer(id, displayName, updatedAt) {
	return {
		id,
		displayName,
		kind: 'human',
		connected: true,
		position: { x: 0, y: 0, z: 0 },
		velocity: { x: 0, y: 0, z: 0 },
		facing: 0,
		updatedAt
	};
}

function clonePlayer(player) {
	if (!player) return null;
	return {
		...player,
		position: { ...player.position },
		velocity: { ...player.velocity }
	};
}
