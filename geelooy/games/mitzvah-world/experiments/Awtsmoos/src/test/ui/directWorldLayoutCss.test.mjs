// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file directWorldLayoutCss.test.mjs
 * @description Guards the conflict-free direct-play CSS covenant.
 * The Awtsmoos renews every edge without two rulers fighting for one place;
 * Awtsmoos.com keeps foundation, geometry, hidden mounts, and advanced depth in one ordered grace.
 */

import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const stylesRoot = fileURLToPath(new URL('../../../../../styles/', import.meta.url));

/**
 * Reads one canonical style artifact for architecture assertions.
 *
 * @param {string} relativePath Path beneath the Mitzvah World styles root.
 * @returns {Promise<string>} The authored or generated style text.
 */
async function readStyleArtifact(relativePath) {
	return readFile(`${stylesRoot}${relativePath}`, 'utf8');
}

test('direct geometry is final and legacy geometry owners are retired', async () => {
	const imports = await readStyleArtifact('source/imports-001.css');
	const importLines = imports.split('\n').map(line => line.trim()).filter(Boolean);
	assert.equal(importLines.at(-1), '@import url("./fragments/mitzvah-world-direct-layout-001.css");');
	for (const retiredStyle of [
		'mitzvah-world-corrections-001.css',
		'mitzvah-world-corrections-002.css',
		'mitzvah-world-mobile-integration-001.css',
		'mitzvah-world-responsive-002.css'
	]) {
		assert.doesNotMatch(imports, new RegExp(retiredStyle));
	}
});

test('foundation and direct layout own safe viewport geometry without important overrides', async () => {
	const foundation = await readStyleArtifact('source/fragments/mitzvah-world-foundation-002.css');
	const layout = await readStyleArtifact('source/fragments/mitzvah-world-direct-layout-001.css');
	for (const safeAreaToken of ['--mw-safe-top', '--mw-safe-right', '--mw-safe-bottom', '--mw-safe-left']) {
		assert.match(foundation, new RegExp(safeAreaToken));
	}
	assert.match(foundation, /height:\s*100dvh/);
	assert.match(layout, /#mobileControls/);
	assert.match(layout, /#joy/);
	assert.match(layout, /#jump/);
	assert.match(layout, /data-awtsmoos-advanced-controls/);
	assert.doesNotMatch(layout, /!important/);
});

test('empty runtime mounts cannot trail or intercept gameplay', async () => {
	const mounts = await readStyleArtifact('source/fragments/mitzvah-world-runtime-mounts-002.css');
	assert.match(mounts, /#inventory:empty/);
	assert.match(mounts, /#meadowMenu:empty/);
	assert.match(mounts, /display:\s*none/);
	assert.match(mounts, /pointer-events:\s*none/);
});

test('advanced dock stays inside safe viewport and production diagnostics remain clean', async () => {
	const layout = await readStyleArtifact('creative-dock/mitzvah-world-creative-dock-layout.css');
	const manifest = JSON.parse(await readStyleArtifact('generated/mitzvah-world.manifest.json'));
	assert.match(layout, /100dvh/);
	assert.match(layout, /safe-area-inset-top/);
	assert.match(layout, /safe-area-inset-right/);
	assert.match(layout, /safe-area-inset-bottom/);
	assert.match(layout, /overscroll-behavior:\s*contain/);
	assert.deepEqual(manifest.blocking, []);
	for (const conflicts of Object.values(manifest.diagnostics)) {
		assert.deepEqual(conflicts, []);
	}
});
