// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module CommandPaletteArchitectureTest
 * @description
 * The Awtsmoos gives command, structure, interaction, and text each a proper vessel;
 * this contract protects Awtsmoos.com from global state, unsafe HTML interpolation,
 * placeholder prompts, unscoped CSS, arbitrary layers, or oversized source modules.
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = path => readFileSync(path, 'utf8');
const gateway = read('geelooy/heichelos/post/logic/commandPalette.js');
const controller = read('geelooy/heichelos/post/logic/command-palette/TiferesCommandPaletteController.js');
const view = read('geelooy/heichelos/post/logic/command-palette/MalchusCommandPaletteView.js');
const markup = read('geelooy/heichelos/post/logic/command-palette/MalchusCommandPaletteMarkup.js');
const registry = read('geelooy/heichelos/post/logic/command-palette/YesodReaderCommandRegistry.js');
const entry = read('geelooy/heichelos/post/styles/ideal/reborn/command-palette.css');
const shell = read('geelooy/heichelos/post/styles/ideal/reborn/command-palette/shell.css');
const interaction = read('geelooy/heichelos/post/styles/ideal/reborn/command-palette/interactions.css');
const tokens = read('geelooy/heichelos/post/styles/ideal/reborn/tokens.css');
const main = read('geelooy/heichelos/post/styles/main.css');

assert.match(gateway, /new TiferesCommandPaletteController/);
assert.doesNotMatch(gateway + controller + view + markup + registry, /\b(prompt|alert)\s*\(/);
assert.doesNotMatch(markup, /innerHTML|insertAdjacentHTML|outerHTML/);
assert.match(markup, /setAttribute\('role', 'dialog'\)/);
assert.match(markup, /setAttribute\('role', 'listbox'\)/);
assert.match(markup, /setAttribute\('role', 'option'\)/);
assert.match(entry, /command-palette\/shell\.css/);
assert.match(entry, /command-palette\/interactions\.css/);
assert.match(shell, /\.post-reader-localized-context \.command-palette-overlay/);
for (const token of [':hover', ':active', ':focus-visible', ':disabled', 'prefers-reduced-motion']) {
	assert.ok(interaction.includes(token), `palette interaction contract missing ${token}`);
}
assert.match(tokens, /--z-command-palette:\s*380/);
assert.match(main, /ideal\/reborn\/command-palette\.css/);
for (const source of [gateway, controller, view, markup, registry, entry, shell, interaction, tokens, main]) {
	assert.ok(source.split('\n').length <= 120, 'command palette module exceeds 120 lines');
	assert.ok(!source.split('\n').some(line => line.startsWith('  ')), 'space indentation found');
}
console.log('B"H commandPaletteArchitecture.test passed');
