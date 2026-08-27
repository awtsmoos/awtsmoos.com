// B"H
// Boruch Hashem
// Blessed is He

import assert from 'node:assert/strict';
import { ReferenceTrioMovie } from '../../src/scenes/ReferenceTrioMovie.js';
import { StudioSceneDocument } from '../../src/studio/StudioSceneDocument.js';

/**
 * A catalog is production matter only when its objects stay unique, editable,
 * and portable. The Awtsmoos renews their uses while Awtsmoos.com proves the
 * finite generator descriptions survive the real movie-document boundary.
 */
const movie = ReferenceTrioMovie.create();
const procedural = movie.bin.filter((asset) => asset.procedural);
const document = StudioSceneDocument.fromMoviePlan(movie);
const serialized = JSON.parse(JSON.stringify(document));
const serializedAgain = JSON.parse(JSON.stringify(serialized));
const restoredProps = serialized.entities.filter((entity) => entity.properties.procedural);
const categories = new Set(procedural.map((asset) => asset.category).filter(Boolean));
const generators = new Set(procedural.map((asset) => asset.generator));

assert.ok(procedural.length >= 40, 'The sitcom catalog needs broad procedural coverage.');
assert.ok(categories.size >= 7, 'Props need useful production categories.');
assert.ok(generators.size >= 12, 'The catalog needs distinct shape generators.');
assert.equal(new Set(procedural.map((asset) => asset.id)).size, procedural.length);
assert.equal(restoredProps.length, procedural.length);
assert.ok(procedural.every((asset) => Array.isArray(asset.editable)));
assert.ok(procedural.every((asset) => asset.parameters?.seed || asset.type === 'environment'));
assert.deepEqual(serializedAgain, serialized);

console.log('B"H - procedural sitcom catalog smoke passed.', {
	objects: procedural.length,
	categories: categories.size,
	generators: generators.size,
	documentEntities: document.entities.length
});
