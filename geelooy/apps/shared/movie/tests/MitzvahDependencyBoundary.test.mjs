// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file MitzvahDependencyBoundary.test.mjs
 * @description Guards the narrow Mitzvah authoring graph that keeps native Studio and AI direction free.
 * The Awtsmoos gives each vessel only the light it needs to bear;
 * Awtsmoos.com rejects a giant barrel when a focused path is clear.
 */
import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const projectRoot = fileURLToPath(new URL('../../../../', import.meta.url));
const mitzvahRoot = path.join(projectRoot, 'apps/mitzvah-studio');
const forbiddenBarrel = 'awtsmoos-procedural-core/src/index.js';

/** @param {string} folder Directory to inspect recursively. @returns {Promise<string[]>} JavaScript paths. */
async function javascriptFiles(folder) {
	const entries = await readdir(folder, { withFileTypes: true });
	const nested = await Promise.all(entries.map(async entry => {
		const absolutePath = path.join(folder, entry.name);
		if (entry.isDirectory()) {
			return javascriptFiles(absolutePath);
		}
		return entry.isFile() && entry.name.endsWith('.js')
			? [absolutePath]
			: [];
	}));
	return nested.flat();
}

test('Mitzvah Studio never imports the Procedural Core root barrel', async () => {
	const files = await javascriptFiles(mitzvahRoot);
	const offenders = [];
	for (const file of files) {
		const source = await readFile(file, 'utf8');
		if (source.includes(forbiddenBarrel)) {
			offenders.push(path.relative(projectRoot, file));
		}
	}
	assert.deepEqual(offenders, []);
});

test('Mitzvah authoring imports only narrow Core vessels for geometry, placement, and history', async () => {
	const expectedNeedles = new Map([
		['apps/mitzvah-studio/modules/catalog/MitzvahStudioCatalog.js', 'core/geometry/primitiveGeometryGenerator.js'],
		['apps/mitzvah-studio/modules/state/StudioObjectFactory.js', 'core/authoring/PlacementMath.js'],
		['apps/mitzvah-studio/modules/state/StudioDocumentMutations.js', 'core/authoring/PlacementMath.js'],
		['apps/mitzvah-studio/modules/state/StudioHistoryController.js', 'core/authoring/HistoryLedger.js']
	]);
	for (const [relativePath, needle] of expectedNeedles) {
		const source = await readFile(path.join(projectRoot, relativePath), 'utf8');
		assert.ok(source.includes(needle), `${relativePath} must import ${needle}`);
	}
});
