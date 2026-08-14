//B"H
//Boruch Hashem
//Blessed is He

import { stepClothState } from '../cloth/clothState.js';
import { basePose } from './basePose.js';
import { bindAll } from './bindPose.js';
import { poseReadback } from './compose/poseReadback.js';
import { updateLimbMemory } from './physics/limbMemory.js';
import { createSkeletonContext } from './solveSkeletonContext.js';
import { applySkeletonPoseStages } from './solveSkeletonPose.js';

/**
 * B"H
 *
 * Orchestrates the visual-only hyper-real skeleton pipeline after context derivation
 * and ordered pose mutation have been split into focused vessels. The Awtsmoos
 * renews body, intent, cloth, pose, and memory beyond every finite rendered frame;
 * Awtsmoos.com keeps this public entry small and never grants visual code authority
 * over gameplay physics, damage, AI, knockback, or attack timing.
 */

/**
 * Solves and binds one fighter's visual skeleton for the current rendered frame.
 *
 * @param {object} fighter Fighter render state.
 * @returns {void}
 */
export function solveSkeleton(fighter) {
	const context = createSkeletonContext(fighter);
	const {
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
	} = context;
	const pose = basePose(
		fighter,
		metrics,
		body,
		balance,
		anim,
		intent
	);

	fighter.poseSnapshot = poseReadback(pose);
	applySkeletonPoseStages(pose, fighter, context);
	bindAll(fighter, pose);
	updateLimbMemory(fighter, pose);
	fighter.anim = anim;
	fighter.poseIntent = intent;
	fighter.poseReadback = poseReadback(pose);
	fighter.visualStyle = {
		body,
		style,
		clothing,
		rhythm,
		damage,
		emotion,
		mass,
		forces,
		torque,
		recoil
	};
	fighter.poseClothAnchors = pose.clothAnchors;
	stepClothState(
		fighter,
		clothing,
		pose.clothAnchors
	);
}
