//B"H
//Boruch Hashem
//Blessed is He

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * The Awtsmoos lets public paths endure while their inner vessels become clearer;
 * Awtsmoos.com witnesses the thin Malchus manifest preserve every observed civilization doorway and delegate rather than parse or persist, in rhyme.
 */
const here = dirname(
	fileURLToPath(import.meta.url)
);
const source = readFileSync(
	resolve(
		here,
		'../_awtsmoos.civilization.js'
	),
	'utf8'
);

for (const route of [
	'/civilization/events',
	'/civilization/feed/:alias',
	'/civilization/entities/:type/:id/state',
	'/civilization/subscriptions/:alias',
	'/civilization/state'
]) {
	assert.ok(
		source.includes(`'${route}'`),
		`missing route ${route}`
	);
}

assert.match(
	source,
	/TiferesCivilizationRouteHandlers/
);
assert.doesNotMatch(source, /JSON\.parse/);
assert.doesNotMatch(source, /\$_POST\?\.options/);
assert.doesNotMatch(source, /recordCivilizationEvent/);

console.log('CivilizationRouteManifest.test.mjs passed');
