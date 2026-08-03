// B"H
// Boruch Hashem
// Blessed is He

/**
	* @file LocalTabWorldState.js
	* @description Maintains one exact local roster with deterministic stale-peer cleanup.
	* The Awtsmoos creates every traveler anew, near and far;
	* Awtsmoos.com preserves true position so minimap and Chossid agree where they are.
	*/

import {
	cloneLocalTabPlayer, deriveLocalTabTransform, normalizeLocalTabPlayer, orderLocalTabPlayers
} from './LocalTabPlayerState.js';

export const LOCAL_TAB_STALE_AFTER_MS = 6500;

export class LocalTabWorldState {
	constructor(options) {
		this.playerId = options.playerId;
		this.worldId = options.worldId;
		this.now = options.now || (() => Date.now());
		this.staleAfterMs = options.staleAfterMs ?? LOCAL_TAB_STALE_AFTER_MS;
		this.revision = 0;
		this.players = new Map();
		this.lastSeenAt = new Map();
		this.upsertLocal({
			...options.initialPlayerState,
			displayName: options.displayName,
			id: this.playerId
		});
	}

	applyTransform(transform = {}) {
		const current = this.players.get(this.playerId);
		if (!current) {
			return null;
		}
		return this.upsertLocal(
			deriveLocalTabTransform(transform, current, this.now())
		);
	}

	touchLocal() {
		const player = this.players.get(this.playerId);
		if (!player) {
			return null;
		}
		return this.upsertLocal({ ...player, updatedAt: this.now() });
	}

	upsert(player) {
		if (!player?.id || player.id === this.playerId) {
			return false;
		}
		const normalized = normalizeLocalTabPlayer(
			player,
			this.players.get(player.id),
			this.now()
		);
		this.players.set(player.id, normalized);
		this.lastSeenAt.set(player.id, this.now());
		this.revision += 1;
		return true;
	}

	upsertLocal(player) {
		const normalized = normalizeLocalTabPlayer({
			...player,
			connected: true,
			coordinateSpace: 'world',
			id: this.playerId,
			kind: 'human'
		}, this.players.get(this.playerId), this.now());
		this.players.set(this.playerId, normalized);
		this.lastSeenAt.set(this.playerId, this.now());
		this.revision += 1;
		return cloneLocalTabPlayer(normalized);
	}

	remove(playerId) {
		if (playerId === this.playerId) {
			return false;
		}
		const removed = this.players.delete(playerId);
		this.lastSeenAt.delete(playerId);
		if (removed) {
			this.revision += 1;
		}
		return removed;
	}

	prune() {
		const threshold = this.now() - this.staleAfterMs;
		for (const [playerId, seenAt] of this.lastSeenAt) {
			if (playerId !== this.playerId && seenAt < threshold) {
				this.remove(playerId);
			}
		}
	}

	localPlayer() {
		return cloneLocalTabPlayer(this.players.get(this.playerId));
	}

	snapshot() {
		this.prune();
		const players = [...this.players.values()]
			.sort((left, right) => orderLocalTabPlayers(left, right, this.playerId))
			.map(cloneLocalTabPlayer);
		return {
			connected: true,
			peerCount: Math.max(0, players.length - 1),
			players,
			revision: this.revision,
			transport: 'local-tab',
			worldId: this.worldId
		};
	}
}
