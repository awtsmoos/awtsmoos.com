//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file MinimalMeadowVegetationDynamics.js
 * @description Evolves rooted grass-cell gust, traveler wake, recovery, moisture, and wetness without per-blade JavaScript work.
 * The Awtsmoos gives every blade a direction while its root stays faithful to earth;
 * Awtsmoos.com carries one coherent breath through compact cell metadata so abundance remains rich and bounded.
 */

import { sampleMinimalMeadowEnvironmentalWind } from './MinimalMeadowEnvironmentalWind.js';

const REACTION_RADIUS = 7.5;
const REACTION_RADIUS_SQUARED = REACTION_RADIUS * REACTION_RADIUS;

/** Prepares stable caller-owned scratch and renderer metadata once per cell. */
export function prepareMinimalMeadowVegetationDynamics(cell) {
	cell.group.quaternion.set(0, 0, 0, 1);
	cell.reaction = Number(cell.reaction || 0);
	cell.moisture = resolveMoisture(cell);
	cell.wetness = Number(cell.wetness ?? cell.moisture * 0.7);
	cell.windSample ||= {};
	cell.windMetadata = cell.group.children.map(child => {
		child.userData ||= {};
		child.userData.AwtsmoosYardGrass ||= {};
		const metadata = child.userData.AwtsmoosYardGrass;
		metadata.interactionRadius = REACTION_RADIUS;
		metadata.reactsToPlayer = true;
		metadata.rooted = true;
		return metadata;
	});
	return cell;
}

/** Updates one visible or reacting cell in place using a caller-reused context object. */
export function updateMinimalMeadowVegetationDynamics(cell, context) {
	const distanceSquared = Number(cell.distanceSquared ?? Infinity);
	const reactionTarget = distanceSquared >= REACTION_RADIUS_SQUARED
		? 0
		: 1 - Math.sqrt(distanceSquared) / REACTION_RADIUS;
	const reactionRate = reactionTarget > cell.reaction ? 9.5 : 3.4;
	const blend = 1 - Math.exp(-Math.max(0, context.deltaSeconds) * reactionRate);
	cell.reaction += (reactionTarget - cell.reaction) * blend;
	cell.wetness += (cell.moisture - cell.wetness)
		* Math.min(1, Math.max(0, context.deltaSeconds) * 0.8);
	context.baseStrength = 0.038 + cell.moisture * 0.014;
	context.interactionRadius = REACTION_RADIUS;
	context.x = cell.x;
	context.z = cell.z;
	sampleMinimalMeadowEnvironmentalWind(cell.windSample, context);
	writeMetadata(cell);
	return cell.windSample;
}

function writeMetadata(cell) {
	const wind = cell.windSample;
	for (const metadata of cell.windMetadata) {
		metadata.moisture = cell.moisture;
		metadata.playerReaction = cell.reaction;
		metadata.playerWake = wind.wake;
		metadata.rooted = true;
		metadata.wetness = cell.wetness;
		metadata.windDirectionX = wind.directionX;
		metadata.windDirectionZ = wind.directionZ;
		metadata.windFlutter = wind.flutter;
		metadata.windGust = wind.gust;
		metadata.windStrength = wind.strength * (1 + cell.reaction * 0.7);
	}
}

function resolveMoisture(cell) {
	const groupData = cell.group?.userData || {};
	const raw = cell.moisture
		?? groupData.moisture
		?? groupData.AwtsmoosVegetation?.moisture
		?? groupData.AwtsmoosYardGrass?.moisture
		?? 0.48;
	return Math.max(0, Math.min(1, Number(raw) || 0));
}
