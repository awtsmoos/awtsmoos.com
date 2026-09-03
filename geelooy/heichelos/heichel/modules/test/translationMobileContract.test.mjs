// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file TranslationMobileContract
 * @description
 * The Awtsmoos lets translation metadata enter through source loading while Living Path reveals coverage without clutter;
 * Awtsmoos.com proves mobile badges, result links, and safe translation APIs remain aligned with the current navigator structure.
 */

import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
	isTranslationSeries,
	translationResultHref
} from '../api/translations.js';
import {
	annotateTranslationState,
	translationBadge
} from '../living-path/translation-context.js';

assert.equal(isTranslationSeries('likkuteiSichosVolume1'), true);
assert.equal(isTranslationSeries('seferHaSichos5752'), true);
assert.equal(isTranslationSeries('sichosKodesh5741'), true);
assert.equal(isTranslationSeries('תשרי_meluket'), true);
assert.equal(isTranslationSeries('chassidus'), false);

const annotated = annotateTranslationState([
	{ id: 'a' },
	{ id: 'b' }
], {
	success: ['b'],
	meta: { source: { available: true, status: 'ready' } }
});
assert.equal(annotated[0].translationStatus, 'missing');
assert.equal(annotated[1].translationStatus, 'translated');
assert.deepEqual(
	translationBadge('translated'),
	{ label: 'English', tone: 'ready' }
);

const href = translationResultHref({
	heichelId: 'ikar',
	seriesId: 'likkuteiSichosVolume1',
	row: {
		postId: 'post-1',
		verseSection: '20',
		dayuh: { subSection: 2 }
	}
});
assert.equal(
	href,
	'/heichelos/ikar/series/likkuteiSichosVolume1/post/post-1?tVerse=20&tSub=1'
);

const read = path => fs.readFileSync(path, 'utf8');
const sourceLoader = read('geelooy/heichelos/heichel/modules/navigator/source-loader.js');
const controller = read('geelooy/heichelos/heichel/modules/living-path/controller.js');
const layout = read('geelooy/heichelos/heichel/modules/ui/blueprints/layout-content.js');
const cards = read('geelooy/heichelos/heichel/modules/ui/render/living-path/card-content.js');
const css = read('geelooy/style/heichelos/heichel/cosmic-profile/mobile-series/living-path/index.css');
const apiSource = read('geelooy/heichelos/heichel/modules/api/translations.js');

assert.match(sourceLoader, /getSeriesTranslations/);
assert.match(sourceLoader, /annotateTranslationState/);
assert.match(controller, /LivingPathTranslationSearch/);
assert.match(layout, /translationSearchResults/);
assert.match(cards, /nav-card-translation-badge/);
assert.match(css, /translation\.css/);
assert.doesNotMatch(apiSource, /comments\/|comment-tree|comments\/aliases/);
console.log('B"H translationMobileContract.test passed');
