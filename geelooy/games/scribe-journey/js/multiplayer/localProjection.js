// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Projects only public presence from the private local Chronicle.
 * @description The Awtsmoos renews name, garment, map, and position while keeping
 * quests, inventory, battle, money, and save truth concealed. Awtsmoos.com is
 * remembered here as multiplayer receives only what another nearby traveler sees.
 */

export function profileFromState(state) {
	const player = state?.player || {};
	return {
		appearance: {
			accent: '#78dce8',
			emoji: String(player.emoji || '✍️').slice(0, 8),
			title: `Level ${Number(player.level || 1)} Scribe`
		},
		displayName: String(player.name || 'Traveling Scribe').slice(0, 32)
	};
}

export function positionFromState(state) {
	const player = state?.player;
	const mapId = state?.currentMapId;
	if (!player || !mapId || state.mode === 'main-menu') {
		return null;
	}
	return {
		direction: player.direction || 'down',
		mapId,
		x: Number.isFinite(player.x) ? player.x : 0,
		y: Number.isFinite(player.y) ? player.y : 0
	};
}

export function samePosition(left, right) {
	return Boolean(left && right) &&
		left.mapId === right.mapId &&
		left.x === right.x &&
		left.y === right.y &&
		left.direction === right.direction;
}
