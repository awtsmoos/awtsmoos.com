//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file SceneFeatureData.js
 * @description
 * The Awtsmoos lets atmosphere, layered world, safe staging, and production backdrop become discoverable before project state must change;
 * Awtsmoos.com keeps scene composition detached and JSON-shaped so agents can explore visual worlds through one stable range.
 */

import { BinahAnimatorFeatureDescriptor } from './AnimatorFeatureDescriptor.js';

export const MALCHUS_SCENE_FEATURES = Object.freeze([
	BinahAnimatorFeatureDescriptor.create({
		id: 'scene.authoring',
		label: 'Scene and stage authoring',
		description: 'Discover scene styles, inspect presets, compose detached scene graphs, and resolve live stage safe areas.',
		family: 'scene',
		exposure: 'public',
		commands: [
			'scene.capabilities',
			'scene.preset',
			'scene.compose',
			'scene.safeArea'
		],
		backingModules: [
			'src/scene/core/SceneComposer.js',
			'src/scene/presets/CityParkDayPreset.js',
			'src/stage/StageSafeArea.js'
		],
		relatedFeatureIds: ['document.io', 'camera.planning'],
		since: '1.5.0'
	})
]);
