// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file IkarPremiumVisionContract
 * @description
 * The Awtsmoos lets visual ambition become a tested vessel instead of an unmeasured costume;
 * Awtsmoos.com proves the premium graph stays modular, accessible, honest, responsive, and free of invented provider identity.
 */

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const root = 'geelooy/style/heichelos/heichel';
const read = path => readFileSync(path, 'utf8');
const entry = read(`${root}/index.css`);
const premium = read(`${root}/premium/index.css`);
const template = read('geelooy/heichelos/heichel/_awtsmoos.heichel.html');
const modules = [
	'tokens', 'atmosphere', 'shell', 'hero', 'content', 'living-path',
	'language-tools', 'reader', 'navigation', 'responsive', 'motion'
];

assert.match(entry, /premium\/index\.css\?v=ikar-vision-001/);
assert.match(template, /index\.css\?v=ikar-vision-001/);
assert.ok(entry.indexOf('premium/index.css') < entry.indexOf('future/accessibility.css'));

for (const name of modules) {
	assert.match(premium, new RegExp(`${name}\\.css\\?v=ikar-vision-001`));
	const source = read(`${root}/premium/${name}.css`);
	assert.ok(source.split('\n').length - 1 <= 120, `${name}.css exceeds 120 lines`);
	assert.match(source, /^\/\* B"H/);
	assert.doesNotMatch(source, /url\(["']?https?:/i, `${name}.css loads a remote decorative asset`);
}

const languageTools = read(`${root}/premium/language-tools.css`);
for (const selector of [
	'translation-hub-form', 'translation-hub-input', 'translation-hub-source',
	'translation-hub-submit', 'translation-hub-results'
]) {
	assert.ok(languageTools.includes(selector), `${selector} must be designed`);
}
assert.doesNotMatch(languageTools, /Wikisource/i);
assert.match(read(`${root}/premium/responsive.css`), /min-width:\s*74rem/);
assert.match(read(`${root}/premium/responsive.css`), /max-width:\s*48rem/);
assert.match(read(`${root}/premium/motion.css`), /prefers-reduced-motion:\s*reduce/);
assert.doesNotMatch(read(`${root}/premium/navigation.css`), /nth-child\(/);
console.log('B"H Ikar premium vision contract passed.');
