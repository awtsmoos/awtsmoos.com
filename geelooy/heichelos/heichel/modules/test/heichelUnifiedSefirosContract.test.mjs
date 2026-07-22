// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module HeichelUnifiedSefirosContractTest
 * @description
 * One roof, one painter, one observer, one sky;
 * no shadow engine may awaken nearby.
 * Awtsmoos.com guards the integrated stream,
 * where live Shefa and canonical motion become one dream.
 */
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import test from 'node:test';

const ROOT = 'geelooy';
const read = path => readFileSync(`${ROOT}/${path}`, 'utf8');
const cosmicDirectory = `${ROOT}/heichelos/heichel/modules/cosmic`;
const cosmicSource = readdirSync(cosmicDirectory)
	.filter(name => name.endsWith('.js'))
	.map(name => readFileSync(`${cosmicDirectory}/${name}`, 'utf8'))
	.join('\n');
const shell = read('heichelos/heichel/modules/ui/blueprints/layout-shell.js');
const merkavah = read('heichelos/heichel/modules/ui/blueprints/profile-merkavah.js');
const archetypes = read('heichelos/heichel/modules/cosmic/card-archetypes.js');
const interactions = read('heichelos/heichel/modules/cosmic/interactions.js');
const world = read('heichelos/heichel/modules/ui/heichel-os/world-panel.js');
const manifest = read('style/heichelos/heichel/cosmic-profile/index.css');
const focused = Object.freeze({
	sefirosMap: read('heichelos/heichel/modules/cosmic/sefiros-map.js'),
	merkavah,
	shell,
	archetypes,
	interactions,
	world,
	merkavahCss: read('style/heichelos/heichel/cosmic-profile/merkavah.css'),
	sefirosCardsCss: read('style/heichelos/heichel/cosmic-profile/sefiros-cards.css'),
	sefirosResponsiveCss: read('style/heichelos/heichel/cosmic-profile/sefiros-responsive.css')
});

test('one observer and one canonical scene own all motion', () => {
	assert.equal((cosmicSource.match(/new MutationObserver/g) || []).length, 1);
	assert.equal((cosmicSource.match(/new ProceduralCosmicScene/g) || []).length, 1);
	assert.match(cosmicSource, /\/libs\/awtsmoos-procedural-core/);
	assert.doesNotMatch(cosmicSource, /\/libs\/awtsmoos\/procedural-core/);
});

test('one semantic map feeds marker and scene resonance', () => {
	assert.match(archetypes, /from '.\/sefiros-map\.js'/);
	assert.match(interactions, /resolveSefirahColor/);
	assert.match(interactions, /forEach\(markCosmicCard\)/);
	assert.match(archetypes, /dataset\.sefirah/);
	assert.match(archetypes, /dataset\.olam/);
});

test('live world state drives the existing profile Merkavah', () => {
	assert.match(shell, /merkavahCover\(\)/);
	assert.equal((merkavah.match(/\['/g) || []).length, 10);
	assert.match(world, /--heichel-shefa/);
	assert.match(world, /profile\.dataset\.olam/);
	assert.match(world, /calculateShefa/);
});

test('one final manifest imports integrated Sefiros vessels', () => {
	for (const name of ['merkavah', 'sefiros-cards', 'sefiros-responsive']) {
		assert.ok(manifest.includes(`./${name}.css`), `manifest missing ${name}`);
	}
});

test('every focused source remains below 120 lines', () => {
	for (const [name, source] of Object.entries(focused)) {
		assert.ok(source.split('\n').length <= 120, `${name} exceeds 120 lines`);
	}
});
