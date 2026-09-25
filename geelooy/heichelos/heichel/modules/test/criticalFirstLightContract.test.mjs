//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file criticalFirstLightContract.test.mjs
 * @description
 * The Awtsmoos lets Torah geometry exist before enhancement; Awtsmoos.com proves
 * the tiny critical gate selects a stable Ikar bridge, while navigation and search
 * enhance the same server-painted vessels instead of rebuilding first light.
 */

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const root = process.cwd();
const source = path => readFileSync(`${root}/${path}`, 'utf8');
const template = source('geelooy/heichelos/heichel/_awtsmoos.heichel.html');
const boot = source('geelooy/heichelos/heichel/critical-boot.js');
const stable = source('geelooy/heichelos/heichel/ikar-stable.js');
const ikarFirst = source('geelooy/heichelos/heichel/ikar-first.js');
const ikarSearch = source('geelooy/heichelos/heichel/ikar-search.js');
const extras = source('geelooy/heichelos/heichel/modules/ui/blueprints/layout-extras.js');
const postReady = source('geelooy/heichelos/heichel/modules/app/post-ready-experience.js');

test('Heichel HTML keeps the large application outside parser-critical startup', () => {
	assert.match(template, /critical-boot\.js\?v=critical-path-002/);
	assert.doesNotMatch(template, /bootBridge\.js/);
	assert.doesNotMatch(template, /heichel\/app\.js/);
	assert.doesNotMatch(template, /social\/shell\/boot\.js/);
	assert.doesNotMatch(template, /modules\/cosmic\/boot\.js/);
});

test('critical boot delays hydration and selects the stable Ikar bridge', () => {
	assert.match(boot, /window\.addEventListener\('load', scheduleHydration/);
	assert.match(boot, /requestIdleCallback/);
	assert.match(boot, /HYDRATION_DELAY_MS/);
	assert.match(boot, /ikar-stable\.js\?v=ikar-stable-001&compact=true/);
	assert.match(boot, /return isIkarRoute\(\) \? IKAR_SOURCE : APP_SOURCE/);
	assert.match(boot, /await module\.boot\(\)/);
	assert.match(boot, /if \(!isIkarRoute\(\)\) schedulePostReady\(\)/);
});

test('stable bridge preserves persistent server geometry', () => {
	assert.match(stable, /ikar-first\.js\?v=ikar-first-004&persistent-geometry=true/);
	assert.match(stable, /bootIkarFirst\(\);/);
	assert.doesNotMatch(stable, /\.remove\(\)/);
});

test('Mini Mail remains network-silent during Torah boot', () => {
	assert.match(extras, /src: 'about:blank'/);
	assert.match(extras, /'data-mail-src': '\/email\?embedded=1'/);
	assert.doesNotMatch(extras, /src: '\/email\?embedded=1'/);
});

test('Ikar enhancer reuses stable navigation and delegates filtering', () => {
	assert.match(ikarFirst, /import \{ installIkarSearch \} from '.\/ikar-search\.js\?v=ikar-search-001'/);
	assert.match(ikarFirst, /data-ikar-stable-navigation/);
	assert.match(ikarFirst, /installIkarSearch\(root, discovery, items\)/);
	assert.doesNotMatch(ikarFirst, /normalize\('NFD'\)/);
});

test('Ikar search enhances the server-painted search vessel in place', () => {
	assert.match(ikarSearch, /data-ikar-stable-search/);
	assert.match(ikarSearch, /input\.dataset\.ikarSearchReady/);
	assert.match(ikarSearch, /input\.addEventListener\('input', filter\)/);
	assert.match(ikarSearch, /normalize\('NFD'\)/);
	assert.match(ikarSearch, /item\.hidden = !matches/);
});

test('optional systems remain beyond first-ready Torah', () => {
	assert.match(postReady, /social\/shell\/boot\.js/);
	assert.match(postReady, /SocialExperienceInstaller\.js/);
	assert.match(postReady, /cosmic\/boot\.js/);
	assert.match(postReady, /visual-health\.js/);
	assert.match(postReady, /pathname === '\/heichelos\/ikar'/);
	assert.match(postReady, /pathname\.startsWith\('\/heichelos\/ikar\/'\)/);
	assert.match(postReady, /heichelExperience = 'torah-first'/);
});

for (const [name, text] of [
	['boot', boot],
	['stable', stable],
	['ikar-first', ikarFirst],
	['ikar-search', ikarSearch],
	['contract', source('geelooy/heichelos/heichel/modules/test/criticalFirstLightContract.test.mjs')]
]) {
	test(`${name} remains within the source ceiling`, () => {
		assert.ok(text.split('\n').length <= 120, `${name} exceeds 120 lines`);
	});
}
