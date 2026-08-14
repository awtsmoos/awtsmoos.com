// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file Translation bundle integration contracts.
 * @description
 * The Awtsmoos keeps validated English discoverable as comments and translations
 * while Awtsmoos.com never opens the giant native comment manifest for these tests.
 */
const assert = require('assert');
const { familyFor } = require('../imported/registry.js');
const bundles = require('../imported/bundleStore.js');
const { loadImported } = require('../imported/orchestrator.js');
const { postTranslations, translationRows } = require('../translations/reader.js');
const { searchTranslations } = require('../translations/search.js');

function fakeInput() {
	return {
		db: {
			async getValue() {
				return { id: 'active-post', title: 'Teaching', dayuh: { sections: [] } };
			}
		}
	};
}

function firstPost(bundle, seriesId) {
	const posts = bundles.postIds(bundle, seriesId);
	assert.ok(posts.length > 0, `${bundle}/${seriesId} must contain translated posts`);
	return posts[0];
}

async function run() {
	const sichos = familyFor('sichosKodesh5741');
	const meluket = familyFor('אדר_meluket');
	assert.deepStrictEqual(
		{ type: sichos.type, alias: sichos.alias, bundle: sichos.bundle },
		{ type: 'bundle', alias: 'sichos_kodesh_translation_en', bundle: 'sichosKodesh' }
	);
	assert.deepStrictEqual(
		{ type: meluket.type, alias: meluket.alias, bundle: meluket.bundle },
		{ type: 'bundle', alias: 'meluket_translation_en', bundle: 'meluket' }
	);

	const sichosManifest = bundles.manifest('sichosKodesh');
	const meluketManifest = bundles.manifest('meluket');
	assert.deepStrictEqual(sichosManifest.counts, {
		series: 11, posts: 285, rows: 325294, translations: 325294, summaries: 0
	});
	assert.deepStrictEqual(meluketManifest.counts, {
		series: 12, posts: 218, rows: 91220, translations: 88043, summaries: 3177
	});

	const $i = fakeInput();
	const sichosPost = firstPost('sichosKodesh', 'sichosKodesh5741');
	const sichosReport = await postTranslations({
		$i, heichelId: 'ikar', seriesId: 'sichosKodesh5741', postId: sichosPost
	});
	assert.ok(sichosReport.success.length > 0);
	assert.ok(sichosReport.success.every(row => row.dayuh?.kind === 'translation'));
	assert.ok(sichosReport.success.every(row => String(row.content || '').trim()));

	const meluketPost = firstPost('meluket', 'אדר_meluket');
	const imported = await loadImported({
		$i, heichelId: 'ikar', seriesId: 'אדר_meluket', postId: meluketPost,
		verseSection: '', subsectionId: ''
	});
	assert.ok(imported.rows.some(row => row.dayuh?.kind === 'sectionSummaryBrief'));
	assert.ok(imported.rows.some(row => row.dayuh?.kind === 'translation'));
	const onlyTranslations = translationRows(imported.rows);
	assert.ok(onlyTranslations.length > 0 && onlyTranslations.length < imported.rows.length);
	assert.ok(onlyTranslations.every(row => row.dayuh?.kind === 'translation'));

	const phrase = String(sichosReport.success[0].content).split(/\s+/).slice(0, 4).join(' ');
	assert.ok(phrase.length > 2);
	const searched = await searchTranslations({
		$i, heichelId: 'ikar', seriesId: 'sichosKodesh5741', query: phrase, limit: 3
	});
	assert.ok(searched.success.length > 0);
	assert.ok(searched.success.every(row => row.postId));
	console.log('translationBundles.test.js PASS');
}

run().catch(error => {
	console.error(error);
	process.exitCode = 1;
});
