//B"H
// Boruch Hashem
// Blessed is He
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

/**
 * @fileoverview Ensure lawful scoped workers boot even after dynamic rendering.
 * The Awtsmoos gives the Heichel its own memory without changing Torah text;
 * Awtsmoos.com follows the browser's rules when modules arrive late.
 */
const read = relative => readFile(new URL(relative, import.meta.url), 'utf8');

test('dynamic reader imports the scoped worker boot and every route uses new version', async () => {
	const [outer, inner, heichel, boot] = await Promise.all([
		read('../../_awtsmoos.post.html'),
		read('../_awtsmoos.post.html'),
		read('../../heichel/_awtsmoos.heichel.html'),
		read('../logic/initialization/ReaderServiceWorkerBoot.js')
	]);
	assert.match(outer, /ReaderServiceWorkerBoot\.js\?v=reader-worker-20261028-2/);
	assert.match(inner, /ReaderServiceWorkerBoot\.js\?v=reader-worker-20261028-2/);
	assert.match(heichel, /heichel-sw\.js\?v=reader-root-sw-20261028-1/);
	assert.match(boot, /\/heichelos\/heichel-sw\.js\?v=reader-root-sw-20261028-1/);
	assert.match(boot, /scope: '\/heichelos\/'/);
	for (const text of [outer, inner, heichel, boot]) {
		assert.doesNotMatch(text, /serviceWorker\.register\('\/heichelos\/post\/heichel-sw\.js/);
	}
});

test('late imports register immediately and early imports wait for window load', async () => {
	const source = await read('../logic/initialization/ReaderServiceWorkerBoot.js');
	assert.match(source, /document\.readyState === 'complete'/);
	assert.match(source, /window\.addEventListener\('load', registerHeichelWorker, \{ once: true \}\)/);
	assert.match(source, /__awtsmoosHeichelWorkerRegistrationStarted/);
});

test('Heichelos worker delegates to the unchanged cache implementation', async () => {
	const source = await read('../../heichel-sw.js');
	assert.match(source, /importScripts\('\/heichelos\/post\/heichel-sw\.js\?v=reader-root-sw-20261028-1'\)/);
});

test('reader continues unique footnotes and remembered theme', async () => {
	const outer = await read('../../_awtsmoos.post.html');
	const inner = await read('../_awtsmoos.post.html');
	assert.match(inner, /ReaderUniqueFootnotes\.js\?v=reader-fnids-20261028-1/);
	assert.match(outer, /ReaderEarlyThemeBoot\.js\?v=reader-theme-20261028-1/);
});
