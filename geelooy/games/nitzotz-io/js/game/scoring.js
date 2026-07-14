// B"H
// Boruch Hashem
// Blessed is He
import { visiblePeers } from '../multiplayer/state.js';

/** Radius grows sublinearly, preserving control while unlocking larger prey. */
export function radiusForMass(mass) {
	return 18 + Math.sqrt(Math.max(0, mass)) * 2.1;
}

/** Feed a hole and update all derived measurements in one place. */
export function feedHole(hole, mass, score = mass) {
	hole.mass += mass;
	hole.score = (hole.score || 0) + score;
	hole.r = radiusForMass(hole.mass);
}

/**
 * Produce one visual leaderboard containing authoritative local rivals and
 * observational live peers. Peer mass can never affect campaign rank or stars.
 */
export function rankings(world) {
	return [
		...localRankings(world),
		...visiblePeers(world).map(peer => ({
			id: peer.peerId,
			name: peer.name,
			archetype: 'LIVE HEVRUTA',
			mass: peer.mass,
			score: 0,
			peer: true,
			player: false
		}))
	].sort(compareRank);
}

/** Calculate campaign-authoritative rank from local simulation only. */
export function playerRank(world) {
	return localRankings(world).sort(compareRank).findIndex(entry => entry.player) + 1;
}

/** Return the local player and deterministic rivals without peer observations. */
export function localRankings(world) {
	return [
		{
			id: 'player',
			name: 'You',
			mass: world.player.mass,
			score: world.score,
			player: true
		},
		...world.rivals.map(rival => ({
			id: rival.id,
			name: rival.name,
			archetype: rival.archetype.name,
			mass: rival.mass,
			score: rival.score,
			player: false
		}))
	];
}

function compareRank(left, right) {
	return right.mass - left.mass || right.score - left.score;
}
