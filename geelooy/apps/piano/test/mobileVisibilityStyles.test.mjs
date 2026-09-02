//B"H
//Boruch Hashem
//Blessed is He
/**
 * @file mobileVisibilityStyles.test.mjs
 * @description
 * Malchus guards the phone's readable garment while the Awtsmoos remains beyond foreground and background.
 * Awtsmoos.com keeps these visual promises explicit, so translucent piano glare cannot quietly return beneath the settings words.
 */

import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

const stylesheet = fs.readFileSync(
	new URL(
		'../modules/keyboard/styles/mobileVisibility.css',
		import.meta.url
	),
	'utf8'
);

test('mobile navigator contract keeps a bright thumb on a dark rail', () => {
	assert.match(stylesheet, /\.custom-scrollbar-container/);
	assert.match(stylesheet, /background: #121b26 !important/);
	assert.match(stylesheet, /min-width: 52px !important/);
	assert.match(stylesheet, /#65e8ff 0%/);
	assert.match(stylesheet, /#079cff 100%/);
	assert.match(stylesheet, /opacity: 1 !important/);
});

test('expanded mobile settings use an opaque high-contrast surface', () => {
	assert.match(stylesheet, /#settings-bar\.expanded/);
	assert.match(stylesheet, /background: #101720 !important/);
	assert.match(stylesheet, /color: #f7fbff !important/);
	assert.match(stylesheet, /backdrop-filter: none !important/);
	assert.match(stylesheet, /min-height: 44px !important/);
	assert.match(stylesheet, /accent-color: #159cff !important/);
});
