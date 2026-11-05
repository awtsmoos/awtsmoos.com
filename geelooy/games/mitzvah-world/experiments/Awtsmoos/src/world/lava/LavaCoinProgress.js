//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file LavaCoinProgress.js
 * @description Owns collectible proximity checks and deterministic coin reset behavior for the lava challenge.
 * Progress logic uses only native JavaScript math and mutable semantic coin records.
 */

const COIN_HORIZONTAL_RADIUS = 1.35;
const COIN_VERTICAL_TOLERANCE = 2.8;

/**
 * Collects every currently eligible coin touching the player's bounded pickup volume.
 * @param {object[]} coins Mutable coin records.
 * @param {object} state Current player state.
 * @param {number} footOffset Player foot-to-origin offset.
 * @returns {number} Number of newly collected coins.
 */
export function collectNearbyLavaCoins(coins, state, footOffset) {
	let collected = 0;

	for (const coin of coins) {
		if (!coinCanBeCollected(coin, state, footOffset)) {
			continue;
		}

		coin.got = true;
		coin.group.visible = false;
		collected += 1;
	}

	return collected;
}

/**
 * Restores every collectible to its visible, uncollected state after lava failure.
 * @param {object[]} coins Mutable coin records.
 * @returns {void}
 */
export function resetLavaCoins(coins) {
	for (const coin of coins) {
		coin.got = false;
		coin.group.visible = true;
	}
}

/** Tests one coin against the exact historical pickup radius and floor tolerance. */
function coinCanBeCollected(coin, state, footOffset) {
	if (coin.got) {
		return false;
	}

	const horizontalDistance = Math.hypot(
		state.x - coin.x,
		state.z - coin.z
	);
	const playerFloorY = state.y - footOffset;
	const verticalDistance = Math.abs(playerFloorY - coin.floorY);

	return horizontalDistance < COIN_HORIZONTAL_RADIUS
		&& verticalDistance < COIN_VERTICAL_TOLERANCE;
}
