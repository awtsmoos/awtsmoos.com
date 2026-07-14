// B"H
// Boruch Hashem
// Blessed is He
/** @module ArtifactsTrainTest @description Verifies chapters forty-six through fifty. */
import assert from 'node:assert/strict';
import {
	capabilityExecuted,
	createCapabilityLevel,
	createCompatibilityMatrix,
	createPrivateArtifactReport,
	createTraceCoordinate,
	createUnsupportedBoundary,
	findCompatibility,
	publicArtifactProjection
} from '../artifacts/index.mjs';

const claim = createCapabilityLevel({ level: 'emulated', capability: 'dalvik-add', evidence: ['trace'] });
assert.equal(capabilityExecuted(claim), true);
const coordinate = createTraceCoordinate({ artifactId: 'apk:1', kind: 'instruction', address: 12 });
assert.equal(coordinate.address, 12);
const boundary = createUnsupportedBoundary({ capability: 'binder', reason: 'not implemented', coordinate });
assert.equal(boundary.coordinate.kind, 'instruction');
const report = createPrivateArtifactReport({
	artifactHash: 'abcdef',
	format: 'apk',
	capabilities: [claim],
	approvedFields: ['format', 'capabilities']
});
assert.equal(report.visibility, 'private');
assert.deepEqual(Object.keys(publicArtifactProjection(report)).sort(), ['capabilities', 'format']);
const matrix = createCompatibilityMatrix({
	name: 'Android',
	rows: [{ format: 'dex', architecture: 'dalvik', apiFamily: 'core', level: 'emulated' }]
});
assert.equal(findCompatibility(matrix, { format: 'dex', architecture: 'dalvik', apiFamily: 'core' }).level, 'emulated');
console.log('B"H artifacts train passed.');
