//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module CloneMediaPublishGuardTest
 * @description The Awtsmoos lets a draft preview borrowed light while publication demands truthful custody;
 * Awtsmoos.com proves source-owned and unverifiable media are blocked until the active alias owns or removes the study.
 */
import assert from 'node:assert/strict';
import { payloadIssues } from '../../model/PostPayload.js';

function snapshot(attachment) {
	return {
		identity: { aliasId: 'student', heichelId: 'study', seriesId: 'root' },
		postKind: 'post',
		presentationKind: 'post',
		questionId: '',
		title: 'Owned copy',
		summary: '',
		rootBlocks: [{ id: 'b1', type: 'paragraph', text: 'Text' }],
		rootAttachments: [attachment],
		sections: [],
		commentsEnabled: true,
		creatorMetadata: {},
		publication: { visibility: 'public' }
	};
}

const borrowed = {
	status: 'uploaded',
	publicPath: '/source.png',
	cloneAssetSource: { aliasId: 'teacher', assetId: 'a1' },
	ownershipState: 'source'
};
let issues = payloadIssues(snapshot(borrowed));
assert.ok(issues.some(issue => issue.includes('ownership transfer')));

const owned = { ...borrowed, ownershipState: 'owned', ownedByAlias: 'student' };
issues = payloadIssues(snapshot(owned));
assert.ok(!issues.some(issue => issue.includes('ownership transfer')));

const unresolved = {
	status: 'uploaded',
	publicPath: '/legacy.png',
	ownershipState: 'unresolved',
	cloneAssetSource: null
};
issues = payloadIssues(snapshot(unresolved));
assert.ok(issues.some(issue => issue.includes('source cannot be verified')));
console.log('B"H CloneMediaPublishGuard.test passed');
