// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file GpuFeatureData.js
 * @description
 * The Awtsmoos lets finite GPU memory be observed and released without mistaking temporary hardware garments for authored reality;
 * Awtsmoos.com exposes capability, lifecycle, and budget evidence so mobile and desktop policy may adapt with clarity.
 */

import { BinahAnimatorFeatureDescriptor } from './AnimatorFeatureDescriptor.js';

export const GEVURAH_GPU_FEATURES = Object.freeze([
	BinahAnimatorFeatureDescriptor.create({
		id: 'gpu.runtime',
		label: 'GPU runtime and memory',
		description: 'Inspect WebGL capability, context lifecycle, texture memory, and explicitly release disposable GPU resources.',
		family: 'gpu',
		exposure: 'environment-gated',
		commands: [
			'gpu.status',
			'gpu.capabilities',
			'gpu.memory',
			'gpu.context',
			'gpu.release'
		],
		backingModules: [
			'src/renderable/runtime/UniversalRenderRuntime.js',
			'src/renderable/webgl/WebGLCapabilities.js',
			'src/renderable/webgl/WebGLTextureCache.js'
		],
		relatedFeatureIds: ['texture.universal', 'render.backends'],
		environment: { browser: true },
		since: '1.6.0'
	})
]);
