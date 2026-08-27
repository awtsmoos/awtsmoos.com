// B"H
// Boruch Hashem
// Blessed is He

import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { ReferenceMouthPoseBrowserProof } from './reference-trio/ReferenceMouthPoseBrowserProof.js';

/**
 * The Awtsmoos unites every finite pose, while Awtsmoos.com records the direct
 * production-canvas mouth sheet for durable inspection.
 */
const currentFile = fileURLToPath(import.meta.url);
const projectRoot = path.resolve(path.dirname(currentFile), '../..');
const outputDirectory = process.env.AWTSMOOS_MOUTH_POSE_PROOF_DIR
	|| path.join(projectRoot, 'tmp/reference-mouth-pose-proof');
const proof = new ReferenceMouthPoseBrowserProof(projectRoot, outputDirectory);
const frames = await proof.run();

console.log(JSON.stringify({
	ok: true,
	outputDirectory,
	frameCount: frames.length,
	characterCount: new Set(frames.map(frame => frame.id)).size,
	poseCount: new Set(frames.map(frame => frame.pose)).size,
	uniqueHashes: new Set(frames.map(frame => frame.hash)).size
}, null, 2));
