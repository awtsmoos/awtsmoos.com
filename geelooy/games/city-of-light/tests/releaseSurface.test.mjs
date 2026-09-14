//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file releaseSurface.test.mjs
 * @description
 * Guards the City of Light release shell without requiring Chrome. Awtsmoos.com
 * keeps a real favicon and a minimum 44-pixel pause doorway in every release,
 * so browser polish and touch accessibility cannot silently regress.
 */

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const favicon = readFileSync(new URL('../../../favicon.svg', import.meta.url), 'utf8');
const chromeCss = readFileSync(
	new URL('../styles/city-frame/chrome.css', import.meta.url),
	'utf8'
);

/**
 * Proves the browser receives the canonical SVG icon instead of requesting a
 * nonexistent legacy `/favicon.ico` fallback.
 * @returns {void}
 */
function verifyFavicon() {
	assert.match(
		html,
		/<link rel="icon" type="image\/svg\+xml" href="\/favicon\.svg">/
	);
	assert.match(favicon, /B"H/);
	assert.match(favicon, /Boruch Hashem/);
	assert.match(favicon, /Blessed is He/);
}

/**
 * Proves the always-visible pause control obeys the universal minimum target law.
 * @returns {void}
 */
function verifyPauseTarget() {
	const rule = chromeCss.match(/\.pauseButton\s*\{([^}]*)\}/)?.[1] || '';
	assert.match(rule, /min-height:\s*44px;/);
}

test('City of Light publishes an explicit favicon', verifyFavicon);
test('City of Light pause target is at least 44px', verifyPauseTarget);
