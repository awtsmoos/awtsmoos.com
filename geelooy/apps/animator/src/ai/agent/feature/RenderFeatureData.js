// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file RenderFeatureData.js
 * @description
 * The Awtsmoos lets Canvas, texture, atlas, plane, target, effect, and future backend remain different garments of one authored form;
 * Awtsmoos.com exposes render meaning as stable data so backend availability may change without changing what a project may become.
 */

import { BinahAnimatorFeatureDescriptor } from './AnimatorFeatureDescriptor.js';

export const TIFERES_RENDER_FEATURES = Object.freeze([
	BinahAnimatorFeatureDescriptor.create({
		id: 'render.backends',
		label: 'Render backends and representations',
		description: 'Discover Canvas, WebGL, future WebGPU readiness, and durable representation kinds without exposing runtime handles.',
		family: 'render',
		exposure: 'public',
		commands: [
			'render.backends',
			'render.representations'
		],
		backingModules: [
			'src/renderable/schema/RepresentationSchemaData.js',
			'src/renderable/runtime/UniversalRenderRuntime.js'
		],
		relatedFeatureIds: ['object.renderables', 'texture.universal', 'gpu.runtime'],
		since: '1.6.0'
	}),
	BinahAnimatorFeatureDescriptor.create({
		id: 'render.graphs',
		label: 'Render graphs and effects',
		description: 'Discover non-destructive effect recipes, render-graph schema, and build pure JSON render plans.',
		family: 'render',
		exposure: 'public',
		commands: [
			'render.effects',
			'render.effect',
			'render.graphSchema',
			'render.plan'
		],
		backingModules: [
			'src/renderable/graph/EffectRecipeCatalog.js',
			'src/renderable/graph/RenderGraphSchemaData.js'
		],
		relatedFeatureIds: ['render.backends', 'texture.universal'],
		since: '1.6.0'
	})
]);
