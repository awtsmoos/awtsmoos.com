// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file ObjectFeatureData.js
 * @description
 * The Awtsmoos lets every authored drawable keep one identity while traits and render representations reveal its many possible garments;
 * Awtsmoos.com makes object discovery and representation editing canonical so Canvas and GPU never invent competing departments.
 */

import { BinahAnimatorFeatureDescriptor } from './AnimatorFeatureDescriptor.js';

export const KETER_OBJECT_FEATURES = Object.freeze([
	BinahAnimatorFeatureDescriptor.create({
		id: 'object.renderables',
		label: 'Universal renderable objects',
		description: 'Query canonical Studio drawables and manage traits, dependencies, and durable render representations.',
		family: 'object',
		exposure: 'public',
		commands: [
			'object.capabilities',
			'object.list',
			'object.get',
			'object.query',
			'object.dependencies',
			'object.dependents',
			'object.setRenderable',
			'object.setRepresentation',
			'object.setTraits'
		],
		backingModules: [
			'src/renderable/model/RenderableDescriptor.js',
			'src/renderable/model/RenderableTraits.js',
			'src/studio/document/StudioDocumentCodec.js'
		],
		relatedFeatureIds: ['texture.universal', 'render.backends'],
		since: '1.6.0'
	})
]);
