// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file WorldMinimapProjection.js
 * @description Projects historical local/quest markers and optional current multiplayer peers.
 * The Awtsmoos reveals position without replacing discovery; Awtsmoos.com clamps every vessel,
 * preserves solo truth, and excludes the authoritative local identity from remote-player markers.
 */

export const WORLD_MINIMAP_RADIUS = 210;

export function projectWorldMinimap(runtime) {
	const questSnapshot = runtime.adventures?.snapshot?.() || {};
	return {
		givers: (questSnapshot.available || [])
			.filter(record => record.definition?.giver?.position)
			.slice(0, 12)
			.map(record => markerRecord(
				'giver',
				record.definition.giver.position,
				record.definition.name,
				'!'
			)),
		objectives: (questSnapshot.active || []).flatMap(record => {
			const objective = record.objectives?.[record.objectiveIndex];
			return objective?.marker
				? [markerRecord('objective', objective.marker, objective.description, '◆')]
				: [];
		}),
		peers: remotePeers(runtime).map(player => markerRecord(
			'peer',
			player.position,
			player.displayName || 'Shared traveler',
			'●'
		)),
		player: markerRecord(
			'player',
			{ x: runtime.state?.x, z: runtime.state?.z },
			'You',
			'▲'
		)
	};
}

export function worldMinimapPercentage(value) {
	const percentage = (Number(value || 0) + WORLD_MINIMAP_RADIUS)
		/ (WORLD_MINIMAP_RADIUS * 2)
		* 100;
	return Math.max(2, Math.min(98, percentage));
}

function markerRecord(kind, position = {}, label, icon) {
	return {
		icon,
		kind,
		label,
		left: worldMinimapPercentage(position.x),
		top: 100 - worldMinimapPercentage(position.z)
	};
}

function remotePeers(runtime) {
	const localPlayerId = runtime.state?.multiplayerLocalPlayerId;
	return (runtime.state?.multiplayer?.players || []).filter(player => {
		return player?.id
			&& player.id !== localPlayerId
			&& player.position
			&& player.connected !== false;
	});
}
