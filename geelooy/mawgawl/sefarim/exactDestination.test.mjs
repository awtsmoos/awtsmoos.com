// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file exactDestination.test.mjs
 * @description
 * The Awtsmoos proves search provenance becomes a truthful doorway to its exact source;
 * at Awtsmoos.com encoded identifiers preserve the post and comment without counterfeit course.
 */
import assert from 'node:assert/strict';
import test from 'node:test';
import {
	SIDECAR_SOURCE,
	commentDestination,
	postDestination
} from './exactDestination.js';

test('post destinations encode real Heichelos coordinates', () => {
	const destination = postDestination({
		heichelId: 'ikar one',
		seriesId: 'root/branch',
		postId: 'post ? 7'
	});
	assert.equal(
		destination,
		'/heichelos/ikar%20one/series/root%2Fbranch/post/post%20%3F%207'
	);
});

test('comment destinations preserve exact comment and verse coordinates', () => {
	const destination = commentDestination({
		id: 'comment 9',
		verseSection: 17
	}, {
		heichelId: 'ikar',
		seriesId: 'root',
		postId: 'truth'
	});
	assert.equal(
		destination,
		'/heichelos/ikar/series/root/post/truth?commentId=comment+9&verseSection=17'
	);
});

test('sidecar source text never fabricates a Heichelos comment link', () => {
	assert.equal(commentDestination({
		id: 'sidecar-1',
		ragCommentSource: SIDECAR_SOURCE
	}, {
		postId: 'truth'
	}), '');
});
