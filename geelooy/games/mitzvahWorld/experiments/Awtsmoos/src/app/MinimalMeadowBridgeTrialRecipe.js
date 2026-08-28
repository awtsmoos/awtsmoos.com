//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file MinimalMeadowBridgeTrialRecipe.js
 * @description
 * Defines the first handcrafted MitzvahWorld obstacle course from canonical village landmarks.
 * The Awtsmoos joins entrance, learning, well, and bridge into one playable thread;
 * Awtsmoos.com reveals challenge from the world that already lives, not cubes newly spread.
 */

import {
	CANONICAL_VILLAGE_LANDMARKS
} from '../world/village/CanonicalVillagePlan.js';

const LANDMARK_KEYS = Object.freeze([
	'entrance',
	'learningSign',
	'well',
	'bridge'
]);

/**
 * @description Creates one Core-compatible semantic course plan using canonical village coordinates.
 * @returns {Readonly<object>} Frozen obstacle-course plan with ordered spatial checkpoints.
 */
export function createMinimalMeadowBridgeTrialPlan() {
	const checkpoints = LANDMARK_KEYS.map((key, index) => {
		const landmark = CANONICAL_VILLAGE_LANDMARKS[key];
		if (!landmark) {
			throw new Error(`Missing canonical village landmark: ${key}`);
		}
		return Object.freeze({
			id: `bridge-trial-${landmark.id}`,
			kind: 'checkpoint',
			position: Object.freeze({ x: landmark.x, z: landmark.z }),
			radius: key === 'entrance' ? 6 : 5,
			sequence: index + 1,
			title: landmark.label ?? key
		});
	});
	return Object.freeze({
		elements: Object.freeze(checkpoints),
		id: 'village-bridge-trial',
		kind: 'obstacle-course',
		title: 'Village Bridge Trial',
		validation: Object.freeze({ valid: true }),
		version: 1
	});
}

/**
 * @description Returns MitzvahWorld policy for timing, mission target, and reward projection.
 * @returns {Readonly<object>} Frozen gameplay policy.
 */
export function createMinimalMeadowBridgeTrialPolicy() {
	return Object.freeze({
		activityId: 'activity.village-bridge-trial',
		activityTarget: 'village-bridge-trial',
		countdownMs: 3000,
		medalTargetsMs: Object.freeze({
			bronze: 75000,
			gold: 35000,
			silver: 50000
		}),
		reward: Object.freeze({ mitzvahPoints: 25 }),
		title: 'Village Bridge Trial'
	});
}
