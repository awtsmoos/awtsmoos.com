//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file premiumContracts.test.mjs
 * @description
 * The historical test path now proves one canonical style architecture and no
 * production dependency on the retired premium branches.
 */

import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';

const read = file => readFileSync(file, 'utf8');
const home = read('geelooy/index.html');
const homeManifest = read('geelooy/style/social/home/index.css');
const discovery = read('geelooy/heichelos/_awtsmoos.index.html');
const discoveryManifest = read('geelooy/style/heichelos/discovery.css');
const heichel = read('geelooy/heichelos/_awtsmoos.heichel.html');
const heichelManifest = read('geelooy/style/heichelos/heichel/index.css');
const profileManifest = read('geelooy/style/social/profile/index.css');
const hubManifest = read('geelooy/social-hub/style.css');
const composerManifest = read('geelooy/social-composer/style.css');
const reviewManifest = read('geelooy/heichel-review/style.css');
const forms = read('geelooy/style/social-system/forms.css');
const performance = read('geelooy/style/geelooy-app/performance/effects.css');

for (const token of [
	'data-home-dashboard',
	'data-home-empty-state',
	'data-home-error-state',
	'home-route-constellation',
	'data-home-reduced-motion-safe',
	'/style/social/home/index.css'
]) assert.ok(home.includes(token), `home missing ${token}`);

assert.ok(homeManifest.includes('./civilization/index.css'), 'home must end with civilization');
assert.equal(homeManifest.includes('./premium/index.css'), false, 'home premium branch must be inactive');

for (const token of [
	'data-heichelos-index',
	'data-heichelos-empty-state',
	'spaces-state-row',
	'/style/heichelos/discovery.css'
]) assert.ok(discovery.includes(token), `discovery missing ${token}`);

for (const token of ['./discovery-layout.css', './discovery-cards.css', './discovery-responsive.css']) {
	assert.ok(discoveryManifest.includes(token), `discovery manifest missing ${token}`);
}

for (const token of ['data-heichel-page', 'data-heichel-render-root', 'data-heichel-boot-state']) {
	assert.ok(heichel.includes(token), `Heichel shell missing ${token}`);
}
assert.equal(heichelManifest.includes('./premium/index.css'), false, 'Heichel premium branch must be inactive');
assert.ok(heichelManifest.includes('./beauty/index.css'), 'Heichel beauty authority missing');

assert.equal(profileManifest.includes('./lux/index.css'), false, 'profile lux branch must be inactive');
assert.ok(profileManifest.includes('./unified.css'), 'profile unified authority missing');

for (const manifest of [hubManifest, composerManifest, reviewManifest]) {
	assert.ok(manifest.includes('/style/social-system/index.css'), 'modern app missing social system');
	assert.ok(manifest.includes('/style/geelooy-app/performance.css'), 'modern app missing performance law');
}

assert.ok(forms.includes('label[for]'), 'designed labels missing');
assert.ok(forms.includes('content: "Required"'), 'required badge missing');
assert.ok(performance.includes('backdrop-filter: none'), 'blur removal missing');

for (const file of [
	'geelooy/style/heichelos/discovery-layout.css',
	'geelooy/style/heichelos/heichel/beauty/shell.css',
	'geelooy/style/social/profile/unified.css'
]) assert.equal(existsSync(file), true, `${file} must exist`);

console.log('unified style premiumContracts.test passed');
