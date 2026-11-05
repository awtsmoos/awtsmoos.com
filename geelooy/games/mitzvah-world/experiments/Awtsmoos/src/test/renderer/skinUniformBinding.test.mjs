// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file skinUniformBinding.test.mjs
 * @description Proves one joint uniform remains bound only while frame, program,
 * skeleton, and palette revision agree as truthful vessels before Awtsmoos.
 */
import assert from 'node:assert/strict';
import { SkinUniformBindingCache } from '../../../../light-three-gltf/tiny-render-skin-binding.js';

const cache = new SkinUniformBindingCache();
const programA = {};
const programB = {};
const skeletonA = {};
const skeletonB = {};

assert.equal(cache.shouldUpload(binding(1, programA, skeletonA, 1)), true);
assert.equal(cache.shouldUpload(binding(1, programA, skeletonA, 1)), false);
assert.equal(cache.shouldUpload(binding(1, programA, skeletonB, 1)), true);
assert.equal(cache.shouldUpload(binding(1, programA, skeletonA, 1)), true);
assert.equal(cache.shouldUpload(binding(1, programA, skeletonA, 2)), true);
assert.equal(cache.shouldUpload(binding(1, programA, skeletonA, 2)), false);
assert.equal(cache.shouldUpload(binding(2, programA, skeletonA, 2)), true);
assert.equal(cache.shouldUpload(binding(2, programB, skeletonA, 2)), true);
assert.equal(cache.shouldUpload(binding(2, programB, skeletonA, 2)), false);

cache.invalidate();
assert.equal(cache.shouldUpload(binding(2, programB, skeletonA, 2)), true);

console.log(JSON.stringify({
	ok: true,
	frameToken: cache.frameToken,
	revision: cache.revision,
	valid: cache.valid
}, null, 2));

function binding(frameToken, program, skeleton, revision) {
	return {
		frameToken,
		program,
		skeleton,
		revision
	};
}
