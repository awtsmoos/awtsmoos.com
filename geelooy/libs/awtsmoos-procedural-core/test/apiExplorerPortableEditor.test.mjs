//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file apiExplorerPortableEditor.test.mjs
 * @description Proves schema-assisted Explorer editing is reversible, preserves unfamiliar expert keys, coerces primitive values strictly, and derives metadata/style href facts without a DOM dependency.
 * The Awtsmoos renews simple control and expert JSON before either can claim the whole request alone;
 * Awtsmoos.com lets these pure proofs show one visible field may change while every hidden advanced key remains known.
 */
import assert from 'node:assert/strict';
import {
	coerceApiExplorerSimpleValue,
	parseApiExplorerEditorObject
} from '../src/core/universalApi/ui/ApiExplorerEditorValue.js';
import {
	removeApiExplorerEditorProperty,
	updateApiExplorerEditorProperty
} from '../src/core/universalApi/ui/ApiExplorerEditorPatch.js';
import { createApiExplorerMethodMeta } from '../src/core/universalApi/ui/ApiExplorerMethodMeta.js';
import { createApiExplorerSimpleSchema } from '../src/core/universalApi/ui/ApiExplorerSimpleSchema.js';
import { resolveApiExplorerStyleHref } from '../src/core/universalApi/ui/ApiExplorerStyleHref.js';

const schema = createApiExplorerSimpleSchema({
	properties: {
		advanced: { type: 'object' },
		enabled: { type: 'boolean' },
		mode: { enum: ['calm', 'exact'], type: 'string' },
		quality: { type: 'number' }
	},
	required: ['enabled']
});
assert.deepEqual(schema.fields.map((field) => field.key), ['enabled', 'mode', 'quality']);
assert.deepEqual(schema.unsupportedKeys, ['advanced']);
assert.equal(schema.fields[0].required, true);
assert.equal(schema.fields[1].control, 'select');

const originalText = JSON.stringify({
	advanced: { secretPressureKernel: [3, 1, 4] },
	enabled: true,
	unknownFutureOption: { exact: 0.913 }
});
const updatedText = updateApiExplorerEditorProperty(originalText, 'enabled', false);
const updated = parseApiExplorerEditorObject(updatedText);
assert.deepEqual(updated.advanced.secretPressureKernel, [3, 1, 4]);
assert.deepEqual(updated.unknownFutureOption, { exact: 0.913 });
assert.equal(updated.enabled, false);
const cleared = parseApiExplorerEditorObject(removeApiExplorerEditorProperty(updatedText, 'enabled'));
assert.equal(Object.hasOwn(cleared, 'enabled'), false);
assert.deepEqual(cleared.unknownFutureOption, { exact: 0.913 });

assert.equal(coerceApiExplorerSimpleValue({ key: 'count', type: 'integer' }, '17'), 17);
assert.equal(coerceApiExplorerSimpleValue({ key: 'ratio', type: 'number' }, '0.5'), 0.5);
assert.equal(coerceApiExplorerSimpleValue({ key: 'flag', type: 'boolean' }, false), false);
assert.throws(() => coerceApiExplorerSimpleValue({ key: 'count', type: 'integer' }, '1.5'), /integer/);

const badges = createApiExplorerMethodMeta({
	cost: 'low',
	examples: [{ quality: 'high' }, { quality: 'low' }],
	jsonProjection: 'portable',
	legacySurface: 'reality.oldThing',
	paramsSchema: { properties: { quality: { type: 'string' }, seed: { type: 'number' } } },
	stability: 'stable'
});
assert(badges.some((badge) => badge.kind === 'schema' && badge.value === '2'));
assert(badges.some((badge) => badge.kind === 'examples' && badge.value === '2'));
assert(badges.some((badge) => badge.kind === 'legacy'));

const resolved = resolveApiExplorerStyleHref({ baseURI: 'https://example.test/tools/' }, './custom.css');
assert.equal(resolved, 'https://example.test/tools/custom.css');
assert.throws(() => resolveApiExplorerStyleHref({ baseURI: 'https://example.test/' }, '   '), /cannot be empty/);

console.log('B"H Explorer portable editor and metadata laws verified.');
