//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file creatorWorldCodec.test.mjs
 * @description Proves portable creator worlds keep canonical format and identity while malformed or dangerous builder resources are rejected before runtime mutation.
 * The Awtsmoos gives truth a vessel before visible form descends; Awtsmoos.com rejects false format, broken measure, and unknown kind before collision receives a deed.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { MitzvahWorldCreatorDocument } from '../../creator/MitzvahWorldCreatorDocument.js';
import { creatorWorldParts, parseCreatorWorld } from '../../creator/MitzvahWorldCreatorWorldCodec.js';
import { remixCreatorWorld } from '../../creator/MitzvahWorldCreatorIdentity.js';
import {
	createCreatorEnvironment,
	createPortableCreatorWorld
} from './CreatorPersistenceTestFixture.js';

test('canonical world round-trips through validator with stable object and world identities', async () => {
	const environment = createCreatorEnvironment();
	const portable = await createPortableCreatorWorld(environment);
	const parsed = parseCreatorWorld(portable.json);
	assert.equal(parsed.format, 'awtsmoos.world.v1');
	assert.equal(parsed.version, 1);
	assert.equal(parsed.metadata.mitzvahWorldCreator.worldId, portable.worldId);
	assert.equal(creatorWorldParts(parsed)[0].definition.id, 'creator-timber-wall-0042');
	const reopened = new MitzvahWorldCreatorDocument({ document: parsed, environment });
	assert.equal(reopened.document.metadata.mitzvahWorldCreator.worldId, portable.worldId);
});

test('remix assigns a new identity and preserves source provenance', async () => {
	const environment = createCreatorEnvironment();
	const portable = await createPortableCreatorWorld(environment);
	const remix = remixCreatorWorld(portable.document, environment);
	assert.notEqual(remix.metadata.mitzvahWorldCreator.worldId, portable.worldId);
	assert.equal(remix.metadata.mitzvahWorldCreator.remixOf, portable.worldId);
	assert.equal(creatorWorldParts(remix)[0].definition.id, 'creator-timber-wall-0042');
});

test('invalid envelope and unsafe builder definitions fail before hydration', async () => {
	const environment = createCreatorEnvironment();
	const portable = await createPortableCreatorWorld(environment);
	const wrongFormat = structuredClone(portable.document);
	wrongFormat.format = 'other.world';
	assert.throws(() => parseCreatorWorld(wrongFormat), /FORMAT_UNSUPPORTED/);
	const wrongVersion = structuredClone(portable.document);
	wrongVersion.version = 2;
	assert.throws(() => parseCreatorWorld(wrongVersion), /VERSION_UNSUPPORTED/);
	const unsafe = structuredClone(portable.document);
	unsafe.resources.objects['creator-timber-wall-0042'].definition.position.x = Number.POSITIVE_INFINITY;
	assert.throws(() => parseCreatorWorld(unsafe), /VECTOR_INVALID/);
	const unknown = structuredClone(portable.document);
	unknown.resources.objects['creator-timber-wall-0042'].kind = 'unknown-builder-kind';
	assert.throws(() => parseCreatorWorld(unknown), /CREATOR_PART_UNKNOWN:unknown-builder-kind/);
});
