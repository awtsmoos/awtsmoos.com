// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file torahLibraryNavigation.test.mjs
 * @description
 * The Awtsmoos proves downloaded source works live inside Torah's existing branches and never beside them as another tree;
 * Awtsmoos.com keeps stable work identity, legacy links, virtual routing, and provider-neutral presentation in harmony.
 */

import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { pathToFileURL } from 'node:url';

const ROOT = path.resolve('geelooy/heichelos/heichel/modules');
const ids = await import(pathToFileURL(path.join(ROOT, 'torahLibraryIds.js')));
const hierarchy = await import(pathToFileURL(path.join(ROOT, 'torahSourceHierarchy.js')));
const injection = await import(pathToFileURL(path.join(ROOT, 'torahSourceInjection.js')));
const views = await import(pathToFileURL(path.join(ROOT, 'navigator/view-policy.js')));
const source = file => fs.readFileSync(path.join(ROOT, file), 'utf8');
const providerWord = ['wiki', 'source'].join('');

function names(items) {
	return items.map(item => item.name);
}

test('source IDs round-trip stable Torah Ohr identity without provider branding', () => {
	const workId = ids.workSeriesId('chassidus', 'תורה אור', 160);
	assert.equal(workId.includes(providerWord), false);
	assert.deepEqual(ids.parseTorahLibraryId(workId), {
		kind: 'work',
		view: 'chassidus',
		work: 'תורה אור',
		offset: 160
	});
	const pageId = ids.pageSeriesId('346791', 'chassidus', 'תורה אור');
	assert.equal(ids.parseTorahLibraryId(pageId).pageId, '346791');
});

test('downloaded source branches augment Oral Torah and Chassidus, never Ikar root', () => {
	assert.deepEqual(
		names(injection.injectTorahSourceBranches([], 'ikar', 'root')),
		[]
	);
	assert.deepEqual(
		names(injection.injectTorahSourceBranches([], 'ikar', hierarchy.ORAL_TORAH_ID)),
		['הלכה', 'מדרש', 'קבלה', 'מוסר']
	);
	assert.deepEqual(
		names(injection.injectTorahSourceBranches([], 'ikar', hierarchy.CHASSIDUS_ID)),
		['ספרי חסידות נוספים']
	);
});

test('source hierarchy keeps Mussar separate and suppresses persisted Chassidus works', () => {
	assert.equal(hierarchy.sourceWorkIncluded('mussar', { id: 'מסילת ישרים' }), true);
	assert.equal(hierarchy.sourceWorkIncluded('chassidus', { id: 'מסילת ישרים' }), false);
	assert.equal(hierarchy.sourceWorkIncluded('chassidus', { id: 'תורה אור' }), false);
	assert.equal(hierarchy.sourceDefinition('chassidus').hostSeriesId, 'chassidus');
});

test('legacy library bookmark remains readable but no active root library injection exists', () => {
	assert.deepEqual(
		ids.parseTorahLibraryId(ids.LEGACY_TORAH_LIBRARY_ROOT_ID),
		{ kind: 'legacy-root' }
	);
	const loader = source('navigator/source-loader.js');
	assert.equal(loader.includes('injectTorahLibrarySeries'), false);
	assert(loader.includes('injectTorahSourceBranches'));
});

test('virtual hierarchy remains virtual before stored-series APIs', () => {
	assert.equal(views.chooseContentView({ subSeries: [{}] }, { virtual: true }, ''), 'series');
	const loader = source('navigator/source-loader.js');
	assert(loader.indexOf('isTorahLibrarySeries(seriesId)') < loader.indexOf('loadIdentity(seriesId)'));
});

test('source presentation stays exact and provider-neutral', () => {
	const presentation = source('torahLibraryPresentation.js');
	const renderer = source('ui/source-description-renderer.js');
	assert.equal(presentation.toLowerCase().includes(providerWord), false);
	assert.equal(renderer.toLowerCase().includes(providerWord), false);
	assert(presentation.includes('revisionId'));
	assert(presentation.includes('sourceHash'));
	assert(renderer.includes('torah-source-provenance'));
});
