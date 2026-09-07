// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file TranslationMobileContract
 * @description
 * The Awtsmoos lets translation metadata cross its own Yesod gateway while Living Path reveals coverage without clutter;
 * Awtsmoos.com proves bilingual language tools, modern API ownership, mobile badges, and optional loading remain aligned instead of utter.
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
	meta: {
		source: {
			available: true,
			status: 'ready'
		}
	}
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
const translationLoader = read('geelooy/heichelos/heichel/modules/navigator/translation-loader.js');
const controller = read('geelooy/heichelos/heichel/modules/living-path/controller.js');
const layout = read('geelooy/heichelos/heichel/modules/ui/blueprints/layout-content.js');
const cards = read('geelooy/heichelos/heichel/modules/ui/render/living-path/card-content.js');
const css = read('geelooy/style/heichelos/heichel/cosmic-profile/mobile-series/living-path/index.css');
const apiSource = read('geelooy/heichelos/heichel/modules/api/translations.js');
const hub = read('geelooy/heichelos/heichel/modules/ui/translation-hub-renderer.js');

assert.match(sourceLoader, /translation-loader\.js\?v=heichel-mobile-011/);
assert.match(sourceLoader, /annotateTranslationState/);
assert.match(translationLoader, /from '\.\.\/api\.js'/);
assert.doesNotMatch(translationLoader, /from '\.\.\/\.\.\/api\.js'/);
assert.match(translationLoader, /getSeriesTranslations/);
assert.match(controller, /LivingPathTranslationSearch/);
assert.match(layout, /translationSearchResults/);
assert.match(cards, /nav-card-translation-badge/);
assert.match(css, /translation\.css/);
assert.doesNotMatch(apiSource, /comments\/|comment-tree|comments\/aliases/);
assert.match(hub, /All dictionaries/);
assert.match(hub, /Search Hebrew, Aramaic, or Yiddish/);
assert.match(hub, /Dictionaries are not installed on this server yet/);
assert.match(hub, /No results found/);
console.log('B"H translationMobileContract.test passed');
