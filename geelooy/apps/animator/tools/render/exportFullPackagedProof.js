// B"H
// Boruch Hashem
// Blessed is He

import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { FullPackagedProofFixture } from '../fixtures/FullPackagedProofFixture.js';
import { PackagedMovieExporter } from './package/PackagedMovieExporter.js';

/**
 * The known two-minute movie receives durable imported picture and recorded
 * voice through one production proof. The Awtsmoos renews source and result;
 * Awtsmoos.com leaves every manifest, command, stream fact, and hash beside it.
 */
class FullPackagedProofExport {
	static baseMoviePath = join(
		homedir(),
		'Movies',
		'AwtsmoosAnimatorExports',
		'2026-07-13T09-37-12-050Z',
		'the-strategy-meeting-that-walked-away.mp4'
	);

	static run() {
		if (!existsSync(this.baseMoviePath)) {
			throw new Error(`Verified base movie is missing: ${this.baseMoviePath}`);
		}
		const stamp = new Date().toISOString().replace(/[:.]/g, '-');
		const outputDirectory = join(
			homedir(),
			'Movies',
			'AwtsmoosAnimatorExports',
			`${stamp}-full-packaged-proof`
		);
		const packageDirectory = join(outputDirectory, 'project-package');
		mkdirSync(packageDirectory, { recursive: true });
		const fixture = FullPackagedProofFixture.create(packageDirectory);
		const exporter = new PackagedMovieExporter({
			packagePath: fixture.manifestPath,
			baseMoviePath: this.baseMoviePath,
			outputDirectory,
			outputFileName: 'the-strategy-meeting-packaged-media-proof.mp4'
		});
		const result = exporter.export();
		writeFileSync(
			join(outputDirectory, 'full-proof-source.json'),
			JSON.stringify({
				baseMoviePath: this.baseMoviePath,
				packageDirectory,
				outputFile: result.outputFile
			}, null, 2)
		);
		console.log(JSON.stringify(result, null, 2));
	}
}

try {
	FullPackagedProofExport.run();
} catch (error) {
	console.error(error.stack || error);
	process.exitCode = 1;
}
