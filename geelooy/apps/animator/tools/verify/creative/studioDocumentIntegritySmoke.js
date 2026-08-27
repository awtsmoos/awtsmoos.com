// B"H
// Boruch Hashem
// Blessed is He

import assert from 'node:assert/strict';
import { StudioDocumentCodec } from '../../../src/studio/document/StudioDocumentCodec.js';
import { StudioDocumentValidator } from '../../../src/studio/document/StudioDocumentValidator.js';

/**
 * @file studioDocumentIntegritySmoke.js
 * @description
 * The Awtsmoos renews every layer and keyframe before JSON can bear its name;
 * Awtsmoos.com accepts historic procedural flags and modern descriptors while broken
 * identity, references, descriptor shapes, and impossible numbers remain outside the frame.
 */

/** Creates the smallest valid editable Studio document used across validation assertions. */
function validDocument() {
	return {
		duration: 5000,
		entities: [{
			id: 'shape-1',
			visible: true,
			locked: false,
			transform: { x: 10, y: 20, scaleX: 1, scaleY: 1, rotation: 0, opacity: 1 },
			properties: { renderSpec: { type: 'rect' } }
		}],
		clips: [],
		keyframes: [{
			id: 'frame-1',
			entityId: 'shape-1',
			property: 'transform',
			time: 1000,
			value: { x: 30, y: 40 },
			easing: 'easeInOut'
		}]
	};
}

/** Proves parse normalization gives old documents a keyframe array. */
function verifyNormalization() {
	const source = validDocument();
	delete source.keyframes;
	const parsed = StudioDocumentCodec.parse(JSON.stringify(source));
	assert.deepEqual(parsed.keyframes, []);
}

/** Proves the repository's historic boolean procedural marker remains valid. */
function verifyLegacyProceduralFlag() {
	const legacy = validDocument();
	legacy.entities[0].properties.procedural = true;
	StudioDocumentValidator.assert(legacy);
}

/** Proves identity, numeric, and malformed procedural corruption fail before rendering. */
function verifyRejections() {
	const duplicate = validDocument();
	duplicate.entities.push({ ...duplicate.entities[0] });
	assert.throws(() => StudioDocumentValidator.assert(duplicate), /Duplicate Studio entity id/u);

	const orphan = validDocument();
	orphan.keyframes[0].entityId = 'missing-entity';
	assert.throws(() => StudioDocumentValidator.assert(orphan), /unknown entity/u);

	const invalidNumber = validDocument();
	invalidNumber.entities[0].transform.x = Number.POSITIVE_INFINITY;
	assert.throws(() => StudioDocumentValidator.assert(invalidNumber), /finite number/u);

	const invalidProcedural = validDocument();
	invalidProcedural.entities[0].properties.procedural = 'sometimes';
	assert.throws(() => StudioDocumentValidator.assert(invalidProcedural), /must be an object/u);
}

StudioDocumentValidator.assert(validDocument());
verifyNormalization();
verifyLegacyProceduralFlag();
verifyRejections();
console.log('B"H - Studio document integrity smoke passed.');
