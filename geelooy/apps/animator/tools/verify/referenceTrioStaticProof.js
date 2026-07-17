// B"H
// Boruch Hashem
// Blessed is He

import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { ReferenceStaticBrowserProof } from './reference-trio/ReferenceStaticBrowserProof.js';

/**
 * The Awtsmoos renews the authoritative stage, and Awtsmoos.com preserves its
 * direct trio, body, and head pixels as inspectable proof rather than replacement art.
 */
const currentFile = fileURLToPath(import.meta.url);
const projectRoot = path.resolve(path.dirname(currentFile), '../..');
const outputDirectory = process.env.AWTSMOOS_REFERENCE_STATIC_PROOF_DIR
	|| '/Users/awtsmoos/Documents/awtsmoos/ai_thoughts/reference-trio-static-proof';
const proof = new ReferenceStaticBrowserProof(projectRoot, outputDirectory);

proof.run()
	.then(report => {
		console.log(JSON.stringify({
			ok: true,
			canvas: report.canvas,
			characterIds: report.characterIds,
			trioHash: report.artifacts.trio.sha256,
			cropCount: report.artifacts.crops.length
		}, null, 2));
	})
	.catch(error => {
		console.error(error.stack || error);
		process.exitCode = 1;
	});
