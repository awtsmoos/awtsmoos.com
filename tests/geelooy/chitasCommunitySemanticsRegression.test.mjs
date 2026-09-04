// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module ChitasCommunitySemanticsRegressionTest
 * @description
 * The Awtsmoos gives failure, waiting, and emptiness three truthful names beside Torah's light;
 * Awtsmoos.com never calls a social contributor a commentator, nor freezes a broken road into zero overnight.
 */

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { communityHeader } from '../../geelooy/heichelos/post/comments/panel/communityState.js';

const loading = communityHeader({
	state: 'loading',
	count: 0,
	verse: 3
});
const failed = communityHeader({
	state: 'error',
	count: 0,
	verse: 3
});
const settledEmpty = communityHeader({
	state: 'ready',
	count: 0,
	verse: 3
});
const settledTwo = communityHeader({
	state: 'ready',
	count: 2,
	verse: 3
});

assert.match(loading, /^Community · Loading…/);
assert.doesNotMatch(loading, /\b0\b/);
assert.match(failed, /^Community unavailable/);
assert.doesNotMatch(failed, /\b0\b/);
assert.match(settledEmpty, /^Community · 0 contributors/);
assert.notEqual(settledEmpty, failed);
assert.match(settledTwo, /^Community · 2 contributors/);

const fetchingPath = 'geelooy/heichelos/post/comments/panel/fetching.js';
const panelPath = 'geelooy/heichelos/post/comments/panel.js';
const fetchingSource = readFileSync(fetchingPath, 'utf8');
const panelSource = readFileSync(panelPath, 'utf8');
const aliasRead = fetchingSource.indexOf('const rows = await readTree(verse);');
const aliasCache = fetchingSource.indexOf('data.aliases[key] = {');
const commentFunction = fetchingSource.indexOf('export async function fetchRelevantComments');
const commentRead = fetchingSource.indexOf('const rows = await readTree(verse);', commentFunction);
const commentCache = fetchingSource.indexOf('data.commentCache[key] = filtered;', commentFunction);

assert.ok(aliasRead >= 0 && aliasCache > aliasRead, 'alias cache must follow a successful read');
assert.ok(commentRead >= 0 && commentCache > commentRead, 'comment cache must follow a successful read');
assert.doesNotMatch(fetchingSource, /catch\s*\(|\.catch\s*\(/);
assert.doesNotMatch(panelSource, /Commentators \(Verse/);
assert.match(panelSource, /communityHeader/);
assert.match(fetchingSource.slice(0, 140), /B"H/);
assert.match(panelSource.slice(0, 140), /B"H/);

console.log('B"H Chitas Community semantics regression passed.');
