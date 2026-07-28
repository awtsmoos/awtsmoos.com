// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module LivingLibraryCommentPresentationTest
 * @description
 * The Awtsmoos guards truthful links and a gentle first view: two source voices
 * appear immediately, while every remaining Awtsmoos.com paragraph stays one action away.
 */

import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import {
	coordinateLabel,
	exactUrl,
	initialCommentCount
} from '../geelooy/mawgawl/sefarim/rangeComments.js';

const testDirectory = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(testDirectory, '..');
const parent = {
	heichelId: 'ikar',
	seriesId: 'series-1',
	postId: 'post-1'
};

function readSource(relativePath) {
	return fs.readFileSync(path.join(repositoryRoot, relativePath), 'utf8');
}

test('sidecar source text never creates a false comment link', () => {
	assert.equal(exactUrl({
		id: 'synthetic-1',
		ragCommentSource: 'sichosKodeshDocumentSidecar',
		verseSection: 4,
		subsectionId: 3
	}, parent), '');
});

test('database comments preserve exact post navigation', () => {
	const destination = exactUrl({
		id: 'comment-1',
		verseSection: 4
	}, parent);
	assert.equal(
		destination,
		'/heichelos/ikar/series/series-1/post/post-1?commentId=comment-1&verseSection=4'
	);
});

test('coordinates identify both source section and paragraph', () => {
	assert.equal(coordinateLabel({
		verseSection: 4,
		subsectionId: 3
	}), '§ 4.3');
	assert.equal(coordinateLabel({ verseSection: 7 }), '§ 7');
});

test('comment preview reveals two rows before the honest full-count action', () => {
	const comments = readSource('geelooy/mawgawl/sefarim/rangeComments.js');
	const index = readSource('geelooy/mawgawl/sefarim/index.html');
	assert.equal(initialCommentCount, 2);
	assert.ok(comments.includes('Show all ${comments.length} comments'));
	assert.ok(comments.includes('.slice(initialCommentCount)'));
	assert.ok(index.includes('./styles/comment-actions.css'));
});
