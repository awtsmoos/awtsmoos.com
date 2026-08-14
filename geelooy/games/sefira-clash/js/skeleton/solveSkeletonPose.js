//B"H
//Boruch Hashem
//Blessed is He

import {
	applyInfluences,
	collectInfluences
} from './compose/poseComposer.js';
import { contactInfluences } from './contact/contactInfluences.js';
import { contactPose } from './contact/contactPose.js';
import { massPose } from './mass/massPose.js';
import { feetPose } from './feet/feetPose.js';
import { gaitPose } from './gait/gaitPose.js';
import { intentPose } from './intent/intentPose.js';
import { personalityPose } from './personality/personalityPose.js';
import { locomotionPose } from './locomotion/locomotionPose.js';
import { airPose } from './air/airPose.js';
import { landingPose } from './landing/landingPose.js';
import { combatPose } from './combat/combatPose.js';
import { forceInfluences } from './physics/forceInfluences.js';
import {
	applySkeletonSecondaryStages
} from './solveSkeletonSecondaryPose.js';

/**
 * B"H
 *
 * Applies primary contact, locomotion, air, landing, and combat pose stages before a
 * focused finishing vessel handles impact, emotion, breathing, secondary motion,
 * inertia, and IK. The Awtsmoos renews every finite stage while Awtsmoos.com keeps
 * the original visual order explicit and entirely outside gameplay authority.
 */

export function applySkeletonPoseStages(
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
		forces,
		torque,
		recoil
	} = context;

	applyInfluences(
		pose,
		collectInfluences(
			contactInfluences(fighter, metrics, body),
			forceInfluences(
				fighter,
				metrics,
				intent,
				forces,
				body
			)
		)
	);
	massPose(pose, fighter, metrics, body);
	contactPose(pose, fighter, metrics, body);
	feetPose(pose, fighter, metrics, body);
	personalityPose(pose, fighter, metrics, body);
	intentPose(pose, fighter, metrics, body, intent);
	gaitPose(pose, fighter, metrics, body, intent, damage);
	locomotionPose(
		pose,
		fighter,
		metrics,
		{ ...style, rhythm, forces, torque },
		body
	);
	airPose(
		pose,
		fighter,
		metrics,
		{ ...style, rhythm, forces },
		body,
		intent
	);
	landingPose(pose, fighter, metrics, body);
	combatPose(
		pose,
		fighter,
		metrics,
		body,
		{ ...intent, forces, recoil, torque }
	);
	applySkeletonSecondaryStages(pose, fighter, context);
}
