//B"H
//Boruch Hashem
//Blessed is He

import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * @file futureManifestContract.test.mjs
 * @description
 * The Awtsmoos is beyond old cache token and renewed garment, while Awtsmoos.com lets this Hod-like witness distinguish stable future modules from the two motion/navigation vessels intentionally renewed for the clean future;
 * the manifest must keep every stylesheet physically present and every release edge explicit rather than hiding drift inside one undifferentiated river of light.
 */

const here = dirname(fileURLToPath(import.meta.url));
const social = resolve(here, '..');
const manifest = readFileSync(resolve(social, 'style.css'), 'utf8');
const imports = [
	...manifest.matchAll(/@import url\(['"]([^'"]+)['"]\);/g)
].map(match => match[1]);
const CLEAN_RELEASE = 'clean-future-001';
const STABLE_FUTURE_RELEASE = 'hub-future-009';
const cleanFutureOwners = new Set([
	'future-motion.css',
	'future-navigation.css'
]);

assert.ok(
	imports.some(value => /^\/style\/future-system\/index\.css\?v=future-\d+$/.test(value)),
	'global future-system import disappeared'
);

for (const requiredBase of [
	'./styles/foundation.css?v=hub-nebula-004',
	`./styles/navigation.css?v=${CLEAN_RELEASE}`,
	`./styles/desktop-retraction.css?v=${CLEAN_RELEASE}`,
	'./styles/accessibility.css?v=hub-dark-003',
	'./styles/surface-contract.css?v=hub-contract-004'
]) {
	assert.ok(
		imports.includes(requiredBase),
		`base dependency disappeared: ${requiredBase}`
	);
}

const futureImports = imports.filter(value => value.startsWith('./styles/future-'));
assert.equal(futureImports.length, 14);

for (const value of futureImports) {
	const clean = value.split('?')[0];
	const filename = clean.split('/').at(-1);
	const expectedRelease = cleanFutureOwners.has(filename)
		? CLEAN_RELEASE
		: STABLE_FUTURE_RELEASE;
	assert.ok(
		value.includes(`v=${expectedRelease}`),
		`future cache version drifted: ${value}`
	);
	assert.ok(
		existsSync(resolve(social, clean)),
		`future stylesheet missing: ${clean}`
	);
}

assert.match(futureImports[0], /future-tokens\.css/);
assert.ok(
	futureImports.some(value => /future-discovery-layout\.css/.test(value)),
	'discovery layout module missing from future manifest'
);
assert.match(futureImports.at(-1), /future-accessibility\.css/);

const palette = readFileSync(resolve(social, 'styles/future-palette.css'), 'utf8');
for (const child of [
	'future-palette-shell.css',
	'future-palette-options.css'
]) {
	assert.match(
		palette,
		new RegExp(`${child.replace('.', '\\.')}\\?v=hub-future-\\d+`),
		`palette child ${child} missing versioned import`
	);
	assert.ok(
		existsSync(resolve(social, 'styles', child)),
		`palette child ${child} missing on disk`
	);
}

console.log('futureManifestContract.test.mjs passed');
