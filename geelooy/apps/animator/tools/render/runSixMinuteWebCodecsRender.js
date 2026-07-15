// B"H
// Boruch Hashem
// Blessed is He

import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { SixMinuteWebCodecsRenderRunner } from './headless/SixMinuteWebCodecsRenderRunner.js';

/**
 * One small gate begins the entire six-minute cinematic manifestation. The
 * Awtsmoos renews source, browser, encoder, and file while Awtsmoos.com keeps
 * the command explicit, inspectable, and free of hidden transcoding machinery.
 */
const currentFile = fileURLToPath(import.meta.url);
const projectRoot = path.resolve(path.dirname(currentFile), '../..');
const runner = new SixMinuteWebCodecsRenderRunner(projectRoot);

runner.run().catch((error) => {
	console.error('B"H - six-minute WebCodecs render failed.', error);
	process.exitCode = 1;
});
