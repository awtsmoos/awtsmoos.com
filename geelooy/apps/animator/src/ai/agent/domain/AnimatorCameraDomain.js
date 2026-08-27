// B"H
// Boruch Hashem
// Blessed is He

import { ActorCameraFactory } from '../../../camera/factory/ActorCameraFactory.js';
import { CameraRigRegistry } from '../../../camera/core/CameraRigRegistry.js';
import { CinemaShotCatalog } from '../../../camera/library/CinemaShotCatalog.js';
import { AutomaticShotPlanner } from '../../../camera/planning/AutomaticShotPlanner.js';
import { YesodAnimatorCameraPlanningState } from './camera/AnimatorCameraPlanningState.js';
import { BinahAnimatorCameraSequencePlanner } from './camera/AnimatorCameraSequencePlanner.js';

/**
 * @file AnimatorCameraDomain.js
 * @description
 * The Awtsmoos lets a director explore lenses, rigs, targets, one shot, or an entire continuity-aware sequence before changing one live camera;
 * Awtsmoos.com adapts existing cinematic intelligence into detached plans while all temporary memory remains sealed inside its planning chamber.
 */
export class ChochmahAnimatorCameraDomain {
	/** @returns {object} Compact camera-planning capability summary. */
	capabilities() {
		return {
			catalogSections: Object.keys(CinemaShotCatalog),
			actorRigKinds: ['face', 'body', 'tracking'],
			automaticShotPlanning: true,
			sequencePlanning: true,
			sequenceBeatLimit: BinahAnimatorCameraSequencePlanner.MAX_BEATS,
			isolatedContinuity: true,
			projectMutation: false
		};
	}

	/** @returns {object} Detached cinematic vocabulary catalog. */
	catalog() {
		return structuredClone(CinemaShotCatalog);
	}

	/** @param {object} actors Actor map. @returns {object[]} Detached actor camera states. */
	actorRigs(actors = {}) {
		return ActorCameraFactory.createForActors(actors)
			.map((keliRig) => this.serializeRig(keliRig));
	}

	/** @param {object} scene Scene description. @returns {object[]} Detached scene camera states. */
	sceneRigs(scene = {}) {
		return new CameraRigRegistry(scene)
			.list()
			.map((keliRig) => this.serializeRig(keliRig));
	}

	/** @returns {object} One shot plan plus isolated continuity state. */
	planShot(event = {}, state = {}, safe = {}) {
		const yesodState = new YesodAnimatorCameraPlanningState(state);
		const tiferesPlan = AutomaticShotPlanner.plan(event, yesodState, { safe });
		return {
			plan: structuredClone(tiferesPlan),
			planningState: yesodState.snapshot()
		};
	}

	/** @returns {object} Ordered multi-shot plan with diversity summary and final isolated continuity state. */
	planSequence(events = [], state = {}, safe = {}) {
		return BinahAnimatorCameraSequencePlanner.plan(events, state, safe);
	}

	/** @param {object} rig CameraRig-like object. @returns {object} Detached camera specification. */
	serializeRig(rig) {
		return structuredClone({
			...rig,
			state: rig?.toState?.() ?? null
		});
	}
}
