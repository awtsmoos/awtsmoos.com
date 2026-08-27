// B"H
// Boruch Hashem
// Blessed is He

import assert from 'node:assert/strict';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createPackagedMediaFixture } from '../fixtures/createPackagedMediaFixture.js';
import { PackagedMovieExporter } from '../render/package/PackagedMovieExporter.js';
import { PackagedMediaProofProbe } from './PackagedMediaProofProbe.js';

/**
 * Multiply, screen, and overlay must each survive real FFmpeg composition. The
 * Awtsmoos renews every mode without doubling its appointed time; Awtsmoos.com
 * proves each non-normal garment through an encoded stream and changed frame.
 */
const root = mkdtempSync(join(tmpdir(), 'awtsmoos-blend-modes-'));
try {
	for (const blendMode of ['multiply', 'screen', 'overlay']) {
		const packageRoot = join(root, blendMode, 'package');
		const fixture = createPackagedMediaFixture(packageRoot);
		const videoClip = fixture.manifest.timeline.clips.find((clip) => {
			return clip.type === 'video';
		});
		videoClip.payload.blendMode = blendMode;
		writeFileSync(
			fixture.manifestPath,
			JSON.stringify(fixture.manifest, null, 2)
		);
		const exporter = new PackagedMovieExporter({
			packagePath: fixture.manifestPath,
			baseMoviePath: fixture.baseMoviePath,
			outputDirectory: join(root, blendMode, 'output'),
			outputFileName: `${blendMode}.mp4`
		});
		const result = exporter.export();
		assert.equal(result.videoClips, 1);
		assert.notEqual(
			PackagedMediaProofProbe.frameMd5(result.outputFile, 0.5),
			PackagedMediaProofProbe.frameMd5(result.outputFile, 1.5),
			`${blendMode} must reveal imported footage at its scheduled time.`
		);
	}
	console.log('B"H - packaged blend modes smoke passed.');
} finally {
	rmSync(root, { recursive: true, force: true });
}
