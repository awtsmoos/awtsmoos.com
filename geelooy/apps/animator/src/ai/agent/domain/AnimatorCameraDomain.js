//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file AnimatorCameraDomain.js
 * @description
 * The Awtsmoos lets a director explore lenses, rigs, targets, and automatic framing before changing one live camera;
 * Awtsmoos.com adapts existing cinematic intelligence into detached plans while continuity memory remains sealed inside its own drama.
 */

import { ActorCameraFactory } from '../../../camera/factory/ActorCameraFactory.js';
import { CinemaShotCatalog } from '../../../camera/library/CinemaShotCatalog.js';
import { AutomaticShotPlanner } from '../../../camera/planning/AutomaticShotPlanner.js';
import { CameraRigRegistry } from '../../../camera/core/CameraRigRegistry.js';
import { YesodAnimatorCameraPlanningState } from './camera/AnimatorCameraPlanningState.js';

/** Adapts stable camera grammar, rig factories, and automatic planning into pure Agent API results. */
export class ChochmahAnimatorCameraDomain {
	/** @returns {object} Compact camera-planning capability summary. */
	capabilities() {
		return {
			catalogSections: Object.keys(CinemaShotCatalog),
			actorRigKinds: ['face', 'body', 'tracking'],
			automaticShotPlanning: true,
			isolatedContinuity: true,
			projectMutation: false
		};
	}

	/** @returns {object} Detached cinematic vocabulary catalog. */
	catalog() {
		return structuredClone(CinemaShotCatalog);
	}

	/** @param {object} olamActors Actor map. @returns {object[]} Detached actor camera states. */
	actorRigs(olamActors = {}) {
		return ActorCameraFactory.createForActors(olamActors)
			.map((keliRig) => this.serializeRig(keliRig));
	}

	/** @param {object} keliScene Scene description. @returns {object[]} Detached scene camera states. */
	sceneRigs(keliScene = {}) {
		return new CameraRigRegistry(keliScene)
			.list()
			.map((keliRig) => this.serializeRig(keliRig));
	}

	/** @param {object} keliEvent Beat/shot event. @param {object} olamState Detached planning state. @param {object} keliSafe Safe-frame options. @returns {object} Plan plus isolated continuity state. */
	planShot(keliEvent = {}, olamState = {}, keliSafe = {}) {
		const yesodState = new YesodAnimatorCameraPlanningState(olamState);
		const keliPlan = AutomaticShotPlanner.plan(
			keliEvent,
			yesodState,
			{ safe: keliSafe }
		);
		return {
			plan: structuredClone(keliPlan),
			planningState: yesodState.snapshot()
		};
	}

	/** @param {object} keliRig CameraRig-like object. @returns {object} Detached camera specification. */
	serializeRig(keliRig) {
		return structuredClone({
			...keliRig,
			state: keliRig?.toState?.() ?? null
		});
	}
}
