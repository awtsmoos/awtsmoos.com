//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file PerformanceFeatureData.js
 * @description
 * The Awtsmoos lets subtle feeling become discoverable before any pose or frame must change;
 * Awtsmoos.com names acting, recipes, blends, and compiled direction as clear powers whose data stays bounded and arranged.
 */

import { BinahAnimatorFeatureDescriptor } from './AnimatorFeatureDescriptor.js';

export const TIFERES_PERFORMANCE_FEATURES = Object.freeze([
	BinahAnimatorFeatureDescriptor.create({
		id: 'performance.discovery',
		label: 'Performance discovery',
		description: 'Discover semantic acting channels, expressions, motions, recipes, and composition limits.',
		family: 'performance',
		exposure: 'public',
		commands: ['performance.capabilities', 'performance.recipeSearch'],
		backingModules: ['src/ai/performance'],
		relatedFeatureIds: ['performance.recipes', 'performance.composition'],
		since: '1.2.0'
	}),
	BinahAnimatorFeatureDescriptor.create({
		id: 'performance.recipes',
		label: 'Reusable acting recipes',
		description: 'Resolve authored performance recipes into detached facial, gaze, and motion direction.',
		family: 'performance',
		exposure: 'public',
		commands: ['performance.recipe'],
		backingModules: ['src/ai/performance/PerformanceRecipeCatalog.js'],
		relatedFeatureIds: ['performance.discovery', 'performance.composition'],
		since: '1.2.0'
	}),
	BinahAnimatorFeatureDescriptor.create({
		id: 'performance.composition',
		label: 'Performance composition',
		description: 'Compile direction and blend semantic facial or body-motion layers into bounded channels.',
		family: 'performance',
		exposure: 'public',
		commands: ['performance.compile', 'performance.blendExpression', 'performance.blendMotion'],
		backingModules: ['src/ai/PerformancePromptCompiler.js', 'src/ai/performance'],
		relatedFeatureIds: ['performance.discovery', 'performance.recipes'],
		since: '1.2.0'
	})
]);
