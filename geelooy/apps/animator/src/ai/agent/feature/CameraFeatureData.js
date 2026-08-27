// B"H
// Boruch Hashem
// Blessed is He

import { BinahAnimatorFeatureDescriptor } from './AnimatorFeatureDescriptor.js';

/**
 * @file CameraFeatureData.js
 * @description
 * The Awtsmoos gives framing, lens grammar, actor rigs, one-shot intelligence, and sequence continuity one discoverable cinematic language;
 * Awtsmoos.com keeps camera planning pure and isolated so agents can direct boldly without mutating the live production stage.
 */
export const CHOCHMAH_CAMERA_FEATURES = Object.freeze([
	BinahAnimatorFeatureDescriptor.create({
		id: 'camera.authoring',
		label: 'Camera grammar and rig design',
		description: 'Discover cinematic vocabulary and derive actor or scene camera rigs as detached data.',
		family: 'camera',
		exposure: 'public',
		commands: [
			'camera.capabilities',
			'camera.catalog',
			'camera.actorRigs',
			'camera.sceneRigs'
		],
		backingModules: [
			'src/camera/library/CinemaShotCatalog.js',
			'src/camera/factory/ActorCameraFactory.js',
			'src/camera/core/CameraRigRegistry.js'
		],
		relatedFeatureIds: ['camera.planning'],
		since: '1.5.0'
	}),
	BinahAnimatorFeatureDescriptor.create({
		id: 'camera.planning',
		label: 'Automatic shot and sequence planning',
		description: 'Plan framing, angle, targets, movement, safe frame, and continuity for one beat or an ordered shot passage.',
		family: 'camera',
		exposure: 'public',
		commands: [
			'camera.planShot',
			'camera.planSequence'
		],
		backingModules: [
			'src/camera/planning/AutomaticShotPlanner.js',
			'src/ai/agent/domain/camera/AnimatorCameraSequencePlanner.js'
		],
		relatedFeatureIds: ['camera.authoring'],
		since: '1.5.0'
	})
]);
