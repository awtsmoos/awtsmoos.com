// B"H
/**
 * Chapter 209: reader safety contract. The actual post reader stays largely
 * untouched: old comment endpoint remains first, rich mirror is best-effort,
 * inline asks root + verses, subsection coordinates use canonical subSection,
 * and auto-scroll default is no longer sluggish.
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const autoScroll = readFileSync('geelooy/heichelos/post/actions/AutoScrollDown.js', 'utf8');
const submit = readFileSync('geelooy/heichelos/post/commentSection/submit.js', 'utf8');
const coordinate = readFileSync('geelooy/heichelos/post/comments/state/commentCoordinate.js', 'utf8');
const rendered = readFileSync('geelooy/heichelos/post/comments/logic/inlineManifest/bulk/renderedVerses.js', 'utf8');
const batch = readFileSync('geelooy/heichelos/post/comments/logic/inlineManifest/bulk/requestBatch.js', 'utf8');

assert.match(autoScroll, /const DEFAULT_SPEED = 2\.4;/, 'default auto scroll should be faster than before');
assert.match(autoScroll, /const RESUME_DELAY_MS = 420;/, 'resume delay should not feel slow');
assert.match(autoScroll, /window\.__awtsmoosAutoScrollVerseBuffer/, 'auto scroll must still request more reader road');

assert.match(coordinate, /subSection/, 'canonical coordinate must expose subSection');
assert.match(coordinate, /dayuh\.subSection = c\.subSection/, 'dayuh must preserve canonical subSection');
assert.match(submit, /postOldComment/, 'old reader comment path must remain primary');
assert.match(submit, /\/post\/\$\{window\.post\?\.id\}\/comments\//, 'old API endpoint must remain');
assert.match(submit, /mirrorRichComment/, 'rich comment mirror should exist');
assert.match(submit, /comment-tree/, 'rich mirror route should be used best-effort');
assert.match(submit, /verseSection/, 'verse coordinate must be sent explicitly');
assert.match(submit, /subsectionId: coordinate\.subSection \?\? coordinate\.sub \?\? ""/, 'subsection mirror must use canonical subSection');
assert.doesNotMatch(submit, /coordinate\.subsectionId/, 'old typo subsectionId must not be read from coordinate');
assert.match(submit, /sections: JSON\.stringify\(sections\)/, 'comment sections must be mirrored');
assert.match(submit, /assets: JSON\.stringify\(assets\)/, 'comment images/assets must be mirrored');
assert.match(submit, /catch \(error\)[\s\S]*old reader comment already lives/, 'rich mirror failure must not break old reader');

assert.match(rendered, /\["root", \.\.\.rendered\]/, 'inline loader must include root plus rendered verses');
assert.match(rendered, /data-verse-section/, 'inline loader must understand explicit verse-section markers');
assert.match(batch, /includeRich: true/, 'inline old API request can ask for rich-compatible payloads without requiring them');
assert.match(batch, /async function getCommentsOfAlias/, 'browser-only old API import must be lazy for tests and resilience');
assert.match(batch, /getRequestVerseScope/, 'reader inline request scope must be testable');

console.log('B"H ReaderCommentsSafety.test passed');
