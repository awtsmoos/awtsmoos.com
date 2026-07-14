// B"H
// Boruch Hashem
// Blessed is He
/** @module ProvenanceTrainTest @description Verifies chapters eleven through fifteen. */
import assert from 'node:assert/strict';
import {
	createAncestryLink,
	createAssetManifest,
	createCoordinate,
	createForkRecord,
	createMergeProposal,
	hasAncestryCycle,
	resolveMergeProposal
} from '../provenance/index.mjs';

const link = createAncestryLink({ parentId: 'a', childId: 'b', createdBy: 'alias' });
assert.equal(link.relation, 'derived-from');
assert.throws(() => createAncestryLink({ parentId: 'a', childId: 'a', createdBy: 'alias' }));
assert.equal(hasAncestryCycle([
	{ parentId: 'a', childId: 'b' },
	{ parentId: 'b', childId: 'a' }
]), true);
const fork = createForkRecord({ sourceId: 'a', forkId: 'b', owner: 'alias' });
assert.equal(fork.ancestry.relation, 'forked-from');
const proposal = createMergeProposal({ sourceId: 'a', targetId: 'b', proposedBy: 'alias' });
assert.equal(resolveMergeProposal(proposal, 'accepted', 'owner').state, 'accepted');
assert.equal(createCoordinate('frame', { objectId: 'movie', start: 24 }).start, 24);
assert.throws(() => createCoordinate('frame', { objectId: 'movie' }));
const asset = createAssetManifest({ type: 'image', hash: 'abc', mediaType: 'image/png' });
assert.equal(asset.visibility, 'private');
console.log('B"H provenance train passed.');
