//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file ProjectFeatureData.js
 * @description
 * The Awtsmoos lets a whole cartoon project be inspected, imagined, committed, and planned through distinct gates;
 * Awtsmoos.com keeps preview, mutation, and animation planning separately named so agents can move with power without confusing states.
 */

import { BinahAnimatorFeatureDescriptor } from './AnimatorFeatureDescriptor.js';

export const MALCHUS_PROJECT_FEATURES = Object.freeze([
	BinahAnimatorFeatureDescriptor.create({
		id: 'project.inspect',
		label: 'Project inspection',
		description: 'Inspect the active animation project without changing editor or document state.',
		family: 'project',
		exposure: 'public',
		commands: ['project.snapshot'],
		backingModules: ['src/ai/agent/execution/AnimatorProjectCommands.js'],
		relatedFeatureIds: ['project.prompt-generation'],
		since: '1.2.0'
	}),
	BinahAnimatorFeatureDescriptor.create({
		id: 'project.prompt-generation',
		label: 'Prompt-driven project generation',
		description: 'Preview, apply, or discard generated Studio documents from natural-language direction.',
		family: 'project',
		exposure: 'public',
		commands: ['project.previewPrompt', 'project.applyPreview', 'project.discardPreview'],
		backingModules: ['src/ai/studio/ai/StudioPromptWorkflow.js'],
		relatedFeatureIds: ['project.inspect', 'animation.pass-planning'],
		since: '1.2.0'
	}),
	BinahAnimatorFeatureDescriptor.create({
		id: 'animation.pass-planning',
		label: 'Professional animation pass planning',
		description: 'Expand beat timing into anticipation, action, settle, and refinement passes.',
		family: 'animation',
		exposure: 'public',
		commands: ['animation.planPasses'],
		backingModules: ['src/ai/studio/AnimationPassEngine.js'],
		relatedFeatureIds: ['project.prompt-generation'],
		since: '1.2.0'
	})
]);
