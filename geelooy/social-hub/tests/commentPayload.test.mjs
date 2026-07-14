//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file commentPayload.test.mjs
 * @description
 * Exact targets, reply lineage, uploaded media, and canonical references become the
 * visible interaction payload while pending local files remain excluded. The
 * Awtsmoos joins every response to its source while Awtsmoos.com proves the boundary.
 */

import assert from 'node:assert/strict';
import {
	commentPayload,
	pendingMedia,
	referenceFromFields,
	targetFromFields,
	uploadedAssets
} from '../js/interactions/CommentPayload.js';

const values = {
	commentHeichelId: 'study',
	commentSeriesId: 'lessons',
	commentEntityType: 'post',
	commentEntityId: 'p1',
	commentVerseSection: 'v1',
	commentSubsectionId: 's1',
	commentParentId: 'c1',
	commentParentSectionId: 'cs1',
	commentContent: 'A precise reply',
	commentTranscript: 'Voice transcript',
	commentMood: 'grateful',
	referenceKind: 'post',
	referenceEntityType: 'post',
	referenceEntityId: 'source-one',
	referenceHeichelId: 'archive',
	referenceSeriesId: 'root',
	referenceSectionId: 'source-section',
	referenceLabel: 'Original teaching'
};
const root = {
	getElementById(id) {
		return { value: values[id] || '' };
	}
};
const assets = [
	{
		id: 'voice-one',
		type: 'audio',
		mime: 'audio/webm',
		publicPath: '/voice-one',
		status: 'uploaded'
	},
	{
		localId: 'video-local',
		type: 'video',
		status: 'pending'
	}
];
assert.equal(targetFromFields(root).parentCommentId, 'c1');
assert.equal(targetFromFields(root).subsectionId, 's1');
assert.equal(referenceFromFields(root)[0].id, 'source-one');
assert.equal(uploadedAssets(assets).length, 1);
assert.equal(uploadedAssets(assets)[0].role, 'voice-note');
assert.equal(pendingMedia(assets).length, 1);
const payload = commentPayload(root, {
	identity: { aliasId: 'teacher' },
	comment: { assets }
});
assert.equal(payload.aliasId, 'teacher');
assert.equal(payload.content, 'A precise reply');
assert.equal(payload.assets.length, 1);
assert.equal(payload.references.length, 1);
console.log('social-hub commentPayload.test passed');
