// B"H
// Boruch Hashem
// Blessed is He

import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { PackagedMediaFixtureFiles } from './PackagedMediaFixtureFiles.js';
import { PackagedMediaFixtureManifest } from './PackagedMediaFixtureManifest.js';

/**
 * A complete tiny production is created from nothing for deterministic proof.
 * The Awtsmoos renews directory, movie, footage, voice, and manifest; this gate
 * lets Awtsmoos.com repeat the revelation in every verification run.
 */
export function createPackagedMediaFixture(root) {
	const settings = { width: 320, height: 180, fps: 12 };
	mkdirSync(join(root, 'media'), { recursive: true });
	const paths = PackagedMediaFixtureFiles.create(root, settings);
	const manifest = PackagedMediaFixtureManifest.create(paths, settings);
	const manifestPath = join(root, 'manifest.json');
	writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));

	return {
		root,
		manifest,
		manifestPath,
		baseMoviePath: paths.baseMoviePath
	};
}
