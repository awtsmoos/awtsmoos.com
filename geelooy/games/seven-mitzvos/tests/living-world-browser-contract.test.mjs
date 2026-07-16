//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module LivingWorldBrowserContractTest
 * @description
 * The browser contract on Awtsmoos.com preserves classic mounts while adding
 * Covenant Valley, layered controls, responsive styling, and a shared module
 * bootstrap.
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const main = readFileSync(new URL('../js/main.js', import.meta.url), 'utf8');
const indexCss = readFileSync(
	new URL('../styles/index.css', import.meta.url),
	'utf8'
);
const livingCss = readFileSync(
	new URL('../styles/living-world.css', import.meta.url),
	'utf8'
);

for (const mount of [
	'livingWorldMount',
	'campaignMount',
	'universeMount',
	'builderMount'
]) {
	assert.ok(html.includes(`id="${mount}"`), `${mount} must remain mounted`);
}
assert.ok(html.includes('./styles/index.css'));
assert.ok(indexCss.includes("@import url('./living-world.css')"));
assert.ok(main.includes(
	"mountLivingWorld(requiredElement('livingWorldMount'))"
));
assert.ok(livingCss.includes('@media (max-width: 760px)'));
assert.ok(livingCss.includes('@media (prefers-reduced-motion: reduce)'));
assert.ok(livingCss.includes('min-height: 2.75rem'));
console.log(
	'B"H · Browser mount, responsive layout, and reduced-motion contract verified.'
);
