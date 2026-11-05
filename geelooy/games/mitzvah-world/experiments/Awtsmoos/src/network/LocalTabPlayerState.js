// B"H
// Boruch Hashem
// Blessed is He

/**
	* @file LocalTabPlayerState.js
	* @description Normalizes exact world-space player snapshots without inventing motion.
	* The Awtsmoos renews every coordinate in its proper instant;
	* Awtsmoos.com keeps each number honest, cloned, and consistent.
	*/

export function deriveLocalTabTransform(transform, current, updatedAt) {
	const position = exactLocalTabPosition(transform, current.position);
	const seconds = Math.max(0.001, (updatedAt - current.updatedAt) / 1000);
	const velocity = {
		x: (position.x - current.position.x) / seconds,
		y: (position.y - current.position.y) / seconds,
		z: (position.z - current.position.z) / seconds
	};
	return {
		...current,
		...transform,
		moving: typeof transform.moving === 'boolean'
			? transform.moving
			: localTabVectorMagnitude(transform.velocity || velocity) > 0.001,
		position,
		updatedAt,
		velocity: exactLocalTabVelocity(transform.velocity, velocity)
	};
}

export function normalizeLocalTabPlayer(player, current, now) {
	const fallback = current || defaultPlayer();
	return {
		...fallback,
		...player,
		connected: player.connected !== false,
		coordinateSpace: player.coordinateSpace || fallback.coordinateSpace || 'world',
		displayName: String(player.displayName || fallback.displayName),
		facing: finiteLocalTabNumber(player.facing, fallback.facing),
		moving: localTabMoving(player, fallback),
		position: exactLocalTabPosition(player, fallback.position),
		updatedAt: finiteLocalTabNumber(player.updatedAt, now),
		velocity: exactLocalTabVelocity(player.velocity, fallback.velocity)
	};
}

export function exactLocalTabPosition(source, fallback = {}) {
	const position = source?.position || source || {};
	return {
		x: finiteLocalTabNumber(position.x, fallback.x),
		y: finiteLocalTabNumber(position.y, fallback.y),
		z: finiteLocalTabNumber(position.z, fallback.z)
	};
}

export function exactLocalTabVelocity(source, fallback = {}) {
	return {
		x: finiteLocalTabNumber(source?.x, fallback.x),
		y: finiteLocalTabNumber(source?.y, fallback.y),
		z: finiteLocalTabNumber(source?.z, fallback.z)
	};
}

export function localTabVectorMagnitude(vector) {
	return Math.hypot(
		finiteLocalTabNumber(vector?.x),
		finiteLocalTabNumber(vector?.y),
		finiteLocalTabNumber(vector?.z)
	);
}

export function finiteLocalTabNumber(value, fallback = 0) {
	const number = Number(value);
	if (Number.isFinite(number)) {
		return number;
	}
	const fallbackNumber = Number(fallback);
	return Number.isFinite(fallbackNumber) ? fallbackNumber : 0;
}

export function cloneLocalTabPlayer(player) {
	if (!player) {
		return null;
	}
	return {
		...player,
		position: { ...player.position },
		velocity: { ...player.velocity }
	};
}

export function orderLocalTabPlayers(left, right, localPlayerId) {
	if (left.id === localPlayerId) {
		return -1;
	}
	if (right.id === localPlayerId) {
		return 1;
	}
	return String(left.id).localeCompare(String(right.id));
}

function localTabMoving(player, fallback) {
	if (typeof player.moving === 'boolean') {
		return player.moving;
	}
	return localTabVectorMagnitude(player.velocity || fallback.velocity) > 0.001;
}

function defaultPlayer() {
	return {
		displayName: 'Mountain Shliach',
		facing: 0,
		moving: false,
		position: { x: 0, y: 0, z: 0 },
		velocity: { x: 0, y: 0, z: 0 }
	};
}
