// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MitzvahWorldCreatorWorldCodec.test.js
 * @description Proves the creator world codec stays strict against malformed
 * payloads, accepts every renderer-supported primitive shape the universe
 * composer emits, and preserves a saved universe exactly through a
 * save -> reopen round-trip.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { WORLD_FORMAT } from '../../../../../../libs/awtsmoos-procedural-core/src/core/universalApi/index.js';
import { MitzvahWorldCreatorDocument } from './MitzvahWorldCreatorDocument.js';
import { universePart } from './MitzvahWorldUniverseCatalog.js';
import { resolveUniverseShape } from './MitzvahWorldUniverseShapeResolver.js';
import {
	creatorWorldParts,
	parseCreatorWorld,
	validateCreatorWorld
} from './MitzvahWorldCreatorWorldCodec.js';

/** Builds one serialized world holding every composed shape the universe emits. */
async function universeWorldJson(partIds = ['oak-tree', 'timber-house', 'sukkah', 'chossid-npc', 'mission-beacon', 'stone-arch']) {
	const document = new MitzvahWorldCreatorDocument({ environment: {} });
	const definitions = [];
	for (const partId of partIds) {
		const part = universePart(partId);
		const defs = resolveUniverseShape(partId, {
			id: `codec-${partId}`,
			position: { x: 3, y: part.size.y / 2, z: -2 },
			rotation: { y: Math.PI / 6 }
		});
		for (const definition of defs) {
			await document.createPart(part, definition);
			definitions.push(definition);
		}
	}
	return { definitions, json: document.serialize() };
}

function mutateWorld(json, mutator) {
	const document = JSON.parse(json);
	mutator(document);
	return JSON.stringify(document);
}

function firstObjectId(json) {
	const document = JSON.parse(json);
	return Object.keys(document.resources.objects)[0];
}

test('save -> reopen round-trip preserves a universe exactly', async () => {
	const { definitions, json } = await universeWorldJson();
	assert.ok(definitions.length > 10, 'fixture must exercise many composed pieces');

	// Reopen through the same validation gate the live session uses.
	const reopened = new MitzvahWorldCreatorDocument({
		document: parseCreatorWorld(json),
		environment: {}
	});
	assert.equal(reopened.serialize(), json, 'serialized bytes must be byte-stable across reopen');

	const reopenedDefinitions = creatorWorldParts(parseCreatorWorld(json)).map(part => part.definition);
	assert.deepEqual(reopenedDefinitions, definitions);

	// And a remix keeps every definition while minting a fresh world identity.
	const remixed = new MitzvahWorldCreatorDocument({ environment: {} });
	const sourceId = JSON.parse(json).metadata.mitzvahWorldCreator.worldId;
	remixed.remix(JSON.parse(json));
	const remixedMeta = JSON.parse(remixed.serialize()).metadata.mitzvahWorldCreator;
	assert.equal(remixedMeta.remixOf, sourceId, 'remix must remember its source world');
	assert.ok(remixedMeta.worldId && remixedMeta.worldId !== sourceId, 'remix must mint a fresh world id');
	const remixedDefinitions = creatorWorldParts(parseCreatorWorld(remixed.serialize())).map(part => part.definition);
	assert.deepEqual(remixedDefinitions, definitions);
});

test('codec accepts every renderer-supported shape', async () => {
	const { json } = await universeWorldJson();
	const parts = creatorWorldParts(parseCreatorWorld(json));
	const shapes = new Set(parts.map(part => part.definition.shape));
	for (const expected of ['box', 'cylinder', 'sphere', 'triPrism', 'diamond', 'doorway']) {
		assert.ok(shapes.has(expected), `round-trip must carry shape ${expected}`);
	}
});

test('codec rejects non-world payloads', () => {
	assert.throws(() => validateCreatorWorld(null), /CREATOR_WORLD_OBJECT_REQUIRED/);
	assert.throws(() => validateCreatorWorld('nope'), /CREATOR_WORLD_OBJECT_REQUIRED/);
	assert.throws(() => validateCreatorWorld([]), /CREATOR_WORLD_OBJECT_REQUIRED/);
	assert.doesNotThrow(
		() => validateCreatorWorld({ format: WORLD_FORMAT, resources: {}, version: 1 }),
		'an empty but well-formed world is valid'
	);
});

