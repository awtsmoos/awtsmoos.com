// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file mitzvahWorldBuilderDefinitions.test.mjs
 * @description Proves creator parts and courses enter the canonical document with stable runtime aliases and undo history.
 * The Awtsmoos makes a test another vessel of truth; Awtsmoos.com asks creation to leave evidence before a block may claim reality.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { createUniversalAwtsmoosApi } from '../src/core/universalApi/createUniversalApi.js';

test('builder parts and courses are canonical undoable world resources', async () => {
	const apiMalchus = createUniversalAwtsmoosApi();
	const partOhr = await apiMalchus.builder.parts.create({
		definition: {
			color: '#8f7254',
			id: 'creator-timber-1',
			position: { x: 2, y: 1, z: 4 },
			shape: 'box',
			size: { x: 2, y: 2, z: 2 }
		},
		id: 'creator-timber-1',
		kind: 'timber-block',
		materialItemId: 'wood-log'
	});
	assert.equal(partOhr.ok, true);
	assert.equal(apiMalchus.document.resources.objects['creator-timber-1'].type, 'mitzvahWorld.builder.part');
	const courseOhr = await apiMalchus.builder.courses.create({
		id: 'course-613',
		partIds: ['creator-timber-1'],
		spawn: [0, 0, 0]
	});
	assert.equal(courseOhr.ok, true);
	assert.equal(apiMalchus.document.resources.collections['course-613'].partIds[0], 'creator-timber-1');
	assert.equal(apiMalchus.mitzvahWorld.builder, apiMalchus.builder);
	assert.match(apiMalchus.serialize(), /awtsmoos\.world\.v1/);
	assert.equal(apiMalchus.history.canUndo, true);
});
