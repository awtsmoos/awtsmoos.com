// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file heichelosGateway.test.mjs
 * @description
 * The Awtsmoos is one while truthful paths receive distinct names;
 * Awtsmoos.com keeps Ikar first, whole-card interaction in the document head, and community actions in their own lanes.
 */

import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

const rootSource = fs.readFileSync('geelooy/heichelos/_awtsmoos.index.html', 'utf8');
const ikarTemplate = fs.readFileSync('templates/heichelos/ikar-library.html', 'utf8');
const communityTemplate = fs.readFileSync('templates/heichelos/community-card.html', 'utf8');
const resultsTemplate = fs.readFileSync('templates/heichelos/discovery-results.html', 'utf8');
const shellTemplate = fs.readFileSync('templates/heichelos/discovery-shell.html', 'utf8');
const headTemplate = fs.readFileSync('templates/heichelos/discovery-head.html', 'utf8');

test('gateway partitions Ikar out before community rendering', () => {
	assert.match(rootSource, /\.find\(isIkar\)/);
	assert.match(rootSource, /return !isIkar\(heichel\)/);
	assert.match(rootSource, /Ikar is the Torah Library\./);
});

test('Ikar card is itself the canonical Torah Library link', () => {
	assert.match(ikarTemplate, /data-torah-library/);
	assert.match(ikarTemplate, /class="space-card-link torah-library-link"/);
	assert.match(ikarTemplate, /href="\/heichelos\/ikar\/"/);
	assert.doesNotMatch(ikarTemplate, />Open Torah Library</);
	assert.doesNotMatch(ikarTemplate, /\/submit/);
});

test('community card uses a primary card anchor and sibling actions', () => {
	assert.match(communityTemplate, /class="space-card-link"/);
	assert.match(communityTemplate, /href="\/heichelos\/' \+ safeId \+ '\/"/);
	assert.match(communityTemplate, /class="space-secondary-actions"/);
	assert.match(communityTemplate, />Contribute</);
	assert.doesNotMatch(communityTemplate, />Open space</);
	assert.doesNotMatch(communityTemplate, /data-torah="true"/);
});

test('community result coordinator delegates card rendering', () => {
	assert.match(resultsTemplate, /heichelos\/community-card\.html/);
	assert.doesNotMatch(resultsTemplate, /<article class="social-space-card/);
});

test('shell presents Ikar before community discovery', () => {
	const ikarPosition = shellTemplate.indexOf('ikarLibraryHtml');
	const communityPosition = shellTemplate.indexOf('community-heichelos-title');
	assert.notEqual(ikarPosition, -1);
	assert.notEqual(communityPosition, -1);
	assert.ok(ikarPosition < communityPosition);
});

test('root injects the discovery head and the head owns whole-card interaction styling', () => {
	assert.match(rootSource, /\$a\('heichelos\/discovery-head\.html'\)/);
	assert.match(headTemplate, /heichelos\/discovery-interaction-style\.html/);
	assert.match(headTemplate, /\/style\/heichelos\/discovery\.css\?v=torah-first-007/);
});
