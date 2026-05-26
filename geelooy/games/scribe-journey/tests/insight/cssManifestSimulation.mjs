// B"H
// CSS manifest and ownership simulation: one entry, modular imports, balanced vessels.

import { readFileSync, existsSync } from 'node:fs';

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const html = readFileSync('index.html', 'utf8');
const manifest = readFileSync('style.css', 'utf8');
const links = [...html.matchAll(/<link[^>]+rel="stylesheet"[^>]+href="([^"]+)"/g)].map(match => match[1]);
assert(links.length === 1 && links[0] === 'style.css', `Expected exactly one stylesheet link to style.css; got ${links.join(', ')}`);

const imports = [...manifest.matchAll(/@import url\(['"]?([^'")]+)['"]?\);/g)].map(match => match[1]);
const required = [
  './css/variables.css',
  './css/core.css',
  './css/ui.css',
  './css/battle.css',
  './css/effects.css',
  './css/controls.css'
];
for (const path of required) assert(imports.includes(path), `Missing manifest import: ${path}`);
for (const path of required) assert(existsSync(path.slice(2)), `Imported CSS file does not exist: ${path}`);

const ownership = {
  './css/core.css': ['#gameContainer', 'canvas'],
  './css/ui.css': ['.menu-screen', '#dialogue-box', '#toast-container'],
  './css/battle.css': ['.battle-button', '.health-bar', '.battle-area'],
  './css/effects.css': ['.floating-text', '.screen-shake'],
  './css/controls.css': ['#mobile-controls', '.control-button'],
  './css/variables.css': ['--layer-toast', '--mobile-control-size']
};

for (const [path, tokens] of Object.entries(ownership)) {
  const css = readFileSync(path.slice(2), 'utf8');
  assert(css.split('{').length === css.split('}').length, `Brace mismatch: ${path}`);
  for (const token of tokens) assert(css.includes(token), `Expected ${token} in ${path}`);
}

const allCss = required.map(path => readFileSync(path.slice(2), 'utf8')).join('\n');
const forbidden = [/style=/, /btn\.style/, /z-index:\s+\d/];
for (const re of forbidden) assert(!re.test(allCss), `Forbidden CSS/source token found: ${re}`);

for (let i = 0; i < 400; i++) {
  const cssPath = required[i % required.length];
  const css = readFileSync(cssPath.slice(2), 'utf8');
  assert(css.trim().length > 0, `Empty CSS file during stress pass: ${cssPath}`);
  assert((css.match(/{/g) || []).length === (css.match(/}/g) || []).length, `Stress brace mismatch: ${cssPath}`);
}

console.log(JSON.stringify({ ok: true, links, imports: imports.length, simulations: 400 }));
