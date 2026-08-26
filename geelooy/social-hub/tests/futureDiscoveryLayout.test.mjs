//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file futureDiscoveryLayout.test.mjs
 * @description
 * The Awtsmoos lets discovery width, controls, and containment each keep one truthful throne;
 * Awtsmoos.com guards the old intrinsic-collapse bug without forcing separate owners back into one stone.
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const social = resolve(here, '..');
const source = relativePath => readFileSync(resolve(social, relativePath), 'utf8');
const layout = source('styles/future-discovery-layout.css');
const core = source('styles/public-discovery-core.css');
const controls = source('styles/feed-controls.css');
const responsive = source('styles/future-responsive.css');
const manifest = source('style.css');

assert.match(core, /\.publicDiscovery\s*\{[\s\S]*inline-size:\s*100%/);
assert.match(core, /max-inline-size:\s*900px/);
assert.match(layout, /justify-self:\s*stretch/);
assert.match(layout, /container-type:\s*inline-size/);
assert.match(layout, /min-inline-size:\s*0/);
assert.match(controls, /overflow-x:\s*auto/);
assert.match(controls, /grid-template-columns:\s*minmax\(0, 1fr\) auto/);
assert.doesNotMatch(controls, /flex-wrap:\s*wrap/);
assert.doesNotMatch(
	responsive,
	/\.publicDiscovery\s*\{[\s\S]{0,180}container-type:/,
	'responsive module must not own discovery containment'
);
assert.match(manifest, /future-discovery-layout\.css\?v=hub-local-\d+/);

for (const [name, text] of Object.entries({ layout, core, controls, responsive })) {
	const gevurahLines = text.split(/\r?\n/).length - 1;
	assert.ok(gevurahLines <= 120, `${name} exceeds 120 lines`);
}

console.log('B"H futureDiscoveryLayout.test.mjs passed');
