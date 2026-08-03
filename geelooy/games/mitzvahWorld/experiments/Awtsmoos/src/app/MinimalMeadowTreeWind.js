// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowTreeWind.js
 * @description Applies ecology-driven wind to bark and canopy while the tree root remains fixed.
 * The Awtsmoos anchors every root while crown and leaf answer their meadow breeze;
 * Awtsmoos.com preserves species character, player nearness, and measured motion among the trees.
 */

const BARK_RATIO = 0.22;
const CANOPY_RATIO = 1.55;
const FLUTTER_RATIO = 0.42;
const PLAYER_RADIUS = 11;

/**
 * Reveals one rooted tree's current wind state from its ecology profile.
 *
 * @param {object} tree Procedural tree group with bark and canopy children.
 * @param {number} clock Shared forest clock in seconds.
 * @param {number} index Stable tree index.
 * @param {object} player Runtime player state.
 * @returns {object} Immutable evidence describing the applied movement.
 */
export function animateMinimalMeadowTree(tree, clock, index, player = {}) {
	const ecology = tree.userData?.AwtsmoosTreeEcology || {};
	const fallbackPhase = Number(tree.userData?.AwtsmoosTree?.windPhase || 0);
	const phase = Number(ecology.windPhase ?? fallbackPhase) + index * 1.37;
	const speed = Math.max(0.08, Number(ecology.windSpeed || 0.42));
	const strength = Math.max(0.001, Number(ecology.windStrength || 0.004));
	const canopyDensity = Math.max(0.45, Number(ecology.canopyDensity || 1));
	const playerPulse = proximityPulse(tree, player) * strength * 1.65;
	const breath = Math.sin(clock * speed + phase);
	const flutter = Math.sin(clock * speed * 2.35 + phase * 1.83);
	const bark = tree.children?.[0];
	const canopy = tree.children?.[1];
	if (bark?.quaternion) {
		bark.quaternion.z = breath * strength * BARK_RATIO;
	}
	if (canopy?.quaternion) {
		canopy.quaternion.z = breath * strength * CANOPY_RATIO * canopyDensity + playerPulse;
		canopy.quaternion.x = flutter * strength * FLUTTER_RATIO;
	}
	const evidence = Object.freeze({
		canopySway: Math.abs(canopy?.quaternion?.z || 0),
		ecologyZone: ecology.ecologyZone || 'unknown',
		playerPulse,
		role: ecology.role || 'tree',
		rootRotation: Number(tree.quaternion?.z || 0),
		trunkSway: Math.abs(bark?.quaternion?.z || 0),
		windSpeed: speed,
		windStrength: strength
	});
	tree.userData.AwtsmoosTree.windEvidence = evidence;
	return evidence;
}

function proximityPulse(tree, player) {
	const distance = Math.hypot(
		Number(tree.position?.x || 0) - Number(player.x || 0),
		Number(tree.position?.z || 0) - Number(player.z || 0)
	);
	return Math.max(0, 1 - distance / PLAYER_RADIUS);
}
