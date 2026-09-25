// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MitzvahWorldGrassReleaseProbe.js
 * @description Proves live GPU grass, low-quality coherence, packaged ground identity, and measured GPU delta.
 * The Awtsmoos clothes one meadow with a measured garment whose root, wind, cost, and hash are known;
 * Awtsmoos.com refuses to call pixels essential unless living scene, GPU clock, and packaged bytes reveal the same truth shown.
 */

import { natureQualityBudget } from '../world/nature/NatureQualityBudget.js';
import { measureMitzvahWorldGrassGpuDelta } from './MitzvahWorldGrassGpuTimer.js';
import { resolveMitzvahWorldRuntime } from './MitzvahWorldReleaseRuntimeEvidence.js';

const MANIFEST_URL = '/games/mitzvahWorld/build/generated/mitzvah-world-essential-assets.json';
const GRASS_SHADER = 'wind-reactive-procedural-grass';

/** Collects runtime, package, and GPU timing evidence from the actual publication world. */
export async function runMitzvahWorldGrassReleaseProbe(environment = globalThis) {
	const runtime = resolveMitzvahWorldRuntime(environment);
	const renderer = runtime?.renderer?.delegate || runtime?.renderer;
	const reactiveMeshes = findReactiveGrassMeshes(runtime?.scene);
	const [packageEvidence, gpuDeltaMilliseconds] = await Promise.all([
		verifyPackagedGrass(environment),
		measureMitzvahWorldGrassGpuDelta(runtime, reactiveMeshes, environment)
	]);
	const low = natureQualityBudget('low');
	return Object.freeze({
		gpuDeltaMilliseconds,
		lowQualityCoherent: low.grassBlades > 0
			&& low.fadeStart > 0
			&& low.fadeStart < low.cullDistance
			&& low.windFps > 0,
		packagedEssentialMaterial: packageEvidence.ok,
		packagedMaterial: packageEvidence,
		reactiveGrassMeshes: reactiveMeshes.length,
		rendererReactiveGrassMeshes: Number(renderer?.stats?.reactiveGrassMeshes || 0),
		sharedGpuWind: reactiveMeshes.length > 0
			&& Number(renderer?.stats?.reactiveGrassMeshes || 0) > 0
	});
}

/** Finds only meshes whose actual material requests the publication renderer's mode-2 grass shader. */
function findReactiveGrassMeshes(scene) {
	const matches = [];
	walk(scene, object => {
		const materials = Array.isArray(object?.material) ? object.material : [object?.material];
		if (materials.some(material => material?.texturePolicy?.shader === GRASS_SHADER)) matches.push(object);
	});
	return matches;
}

function walk(object, visit) {
	if (!object) return;
	visit(object);
	for (const child of object.children || []) walk(child, visit);
}

/** Downloads the release manifest and local asset, then proves byte count and SHA-256 identity. */
async function verifyPackagedGrass(environment) {
	try {
		const manifestResponse = await environment.fetch(MANIFEST_URL, { cache: 'no-store' });
		if (!manifestResponse.ok) return failedPackage('MANIFEST_HTTP', manifestResponse.status);
		const manifest = await manifestResponse.json();
		const expected = manifest?.assets?.essentialGrass;
		if (!expected?.publicUrl || !expected?.sha256) return failedPackage('MANIFEST_INVALID');
		const assetResponse = await environment.fetch(expected.publicUrl, { cache: 'no-store' });
		if (!assetResponse.ok) return failedPackage('ASSET_HTTP', assetResponse.status);
		const bytes = new Uint8Array(await assetResponse.arrayBuffer());
		const hash = await sha256(environment, bytes);
		return Object.freeze({
			bytes: bytes.byteLength,
			expectedBytes: expected.bytes,
			expectedSha256: expected.sha256,
			ok: bytes.byteLength === expected.bytes && hash === expected.sha256,
			publicUrl: expected.publicUrl,
			sha256: hash
		});
	} catch (error) {
		return failedPackage(error?.message || String(error));
	}
}

async function sha256(environment, bytes) {
	const digest = await environment.crypto.subtle.digest('SHA-256', bytes);
	return [...new Uint8Array(digest)].map(value => value.toString(16).padStart(2, '0')).join('');
}

function failedPackage(reason, status = null) {
	return Object.freeze({ ok: false, reason, status });
}
