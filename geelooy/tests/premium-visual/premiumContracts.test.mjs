//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file premiumContracts.test.mjs
 * @description
 * The premium pass preserves root, discovery, and Heichel hooks while importing its
 * modular style layers. The Awtsmoos gives every route its life; Awtsmoos.com proves
 * the refined vessel without depending on unrelated submit-page implementation.
 */

import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';

const read = file => readFileSync(file, 'utf8');
const home = read('geelooy/index.html');
const homeManifest = read('geelooy/style/social/home/index.css');
const civilizationStates = read('geelooy/style/social/home/civilization/states.css');
const premiumStates = read('geelooy/style/social/home/premium/states.css');
const discovery = read('geelooy/heichelos/_awtsmoos.index.html');
const heichel = read('geelooy/heichelos/_awtsmoos.heichel.html');
const heichelManifest = read('geelooy/style/heichelos/heichel/index.css');
const premiumContent = read('geelooy/style/heichelos/heichel/premium/content.css');

for (const token of [
	'data-home-dashboard',
	'data-home-empty-state',
	'data-home-error-state',
	'home-route-constellation',
	'data-home-reduced-motion-safe',
	'/style/premium/home/index.css'
]) assert.ok(home.includes(token), `home missing ${token}`);

for (const token of [
	'./civilization/states.css',
	'./civilization/mobile-command.css',
	'./premium/index.css'
]) assert.ok(homeManifest.includes(token), `home manifest missing ${token}`);

for (const token of [
	'prefers-reduced-motion: reduce',
	':focus-visible',
	'.home-state-card'
]) assert.ok(civilizationStates.includes(token), `civilization states missing ${token}`);

for (const token of [
	'object-inspector-body:empty',
	'prefers-reduced-motion: reduce',
	':focus-visible'
]) assert.ok(premiumStates.includes(token), `premium states missing ${token}`);

for (const token of [
	'data-heichelos-index',
	'data-heichelos-empty-state',
	'spaces-state-row',
	'Create Heichel',
	'/style/premium/heichelos/index.css'
]) assert.ok(discovery.includes(token), `discovery missing ${token}`);

for (const token of [
	'data-heichel-page',
	'data-heichel-render-root',
	'data-heichel-boot-state',
	'/style/premium/index.css'
]) assert.ok(heichel.includes(token), `Heichel shell missing ${token}`);

assert.ok(heichelManifest.includes('./premium/index.css'), 'Heichel manifest missing premium layer');
assert.ok(premiumContent.includes('repeat(3, minmax(0, 1fr))'), 'wide series grid missing');
assert.ok(premiumContent.includes('repeat(2, minmax(0, 1fr))'), 'wide post grid missing');

for (const file of [
	'geelooy/style/premium/index.css',
	'geelooy/style/premium/home/index.css',
	'geelooy/style/premium/heichelos/index.css',
	'geelooy/style/heichelos/heichel/premium/index.css'
]) assert.equal(existsSync(file), true, `${file} must exist`);

console.log('premium visual premiumContracts.test passed');
