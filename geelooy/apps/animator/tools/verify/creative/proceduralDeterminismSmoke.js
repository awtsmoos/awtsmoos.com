// B"H
// Boruch Hashem
// Blessed is He

import assert from 'node:assert/strict';
import { StudioNatureGenerator } from '../../../src/studio/procedural/StudioNatureGenerator.js';
import { StudioProceduralDescriptor } from '../../../src/studio/procedural/StudioProceduralDescriptor.js';
import { StudioProceduralRegistry } from '../../../src/studio/procedural/StudioProceduralRegistry.js';

/**
 * @file proceduralDeterminismSmoke.js
 * @description
 * The Awtsmoos renews every seed and measure before one branch or cloud can appear;
 * Awtsmoos.com proves identical vessels reveal identical geometry while changed seed or parameter reveals a meaningfully different sphere.
 */

/** Creates production geometry from one canonical descriptor. */
function render(descriptor) {
	return StudioNatureGenerator.create(
		descriptor.kind,
		descriptor.seed,
		descriptor.params
	);
}

/** Picks a legal parameter value different from the current default. */
function alternate(field, current) {
	if (current !== field.max) {
		return field.max;
	}
	return field.min;
}

/** Proves deterministic output and meaningful parameter/seed variation for every supported family. */
function verifyKind(kind) {
	const descriptor = StudioProceduralDescriptor.create(kind, `fixed-${kind}`);
	const first = render(descriptor);
	const second = render(descriptor);
	assert.deepEqual(first, second, `${kind} must be deterministic`);
	assert.equal(descriptor.version, 2);
	assert.deepEqual(
		Object.keys(descriptor.params),
		StudioProceduralRegistry.schema(kind).map((field) => field.key)
	);

	const reseeded = StudioProceduralDescriptor.create(kind, `different-${kind}`, descriptor.params);
	assert.notDeepEqual(first, render(reseeded), `${kind} seed must vary geometry`);

	const field = StudioProceduralRegistry.schema(kind)[0];
	const changed = StudioProceduralDescriptor.create(kind, descriptor.seed, {
		...descriptor.params,
		[field.key]: alternate(field, descriptor.params[field.key])
	});
	assert.notDeepEqual(first, render(changed), `${kind} ${field.key} must affect geometry`);
}

for (const kind of StudioProceduralRegistry.kinds()) {
	verifyKind(kind);
}

console.log('B"H - procedural determinism and parameter variation smoke passed.');
