// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file torahLibraryNavigation.test.mjs
 * @description The Awtsmoos tests stable virtual names before the browser walks them;
 * Awtsmoos.com keeps Ikar-only injection, Chitas posts, Torah series, and exact source truth distinct and quietly named.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const ROOT = path.resolve('geelooy/heichelos/heichel/modules');
const ids = await import(pathToFileURL(path.join(ROOT, 'torahLibraryIds.js')));
const views = await import(pathToFileURL(path.join(ROOT, 'navigator/view-policy.js')));
const source = file => fs.readFileSync(path.join(ROOT, file), 'utf8');
const forbiddenProviderWord = ['wiki', 'source'].join('');

test('virtual IDs round-trip Hebrew work, page, and offset without provider branding', () => {
	const workId = ids.workSeriesId('chassidus_mussar', 'תורה אור (חב"ד)', 160);
	assert.equal(workId.includes(forbiddenProviderWord), false);
	assert.deepEqual(ids.parseTorahLibraryId(workId), {
		kind: 'work', domain: 'chassidus_mussar', work: 'תורה אור (חב"ד)', offset: 160
	});
	const pageId = ids.pageSeriesId('44107', 'kabbalah', 'תיקוני זהר');
	assert.deepEqual(ids.parseTorahLibraryId(pageId), {
		kind: 'page', pageId: '44107', domain: 'kabbalah', work: 'תיקוני זהר'
	});
});

test('Torah Library injects only into Ikar root and never duplicates', () => {
	const card = { id: ids.TORAH_LIBRARY_ROOT_ID };
	assert.equal(ids.injectTorahLibrarySeries([], 'other', 'root', card).length, 0);
	assert.equal(ids.injectTorahLibrarySeries([], 'ikar', 'child', card).length, 0);
	const once = ids.injectTorahLibrarySeries([], 'ikar', 'root', card);
	assert.equal(once.length, 1);
	assert.equal(ids.injectTorahLibrarySeries(once, 'ikar', 'root', card).length, 1);
});

test('virtual hierarchy chooses series while Chitas-style virtual posts stay posts', () => {
	assert.equal(views.chooseContentView({ subSeries: [{}] }, { virtual: true }, ''), 'series');
	assert.equal(views.chooseContentView({ posts: [{}] }, { virtual: true }, ''), 'posts');
	assert.equal(views.chooseContentView({ groupings: [{}] }, {}, '?view=groupings'), 'groupings');
});

test('source loader routes Torah virtual IDs before stored series APIs', () => {
	const text = source('navigator/source-loader.js');
	assert(text.indexOf('isTorahLibrarySeries(seriesId)') < text.indexOf('loadIdentity(seriesId)'));
	assert(text.includes('injectTorahLibrarySeries'));
});

test('virtual cards never receive stored-series inline expansion', () => {
	const text = source('ui/render/living-path/tree.js');
	assert(text.includes('!data.raw?.virtual'));
	assert(text.includes('getSubSeriesDetails'));
});

test('source presentation remains exact, provider-neutral, and source-accessible', () => {
	const presentation = source('torahLibraryPresentation.js');
	const renderState = source('ui/render-state.js');
	for (const field of ['Revision ID', 'Revision timestamp', 'Quality', 'License', 'Source hash']) {
		assert(presentation.includes(field));
	}
	assert.equal(presentation.toLowerCase().includes(forbiddenProviderWord), false);
	assert.equal(renderState.toLowerCase().includes(forbiddenProviderWord), false);
	assert(renderState.includes("button.textContent = 'פתיחת המקור'"));
	assert(renderState.includes("area.style.whiteSpace = presentation.exact ? 'pre-wrap' : ''"));
});
