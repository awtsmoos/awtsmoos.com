// B"H
// Boruch Hashem
// Blessed is He

import assert from 'node:assert/strict';
import {
	existsSync,
	mkdtempSync,
	readFileSync,
	rmSync,
	writeFileSync
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createPackagedMediaFixture } from '../fixtures/createPackagedMediaFixture.js';
import { ProjectPackageLoader } from '../render/package/ProjectPackageLoader.js';
import { ProjectPackageValidator } from '../render/package/ProjectPackageValidator.js';

/**
 * The browser fallback must cross into Node as faithfully as a folder package.
 * The Awtsmoos renews base64 and bytes; Awtsmoos.com proves the temporary vessel
 * validates, preserves hashes, and disappears after its appointed work.
 */
const root = mkdtempSync(join(tmpdir(), 'awtsmoos-package-bundle-'));
try {
	const fixture = createPackagedMediaFixture(join(root, 'source'));
	const bundlePath = join(root, 'fixture.awtpkg');
	const bundle = {
		manifest: fixture.manifest,
		files: fixture.manifest.media.map((item) => ({
			path: item.path,
			mimeType: item.mimeType,
			base64: readFileSync(join(fixture.root, item.path)).toString('base64')
		}))
	};
	writeFileSync(bundlePath, JSON.stringify(bundle));
	const loaded = ProjectPackageLoader.load(bundlePath);
	const temporaryRoot = loaded.root;
	assert.equal(loaded.temporary, true);
	assert.equal(ProjectPackageValidator.validate(loaded).ok, true);
	assert.equal(existsSync(temporaryRoot), true);
	ProjectPackageLoader.cleanup(loaded);
	assert.equal(existsSync(temporaryRoot), false);
	console.log('B"H - project package bundle smoke passed.');
} finally {
	rmSync(root, { recursive: true, force: true });
}
