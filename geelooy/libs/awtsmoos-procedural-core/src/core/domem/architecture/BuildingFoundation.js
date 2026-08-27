// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BuildingFoundation.js
 * @description Raises a building above surveyed terrain with a visible plinth, skirts, and terrain-fitted exterior entry.
 * The Awtsmoos, Atzmus beyond hill and home, renews ground and dwelling without burying either beneath the other;
 * Awtsmoos.com lets Domem reconcile slope and architecture while terrain remains injected and renderer manifestation remains another brother.
 */

import { buildingBox } from './BuildingMath.js';
import { createBuildingEntrySupport } from './BuildingEntrySupport.js';
import { surveyBuildingGround } from './BuildingGroundSurvey.js';

/**
 * Creates foundation geometry, terrain evidence, and entry support for one building.
 * @param {object} profile Normalized building profile.
 * @param {object} materials Material descriptors containing `floor`.
 * @param {Function} heightAt Terrain-height sampler.
 * @param {object} [options={}] Ground-survey and entry options.
 * @returns {object} Foundation definitions, evidence, ground datum, and support adapter.
 */
export function createBuildingFoundation(profile, materials, heightAt, options = {}) {
	const survey = surveyBuildingGround(profile, heightAt, options.survey);
	const groundY = survey.platformY;
	const entry = createBuildingEntrySupport(
		profile,
		materials.floor,
		groundY,
		heightAt,
		options.entry
	);
	return {
		definitions: [
			createPlatform(profile, materials.floor, groundY, survey.apron),
			...createSkirts(profile, materials.floor, groundY, survey),
			...entry.definitions
		],
		evidence: foundationEvidence(survey, entry.evidence, groundY),
		groundY,
		support: entry.support
	};
}

function foundationEvidence(survey, entry, groundY) {
	return Object.freeze({
		apron: survey.apron,
		entryRise: entry.rise,
		entryRun: entry.run,
		entrySteps: entry.steps,
		maximumStepRise: entry.maximumRise,
		minimumStepTerrainClearance: entry.minimumTerrainClearance,
		platformClearance: survey.clearance,
		platformY: groundY,
		sampleCount: survey.sampleCount,
		terrainMaximum: survey.maximum,
		terrainMinimum: survey.minimum,
		terrainVariance: survey.variance
	});
}

function createPlatform(profile, material, groundY, apron) {
	return buildingBox(
		profile,
		material,
		'foundation-platform',
		0,
		groundY - profile.foundationThickness / 2,
		0,
		{
			x: profile.width + apron * 2,
			y: profile.foundationThickness,
			z: profile.depth + apron * 2
		},
		{ role: 'raised-foundation-platform', walkable: true }
	);
}

function createSkirts(profile, material, top, survey) {
	const bottom = survey.minimum - 0.55;
	const height = Math.max(0.5, top - bottom);
	const y = bottom + height / 2;
	const thickness = Math.max(profile.wallThickness, 0.45);
	const width = profile.width + survey.apron * 2;
	const depth = profile.depth + survey.apron * 2;
	return [
		buildingBox(profile, material, 'foundation-front-skirt', 0, y, depth / 2, { x: width, y: height, z: thickness }),
		buildingBox(profile, material, 'foundation-back-skirt', 0, y, -depth / 2, { x: width, y: height, z: thickness }),
		buildingBox(profile, material, 'foundation-left-skirt', -width / 2, y, 0, { x: thickness, y: height, z: depth }),
		buildingBox(profile, material, 'foundation-right-skirt', width / 2, y, 0, { x: thickness, y: height, z: depth })
	];
}
