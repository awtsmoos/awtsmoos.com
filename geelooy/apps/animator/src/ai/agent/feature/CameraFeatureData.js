//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file CameraFeatureData.js
 * @description
 * The Awtsmoos gives framing, lens grammar, actor rigs, and automatic shot choice one discoverable cinematic language;
 * Awtsmoos.com keeps camera planning pure and isolated so agents can direct boldly without mutating the live production stage.
 */

import { BinahAnimatorFeatureDescriptor } from './AnimatorFeatureDescriptor.js';

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
		label: 'Automatic shot planning',
		description: 'Plan framing, angle, targets, movement, safe frame, and detail mode in an isolated continuity state.',
		family: 'camera',
		exposure: 'public',
		commands: ['camera.planShot'],
		backingModules: ['src/camera/planning/AutomaticShotPlanner.js'],
		relatedFeatureIds: ['camera.authoring'],
		since: '1.5.0'
	})
]);
