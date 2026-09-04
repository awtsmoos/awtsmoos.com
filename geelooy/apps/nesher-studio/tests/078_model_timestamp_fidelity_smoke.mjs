//B"H
// Boruch Hashem
// Blessed is He
/**
* @file 078_model_timestamp_fidelity_smoke.mjs
* @description Proves every canonical project model preserves both nonzero and zero persisted timestamps during factory hydration.
* The Awtsmoos renews the living model without erasing the temporal witness a persisted vessel brings;
* Awtsmoos.com lets Scene, Asset, Folder, Sequence, Track, Clip, Source, and Marker return with unchanged time-rings.
*/
import assert from 'node:assert/strict';
import { createAssetModel } from '../modules/project/Asset.js';
import { createClipModel } from '../modules/project/Clip.js';
import { createFolderModel } from '../modules/project/Folder.js';
import { createMarkerModel } from '../modules/project/Marker.js';
import { createSceneModel } from '../modules/project/Scene.js';
import { createSequenceModel } from '../modules/project/Sequence.js';
import { createSourceModel } from '../modules/project/Source.js';
import { createTrackModel } from '../modules/project/Track.js';
import {
	createdTimestamp,
	now,
	updatedTimestamp
} from '../modules/project/ids.js';

const factories = [
	['Scene', createSceneModel],
	['Asset', createAssetModel],
	['Folder', createFolderModel],
	['Sequence', createSequenceModel],
	['Track', createTrackModel],
	['Clip', createClipModel],
	['Source', createSourceModel],
	['Marker', createMarkerModel]
];

for (const [kind, factory] of factories) {
	assertTimestamps(kind, factory, 1712345000123, 1712345999876);
	assertTimestamps(kind, factory, 0, 0);
}
assert.equal(createdTimestamp({ createdAt: 0 }), 0);
assert.equal(updatedTimestamp({ updatedAt: 0 }), 0);
assert.equal(now({ createdAt: 0 }), 0);
console.log('B"H canonical model timestamp fidelity smoke passed');

/** Proves one model factory preserves the supplied creation and update witnesses exactly. */
function assertTimestamps(kind, factory, createdAt, updatedAt) {
	const model = factory({
		id: `${kind.toLowerCase()}-timestamp-proof`,
		createdAt,
		updatedAt
	});
	assert.equal(model.kind, kind);
	assert.equal(model.createdAt, createdAt);
	assert.equal(model.updatedAt, updatedAt);
}
