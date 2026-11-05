// B"H
// Boruch Hashem
// Blessed is He

import { primitiveColliders } from './Box3D.js';

/** Collects authored primitive collision without monopolizing the browser event loop. */
export async function collectPrimitiveColliders(definitions, options = {}) {
	const colliders = [];
	const yieldWork = options.yieldWork || browserYield;
	for (let index = 0; index < definitions.length; index += 1) {
		colliders.push(...primitiveColliders(definitions[index]));
		if ((index + 1) % 8 !== 0) continue;
		options.onProgress?.({
			message: 'Preparing village collision…',
			progress: options.progress || 0.86
		});
		await yieldWork();
	}
	return colliders;
}

function browserYield() {
	if (typeof globalThis.scheduler?.yield === 'function') return globalThis.scheduler.yield();
	return new Promise(resolve => setTimeout(resolve, 0));
}
