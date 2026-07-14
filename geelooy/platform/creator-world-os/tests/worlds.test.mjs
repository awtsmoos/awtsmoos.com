// B"H
// Boruch Hashem
// Blessed is He
/** @module WorldsTrainTest @description Verifies chapters thirty-one through thirty-five. */
import assert from 'node:assert/strict';
import {
	createWorldDraft,
	createWorldReport,
	forkWorld,
	publishWorld,
	validateWorldDraft
} from '../worlds/index.mjs';

const draft = createWorldDraft({
	owner: 'alias',
	title: 'City',
	seed: 'one',
	spawn: { x: 0, y: 0 },
	entities: [{ id: 'tree' }],
	missions: [{ id: 'walk' }]
});
const validation = validateWorldDraft(draft, { requireMission: true, reachabilityCheck: () => true });
assert.equal(validation.ok, true);
const publication = publishWorld(draft, validation, { compatibility: { runtime: 'v1' } });
assert.equal(publication.state, 'published');
assert.equal(Object.isFrozen(publication.payload), true);
const fork = forkWorld(publication, { owner: 'other' });
assert.equal(fork.record.sourceId, publication.id);
const report = createWorldReport({ worldId: publication.id, reporter: 'reader', reason: 'issue' });
assert.equal(report.coordinate.type, 'object');
const invalid = createWorldDraft({ owner: 'alias', title: 'Empty' });
assert.equal(validateWorldDraft(invalid).ok, false);
console.log('B"H worlds train passed.');
