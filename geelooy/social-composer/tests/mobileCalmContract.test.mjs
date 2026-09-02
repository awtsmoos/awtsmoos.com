//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos lets creation remain visible while Awtsmoos.com gathers secondary controls behind a quiet veil;
 * this contract proves one compact publishing path survives on mobile without fixed tool layers covering the tale.
 */
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const sources = {
	actions: new URL('../js/civilization/actionHierarchy.js', import.meta.url),
	manifest: new URL('../style.css', import.meta.url),
	calm: new URL('../styles/mobile-calm.css', import.meta.url),
	bar: new URL('../styles/mobile-calm-actions.css', import.meta.url),
	tools: new URL('../styles/mobile-calm-tools.css', import.meta.url),
	surface: new URL('../styles/mobile-calm-surface.css', import.meta.url)
};

const entries = await Promise.all(
	Object.entries(sources).map(async ([name, url]) => [name, await readFile(url, 'utf8')])
);
const source = Object.fromEntries(entries);

for (const id of ['saveLocalButton', 'saveServerButton', 'clearDraftButton']) {
	assert.match(source.actions, new RegExp(`'${id}'`), `${id} must live behind More`);
}
assert.match(source.actions, /insertBefore\(disclosure, publishButton \|\| null\)/);
assert.match(source.manifest, /mobile-calm\.css\?v=mobile-calm-001/);
assert.equal(
	source.manifest.trimEnd().split('\n').at(-1),
	'@import url("./styles/mobile-calm.css?v=mobile-calm-001");',
	'mobile calm must own the final cascade'
);
assert.match(source.bar, /grid-template-columns: auto minmax\(0, 1fr\)/);
assert.match(source.bar, /#previewButton[\s\S]*display: none !important/);
assert.match(source.tools, /\.creatorDock,[\s\S]*position: static !important/);
assert.match(source.tools, /\.creatorCommandLauncher[\s\S]*display: none !important/);
assert.match(source.surface, /\.majorPanelBody[\s\S]*padding:/);

for (const [name, text] of Object.entries(source)) {
	assert.ok(text.trimEnd().split('\n').length <= 120, `${name} exceeds the 120-line vessel`);
}

console.log('B"H social composer mobile calm contract verified.');
