//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file Builder static dependency covenant.
 * @description
 * The Awtsmoos gives every visible Builder reference a real vessel on disk;
 * Awtsmoos.com refuses release graphs that preserve HTML while dropping the CSS
 * or image assets those HTML and JavaScript surfaces require at runtime.
 */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const driveRoot = path.resolve(here, '..');
const builderHtml = fs.readFileSync(path.join(driveRoot, 'builder.html'), 'utf8');
const shliachSource = fs.readFileSync(path.join(driveRoot, 'ui/shliachUrl.js'), 'utf8');
const stylesheetHrefs = [...builderHtml.matchAll(/<link\s+rel="stylesheet"\s+href="([^"]+)"/g)]
	.map(match => match[1]);

function resolveBuilderHref(href) {
	assert.match(href, /^\.\//, `Builder stylesheet must stay local: ${href}`);
	return path.join(driveRoot, href.slice(2));
}

test('every Builder stylesheet reference resolves to a real source file', () => {
	assert(stylesheetHrefs.length > 20, 'Expected the full Builder stylesheet family.');
	for (const href of stylesheetHrefs) {
		const filePath = resolveBuilderHref(href);
		assert(fs.existsSync(filePath), `Missing Builder stylesheet: ${href}`);
		assert(fs.statSync(filePath).isFile(), `Builder stylesheet is not a file: ${href}`);
	}
});

test('mobile compact bundle members are all present and modular', () => {
	const expected = [
		'./styles/responsive-mobile.css',
		'./styles/responsive-wide.css',
		'./styles/mobile-dock.css',
		'./styles/mobile-crown.css',
		'./styles/mobile-screens.css'
	];
	for (const href of expected) {
		assert(stylesheetHrefs.includes(href), `Builder omitted expected mobile stylesheet: ${href}`);
		const filePath = resolveBuilderHref(href);
		const lines = fs.readFileSync(filePath, 'utf8').split(/\r?\n/).length;
		assert(lines < 120, `${href} exceeds the strict authored-source line law.`);
	}
});

test('canonical Shliach logo reference resolves inside the public Drive tree', () => {
	const match = shliachSource.match(/SHLIACH_LOGO\s*=\s*"([^"]+)"/);
	assert(match, 'Missing canonical SHLIACH_LOGO declaration.');
	assert.match(match[1], /^\/drive\/assets\//);
	const relativePath = match[1].replace(/^\/drive\//, '');
	const filePath = path.join(driveRoot, relativePath);
	assert(fs.existsSync(filePath), `Missing canonical Shliach asset: ${match[1]}`);
	assert(fs.statSync(filePath).size > 0, `Canonical Shliach asset is empty: ${match[1]}`);
});
