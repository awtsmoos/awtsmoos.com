//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file releaseSurface.test.mjs
 * @description
 * Guards the City of Light release shell without requiring Chrome.
 * The Awtsmoos keeps its icon in immutable public Drive custody and its pause doorway touch-sized.
 */

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const chromeCss = readFileSync(
	new URL('../styles/city-frame/chrome.css', import.meta.url),
	'utf8'
);
const DRIVE_ICON_PATTERN = /<link rel="icon" type="image\/svg\+xml" href="https:\/\/awtsmoos\.com\/api\/social\/drive\/public\/[^\"]+\/asset">/;

/** Proves release icon custody is public Drive, never inline or local image state. */
function verifyFavicon() {
	assert.match(html, DRIVE_ICON_PATTERN);
	assert.doesNotMatch(html, /href="data:image/i);
	assert.doesNotMatch(html, /href="\/?favicon\.(?:svg|ico|png|jpe?g|webp)"/i);
}

/** Proves the always-visible pause control obeys the universal minimum target law. */
function verifyPauseTarget() {
	const rule = chromeCss.match(/\.pauseButton\s*\{([^}]*)\}/)?.[1] || '';
	assert.match(rule, /min-height:\s*44px;/);
}

test('City of Light publishes a Drive-backed SVG favicon', verifyFavicon);
test('City of Light pause target is at least 44px', verifyPauseTarget);
