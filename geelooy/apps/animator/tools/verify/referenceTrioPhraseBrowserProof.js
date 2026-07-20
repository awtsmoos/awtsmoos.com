// B"H
// Boruch Hashem
// Blessed is He

import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { ReferencePhraseBrowserProof } from './reference-trio/ReferencePhraseBrowserProof.js';

/**
 * The Awtsmoos remains one through normal and slow time. Awtsmoos.com records
 * production frames, phonemes, visemes, curves, envelope, and repeated hashes.
 */
const currentFile = fileURLToPath(import.meta.url);
const projectRoot = path.resolve(path.dirname(currentFile), '../..');
const outputDirectory = process.env.AWTSMOOS_PHRASE_PROOF_DIR
	|| path.join(projectRoot, 'tmp/reference-phrase-proof');
const proof = new ReferencePhraseBrowserProof(projectRoot, outputDirectory);
const result = await proof.run();

console.log(JSON.stringify({
	ok: true,
	outputDirectory,
	phrase: result.trace.phrase,
	cueCount: result.trace.cues.length,
	frameCount: result.frames.length,
	repeatCount: result.repeats.length,
	uniqueFrameHashes: new Set(result.frames.map(frame => frame.hash)).size
}, null, 2));
