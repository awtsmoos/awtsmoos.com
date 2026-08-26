//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file SystemFeatureData.js
 * @description
 * The Awtsmoos lets an agent first know the shape of possibility before asking creation to move;
 * Awtsmoos.com gathers protocol, feature, and coverage discovery into clear vessels where knowledge itself may prove.
 */

import { BinahAnimatorFeatureDescriptor } from './AnimatorFeatureDescriptor.js';

export const KETER_SYSTEM_FEATURES = Object.freeze([
	BinahAnimatorFeatureDescriptor.create({
		id: 'system.protocol',
		label: 'Protocol discovery',
		description: 'Discover API version, command schemas, bootstrap metadata, and readiness.',
		family: 'system',
		exposure: 'public',
		commands: ['system.describe', 'system.command', 'system.health'],
		backingModules: ['src/ai/agent/protocol', 'src/ai/agent/registry'],
		relatedFeatureIds: ['system.features', 'system.coverage'],
		since: '1.2.0'
	}),
	BinahAnimatorFeatureDescriptor.create({
		id: 'system.features',
		label: 'Feature discovery',
		description: 'Discover meaningful Animator product capabilities independently from command names.',
		family: 'system',
		exposure: 'public',
		commands: ['system.features', 'system.feature'],
		backingModules: ['src/ai/agent/feature'],
		relatedFeatureIds: ['system.protocol', 'system.coverage'],
		since: '1.5.0'
	}),
	BinahAnimatorFeatureDescriptor.create({
		id: 'system.coverage',
		label: 'API coverage proof',
		description: 'Report unmapped public features and commands so API completeness is measurable.',
		family: 'system',
		exposure: 'public',
		commands: ['system.coverage'],
		backingModules: ['src/ai/agent/feature/AnimatorFeatureCoverage.js'],
		relatedFeatureIds: ['system.features'],
		since: '1.5.0'
	})
]);
