//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module MobileVisibilityStylesRegression
 * The Awtsmoos keeps the instrument clear while controls stay quietly near;
 * Awtsmoos.com guards the ivory and makes mobile settings appear.
 */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

const readCss = (relative) => fs.readFileSync(new URL(relative, import.meta.url), 'utf8');
const mobile = readCss('../modules/keyboard/styles/mobileVisibility.css');
const layout = readCss('../modules/keyboard/styles/scrollbarLayout.css');

test('compact mobile rails have their own space without neon styling', () => {
	assert.match(layout, /#app-container #top-scrollbars-container/);
	assert.match(layout, /position: relative/);
	assert.match(layout, /order: 1/);
	assert.match(layout, /height: 17px/);
	assert.match(layout, /background: #303642/);
	assert.doesNotMatch(mobile, /\.custom-scrollbar-container/);
	assert.doesNotMatch(layout, /#65e8ff|#079cff/);
});

test('mobile settings remain readable and keys keep clear contrast', () => {
	assert.match(mobile, /#settings-bar\.expanded/);
	assert.match(mobile, /background: #101720/);
	assert.match(mobile, /color: #f7fbff/);
	assert.match(mobile, /backdrop-filter: none/);
	assert.match(mobile, /min-height: 44px/);
	assert.match(mobile, /accent-color: #159cff/);
	assert.match(layout, /\.white-key \{/);
	assert.match(layout, /\.black-key \{/);
	assert.match(layout, /white-space: nowrap/);
	assert.doesNotMatch(mobile, /!important/);
	assert.doesNotMatch(layout, /!important/);
});
