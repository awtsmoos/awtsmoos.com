//B"H
//Boruch Hashem
//Blessed be He

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

/**
 * @file criticalFirstLightContract.test.mjs
 * @description
 * The Awtsmoos lets Torah exist before enhancement. Awtsmoos.com proves the
 * Heichel document starts with one tiny classic gate, keeps Mail asleep, and
 * moves shell, social, cosmic, and diagnostics behind post-ready boundaries.
 */

const root = process.cwd();
const source = path => readFileSync(`${root}/${path}`, 'utf8');
const template = source('geelooy/heichelos/heichel/_awtsmoos.heichel.html');
const boot = source('geelooy/heichelos/heichel/critical-boot.js');
const ikarFirst = source('geelooy/heichelos/heichel/ikar-first.js');
const extras = source('geelooy/heichelos/heichel/modules/ui/blueprints/layout-extras.js');
const postReady = source('geelooy/heichelos/heichel/modules/app/post-ready-experience.js');

/** Proves the parser sees only the tiny Heichel boot gate, never the full graph. */
test('Heichel HTML keeps the large application outside parser-critical startup', () => {
	assert.match(template, /critical-boot\.js\?v=critical-path-002/);
	assert.doesNotMatch(template, /bootBridge\.js/);
	assert.doesNotMatch(template, /heichel\/app\.js/);
	assert.doesNotMatch(template, /social\/shell\/boot\.js/);
	assert.doesNotMatch(template, /modules\/cosmic\/boot\.js/);
});
/** Proves hydration waits for first light and uses one compact core graph. */
test('critical boot delays and bounds interactive hydration', () => {
	assert.match(boot, /window\.addEventListener\('load', scheduleHydration/);
	assert.match(boot, /requestIdleCallback/);
	assert.match(boot, /HYDRATION_DELAY_MS/);
	assert.match(boot, /ikar-first\.js\?v=ikar-first-002&compact=true/);
	assert.match(boot, /return isIkarRoute\(\) \? IKAR_SOURCE : APP_SOURCE/);
	assert.match(boot, /await module\.boot\(\)/);
	assert.match(boot, /if \(!isIkarRoute\(\)\) schedulePostReady\(\)/);
});

/** Proves optional Mail cannot request its document until explicit user intent. */
test('Mini Mail remains network-silent during Torah boot', () => {
	assert.match(extras, /src: 'about:blank'/);
	assert.match(extras, /'data-mail-src': '\/email\?embedded=1'/);
	assert.doesNotMatch(extras, /src: '\/email\?embedded=1'/);
});

/** Proves Ikar enhancement stays dependency-free and filters server-rendered links. */
test('Ikar uses one tiny native progressive enhancer', () => {
	assert.doesNotMatch(ikarFirst, /^import\s/m);
	assert.match(ikarFirst, /data-heichel-semantic-fallback/);
	assert.match(ikarFirst, /normalize\('NFD'\)/);
	assert.match(ikarFirst, /item\.hidden = !matches/);
});

/** Proves heavy atmosphere and shell systems live beyond first-ready Torah. */
test('optional systems remain in the post-ready module', () => {
	assert.match(postReady, /social\/shell\/boot\.js/);
	assert.match(postReady, /SocialExperienceInstaller\.js/);
	assert.match(postReady, /cosmic\/boot\.js/);
	assert.match(postReady, /visual-health\.js/);
});
/** Proves the Torah library never pays for ambient social or WebGL after readiness. */
test('Ikar remains Torah-first after core hydration', () => {
	assert.match(postReady, /pathname === '\/heichelos\/ikar'/);
	assert.match(postReady, /pathname\.startsWith\('\/heichelos\/ikar\/'\)/);
	assert.match(postReady, /heichelExperience = 'torah-first'/);
});