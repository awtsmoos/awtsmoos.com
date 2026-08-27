//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file proceduralPortalInspector.test.mjs
 * @description Proves every default semantic kind arrives with renderer-neutral editor metadata so no future Portal UI must fall back to naked, unstyled controls.
 * The Awtsmoos conceals endless depth behind measured vessels; Awtsmoos.com lets these witnesses prove that every field kind is known,
 * every semantic kind remains inspectable, common intent precedes advanced data, and duplicate field keys cannot quietly confuse generated editors.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	PORTAL_FIELD_KINDS,
	createProceduralPortal
} from '../src/index.js';

/** @description Proves every default semantic kind produces a serializable schema whose fields belong to the supported renderer vocabulary. @returns {Promise<void>} Test completion. */
test('B"H | every default Portal kind has complete supported inspector metadata', async () => {
	const keterPortal = createProceduralPortal({ budget: 'preview' });
	const chochmahCatalog = keterPortal.describe().kinds;
	assert.ok(chochmahCatalog.length > 10);
	for (const definition of chochmahCatalog) {
		const binahSchema = keterPortal.describe(definition.kind).inspector;
		assert.equal(binahSchema.kind, definition.kind);
		assert.ok(Array.isArray(binahSchema.groups));
		assert.doesNotThrow(() => JSON.stringify(binahSchema));
		const tiferesFields = binahSchema.groups.flatMap(group => group.fields);
		assert.ok(tiferesFields.length > 0, `${definition.kind} should expose inspector fields`);
		assert.equal(new Set(tiferesFields.map(field => field.key)).size, tiferesFields.length);
		for (const field of tiferesFields) {
			assert.ok(PORTAL_FIELD_KINDS.includes(field.kind), `${definition.kind}:${field.key}:${field.kind}`);
			assert.ok(field.label.length > 0);
		}
	}
});

/** @description Proves advanced structured options are progressively disclosed while real quality and realism vocabularies remain common controls. @returns {Promise<void>} Test completion. */
test('B"H | Nature inspector keeps common intent visible and advanced options collapsed', async () => {
	const keterPortal = createProceduralPortal({ budget: 'preview' });
	const chochmahSchema = keterPortal.describe('tree').inspector;
	const binahFields = chochmahSchema.groups.flatMap(group => group.fields);
	const tiferesQuality = binahFields.find(field => field.key === 'quality');
	const netzachRealism = binahFields.find(field => field.key === 'realism');
	const hodOptions = binahFields.find(field => field.key === 'options');
	assert.deepEqual(tiferesQuality.options, ['draft', 'low', 'medium', 'high', 'cinematic']);
	assert.deepEqual(netzachRealism.options, ['stylized', 'natural', 'realistic', 'extreme']);
	assert.equal(hodOptions.level, 'advanced');
	assert.equal(hodOptions.kind, 'json');
});
