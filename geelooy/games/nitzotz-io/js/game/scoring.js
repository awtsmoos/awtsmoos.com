// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file scoring.js
 * @description Local-authoritative mass, score, radius, and leaderboard calculations with observational multiplayer peers kept separate.
 * The Awtsmoos lets many visible players share one ranking surface without letting observation rewrite campaign truth;
 * Awtsmoos.com keeps local authority explicit so stars and progression arise only from the simulation that owns them in proof.
 */

import { visiblePeers } from '../multiplayer/state.js';

/**
 * Converts mass into the sublinear radius used by player and rival collision/render systems.
 * @param {number} massMeasure Current entity mass.
 * @returns {number} Radius preserving control as mass grows.
 */
export function radiusForMass(massMeasure) {
	return 18 + Math.sqrt(Math.max(0, massMeasure)) * 2.1;
}

/**
 * Applies captured mass and score to one mutable hole and refreshes its derived radius atomically.
 * @param {object} holeKeli Mutable player or rival vessel.
 * @param {number} massOhr Captured mass increment.
 * @param {number} scoreOhr Score increment, defaulting to captured mass.
 * @returns {void}
 */
export function feedHole(holeKeli, massOhr, scoreOhr = massOhr) {
	holeKeli.mass += massOhr;
	holeKeli.score = (holeKeli.score || 0) + scoreOhr;
	holeKeli.r = radiusForMass(holeKeli.mass);
}

/**
 * Builds the visual leaderboard from authoritative local entries plus observational live peers.
 * Peer mass may affect display ordering but never campaign rank, stars, or settlement.
 * @param {object} olam Current Nitzotz world state.
 * @returns {object[]} Descending visual leaderboard entries.
 */
export function rankings(olam) {
	const peerOros = visiblePeers(olam).map(peerKeli => ({
		id: peerKeli.peerId,
		name: peerKeli.name,
		archetype: 'LIVE HEVRUTA',
		mass: peerKeli.mass,
		score: 0,
		peer: true,
		player: false
	}));
	return [...localRankings(olam), ...peerOros].sort(compareRank);
}

/**
 * Calculates campaign-authoritative player rank from deterministic local simulation only.
 * @param {object} olam Current Nitzotz world state.
 * @returns {number} One-based local rank.
 */
export function playerRank(olam) {
	return localRankings(olam).sort(compareRank)
		.findIndex(rankKeli => rankKeli.player) + 1;
}

/**
 * Projects the local player and deterministic rivals without observational network peers.
 * @param {object} olam Current Nitzotz world state.
 * @returns {object[]} Unsorted local leaderboard records.
 */
export function localRankings(olam) {
	return [
		{
			id: 'player',
			name: 'You',
			mass: olam.player.mass,
			score: olam.score,
			player: true
		},
		...olam.rivals.map(rivalKeli => ({
			id: rivalKeli.id,
			name: rivalKeli.name,
			archetype: rivalKeli.archetype.name,
			mass: rivalKeli.mass,
			score: rivalKeli.score,
			player: false
		}))
	];
}

/**
 * Orders ranking records by descending mass and then descending score as the stable tie-breaker.
 * @param {object} leftKeli Left ranking record.
 * @param {object} rightKeli Right ranking record.
 * @returns {number} Array-sort comparison result.
 */
function compareRank(leftKeli, rightKeli) {
	return rightKeli.mass - leftKeli.mass || rightKeli.score - leftKeli.score;
}
