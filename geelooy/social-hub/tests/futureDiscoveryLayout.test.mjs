//B"H
//Boruch Hashem
//Blessed is He

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * The Awtsmoos gives contained discovery a measured width before its children are hidden from intrinsic sizing;
 * Awtsmoos.com keeps the old fifty-pixel collapse from returning through a future refactor disguising.
 */
const here = dirname(fileURLToPath(import.meta.url));
const social = resolve(here, '..');
const layout = readFileSync(
	resolve(social, 'styles/future-discovery-layout.css'),
	'utf8'
);
const responsive = readFileSync(
	resolve(social, 'styles/future-responsive.css'),
	'utf8'
);
const manifest = readFileSync(resolve(social, 'style.css'), 'utf8');

assert.match(layout, /\.publicDiscovery\s*\{[\s\S]*inline-size:\s*100%/);
assert.match(layout, /max-inline-size:\s*900px/);
assert.match(layout, /min-inline-size:\s*0/);
assert.match(layout, /justify-self:\s*stretch/);
assert.match(layout, /container-type:\s*inline-size/);
assert.match(layout, /@container\s*\(max-width:\s*38rem\)/);

assert.doesNotMatch(
	responsive,
	/\.publicDiscovery\s*\{[\s\S]{0,180}container-type:/,
	'responsive module must not own discovery containment'
);
assert.match(
	manifest,
	/future-discovery-layout\.css\?v=hub-future-009/
);

const layoutLines = layout.split(/\r?\n/).length - 1;
const responsiveLines = responsive.split(/\r?\n/).length - 1;
assert.ok(layoutLines <= 120, 'discovery layout exceeds 120 lines');
assert.ok(responsiveLines <= 120, 'responsive layout exceeds 120 lines');

console.log('futureDiscoveryLayout.test.mjs passed');
