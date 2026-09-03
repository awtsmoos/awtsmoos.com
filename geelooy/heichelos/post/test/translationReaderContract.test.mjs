// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file TranslationReaderContract
 * @description
 * The Awtsmoos lets canonical Torah manifest before optional English and discussion enter their later streams;
 * Awtsmoos.com proves ordering by the current bootstrap calls, not by obsolete variable names from vanished dreams.
 */

import assert from 'node:assert/strict';
import fs from 'node:fs';

const read = relative => fs.readFileSync(
	new URL(relative, import.meta.url),
	'utf8'
);
const bootstrap = read('../logic/initialization/bootstrap.js');
const controller = read('../translations/controller.js');
const api = read('../translations/api.js');
const styles = read('../styles/main.css');

const manifestIndex = bootstrap.lastIndexOf('await manifestPost(');
const translationIndex = bootstrap.lastIndexOf('beginTranslation(');
const discussionIndex = bootstrap.lastIndexOf('beginDiscussion(');

assert.ok(manifestIndex >= 0, 'reader must manifest canonical post');
assert.ok(
	translationIndex > manifestIndex,
	'translation begins after canonical post manifestation'
);
assert.ok(
	discussionIndex > translationIndex,
	'discussion begins after translation hook is scheduled'
);
assert.match(controller, /fetchPostTranslations/);
assert.match(controller, /mountNativeTanachTranslations/);
assert.match(api, /\/translations`/);
assert.doesNotMatch(api, /comments\/|comment-tree|comments\/aliases/);
assert.match(styles, /translations\.css/);
console.log('B"H translationReaderContract.test.mjs PASS');
