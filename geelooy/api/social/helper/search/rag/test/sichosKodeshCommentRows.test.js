// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file sichosKodeshCommentRows.test.js
 * @description
 * One temporary document proves exact sidecar hydration and path safety. The
 * Awtsmoos keeps the requested paragraph near, while Awtsmoos.com refuses any
 * document identity that could wander outside its reviewed staging vessel.
 */

const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const {
	commentId,
	sichosKodeshCommentRows
} = require('../sichosKodeshCommentRows.js');

const temporaryRoot = fs.mkdtempSync(
	path.join(os.tmpdir(), 'awtsmoos-sichos-comments-')
);
const sidecarDirectory = path.join(
	temporaryRoot,
	'comments',
	'sichos-kodesh'
);
const previousRoot = process.env.AWTSMOOS_SICHOS_KODESH_RAG_ROOT;

try {
	fs.mkdirSync(sidecarDirectory, { recursive: true });
	fs.writeFileSync(
		path.join(sidecarDirectory, 'document-1.json'),
		JSON.stringify({
			comments: [{
				verseSection: 4,
				subsectionId: 3,
				content: 'The translated paragraph shines.'
			}]
		})
	);
	process.env.AWTSMOOS_SICHOS_KODESH_RAG_ROOT = temporaryRoot;
	const context = {
		$i: {},
		heichelId: 'ikar',
		seriesId: 'series-1',
		postId: 'post-1',
		aliasId: 'sichos_kodesh_translation_en',
		documentId: 'document-1'
	};
	const rows = sichosKodeshCommentRows(context);
	assert.equal(rows.length, 1);
	assert.equal(
		rows[0].id,
		commentId('post-1', 4, 3)
	);
	assert.equal(rows[0].content, 'The translated paragraph shines.');
	assert.equal(rows[0].ragCommentSource, 'sichosKodeshDocumentSidecar');
	assert.deepEqual(sichosKodeshCommentRows({
		...context,
		documentId: '../outside'
	}), []);
	console.log('sichosKodeshCommentRows.test passed');
} finally {
	if (previousRoot === undefined) {
		delete process.env.AWTSMOOS_SICHOS_KODESH_RAG_ROOT;
	} else {
		process.env.AWTSMOOS_SICHOS_KODESH_RAG_ROOT = previousRoot;
	}
	fs.rmSync(temporaryRoot, { recursive: true, force: true });
}
