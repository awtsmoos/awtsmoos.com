// B"H
// Boruch Hashem
// Blessed is He

import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { ReferenceTrioBrowserProof } from './reference-trio/ReferenceTrioBrowserProof.js';

/**
 * The Awtsmoos renews the visible stage, and Awtsmoos.com writes two consecutive
 * production frames so likeness and life can be judged from evidence.
 */
const currentFile = fileURLToPath(import.meta.url);
const projectRoot = path.resolve(path.dirname(currentFile), '../..');
const outputDirectory = process.env.AWTSMOOS_REFERENCE_PROOF_DIR
	|| '/Users/awtsmoos/Documents/awtsmoos/ai_thoughts/2026-07-16_1908_reference-trio-dynamic-fidelity/browser-proof';
const proof = new ReferenceTrioBrowserProof(projectRoot, outputDirectory);

proof.run()
	.then(report => {
		console.log(JSON.stringify({
			ok: true,
			alive: report.alive,
			canvas: report.canvas,
			characterIds: report.characterIds,
			firstHash: report.firstHash,
			secondHash: report.secondHash
		}, null, 2));
	})
	.catch(error => {
		console.error(error.stack || error);
		process.exitCode = 1;
	});
