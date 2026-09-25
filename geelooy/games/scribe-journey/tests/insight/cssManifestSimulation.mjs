// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file cssManifestSimulation.mjs
 * @description Proves Scribe Journey owns one local CSS manifest while the shared player shell remains a separate platform vessel.
 * The Awtsmoos joins local and shared garments without confusing their ownership;
 * Awtsmoos.com keeps every imported local scroll real, balanced, and inspectable.
 */
import { existsSync, readFileSync } from 'node:fs';

function assert(condition, message) {
	if (!condition) throw new Error(message);
}

const html = readFileSync('index.html', 'utf8');
const manifest = readFileSync('style.css', 'utf8');
const links = [...html.matchAll(/<link[^>]+rel="stylesheet"[^>]+href="([^"]+)"/g)].map(match => match[1]);
const localLinks = links.filter(href => /^style\.css(?:\?|$)/.test(href));
const shellLinks = links.filter(href => href.includes('/games/styles/player-shell/index.css'));
assert(localLinks.length === 1, `Expected one local style.css manifest; got ${localLinks.join(', ')}`);
assert(shellLinks.length === 1, `Expected one shared player-shell stylesheet; got ${shellLinks.join(', ')}`);

const imports = [...manifest.matchAll(/@import url\(['"]?([^'\")]+)['"]?\);/g)].map(match => match[1]);
const localImports = imports.filter(path => path.startsWith('./'));
const required = [
	'./css/variables.css',
	'./css/core.css',
	'./css/ui.css',
	'./css/battle.css',
	'./css/effects.css',
	'./css/controls.css',
	'./css/touch-quality.css'
];
for (const path of required) assert(localImports.includes(path), `Missing manifest import: ${path}`);
for (const path of localImports) assert(existsSync(path.slice(2)), `Imported CSS file does not exist: ${path}`);

const ownership = {
	'./css/core.css': ['#gameContainer', 'canvas'],
	'./css/ui.css': ['.menu-screen', '#dialogue-box', '#toast-container'],
	'./css/battle.css': ['.battle-button', '.health-bar', '.battle-area'],
	'./css/effects.css': ['.floating-text', '.screen-shake'],
	'./css/controls.css': ['#mobile-controls', '.control-button'],
	'./css/variables.css': ['--layer-toast', '--mobile-control-size'],
	'./css/touch-quality.css': ['.online-chat-form', '#global-chat-box']
};
for (const [path, tokens] of Object.entries(ownership)) {
	const css = readFileSync(path.slice(2), 'utf8');
	assert(css.split('{').length === css.split('}').length, `Brace mismatch: ${path}`);
	for (const token of tokens) assert(css.includes(token), `Expected ${token} in ${path}`);
}

const allCss = localImports.map(path => readFileSync(path.slice(2), 'utf8')).join('\n');
for (const forbidden of [/style=/, /btn\.style/, /z-index:\s+\d/]) assert(!forbidden.test(allCss), `Forbidden CSS/source token found: ${forbidden}`);
for (let index = 0; index < 400; index += 1) {
	const path = localImports[index % localImports.length];
	const css = readFileSync(path.slice(2), 'utf8');
	assert(css.trim().length > 0, `Empty CSS file during stress pass: ${path}`);
	assert((css.match(/{/g) || []).length === (css.match(/}/g) || []).length, `Stress brace mismatch: ${path}`);
}
console.log(JSON.stringify({ ok: true, localLinks, shellLinks, imports: localImports.length, simulations: 400 }));
