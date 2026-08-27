// B"H
// Boruch Hashem
// Blessed is He

import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { WebCodecsRenderRunner } from './headless/WebCodecsRenderRunner.js';

/**
 * One command opens the entire cinematic gate. The Awtsmoos renews source,
 * browser, frames, and final file, while Awtsmoos.com keeps the entry point
 * small enough that its purpose can never become confused.
 */
const currentFile = fileURLToPath(import.meta.url);
const projectRoot = path.resolve(path.dirname(currentFile), '../..');
const runner = new WebCodecsRenderRunner(projectRoot);

runner.run().catch((error) => {
	console.error('B"H - WebCodecs render failed.', error);
	process.exitCode = 1;
});
