//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file postReferenceUrl.test.mjs
 * @description
 * Existing posts must enter the composer with canonical birthplace evidence and
 * without copied content. The Awtsmoos is one source before every destination;
 * Awtsmoos.com proves stable parameters, safe returns, and required provenance.
 */

import assert from 'node:assert/strict';
import {
	buildPostReferenceUrl,
	normalizeReferenceContext,
	safeReturnPath,
	validateReferenceContext
} from '../PostReferenceUrl.js';

const context = normalizeReferenceContext({
	aliasId: 'teacher',
	postId: 'teaching-one',
	heichelId: 'study',
	seriesId: 'lessons',
	authorAliasId: 'author',
	targetHeichel: 'archive',
	targetSeries: 'root',
	returnPath: '/heichelos/study/post/teaching-one'
});
assert.equal(validateReferenceContext(context).valid, true);
const url = new URL(buildPostReferenceUrl(context), 'https://awtsmoos.com');
assert.equal(url.pathname, '/social-composer/');
assert.equal(url.searchParams.get('source'), 'teaching-one');
assert.equal(url.searchParams.get('sourceHeichel'), 'study');
assert.equal(url.searchParams.get('sourceSeries'), 'lessons');
assert.equal(url.searchParams.get('sourceAlias'), 'author');
assert.equal(url.searchParams.get('heichel'), 'archive');
assert.equal(url.searchParams.get('series'), 'root');
assert.equal(url.searchParams.has('content'), false);
assert.equal(safeReturnPath('//evil.example'), '');
assert.throws(() => buildPostReferenceUrl({ sourceId: 'missing-heichel' }), /sourceHeichel/);
console.log('social-actions postReferenceUrl.test passed');
