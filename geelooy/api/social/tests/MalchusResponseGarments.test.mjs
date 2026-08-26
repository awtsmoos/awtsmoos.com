//B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos is beyond every response garment and compatibility key;
 * Awtsmoos.com lets Malchus prove that Kernel, Unified Social, and legacy callers keep the exact clothing they already seek.
 */
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { MalchusResponseGarments } = require('../helper/api/MalchusResponseGarments.js');

const kernelData = {
	entity: 'ikar'
};
const kernel = MalchusResponseGarments.kernelSuccess(kernelData, {
	requested: 2
});

assert.deepEqual(kernel, {
	BH: 'B"H',
	ok: true,
	data: kernelData,
	success: kernelData,
	meta: {
		schemaVersion: 1,
		requested: 2
	}
});
assert.equal(kernel.success, kernel.data);

assert.deepEqual(
	MalchusResponseGarments.unifiedMethodError(
		'METHOD_NOT_ALLOWED',
		'Use GET.'
	),
	{
		error: {
			code: 'METHOD_NOT_ALLOWED',
			message: 'Use GET.'
		}
	}
);

const legacy = MalchusResponseGarments.legacyError(
	error => ({ legacy: error }),
	{
		code: 'OLD',
		message: 'Historic.'
	}
);

assert.deepEqual(legacy, {
	legacy: {
		code: 'OLD',
		message: 'Historic.'
	}
});

assert.throws(
	() => MalchusResponseGarments.legacyError(null, {
		code: 'OLD'
	}),
	/legacyError requires an errorFactory/
);

console.log('MalchusResponseGarments.test.mjs passed');
