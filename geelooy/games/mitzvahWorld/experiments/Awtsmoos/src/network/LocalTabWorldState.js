// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file LocalTabWorldState.js
 * @description Maintains exact world-space tab snapshots with bounded stale-peer cleanup.
 * The Awtsmoos creates every measured position anew; Awtsmoos.com carries actual runtime
 * x/y/z/facing/moving values and never integrates input or invents presentation offsets.
 */

export const LOCAL_TAB_STALE_AFTER_MS = 6500;

export class LocalTabWorldState {
	constructor({
		playerId,
		displayName,
		worldId,
		initialPlayerState = {},
		now = () => Date.now(),
		staleAfterMs = LOCAL_TAB_STALE_AFTER_MS
	}) {
		this.playerId = playerId;
		this.worldId = worldId;
		this.now = now;
		this.staleAfterMs = staleAfterMs;
		this.revision = 0;
		this.players = new Map();
		this.lastSeenAt = new Map();
		this.upsertLocal({
			...initialPlayerState,
			displayName,
			id: playerId
		});
	}

	applyTransform(transform = {}) {
		const current = this.players.get(this.playerId);
		if (!current) return null;
		const updatedAt = this.now();
		const position = exactPosition(transform, current.position);
		const elapsedSeconds = Math.max(0.001, (updatedAt - current.updatedAt) / 1000);
		const derivedVelocity = {
			x: (position.x - current.position.x) / elapsedSeconds,
			y: (position.y - current.position.y) / elapsedSeconds,
			z: (position.z - current.position.z) / elapsedSeconds
		};
		return this.upsertLocal({
			...current,
			...transform,
			facing: finite(transform.facing, current.facing),
			moving: typeof transform.moving === 'boolean'
				? transform.moving
				: vectorMagnitude(transform.velocity || derivedVelocity) > 0.001,
			position,
			updatedAt,
			velocity: exactVelocity(transform.velocity, derivedVelocity)
		});
	}

	touchLocal() {
		const player = this.players.get(this.playerId);
		if (!player) return null;
		return this.upsertLocal({ ...player, updatedAt: this.now() });
	}

	upsert(player) {
		if (!player?.id || player.id === this.playerId) return false;
		const current = this.players.get(player.id);
		const normalized = normalizePlayer(player, current, this.now());
		this.players.set(player.id, normalized);
		this.lastSeenAt.set(player.id, this.now());
		this.revision += 1;
		return true;
	}

	upsertLocal(player) {
		const current = this.players.get(this.playerId);
		const normalized = normalizePlayer({
			...player,
			connected: true,
			coordinateSpace: 'world',
			id: this.playerId,
			kind: 'human'
		}, current, this.now());
		this.players.set(this.playerId, normalized);
		this.lastSeenAt.set(this.playerId, this.now());
		this.revision += 1;
		return clonePlayer(normalized);
	}

	remove(playerId) {
		if (playerId === this.playerId) return false;
		const removed = this.players.delete(playerId);
		this.lastSeenAt.delete(playerId);
		if (removed) this.revision += 1;
		return removed;
	}

	prune() {
		const threshold = this.now() - this.staleAfterMs;
		for (const [playerId, seenAt] of this.lastSeenAt) {
			if (playerId === this.playerId || seenAt >= threshold) continue;
			this.players.delete(playerId);
			this.lastSeenAt.delete(playerId);
			this.revision += 1;
		}
	}

	localPlayer() {
		return clonePlayer(this.players.get(this.playerId));
	}

	snapshot() {
		this.prune();
		const players = [...this.players.values()]
			.sort((left, right) => {
				if (left.id === this.playerId) return -1;
				if (right.id === this.playerId) return 1;
				return String(left.id).localeCompare(String(right.id));
			})
			.map(clonePlayer);
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

function normalizePlayer(player, current, now) {
	const fallback = current || {
		displayName: 'Mountain Shliach',
		facing: 0,
		moving: false,
		position: { x: 0, y: 0, z: 0 },
		velocity: { x: 0, y: 0, z: 0 }
	};
	return {
		...fallback,
		...player,
		connected: player.connected !== false,
		coordinateSpace: player.coordinateSpace || fallback.coordinateSpace || 'world',
		displayName: String(player.displayName || fallback.displayName || 'Mountain Shliach'),
		facing: finite(player.facing, fallback.facing),
		moving: typeof player.moving === 'boolean'
			? player.moving
			: vectorMagnitude(player.velocity || fallback.velocity) > 0.001,
		position: exactPosition(player, fallback.position),
		updatedAt: finite(player.updatedAt, now),
		velocity: exactVelocity(player.velocity, fallback.velocity)
	};
}

function exactPosition(source, fallback) {
	const position = source?.position || source || {};
	return {
		x: finite(position.x, fallback.x),
		y: finite(position.y, fallback.y),
		z: finite(position.z, fallback.z)
	};
}

function exactVelocity(source, fallback) {
	return {
		x: finite(source?.x, fallback.x),
		y: finite(source?.y, fallback.y),
		z: finite(source?.z, fallback.z)
	};
}

function vectorMagnitude(vector) {
	return Math.hypot(
		finite(vector?.x, 0),
		finite(vector?.y, 0),
		finite(vector?.z, 0)
	);
}

function finite(value, fallback) {
	const number = Number(value);
	return Number.isFinite(number) ? number : Number(fallback) || 0;
}

function clonePlayer(player) {
	if (!player) return null;
	return {
		...player,
		position: { ...player.position },
		velocity: { ...player.velocity }
	};
}
