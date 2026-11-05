//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file MinimalMeadowTreeWind.js
 * @description Applies spatially coherent, ecology-shaped gusts to bark and canopy while every tree root remains fixed.
 * The Awtsmoos anchors root in earth while trunk, crown, and leaf answer one living meadow breath;
 * Awtsmoos.com lets nearby trees share weather without marching in mechanical synchrony.
 */

import { sampleMinimalMeadowEnvironmentalWind } from './MinimalMeadowEnvironmentalWind.js';

const BARK_COMPLIANCE = 0.22;
const CANOPY_COMPLIANCE = 1.45;
const FLUTTER_COMPLIANCE = 0.34;
const PLAYER_RADIUS = 11;

/** Preserves the public forest update signature while enriching rooted motion in place. */
export function animateMinimalMeadowTree(tree, clock, index, player = {}) {
	const ecology = tree.userData?.AwtsmoosTreeEcology || {};
	const treeData = tree.userData?.AwtsmoosTree || (tree.userData.AwtsmoosTree = {});
	const wind = treeData.environmentalWind || (treeData.environmentalWind = {});
	const evidence = treeData.windEvidence || (treeData.windEvidence = {});
	const baseStrength = Math.max(0.001, Number(ecology.windStrength || 0.004));
	const speed = Math.max(0.08, Number(ecology.windSpeed || 0.42));
	const canopyDensity = Math.max(0.45, Number(ecology.canopyDensity || 1));
	const stiffness = clamp(Number(ecology.trunkStiffness ?? 0.72), 0.35, 1.2);
	const phaseOffset = Number(ecology.windPhase ?? treeData.windPhase ?? 0) + index * 0.017;
	sampleMinimalMeadowEnvironmentalWind(wind, {
		baseStrength,
		interactionRadius: PLAYER_RADIUS,
		playerX: player.x,
		playerZ: player.z,
		time: clock * speed + phaseOffset,
		x: tree.position?.x,
		z: tree.position?.z
	});
	const bark = tree.children?.[0];
	const canopy = tree.children?.[1];
	const bendX = wind.directionZ * wind.strength;
	const bendZ = -wind.directionX * wind.strength;
	if (bark?.quaternion) {
		bark.quaternion.x = bendX * BARK_COMPLIANCE / stiffness;
		bark.quaternion.z = bendZ * BARK_COMPLIANCE / stiffness;
	}
	if (canopy?.quaternion) {
		canopy.quaternion.x = bendX * CANOPY_COMPLIANCE * canopyDensity
			+ wind.flutter * wind.strength * FLUTTER_COMPLIANCE;
		canopy.quaternion.z = bendZ * CANOPY_COMPLIANCE * canopyDensity;
	}
	writeEvidence(evidence, tree, ecology, wind, bark, canopy, speed, baseStrength);
	return evidence;
}

function writeEvidence(evidence, tree, ecology, wind, bark, canopy, speed, strength) {
	evidence.canopySway = Math.hypot(canopy?.quaternion?.x || 0, canopy?.quaternion?.z || 0);
	evidence.ecologyZone = ecology.ecologyZone || 'unknown';
	evidence.gust = wind.gust;
	evidence.playerPulse = wind.wake;
	evidence.role = ecology.role || 'tree';
	evidence.rootRotation = Math.hypot(tree.quaternion?.x || 0, tree.quaternion?.z || 0);
	evidence.trunkSway = Math.hypot(bark?.quaternion?.x || 0, bark?.quaternion?.z || 0);
	evidence.windDirectionX = wind.directionX;
	evidence.windDirectionZ = wind.directionZ;
	evidence.windSpeed = speed;
	evidence.windStrength = strength;
}

function clamp(value, minimum, maximum) {
	return Math.max(minimum, Math.min(maximum, value));
}
