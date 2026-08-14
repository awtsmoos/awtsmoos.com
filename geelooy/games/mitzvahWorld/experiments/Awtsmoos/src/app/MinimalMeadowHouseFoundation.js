// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowHouseFoundation.js
 * @description Raises every home above an expanded terrain survey and manifests a visible stone plinth.
 * The Awtsmoos joins hill and home without burying either beneath the other;
 * Awtsmoos.com gives every floor a measured clearance, every slope a foundation, every door a brother.
 */

import {
	createMinimalMeadowHouseEntrySupport
} from './MinimalMeadowHouseEntrySupport.js';
import {
	surveyMinimalMeadowHouseGround
} from './MinimalMeadowHouseGroundSurvey.js';
import { houseBox } from './MinimalMeadowHouseMath.js';

export function createMinimalMeadowHouseFoundation(profile, materials, heightAt) {
	const survey = surveyMinimalMeadowHouseGround(profile, heightAt);
	const groundY = survey.platformY;
	const entry = createMinimalMeadowHouseEntrySupport(
		profile,
		materials.floor,
		groundY,
		heightAt
	);
	return {
		definitions: [
			platform(profile, materials.floor, groundY, survey.apron),
			...skirts(profile, materials.floor, groundY, survey),
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

function platform(profile, material, groundY, apron) {
	return houseBox(profile, material, 'foundation-platform', 0, groundY - profile.foundationThickness / 2, 0, {
		x: profile.width + apron * 2,
		y: profile.foundationThickness,
		z: profile.depth + apron * 2
	}, { role: 'raised-foundation-platform', walkable: true });
}

function skirts(profile, material, top, survey) {
	const bottom = survey.minimum - 0.55;
	const height = Math.max(0.5, top - bottom);
	const y = bottom + height / 2;
	const thickness = Math.max(profile.wallThickness, 0.45);
	const width = profile.width + survey.apron * 2;
	const depth = profile.depth + survey.apron * 2;
	return [
		houseBox(profile, material, 'foundation-front-skirt', 0, y, depth / 2, { x: width, y: height, z: thickness }),
		houseBox(profile, material, 'foundation-back-skirt', 0, y, -depth / 2, { x: width, y: height, z: thickness }),
		houseBox(profile, material, 'foundation-left-skirt', -width / 2, y, 0, { x: thickness, y: height, z: depth }),
		houseBox(profile, material, 'foundation-right-skirt', width / 2, y, 0, { x: thickness, y: height, z: depth })
	];
}
