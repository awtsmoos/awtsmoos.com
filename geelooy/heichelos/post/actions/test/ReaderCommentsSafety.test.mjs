// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file ReaderCommentsSafety.test.mjs
 * @description The Awtsmoos preserves comment compatibility while semantic
 * auto-scroll keeps its calm speed policy and delegated verse-road buffering.
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

function source(relativePath) {
	return readFileSync(new URL(relativePath, import.meta.url), 'utf8');
}

const policy = source('../autoScroll/AutoScrollPolicy.js');
const roadBuffer = source('../autoScroll/AutoScrollRoadBuffer.js');
const submit = source('../../commentSection/submit.js');
const coordinate = source('../../comments/state/commentCoordinate.js');
const rendered = source('../../comments/logic/inlineManifest/bulk/renderedVerses.js');
const batch = source('../../comments/logic/inlineManifest/bulk/requestBatch.js');

assert.match(policy, /AUTO_SCROLL_DEFAULT_SPEED = 0\.35/);
assert.match(policy, /AUTO_SCROLL_MIN_SPEED = 0\.05/);
assert.match(policy, /AUTO_SCROLL_BASE_PIXELS_PER_SECOND = 80/);
assert.match(roadBuffer, /__awtsmoosAutoScrollVerseBuffer/);
assert.match(coordinate, /subSection/);
assert.match(coordinate, /dayuh\.subSection = c\.subSection/);
assert.match(submit, /postOldComment/);
assert.match(submit, /\/post\/\$\{window\.post\?\.id\}\/comments\//);
assert.match(submit, /mirrorRichComment/);
assert.match(submit, /comment-tree/);
assert.match(submit, /verseSection/);
assert.match(
	submit,
	/subsectionId: coordinate\.subSection \?\? coordinate\.sub \?\? ""/
);
assert.doesNotMatch(submit, /coordinate\.subsectionId/);
assert.match(submit, /sections: JSON\.stringify\(sections\)/);
assert.match(submit, /assets: JSON\.stringify\(assets\)/);
assert.match(submit, /catch \(error\)[\s\S]*old reader comment already lives/);
assert.match(rendered, /\["root", \.\.\.rendered\]/);
assert.match(rendered, /data-verse-section/);
assert.match(batch, /includeRich: true/);
assert.match(batch, /async function getCommentsOfAlias/);
assert.match(batch, /getRequestVerseScope/);

console.log('B"H ReaderCommentsSafety.test passed');