test('codec rejects bad format, version, and missing resources', () => {
	assert.throws(
		() => validateCreatorWorld({ format: 'other.format', resources: {}, version: 1 }),
		/CREATOR_WORLD_FORMAT_UNSUPPORTED:other\.format/
	);
	assert.throws(
		() => validateCreatorWorld({ resources: {}, version: 1 }),
		/CREATOR_WORLD_FORMAT_UNSUPPORTED:missing/
	);
	assert.throws(
		() => validateCreatorWorld({ format: WORLD_FORMAT, resources: {}, version: 2 }),
		/CREATOR_WORLD_VERSION_UNSUPPORTED:2/
	);
	assert.throws(
		() => validateCreatorWorld({ format: WORLD_FORMAT, version: 1 }),
		/CREATOR_WORLD_RESOURCES_REQUIRED/
	);
});

test('codec rejects unknown catalog kinds', async () => {
	const { json } = await universeWorldJson(['timber-wall']);
	const id = firstObjectId(json);
	const bad = mutateWorld(json, document => {
		document.resources.objects[id].kind = 'no-such-part';
	});
	assert.throws(() => parseCreatorWorld(bad), /CREATOR_PART_UNKNOWN:no-such-part/);
});

test('codec rejects definition id mismatch and bad vectors', async () => {
	const { json } = await universeWorldJson(['timber-wall']);
	const id = firstObjectId(json);

	const mismatched = mutateWorld(json, document => {
		document.resources.objects[id].definition.id = 'different-id';
	});
	assert.throws(() => parseCreatorWorld(mismatched), new RegExp(`CREATOR_WORLD_PART_ID_MISMATCH:${id}`));

	const nonFinite = mutateWorld(json, document => {
		document.resources.objects[id].definition.position.x = Number.NaN;
	});
	assert.throws(() => parseCreatorWorld(nonFinite), new RegExp(`CREATOR_WORLD_VECTOR_INVALID:${id}:x`));

	const huge = mutateWorld(json, document => {
		document.resources.objects[id].definition.position.z = 2000000;
	});
	assert.throws(() => parseCreatorWorld(huge), new RegExp(`CREATOR_WORLD_COORDINATE_OUT_OF_RANGE:${id}:z`));

	const zeroSize = mutateWorld(json, document => {
		document.resources.objects[id].definition.size.y = 0;
	});
	assert.throws(() => parseCreatorWorld(zeroSize), new RegExp(`CREATOR_WORLD_SIZE_OUT_OF_RANGE:${id}:y`));

	const hugeSize = mutateWorld(json, document => {
		document.resources.objects[id].definition.size.x = 5000;
	});
	assert.throws(() => parseCreatorWorld(hugeSize), new RegExp(`CREATOR_WORLD_SIZE_OUT_OF_RANGE:${id}:x`));

	const badRotation = mutateWorld(json, document => {
		delete document.resources.objects[id].definition.rotation;
	});
	assert.throws(() => parseCreatorWorld(badRotation), new RegExp(`CREATOR_WORLD_ROTATION_INVALID:${id}`));
});

test('codec rejects unsupported shapes but names the offender', async () => {
	const { json } = await universeWorldJson(['timber-wall']);
	const id = firstObjectId(json);

	const torus = mutateWorld(json, document => {
		document.resources.objects[id].definition.shape = 'torus';
	});
	assert.throws(
		() => parseCreatorWorld(torus),
		new RegExp(`CREATOR_WORLD_SHAPE_UNSUPPORTED:${id}:torus`)
	);

	const missing = mutateWorld(json, document => {
		delete document.resources.objects[id].definition.shape;
	});
	assert.throws(
		() => parseCreatorWorld(missing),
		new RegExp(`CREATOR_WORLD_SHAPE_UNSUPPORTED:${id}:missing`)
	);
});

test('codec only surfaces builder-part resources', async () => {
	const { json } = await universeWorldJson(['timber-wall']);
	const withExtra = mutateWorld(json, document => {
		document.resources.objects['not-a-part'] = {
			id: 'not-a-part',
			type: 'something.else',
			definition: { id: 'not-a-part' },
			kind: 'timber-wall'
		};
	});
	const parts = creatorWorldParts(parseCreatorWorld(withExtra));
	assert.ok(parts.every(part => part.definition.id !== 'not-a-part'));
	assert.ok(parts.length >= 1);
});
