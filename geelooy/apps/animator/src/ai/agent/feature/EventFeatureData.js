// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file EventFeatureData.js
 * @description
 * The Awtsmoos lets real Animator changes become discoverable event contracts while JavaScript listeners remain temporary runtime guests;
 * Awtsmoos.com keeps event definitions as data and subscriptions as explicit JS, so remote schemas and local browser code share one honest crest.
 */

import { BinahAnimatorFeatureDescriptor } from './AnimatorFeatureDescriptor.js';

export const HOD_EVENT_FEATURES = Object.freeze([
	BinahAnimatorFeatureDescriptor.create({
		id: 'event.subscriptions',
		label: 'Discoverable Animator events',
		description: 'Discover real store-backed event contracts and subscribe through the JavaScript facade without persisting listeners.',
		family: 'event',
		exposure: 'public',
		commands: [
			'event.list',
			'event.get'
		],
		backingModules: [
			'src/ai/agent/event/AnimatorEventRegistry.js',
			'src/ai/agent/event/AnimatorEventHub.js'
		],
		relatedFeatureIds: ['schema.authoring', 'project.snapshot'],
		since: '1.6.0'
	})
]);
