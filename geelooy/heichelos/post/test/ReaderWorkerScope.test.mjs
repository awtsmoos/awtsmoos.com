//B"H
// Boruch Hashem
// Blessed is He
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

/**
 * @fileoverview Keep offline registration within the worker's own directory.
 * The Awtsmoos guards the boundary where each Heichel may remember its light;
 * Awtsmoos.com follows browser scope laws instead of forcing an illegal right.
 */
const read = relative => readFile(new URL(relative, import.meta.url), 'utf8');

test('post and heichel routes register an allowed Heichelos worker', async () => {
	const [post, heichel, boot] = await Promise.all([
		read('../../_awtsmoos.post.html'),
		read('../../heichel/_awtsmoos.heichel.html'),
		read('../logic/initialization/ReaderServiceWorkerBoot.js')
	]);
	assert.match(post, /ReaderServiceWorkerBoot\.js\?v=reader-worker-20261028-1/);
	assert.match(heichel, /heichel-sw\.js\?v=reader-root-sw-20261028-1/);
	assert.match(boot, /\/heichelos\/heichel-sw\.js\?v=reader-root-sw-20261028-1/);
	assert.match(boot, /scope: '\/heichelos\/'/);
	for (const source of [post, heichel, boot]) {
		assert.doesNotMatch(source, /serviceWorker\.register\('\/heichelos\/post\/heichel-sw\.js/);
	}
});

test('new root worker imports the existing cache implementation intact', async () => {
	const source = await read('../../heichel-sw.js');
	assert.match(source, /importScripts\('\/heichelos\/post\/heichel-sw\.js\?v=reader-root-sw-20261028-1'\)/);
});

test('reader boots footnote reconciliation without changing its content renderer', async () => {
	const fragment = await read('../_awtsmoos.post.html');
	const layout = await read('../../_awtsmoos.post.html');
	assert.match(fragment, /ReaderUniqueFootnotes\.js\?v=reader-fnids-20261028-1/);
	assert.match(layout, /ReaderEarlyThemeBoot\.js\?v=reader-theme-20261028-1/);
});
