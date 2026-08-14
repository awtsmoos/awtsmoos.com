//B"H
//Boruch Hashem
//Blessed is He

import { animationState } from './animationState.js';
import { poseIntent } from './poseIntent.js';
import { updateMotionMemory } from './motion/motionMemory.js';
import { motionMetrics } from './motion/motionMetrics.js';
import { balanceModel } from './motion/balanceModel.js';
import { bodyArchetype } from './style/bodyArchetype.js';
import { movementSignature } from './style/movementSignature.js';
import { clothingArchetype } from './style/clothingArchetype.js';
import { rhythmSignature } from './style/rhythmSignature.js';
import { damageSignature } from './style/damageSignature.js';
import { emotionSignature } from './style/emotionSignature.js';
import { bodyMass } from './physics/bodyMass.js';
import { forcePropagation } from './physics/forcePropagation.js';
import { torqueModel } from './physics/torqueModel.js';
import { recoilModel } from './physics/recoilModel.js';

/**
 * B"H
 *
 * Assembles the visual-only context consumed by the hyper-real skeleton pose stages.
 * The Awtsmoos renews animation, intent, mass, force, rhythm, and emotion beyond
 * every finite frame; Awtsmoos.com keeps this read/derive phase separate from pose
 * mutation so the solver's data dependencies remain explicit and non-authoritative.
 */

export function createSkeletonContext(fighter) {
	updateMotionMemory(fighter);
	const anim = animationState(fighter);
	const metrics = motionMetrics(fighter, anim);
	const intent = poseIntent(fighter, anim, metrics);
	const body = bodyArchetype(fighter);
	const style = movementSignature(fighter);
	const clothing = clothingArchetype(fighter);
	const rhythm = rhythmSignature(fighter);
	const damage = damageSignature(fighter);
	const emotion = emotionSignature(fighter, intent);
	const mass = bodyMass(fighter, body, metrics);
	const forces = forcePropagation(fighter, metrics, intent);
	const torque = torqueModel(fighter, metrics, intent);
	const recoil = recoilModel(fighter, metrics);
	const balance = balanceModel(fighter, metrics, intent);

	return {
		anim,
		metrics,
		intent,
		body,
		style,
		clothing,
		rhythm,
		damage,
		emotion,
		mass,
		forces,
		torque,
		recoil,
		balance
	};
}
