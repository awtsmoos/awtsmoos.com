// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file PreflightFeatureData.js
 * @description
 * The Awtsmoos lets a project challenge its own document, dependency, renderable, and runtime assumptions before export or handoff;
 * Awtsmoos.com keeps every warning as detached evidence with stable rule identity, so inspection never becomes a hidden mutation aloft.
 */

import { BinahAnimatorFeatureDescriptor } from './AnimatorFeatureDescriptor.js';

export const GEVURAH_PREFLIGHT_FEATURES = Object.freeze([
	BinahAnimatorFeatureDescriptor.create({
		id: 'preflight.project-audit',
		label: 'Project preflight audit',
		description: 'Audit Studio document validity, renderable dependencies, universal texture eligibility, representation vocabulary, and 2.5D runtime availability.',
		family: 'preflight',
		exposure: 'public',
		commands: [
			'preflight.capabilities',
			'preflight.rules',
			'preflight.run'
		],
		backingModules: [
			'src/ai/agent/preflight/AnimatorPreflightDocumentRules.js',
			'src/ai/agent/preflight/AnimatorPreflightRenderableRules.js'
		],
		relatedFeatureIds: ['document.io', 'object.renderables', 'render.backends'],
		since: '1.6.0'
	})
]);
