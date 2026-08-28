// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file GpuCommandSchemas.js
 * @description
 * The Awtsmoos lets agents inspect finite GPU conditions without touching private WebGL handles, then release resources only by explicit deed;
 * Awtsmoos.com marks status as read-only and release as transient so hardware state never masquerades as project mutation need.
 */

import { BinahAnimatorCommandDescriptor } from '../registry/AnimatorCommandDescriptor.js';
import { BinahAnimatorSchemaTypes as S } from './AnimatorSchemaTypes.js';

const OBJECT = S.object();

function gpuRead(keliInput) {
	return BinahAnimatorCommandDescriptor.create({
		family: 'gpu',
		features: ['gpu.runtime'],
		mutation: false,
		mutationScope: 'none',
		idempotent: true,
		risk: 'read',
		environment: { browser: true, animatorRuntime: true },
		since: '1.6.0',
		payloadSchema: OBJECT,
		resultSchema: OBJECT,
		...keliInput
	});
}

export const GEVURAH_GPU_COMMANDS = Object.freeze([
	gpuRead({
		name: 'gpu.status',
		description: 'Inspect the complete JSON-safe GPU runtime status.',
		example: { command: 'gpu.status', payload: {} }
	}),
	gpuRead({
		name: 'gpu.capabilities',
		description: 'Inspect WebGL version, texture limits, extensions, OffscreenCanvas, ImageBitmap, and future WebGPU readiness.',
		example: { command: 'gpu.capabilities', payload: {} }
	}),
	gpuRead({
		name: 'gpu.memory',
		description: 'Inspect approximate cached texture bytes, budget, utilization, entries, and pin count.',
		example: { command: 'gpu.memory', payload: {} }
	}),
	gpuRead({
		name: 'gpu.context',
		description: 'Inspect context-loss state and lazy recovery policy.',
		example: { command: 'gpu.context', payload: {} }
	}),
	BinahAnimatorCommandDescriptor.create({
		name: 'gpu.release',
		family: 'gpu',
		features: ['gpu.runtime'],
		mutation: false,
		mutationScope: 'runtime',
		idempotent: true,
		risk: 'transient',
		environment: { browser: true, animatorRuntime: true },
		since: '1.6.0',
		payloadSchema: OBJECT,
		resultSchema: OBJECT,
		description: 'Release disposable cached GPU resources while leaving every durable representation recipe unchanged.',
		example: { command: 'gpu.release', payload: {} }
	})
]);
