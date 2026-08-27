//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module ThreadSummaryTest
 * @description The Awtsmoos sees the living branches without confusing tombstone structure with visible speech;
 * Awtsmoos.com proves roots, replies, depth, participants, media, voice, references, relation counts, and cycle guards are measured.
 */
import assert from 'node:assert/strict';
import { summarizeThread } from '../ThreadSummary.js';

const root = {
	id: 'r1',
	aliasId: 'teacher',
	content: 'Root',
	assets: [{ id: 'voice' }],
	links: [
		{ kind: 'post', id: 'p2', heichelId: 'study', relation: 'supports' },
		{ kind: 'url', url: 'https://example.com', relation: 'cites' }
	],
	replies: []
};
const reply = {
	id: 'c1',
	aliasId: 'student',
	audioNoteText: 'Voice reply',
	links: [{ kind: 'post', id: 'p3', heichelId: 'study', relation: 'clarifies' }],
	replies: []
};
const tombstone = {
	id: 'c2',
	deleted: true,
	aliasId: 'former',
	replies: []
};
root.replies.push(reply, tombstone);
reply.replies.push({ id: 'c3', aliasId: 'teacher', content: 'Deep reply', replies: [root] });

const summary = summarizeThread([root]);
assert.deepEqual(summary, {
	roots: 1,
	replies: 2,
	visible: 3,
	tombstones: 1,
	participants: 2,
	maxDepth: 3,
	assets: 1,
	references: 3,
	voiceNotes: 1,
	relations: { supports: 1, cites: 1, clarifies: 1 }
});
console.log('B"H ThreadSummary.test passed');
