// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file torahLibraryNavigation.test.mjs
 * @description
 * The Awtsmoos proves downloaded source works and canonical Chassidus share one
 * bilingual Torah tree without duplicating persisted data. Awtsmoos.com keeps
 * stable work identity, root discoverability, legacy links, and exact source
 * presentation in harmony across persisted and virtual navigation vessels.
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

function titlePairs(items) {
	return items.map(item => ({ he: item.titleHe, en: item.titleEn }));
}

test('source IDs round-trip stable Torah Ohr identity without provider branding', () => {
	const workId = ids.workSeriesId('chassidus', 'תורה אור', 160);
	assert.equal(workId.includes(providerWord), false);
	assert.deepEqual(ids.parseTorahLibraryId(workId), {
		kind: 'work', view: 'chassidus', work: 'תורה אור', offset: 160
	});
	const pageId = ids.pageSeriesId('346791', 'chassidus', 'תורה אור');
	assert.equal(ids.parseTorahLibraryId(pageId).pageId, '346791');
});

test('Chassidus is a first-class root doorway without becoming a virtual copy', () => {
	const root = injection.injectTorahSourceBranches([], 'ikar', 'root');
	assert.deepEqual(titlePairs(root), [{ he: 'חסידות', en: 'Chassidus' }]);
	assert.equal(root[0].id, hierarchy.CHASSIDUS_ID);
	assert.equal(root[0].virtual, undefined);
	assert.equal(root[0].rootFeatured, true);
	const persisted = { id: hierarchy.CHASSIDUS_ID, name: 'Persisted Chassidus' };
	assert.deepEqual(injection.injectTorahSourceBranches([persisted], 'ikar', 'root'), [persisted]);
});

test('downloaded source branches augment Oral Torah and Chassidus bilingually', () => {
	assert.deepEqual(
		titlePairs(injection.injectTorahSourceBranches([], 'ikar', hierarchy.ORAL_TORAH_ID)),
		[
			{ he: 'הלכה', en: 'Halacha' },
			{ he: 'מדרש', en: 'Midrash' },
			{ he: 'קבלה', en: 'Kabbalah' },
			{ he: 'מוסר', en: 'Mussar' }
		]
	);
	assert.deepEqual(
		titlePairs(injection.injectTorahSourceBranches([], 'ikar', hierarchy.CHASSIDUS_ID)),
		[{ he: 'ספרי חסידות נוספים', en: 'Additional Chassidus Works' }]
	);
});

test('source hierarchy keeps Mussar separate and suppresses persisted Chassidus works', () => {
	assert.equal(hierarchy.sourceWorkIncluded('mussar', { id: 'מסילת ישרים' }), true);
	assert.equal(hierarchy.sourceWorkIncluded('chassidus', { id: 'מסילת ישרים' }), false);
	assert.equal(hierarchy.sourceWorkIncluded('chassidus', { id: 'תורה אור' }), false);
	assert.equal(hierarchy.sourceDefinition('chassidus').hostSeriesId, 'chassidus');
});

test('legacy library bookmark remains readable without a second library root', () => {
	assert.deepEqual(ids.parseTorahLibraryId(ids.LEGACY_TORAH_LIBRARY_ROOT_ID), { kind: 'legacy-root' });
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
