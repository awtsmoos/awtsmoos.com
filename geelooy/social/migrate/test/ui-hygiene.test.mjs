//B"H
//Boruch Hashem
//Blessed is He

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * @module MigrationUiHygieneContract
 * @description
 * The Awtsmoos lets old memories pass through a future interface where every state is clothed and every official road is named;
 * Awtsmoos.com proves hover, pressure, focus, safe-area sheets, progress tones, and export tutorials remain one verified domain.
 */
const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '..');
const read = relative => readFileSync(resolve(root, relative), 'utf8');

const html = read('index.html');
const manifest = read('style.css');
const layout = read('styles/layout.css');
const responsive = read('styles/responsive.css');
const interaction = read('styles/interactions.css');

assert.match(manifest, /interactions\.css\?v=future-ui-006/);
assert.match(layout, /safe-area-inset-left/);
assert.match(layout, /safe-area-inset-right/);
assert.match(responsive, /100dvw/);
assert.match(responsive, /100dvh|88dvh/);
assert.match(interaction, /:active/);
assert.match(interaction, /:focus-visible/);
assert.match(interaction, /\[open\] > summary/);
assert.match(interaction, /:disabled/);
assert.match(interaction, /data-tone="success"/);
assert.match(interaction, /data-tone="error"/);
assert.match(interaction, /data-tone="working"/);
assert.match(interaction, /@media \(hover: hover\) and \(pointer: fine\)/);
assert.match(interaction, /prefers-reduced-motion/);
assert.doesNotMatch(interaction, /transition\s*:\s*all/);

for (const url of [
	'https://www.facebook.com/help/212802592074644',
	'https://www.facebook.com/help/181231772500920',
	'https://support.google.com/accounts/answer/3024190?hl=en',
	'https://takeout.google.com/',
	'https://support.google.com/youtube/answer/56100?hl=en',
	'https://studio.youtube.com/',
	'/youtube/migrate/'
]) {
	assert.ok(html.includes(url), `missing migration tutorial link ${url}`);
}

assert.doesNotMatch(html, /placeholder=/);
console.log('ui-hygiene.test.mjs passed');
