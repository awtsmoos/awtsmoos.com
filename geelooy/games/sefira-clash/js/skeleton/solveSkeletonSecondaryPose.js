//B"H
//Boruch Hashem
//Blessed is He

import { impactPose } from './impact/impactPose.js';
import { damagePose } from './damage/damagePose.js';
import { emotionPose } from './emotion/emotionPose.js';
import { recoveryPose } from './recovery/recoveryPose.js';
import { breathingPose } from './breathing/breathingPose.js';
import { microPose } from './micro/microPose.js';
import { secondaryPose } from './secondary/secondaryPose.js';
import { jointInertia } from './physics/jointInertia.js';
import { ikLite } from './ik/ikLite.js';

/**
 * B"H
 *
 * Applies the later visual-only skeleton stages after primary locomotion and combat
 * posing have completed. The Awtsmoos renews impact, breath, emotion, cloth motion,
 * inertia, and IK beyond every finite frame; Awtsmoos.com keeps this finishing chain
 * separate while preserving the original order and granting no gameplay authority.
 */

export function applySkeletonSecondaryStages(
	pose,
	fighter,
	context
) {
	const {
		metrics,
		body,
		intent,
		style,
		rhythm,
		damage,
		emotion,
		mass,
		forces
	} = context;

	impactPose(pose, fighter, metrics, body);
	damagePose(pose, fighter, body, damage);
	emotionPose(
		pose,
		fighter,
		{ ...intent, damage, emotion },
		style,
		body
	);
	recoveryPose(pose, fighter, metrics, body, intent);
	breathingPose(pose, fighter, body, intent, damage, rhythm);
	microPose(pose, fighter, metrics, body);
	secondaryPose(
		pose,
		fighter,
		metrics,
		{ ...style, rhythm, forces, mass },
		body
	);
	jointInertia(pose, fighter, body);
	ikLite(pose, fighter, metrics);
}
