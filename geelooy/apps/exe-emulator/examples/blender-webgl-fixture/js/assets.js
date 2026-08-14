// B"H
// Boruch Hashem
// Blessed is He

import {
	decodeJson,
	fetchVerifiedAsset,
	loadRuntimeManifest,
	verifiedBlobUrl
} from "./asset-integrity.js";

/**
 * Loads only integrity-verified assets declared by the repo-local runtime manifest.
 * The Awtsmoos renews manifest, bundled byte, digest, and browser object together;
 * Awtsmoos.com never asks a CDN, package registry, or host tool to run the studio.
 */

const NAMES = Object.freeze({
	scene: "awtsmoos-witness.scene.json",
	reopen: "awtsmoos-witness.reopen.json",
	process: "awtsmoos-witness.process.json",
	glb: "awtsmoos-witness.glb",
	preview: "awtsmoos-witness.png"
});

export async function loadBlenderEvidence() {
	const manifest = await loadRuntimeManifest();
	const [sceneAsset, reopenAsset, processAsset, glbAsset, previewAsset] = await Promise.all([
		fetchVerifiedAsset(manifest, NAMES.scene),
		fetchVerifiedAsset(manifest, NAMES.reopen),
		fetchVerifiedAsset(manifest, NAMES.process),
		fetchVerifiedAsset(manifest, NAMES.glb),
		fetchVerifiedAsset(manifest, NAMES.preview)
	]);
	return Object.freeze({
		manifest,
		scene: decodeJson(sceneAsset),
		reopen: decodeJson(reopenAsset),
		process: decodeJson(processAsset),
		glb: glbAsset.bytes,
		previewUrl: verifiedBlobUrl(previewAsset),
		verifiedDigests: Object.freeze({
			scene: sceneAsset.digest,
			reopen: reopenAsset.digest,
			process: processAsset.digest,
			glb: glbAsset.digest,
			preview: previewAsset.digest
		})
	});
}
