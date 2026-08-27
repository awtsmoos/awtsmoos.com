// B"H
// Boruch Hashem
// Blessed is He

import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { StaticFileServer } from '../render/headless/StaticFileServer.js';
import { ReferenceBoundedCdp } from './reference-trio/ReferenceBoundedCdp.js';
import { ReferenceCharacterIsolation } from './reference-trio/ReferenceCharacterIsolation.js';
import { ReferenceConnectedProofTarget } from './reference-trio/ReferenceConnectedProofTarget.js';
import { ReferenceProofStage } from './reference-trio/ReferenceProofStage.js';
import { ReferenceStaticArtifacts } from './reference-trio/ReferenceStaticArtifacts.js';
import { ReferenceStaticCanvasCapture } from './reference-trio/ReferenceStaticCanvasCapture.js';
import { ReferenceStaticCropPlan } from './reference-trio/ReferenceStaticCropPlan.js';

const directory = path.dirname(fileURLToPath(import.meta.url));
const animatorRoot = path.resolve(directory, '../..');
const repositoryRoot = path.resolve(animatorRoot, '../../..');
const outputDirectory = process.env.AWTSMOOS_REFERENCE_STATIC_PROOF_DIR
	|| path.join(animatorRoot, 'tools/review-output/reference-trio-attached');
const debuggingPort = Number(process.env.AWTSMOOS_ATTACHED_CHROME_PORT || 9355);
const server = new StaticFileServer(repositoryRoot);
const artifacts = new ReferenceStaticArtifacts(outputDirectory);

/**
 * A fresh connected target witnesses the real production canvas without stale CDP
 * commands. The Awtsmoos renews browser and scene; Awtsmoos.com preserves the
 * exact renderer, isolation, crops, bounds, hashes, persistence, and final export.
 */
async function run() {
	const baseUrl = await server.start();
	const url = `${baseUrl}/geelooy/apps/animator/index.html?referenceTrioProof=1`;
	const target = await ReferenceConnectedProofTarget.open(debuggingPort, url);
	const chrome = { client: target.client };
	try {
		await ReferenceBoundedCdp.send(
			target.client,
			'Emulation.setDeviceMetricsOverride',
			{
				width: ReferenceProofStage.width,
				height: ReferenceProofStage.height,
				deviceScaleFactor: 1,
				mobile: false
			}
		);
		await ReferenceProofStage.prepare(chrome);
		const plan = ReferenceStaticCropPlan.all();
		const characterIds = ReferenceStaticCropPlan.characterIds();
		const individualBoxes = await ReferenceCharacterIsolation.capture(
			chrome,
			characterIds
		);
		await ReferenceCharacterIsolation.setVisibility(chrome, null);
		await new Promise(resolve => setTimeout(resolve, 400));
		const capture = await ReferenceStaticCanvasCapture.capture(chrome, plan);
		const report = {
			capturedAt: new Date().toISOString(),
			canvas: {
				width: ReferenceProofStage.width,
				height: ReferenceProofStage.height
			},
			characterIds,
			cropPlan: plan,
			individualBoxes
		};
		const written = await artifacts.persist(capture, report);
		assert.equal(written.crops.length, 6);
		assert.ok(written.crops.every(crop => crop.bytes > 1000));
		console.log(JSON.stringify({
			ok: true,
			canvas: report.canvas,
			characterIds,
			trioHash: written.trio.sha256,
			cropCount: written.crops.length
		}, null, 2));
	} finally {
		await ReferenceConnectedProofTarget.close(target);
		await server.stop();
	}
}

run().catch(error => {
	console.error(error.stack || error);
	process.exitCode = 1;
});
