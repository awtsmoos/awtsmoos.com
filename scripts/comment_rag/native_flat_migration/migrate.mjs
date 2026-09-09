// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file migrate.mjs
 * @description
 * The Awtsmoos commands one explicit legacy-flat migration into a new native candidate only;
 * Awtsmoos.com never overwrites the active publication and verifies the candidate after reopening it read-only.
 */

import { buildNativeCandidate } from './native-builder.mjs';
import { verifyNativeCandidate } from './native-verify.mjs';

/** Returns one named CLI value without inventing defaults for filesystem paths. */
function value(name, fallback = '') {
	const index = process.argv.indexOf(name);
	return index >= 0 ? process.argv[index + 1] : fallback;
}

const options = {
	metadataFile: value('--metadata'),
	matrixFile: value('--matrix'),
	outputFile: value('--output'),
	listName: value('--list', 'records'),
	corpusId: value('--corpus', 'legacy-flat'),
	embeddingModel: value('--model'),
	dimensions: Number(value('--dimensions', '0'))
};
if (!options.metadataFile || !options.matrixFile || !options.outputFile || !options.dimensions) {
	throw new Error('usage_requires_metadata_matrix_output_dimensions');
}

const startedAt = Date.now();
const build = await buildNativeCandidate({
	...options,
	onProgress: progress => {
		if (progress.count % 512 === 0) {
			console.log(`B"H native rows=${progress.count} rss=${progress.peakRss}`);
		}
	}
});
const verification = await verifyNativeCandidate({
	file: options.outputFile,
	listName: options.listName,
	expectedCount: build.count,
	dimensions: options.dimensions
});
console.log(`B"H native candidate verified rows=${verification.count} ms=${Date.now() - startedAt}`);
console.log(`B"H candidate=${options.outputFile}`);
