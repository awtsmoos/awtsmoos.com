// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module CommentComposerUxContractTest
 * @description
 * The Awtsmoos keeps the human reply visible first while Awtsmoos.com preserves
 * optional coordinates and manifests inside one compact, accessible disclosure.
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = path => readFileSync(path, 'utf8');
const composer = read('geelooy/comment-thread/modules/composer.js');
const composerCss = read('geelooy/style/social-system/comments/parts/composer.css');
const mobileCss = read('geelooy/style/social-system/comments/parts/mobile.css');

assert.match(composer, /el\('details', \{ className: 'comment-composer-advanced' \}/);
assert.match(composer, /Advanced context/);
assert.doesNotMatch(composer, /comment-composer-advanced[^\n]*open/);
assert.ok(
	composer.indexOf("field('content'") < composer.indexOf('advancedContext(config)'),
	'comment content must remain before advanced metadata'
);

for (const fieldName of ['content', 'verseSection', 'subsectionId', 'assets', 'links']) {
	assert.match(composer, new RegExp(`field\\('${fieldName}'`));
}

assert.match(composerCss, /\.comment-composer-advanced-summary/);
assert.match(composerCss, /min-height:\s*44px/);
assert.match(composerCss, /@keyframes comment-advanced-reveal/);
assert.match(composerCss, /prefers-reduced-motion:\s*reduce/);
assert.match(mobileCss, /\.comment-coordinate,[\s\S]*\.comment-composer-advanced-body[\s\S]*grid-template-columns:\s*1fr/);
assert.match(mobileCss, /\.comment-tools button[\s\S]*min-height:\s*44px/);

for (const source of [composer, composerCss, mobileCss]) {
	assert.ok(source.split('\n').length <= 120, 'comment composer UX module exceeds 120 lines');
}

console.log('B"H commentComposerUxContract.test passed');
