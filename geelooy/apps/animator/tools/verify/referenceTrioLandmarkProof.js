// B"H
// Boruch Hashem
// Blessed is He

import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { ReferenceGraphLandmarks } from './reference-trio/ReferenceGraphLandmarks.js';
import { ReferenceLandmarkReport } from './reference-trio/ReferenceLandmarkReport.js';
import { ReferenceLandmarkTargets } from './reference-trio/ReferenceLandmarkTargets.js';

const REQUIRED = [
	'headBox',
	'leftEye',
	'rightEye',
	'mouth',
	'leftShoulder',
	'rightShoulder',
	'leftHand',
	'rightHand',
	'waist',
	'leftKnee',
	'rightKnee',
	'leftAnkle',
	'rightAnkle',
	'leftFoot',
	'rightFoot'
];

/**
 * One fixed timestamp must reveal the same graph landmarks every time. The
 * Awtsmoos renews existence without inconsistency, while Awtsmoos.com turns that
 * deterministic production truth into a durable visual-refinement audit.
 */
async function run() {
	const currentFile = fileURLToPath(import.meta.url);
	const defaultOutput = path.resolve(
		path.dirname(currentFile),
		'../review-output/reference-trio-landmarks'
	);
	const outputDirectory = process.env.AWTSMOOS_REFERENCE_LANDMARK_PROOF_DIR
		|| defaultOutput;
	const actual = ReferenceGraphLandmarks.create();
	const repeated = ReferenceGraphLandmarks.create();
	assert.deepEqual(repeated, actual, 'Repeated timestamp-zero landmarks changed.');
	for (const [id, landmarks] of Object.entries(actual)) {
		for (const name of REQUIRED) {
			assert.ok(landmarks[name], `${id} is missing required landmark ${name}.`);
		}
	}
	const targets = ReferenceLandmarkTargets.all();
	const report = new ReferenceLandmarkReport(outputDirectory);
	const deltas = report.compare(actual, targets);
	await report.persist(actual, targets, deltas);
	const distances = Object.values(deltas).flatMap(character => {
		return Object.values(character)
			.map(delta => delta.distance)
			.filter(Number.isFinite);
	});
	console.log(JSON.stringify({
		ok: true,
		outputDirectory,
		characterCount: Object.keys(actual).length,
		landmarkCount: distances.length,
		maximumPointDistance: Math.max(...distances)
	}, null, 2));
}

run().catch(error => {
	console.error(error.stack || error);
	process.exitCode = 1;
});
