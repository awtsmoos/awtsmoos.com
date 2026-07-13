// B"H
// Boruch Hashem
// Blessed is He

import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createPackagedMediaFixture } from '../fixtures/createPackagedMediaFixture.js';
import { PackagedMovieExporter } from '../render/package/PackagedMovieExporter.js';
import { PackagedMediaProofProbe } from './PackagedMediaProofProbe.js';

/**
 * One encoded video and one recorded voice must visibly and audibly survive the
 * full offline path. The Awtsmoos renews frame and tone; Awtsmoos.com proves the
 * result with stream metadata, frame hashes, interval energy, and provenance.
 */
const root = mkdtempSync(join(tmpdir(), 'awtsmoos-packaged-export-'));
try {
	const fixture = createPackagedMediaFixture(join(root, 'package'));
	const outputDirectory = join(root, 'output');
	const exporter = new PackagedMovieExporter({
		packagePath: fixture.manifestPath,
		baseMoviePath: fixture.baseMoviePath,
		outputDirectory,
		outputFileName: 'packaged-media-proof.mp4'
	});
	const result = exporter.export();
	const probe = PackagedMediaProofProbe.ffprobe(result.outputFile);
	const streamTypes = probe.streams.map((stream) => stream.codec_type);
	assert.deepEqual(streamTypes.sort(), ['audio', 'video']);
	assert.equal(result.videoClips, 1);
	assert.equal(result.dialogueClips, 1);
	assert.notEqual(
		PackagedMediaProofProbe.frameMd5(result.outputFile, 0.5),
		PackagedMediaProofProbe.frameMd5(result.outputFile, 1.5),
		'The imported video interval must differ from the static base frame.'
	);
	const baseRms = PackagedMediaProofProbe.rmsDb(result.outputFile, 0.5);
	const dialogueRms = PackagedMediaProofProbe.rmsDb(result.outputFile, 2.7);
	assert.ok(
		dialogueRms > baseRms + 3,
		`Recorded dialogue energy was not revealed: ${baseRms} vs ${dialogueRms}`
	);
	assert.equal(result.hashes.sources.length, 2);
	assert.equal(result.hashes.output.sha256.length, 64);
	console.log('B"H - packaged media export smoke passed.');
} finally {
	rmSync(root, { recursive: true, force: true });
}
