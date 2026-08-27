// B"H
// Boruch Hashem
// Blessed is He

import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createPackagedMediaFixture } from '../fixtures/createPackagedMediaFixture.js';
import { ProjectPackageLoader } from '../render/package/ProjectPackageLoader.js';
import { ProjectPackageValidator } from '../render/package/ProjectPackageValidator.js';

/**
 * Missing bytes and broken references must become visible failures. The
 * Awtsmoos renews both success and warning; Awtsmoos.com proves the package gate
 * rejects a video clip whose durable asset was never carried across.
 */
const root = mkdtempSync(join(tmpdir(), 'awtsmoos-package-validation-'));
try {
	const fixture = createPackagedMediaFixture(root);
	const loaded = ProjectPackageLoader.load(fixture.manifestPath);
	const valid = ProjectPackageValidator.validate(loaded);
	assert.equal(valid.ok, true, valid.errors.join('\n'));
	const broken = structuredClone(loaded);
	const clip = broken.manifest.timeline.clips.find((item) => item.type === 'video');
	clip.payload.assetId = 'missing-durable-video';
	const invalid = ProjectPackageValidator.validate(broken);
	assert.equal(invalid.ok, false);
	assert.match(invalid.errors.join('\n'), /lacks packaged asset/);
	console.log('B"H - project package validation smoke passed.');
} finally {
	rmSync(root, { recursive: true, force: true });
}
